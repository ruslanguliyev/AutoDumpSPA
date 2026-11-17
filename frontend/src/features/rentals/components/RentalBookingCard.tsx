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
import { controlClass } from '@/shared/ui/controlClass';
import { FieldError, FieldLabel } from '@/shared/ui/field';

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

  const onStartChange = (value: string) => {
    setStart(value);
    if (end && value > end) setEnd(value);
    request.reset();
  };

  const onEndChange = (value: string) => {
    setEnd(value);
    request.reset();
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

        <ul className="mt-3 space-y-1 text-[14px] text-muted-foreground">
          <li>{t('rental.term.minDays', { count: terms.minDays })}</li>
          {terms.maxDays ? <li>{t('rental.term.maxDays', { count: terms.maxDays })}</li> : null}
          <li>
            {terms.deposit
              ? t('rental.term.deposit', { amount: formatPrice(terms.deposit, currency, locale) })
              : t('rental.term.noDeposit')}
          </li>
          <li>{terms.kmPerDay ? t('rental.term.kmPerDay', { count: terms.kmPerDay }) : t('rental.term.unlimitedKm')}</li>
          {terms.minDriverAge ? <li>{t('rental.term.minDriverAge', { count: terms.minDriverAge })}</li> : null}
        </ul>

        {unavailable.length > 0 ? (
          <div className="mt-4">
            <p className="text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground">
              {t('rental.unavailableDays')}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {unavailable.map((r) => (
                <li
                  key={`${r.startDate}-${r.endDate}-${r.reason}`}
                  className="rounded-full border border-border px-2.5 py-1 text-[12px] font-semibold text-foreground"
                >
                  {r.startDate === r.endDate
                    ? formatDate(r.startDate, locale)
                    : `${formatDate(r.startDate, locale)} → ${formatDate(r.endDate, locale)}`}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="rental-start">{t('rental.from')}</FieldLabel>
            <input
              id="rental-start"
              type="date"
              className={controlClass('md', showMissing && !start)}
              min={today}
              value={start}
              aria-invalid={showMissing && !start}
              aria-describedby="rental-dates-note"
              onChange={(e) => onStartChange(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="rental-end">{t('rental.to')}</FieldLabel>
            <input
              id="rental-end"
              type="date"
              className={controlClass('md', showMissing && !end)}
              min={start || today}
              value={end}
              aria-invalid={showMissing && !end}
              aria-describedby="rental-dates-note"
              onChange={(e) => onEndChange(e.target.value)}
            />
          </div>
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
