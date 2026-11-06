import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { DashboardHeader } from '@/dashboard/components/DashboardHeader/DashboardHeader';
import type { Appointment, AppointmentStatus } from '@/features/appointments/api/appointments.api';
import {
  useCancelAppointment,
  useDecideAppointment,
  useIncomingAppointments,
  useMyAppointments,
} from '@/features/appointments/hooks/useAppointments';
import { todayString } from '@/features/rentals/api/rentals.api';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';

type Tab = 'incoming' | 'mine';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600',
  CONFIRMED: 'bg-emerald-500/15 text-emerald-600',
  DECLINED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-muted text-muted-foreground',
};

const buttonClass = 'rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-accent disabled:opacity-50';

function AppointmentCard({ appointment: a, mode }: { appointment: Appointment; mode: Tab }) {
  const { t } = useTranslation('dashboard');
  const decide = useDecideAppointment();
  const cancel = useCancelAppointment();
  const busy = decide.isPending || cancel.isPending;
  const error = decide.error ?? cancel.error;
  const today = todayString();
  const upcoming = a.date >= today;
  const publicPath = a.targetType === 'SPECIALIST' ? `/specialists/${a.targetSlug ?? ''}` : `/services/${a.targetSlug ?? a.targetId}`;

  return (
    <CardWrapper className="space-y-1 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {a.date}
          {a.time ? ` · ${a.time}` : ''}
        </h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[a.status]}`}>
          {t(`appointment.status.${a.status}`)}
        </span>
        <span className="text-xs text-muted-foreground">{t(`appointment.kind.${a.targetType}`)}</span>
      </div>

      {mode === 'incoming' ? (
        <p className="text-sm text-foreground">
          {a.customerName} · {a.customerEmail} · <strong>{a.phone}</strong>
        </p>
      ) : (
        <p className="text-sm text-foreground">
          {a.targetSlug ? (
            <Link to={publicPath} className="font-semibold text-primary hover:underline">
              {a.targetName}
            </Link>
          ) : (
            a.targetName
          )}
          {a.status === 'CONFIRMED' && a.targetPhone ? (
            <>
              {' · '}
              {t('appointment.callThem')}: <strong>{a.targetPhone}</strong>
            </>
          ) : null}
        </p>
      )}
      {a.vehicle ? <p className="text-xs text-muted-foreground">{t('appointment.vehicle')}: {a.vehicle}</p> : null}
      {a.message ? <p className="whitespace-pre-wrap text-sm text-foreground">{a.message}</p> : null}

      <div className="flex flex-wrap gap-2 pt-2">
        {mode === 'incoming' && a.status === 'PENDING' && upcoming ? (
          <>
            <button type="button" className={`${buttonClass} border-emerald-500/50 text-emerald-600`} disabled={busy} onClick={() => decide.mutate({ id: a.id, confirm: true })}>
              {t('appointment.confirm')}
            </button>
            <button type="button" className={`${buttonClass} border-border`} disabled={busy} onClick={() => decide.mutate({ id: a.id, confirm: false })}>
              {t('appointment.decline')}
            </button>
          </>
        ) : null}
        {(a.status === 'PENDING' || a.status === 'CONFIRMED') && upcoming ? (
          <button type="button" className={`${buttonClass} border-destructive/40 text-destructive`} disabled={busy} onClick={() => cancel.mutate(a.id)}>
            {t('appointment.cancel')}
          </button>
        ) : null}
      </div>
      {error ? <p role="alert" className="text-xs text-destructive">{error.message}</p> : null}
    </CardWrapper>
  );
}

function AppointmentList({ mode }: { mode: Tab }) {
  const { t } = useTranslation('dashboard');
  const incoming = useIncomingAppointments();
  const mine = useMyAppointments();
  const query = mode === 'incoming' ? incoming : mine;
  const items = query.data ?? [];

  if (query.isLoading) return <CardWrapper className="py-16 text-center text-muted-foreground">{t('listings.loading')}</CardWrapper>;
  if (query.error) return <CardWrapper className="py-16 text-center text-destructive">{query.error.message}</CardWrapper>;
  if (items.length === 0) return <CardWrapper className="py-16 text-center text-muted-foreground">{t(`appointment.empty.${mode}`)}</CardWrapper>;
  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li key={a.id}>
          <AppointmentCard appointment={a} mode={mode} />
        </li>
      ))}
    </ul>
  );
}

export function AppointmentsPage() {
  const { t } = useTranslation('dashboard');
  const [tab, setTab] = useState<Tab>('incoming');
  const incoming = useIncomingAppointments();
  const pending = (incoming.data ?? []).filter((a) => a.status === 'PENDING' && a.date >= todayString()).length;

  return (
    <div className="space-y-8">
      <DashboardHeader title={t('appointment.pageTitle')} subtitle={t('appointment.pageSubtitle')} />

      <div className="flex flex-wrap gap-2" role="tablist">
        {(['incoming', 'mine'] as const).map((key) => (
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
            {t(`appointment.tabs.${key}`)}
            {key === 'incoming' && pending ? ` (${pending})` : ''}
          </button>
        ))}
      </div>

      <AppointmentList mode={tab} />
    </div>
  );
}
