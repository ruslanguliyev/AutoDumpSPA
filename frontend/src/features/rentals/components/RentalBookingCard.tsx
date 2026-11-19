import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { daysInclusive, rangesOverlap, todayString } from '@/features/rentals/api/rentals.api';
import { useRentalAvailability, useRequestRental } from '@/features/rentals/hooks/useRentals';
import { isValidPhone } from '@/features/addItem/utils/validateDraft';
import { formatDate, formatPrice, intlLocale } from '@/lib/format';
import { mapSubmitError } from '@/lib/formSubmitError';
import { ContactForm } from '@/shared/blocks/ContactForm';
import Button from '@/shared/ui/button';
import { DateRangeCalendar } from '@/shared/ui/DateRangeCalendar';
import { FieldError } from '@/shared/ui/field';

type RentalCar = {
  listingId?: string | null;
  price?: number | null;
  currency?: string | null;
  rental?: {
    deposit: number | null;
    minDays: number;
    maxDays: number | null;
    kmPerDay: number | null;
    minDriverAge: number | null;
  } | null;
};

const card = 'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere]';

/**
 * “Book this car” on a rental listing: price and terms, then the booking form.
 *
 * The form is the shared `ContactForm` with the date range slotted in, so it has the same
 * five states as every other form on the page:
 *   empty (hint) · validation error · sending · sent · network error.
 * Terms come only from `RentalTermsObject`; a line the API does not return is not drawn.
 * Requests and availability go through the existing `useRequestRental` / `useRentalAvailability`.
 */
