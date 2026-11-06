import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import { listingsApi } from '@/dashboard/api/listings.api';
import { rentalsApi, todayString } from '@/features/rentals/api/rentals.api';
import type { RentalBooking, RentalStatus } from '@/features/rentals/api/rentals.api';
import {
  useAddRentalBlock,
  useCancelRental,
  useDecideRental,
  useIncomingRentals,
  useMyRentals,
  useRemoveRentalBlock,
  useRentalBlocks,
} from '@/features/rentals/hooks/useRentals';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

type Tab = 'incoming' | 'mine' | 'calendar';

const STATUS_STYLES: Record<RentalStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-600',
  DECLINED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-muted text-muted-foreground',
};

const buttonClass = 'rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-accent disabled:opacity-50';
const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const money = (value: number, currency: string) =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)} ${currency}`;

function BookingCard({ booking, mode }: { booking: RentalBooking; mode: 'incoming' | 'mine' }) {
  const { t } = useTranslation('dashboard');
  const decide = useDecideRental();
  const cancel = useCancelRental();
  const busy = decide.isPending || cancel.isPending;
  const error = decide.error ?? cancel.error;
  const today = todayString();
  const active = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const photo = resolveMediaUrl(booking.thumbnail);

  return (
    <CardWrapper className="flex flex-col gap-4 p-4 sm:flex-row">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        {photo ? <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">{booking.listingTitle}</h3>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}>
            {t(`rental.status.${booking.status}`)}
          </span>
        </div>
        <p className="text-sm text-foreground">
          {booking.startDate === booking.endDate ? booking.startDate : `${booking.startDate} → ${booking.endDate}`} ·{' '}
          {t('rental.daysCount', { count: booking.days })} · <strong>{money(booking.totalPrice, booking.currency)}</strong>
        </p>
        {booking.deposit ? (
          <p className="text-xs text-muted-foreground">{t('rental.term.deposit', { amount: money(booking.deposit, booking.currency) })}</p>
        ) : null}

        {mode === 'incoming' ? (
          <p className="text-xs text-muted-foreground">
            {booking.renterName}
            {booking.renterEmail ? ` · ${booking.renterEmail}` : ''}
            {booking.phone ? ` · ${booking.phone}` : ''}
          </p>
        ) : booking.status === 'CONFIRMED' && booking.sellerPhone ? (
          <p className="text-xs text-foreground">
            {t('rental.contactOwner', { name: booking.sellerName })}: <strong>{booking.sellerPhone}</strong>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{booking.sellerName}</p>
        )}
        {booking.message ? <p className="whitespace-pre-wrap text-sm text-foreground">{booking.message}</p> : null}

        <div className="flex flex-wrap gap-2 pt-1">
          {booking.vehicleId ? (
            <Link to={`/vehicles/${booking.vehicleId}`} className={`${buttonClass} border-border`}>
              {t('listings.view')}
            </Link>
          ) : null}
          {mode === 'incoming' && booking.status === 'PENDING' ? (
            <>
              <button type="button" className={`${buttonClass} border-emerald-500/50 text-emerald-600`} disabled={busy} onClick={() => decide.mutate({ id: booking.id, confirm: true })}>
                {t('rental.confirm')}
              </button>
              <button type="button" className={`${buttonClass} border-border`} disabled={busy} onClick={() => decide.mutate({ id: booking.id, confirm: false })}>
                {t('rental.decline')}
              </button>
            </>
          ) : null}
          {active && booking.endDate >= today ? (
            <button type="button" className={`${buttonClass} border-destructive/40 text-destructive`} disabled={busy} onClick={() => cancel.mutate(booking.id)}>
              {t('rental.cancel')}
            </button>
          ) : null}
        </div>
        {error ? <p role="alert" className="text-xs text-destructive">{error.message}</p> : null}
      </div>
    </CardWrapper>
  );
}

function BookingList({ mode }: { mode: 'incoming' | 'mine' }) {
  const { t } = useTranslation('dashboard');
  const incoming = useIncomingRentals();
  const mine = useMyRentals();
  const query = mode === 'incoming' ? incoming : mine;
  const items = query.data ?? [];

  if (query.isLoading) return <CardWrapper className="py-16 text-center text-muted-foreground">{t('listings.loading')}</CardWrapper>;
  if (query.error) return <CardWrapper className="py-16 text-center text-destructive">{query.error.message}</CardWrapper>;
  if (items.length === 0) return <CardWrapper className="py-16 text-center text-muted-foreground">{t(`rental.empty.${mode}`)}</CardWrapper>;
  return (
    <ul className="space-y-3">
      {items.map((b) => (
        <li key={b.id}>
          <BookingCard booking={b} mode={mode} />
        </li>
      ))}
    </ul>
  );
}

/** Owner's calendar tool: days on which a car cannot be rented. */
function BlockedDays() {
  const { t } = useTranslation('dashboard');
  const listings = useQuery({ queryKey: ['my-listings'], queryFn: listingsApi.mine });
  const rentals = (listings.data ?? []).filter((l) => l.purpose === 'RENT');
  const [selected, setSelected] = useState('');
  const listingId = selected || rentals[0]?.id || '';
  const blocks = useRentalBlocks(listingId);
  const add = useAddRentalBlock();
  const remove = useRemoveRentalBlock();
  const today = todayString();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');

  if (listings.isLoading) return <CardWrapper className="py-16 text-center text-muted-foreground">{t('listings.loading')}</CardWrapper>;
  if (rentals.length === 0) return <CardWrapper className="py-16 text-center text-muted-foreground">{t('rental.empty.calendar')}</CardWrapper>;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!start || !end || end < start) return;
    add.mutate(
      { listingId, startDate: start, endDate: end, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setStart('');
          setEnd('');
          setNote('');
        },
      },
    );
  };

  return (
    <CardWrapper className="space-y-5 p-5">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground" htmlFor="block-listing">
          {t('rental.car')}
        </label>
        <select id="block-listing" className={inputClass} value={listingId} onChange={(e) => setSelected(e.target.value)}>
          {rentals.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-4">
        <input className={inputClass} type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} aria-label={t('rental.from')} />
        <input className={inputClass} type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} aria-label={t('rental.to')} />
        <input className={inputClass} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('rental.blockNote')} aria-label={t('rental.blockNote')} />
        <button type="submit" className={`${buttonClass} border-border py-2 text-sm`} disabled={add.isPending || !start || !end || end < start}>
          {t('rental.blockDays')}
        </button>
        {add.error ? <p role="alert" className="text-xs text-destructive sm:col-span-4">{add.error.message}</p> : null}
      </form>

      <ul className="space-y-2">
        {(blocks.data ?? []).length === 0 ? <li className="text-sm text-muted-foreground">{t('rental.noBlocks')}</li> : null}
        {(blocks.data ?? []).map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm">
            <span className="text-foreground">
              {b.startDate === b.endDate ? b.startDate : `${b.startDate} → ${b.endDate}`}
              {b.note ? <span className="ml-2 text-muted-foreground">{b.note}</span> : null}
            </span>
            <button type="button" className={`${buttonClass} border-border`} disabled={remove.isPending} onClick={() => remove.mutate(b.id)}>
              {t('rental.unblockDays')}
            </button>
          </li>
        ))}
      </ul>
    </CardWrapper>
  );
}

export function RentalsPage() {
  const { t } = useTranslation('dashboard');
  const [tab, setTab] = useState<Tab>('incoming');
  const pending = useQuery({ queryKey: ['rentals', 'pending-count'], queryFn: rentalsApi.pendingCount });

  return (
    <div className="space-y-8">
      <DashboardHeader title={t('rental.pageTitle')} subtitle={t('rental.pageSubtitle')} />

      <div className="flex flex-wrap gap-2" role="tablist">
        {(['incoming', 'mine', 'calendar'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === key ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'
            }`}
          >
            {t(`rental.tabs.${key}`)}
            {key === 'incoming' && pending.data ? ` (${pending.data})` : ''}
          </button>
        ))}
      </div>

      {tab === 'calendar' ? <BlockedDays /> : <BookingList mode={tab} />}
    </div>
  );
}
