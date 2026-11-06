import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { daysInclusive, rangesOverlap, todayString } from '@/features/rentals/api/rentals.api';
import { useRentalAvailability, useRequestRental } from '@/features/rentals/hooks/useRentals';
import { isValidPhone } from '@/features/addItem/utils/validateDraft';

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

const money = (value: number, currency: string) =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)} ${currency}`;

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** "Rent this car" box on the page of a rental listing: terms, free/busy days, request form. */
export function RentalBookingCard({ car }: { car: RentalCar }) {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const availability = useRentalAvailability(car.listingId);
  const request = useRequestRental();

  const today = todayString();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');

  const terms = car.rental;
  const currency = car.currency ?? 'AZN';
  const pricePerDay = Number(car.price ?? 0);
  const days = daysInclusive(start, end);
  const total = days * pricePerDay;
  const unavailable = availability.data ?? [];

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

  const phoneInvalid = phone.trim().length > 0 && !isValidPhone(phone);
  const canSubmit = Boolean(start && end) && !problem && !phoneInvalid && !request.isPending;

  if (!car.listingId || !terms) return null;

  const box = 'rounded-2xl border border-border bg-card p-4';

  if (request.isSuccess) {
    return (
      <section className={box}>
        <h3 className="text-base font-semibold text-foreground">{t('rental.sentTitle')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('rental.sentText')}</p>
        <Link to="/dashboard/rentals" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
          {t('rental.myBookings')}
        </Link>
      </section>
    );
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    request.mutate({
      listingId: car.listingId!,
      startDate: start,
      endDate: end,
      message: message.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <section className={box}>
      <p className="text-2xl font-bold text-foreground">
        {money(pricePerDay, currency)} <span className="text-sm font-medium text-muted-foreground">{t('rental.perDay')}</span>
      </p>

      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        <li>{t('rental.term.minDays', { count: terms.minDays })}</li>
        {terms.maxDays ? <li>{t('rental.term.maxDays', { count: terms.maxDays })}</li> : null}
        {terms.deposit ? <li>{t('rental.term.deposit', { amount: money(terms.deposit, currency) })}</li> : <li>{t('rental.term.noDeposit')}</li>}
        <li>{terms.kmPerDay ? t('rental.term.kmPerDay', { count: terms.kmPerDay }) : t('rental.term.unlimitedKm')}</li>
        {terms.minDriverAge ? <li>{t('rental.term.minDriverAge', { count: terms.minDriverAge })}</li> : null}
      </ul>

      {unavailable.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('rental.unavailableDays')}</p>
          <ul className="mt-1 flex flex-wrap gap-2 text-xs">
            {unavailable.map((r) => (
              <li key={`${r.startDate}-${r.endDate}-${r.reason}`} className="rounded-full bg-muted px-2.5 py-1 text-foreground">
                {r.startDate === r.endDate ? r.startDate : `${r.startDate} → ${r.endDate}`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!isAuthenticated ? (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{t('rental.loginRequired')}</p>
          <Link
            to="/login"
            state={{ from: location }}
            className="mt-2 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
          >
            {t('contact.login')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground" htmlFor="rental-start">
                {t('rental.from')}
              </label>
              <input
                id="rental-start"
                type="date"
                className={inputClass}
                min={today}
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (end && e.target.value > end) setEnd(e.target.value);
                  request.reset();
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground" htmlFor="rental-end">
                {t('rental.to')}
              </label>
              <input
                id="rental-end"
                type="date"
                className={inputClass}
                min={start || today}
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  request.reset();
                }}
              />
            </div>
          </div>

          {days > 0 && !problem ? (
            <p className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground" data-testid="rental-total">
              {t('rental.total', { count: days, amount: money(total, currency) })}
            </p>
          ) : null}
          {problem ? <p role="alert" className="text-xs text-destructive">{problem}</p> : null}

          <textarea
            className={inputClass}
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('rental.messagePlaceholder')}
          />
          <div>
            <input
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('contact.phonePlaceholder')}
            />
            {phoneInvalid ? <p className="mt-1 text-xs text-destructive">{t('settings.seller.phoneInvalid')}</p> : null}
          </div>

          {request.isError ? <p role="alert" className="text-xs text-destructive">{request.error.message}</p> : null}
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
          >
            {request.isPending ? t('settings.saving') : t('rental.request')}
          </button>
          <p className="text-xs text-muted-foreground">{t('rental.requestNote')}</p>
        </form>
      )}
    </section>
  );
}

export default RentalBookingCard;