export function RentalBookingCard({ car }: { car: RentalCar }) {
  const { t, i18n } = useTranslation('dashboard');
  const locale = intlLocale(i18n.language);
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const availability = useRentalAvailability(car.listingId);
  const request = useRequestRental();

  const today = todayString();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const terms = car.rental;
  const currency = car.currency ?? 'AZN';
  const pricePerDay = car.price != null && Number.isFinite(Number(car.price)) ? Number(car.price) : null;
  const days = daysInclusive(start, end);
  const unavailable = useMemo(() => availability.data ?? [], [availability.data]);

  const problem = useMemo(() => {
    if (!start || !end) return null;
    if (start < today) return t('rental.errors.past');
    if (days === 0) return t('rental.errors.order');
    if (terms && days < terms.minDays) return t('rental.errors.tooShort', { count: terms.minDays });
    if (terms?.maxDays && days > terms.maxDays) return t('rental.errors.tooLong', { count: terms.maxDays });
    if (unavailable.some((r) => rangesOverlap(start, end, r.startDate, r.endDate))) {
      return t('rental.errors.unavailable');
    }
    return null;
  }, [start, end, days, terms, unavailable, today, t]);

  if (!car.listingId || !terms) return null;

  const datesMissing = !start || !end;
  const phoneTrimmed = phone.trim();
  const phoneInvalid = phoneTrimmed.length > 0 && !isValidPhone(phoneTrimmed);
  const phoneError = submitted && phoneInvalid ? t('settings.seller.phoneInvalid') : null;
  const ready = days > 0 && !problem;

  const submitError = mapSubmitError(request.error, {
    network: t('rental.errors.network'),
    generic: t('contact.errors.generic'),
    loginRequired: t('contact.errors.loginToSend'),
  });
  const formError = submitError?.message ?? null;

  const submit = () => {
    setSubmitted(true);
    if (datesMissing || problem || phoneInvalid) return;
    request.mutate({
      listingId: car.listingId!,
      startDate: start,
      endDate: end,
      message: message.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  const isUnavailable = (day: string) => unavailable.some((r) => day >= r.startDate && day <= r.endDate);

  /** First click sets the start, the second the end; a click after a full range, or before the start, starts over. */
  const onPick = (day: string) => {
    request.reset();
    if (!start || end || day < start) {
      setStart(day);
      setEnd('');
      return;
    }
    setEnd(day);
  };

  const showMissing = submitted && datesMissing;

  return (
    <div id="rental-booking" className="flex scroll-mt-24 flex-col gap-4">
      <section className={card}>
        <h3 className="text-[18px] font-semibold text-foreground">{t('rental.title')}</h3>
        {pricePerDay != null ? (
          <p className="mt-2 text-[20px] font-bold text-primary-text">
            {formatPrice(pricePerDay, currency, locale)}{' '}
            <span className="text-[13px] font-medium text-muted-foreground">{t('rental.perDay')}</span>
          </p>
        ) : null}

        <ul className="mt-4 border-t border-dashed border-border text-[15px] text-foreground">
          <li className="border-b border-dashed border-border py-3">{t('rental.term.minDays', { count: terms.minDays })}</li>
          {terms.maxDays ? (
            <li className="border-b border-dashed border-border py-3">
              {t('rental.term.maxDays', { count: terms.maxDays })}
            </li>
          ) : null}
          <li className="border-b border-dashed border-border py-3">
            {terms.deposit
              ? t('rental.term.deposit', { amount: formatPrice(terms.deposit, currency, locale) })
              : t('rental.term.noDeposit')}
          </li>
          <li className="border-b border-dashed border-border py-3">
            {terms.kmPerDay ? t('rental.term.kmPerDay', { count: terms.kmPerDay }) : t('rental.term.unlimitedKm')}
          </li>
          {terms.minDriverAge ? (
            <li className="border-b border-dashed border-border py-3">
              {t('rental.term.minDriverAge', { count: terms.minDriverAge })}
            </li>
          ) : null}
        </ul>

        <p className="mt-4 text-[13px] text-muted-foreground">{t('rental.requestNote')}</p>
      </section>

      <ContactForm
        title={t('rental.formTitle')}
        submitLabel={t('rental.request')}
        messagePlaceholder={t('rental.messagePlaceholder')}
        messageRequired={false}
        message={message}
        onMessageChange={setMessage}
        phone={phone}
        onPhoneChange={setPhone}
        onSubmit={submit}
        pending={request.isPending}
        error={formError}
        phoneError={phoneError}
        errorAction={
          submitError?.showLoginLink ? (
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link to="/login" state={{ from: location }}>
                {t('contact.login')}
              </Link>
            </Button>
          ) : null
        }
        sent={request.isSuccess}
        sentContent={
          <>
            <h3 className="text-[18px] font-semibold text-foreground">{t('rental.sentTitle')}</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">{t('rental.sentText')}</p>
            <Button asChild variant="secondary" className="mt-3 w-full">
              <Link to="/dashboard/rentals">{t('rental.myBookings')}</Link>
            </Button>
          </>
        }
        loginRequired={
          isAuthenticated ? null : (
            <>
              <p className="text-[15px] text-muted-foreground">{t('rental.loginRequired')}</p>
              <Button asChild variant="primary" className="mt-3 w-full">
                <Link to="/login" state={{ from: location }}>
                  {t('contact.login')}
                </Link>
              </Button>
            </>
          )
        }
      >
        <DateRangeCalendar
          start={start}
          end={end}
          min={today}
          isUnavailable={isUnavailable}
          onPick={onPick}
          locale={locale}
          labels={{
            group: t('rental.calendar.group'),
            previousMonth: t('rental.calendar.previousMonth'),
            nextMonth: t('rental.calendar.nextMonth'),
            unavailable: t('rental.calendar.unavailable'),
          }}
        />
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span
            aria-hidden="true"
            className="inline-flex h-5 w-5 items-center justify-center rounded-[var(--radius)] bg-card-muted text-[12px] line-through"
          >
            1
          </span>
          {t('rental.unavailableDays')}
        </p>
        <div className="grid grid-cols-2 gap-3 text-[15px]">
          <p>
            <span className="block text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground">
              {t('rental.from')}
            </span>
            <span className="mt-1.5 block font-semibold text-foreground">{start ? formatDate(start, locale) : '—'}</span>
          </p>
          <p>
            <span className="block text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground">
              {t('rental.to')}
            </span>
            <span className="mt-1.5 block font-semibold text-foreground">{end ? formatDate(end, locale) : '—'}</span>
          </p>
        </div>

        <div id="rental-dates-note" aria-live="polite">
          {problem ? (
            <FieldError id="rental-dates-error">{problem}</FieldError>
          ) : showMissing ? (
            <FieldError id="rental-dates-error">{t('rental.errors.datesRequired')}</FieldError>
          ) : ready && pricePerDay != null ? (
            <p
              className="rounded-[var(--radius)] bg-card-muted px-3 py-2 text-[15px] font-semibold text-foreground"
              data-testid="rental-total"
            >
              {t('rental.summary', {
                count: days,
                price: formatPrice(pricePerDay, currency, locale),
                total: formatPrice(days * pricePerDay, currency, locale),
              })}
            </p>
          ) : datesMissing ? (
            <p className="text-[13px] text-muted-foreground">{t('rental.hint')}</p>
          ) : null}
        </div>
      </ContactForm>
    </div>
  );
}

export default RentalBookingCard;
