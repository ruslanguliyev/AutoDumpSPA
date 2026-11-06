import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { isValidPhone } from '@/features/addItem/utils/validateDraft';
import type { AppointmentTargetType } from '@/features/appointments/api/appointments.api';
import { useRequestAppointment } from '@/features/appointments/hooks/useAppointments';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useMyProfessional } from '@/features/professional/hooks/useProfessional';
import { todayString } from '@/features/rentals/api/rentals.api';

const MAX_DAYS_AHEAD = 90;

const addDays = (day: string, offset: number) => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * "Book a visit" box for a specialist or service center: the customer proposes a day (and time),
 * the owner confirms or declines it from the dashboard.
 */
export function AppointmentRequestCard({
  targetType,
  targetId,
  accepting = true,
  className = '',
}: {
  targetType: AppointmentTargetType;
  targetId?: string;
  /** False when the profile is switched off ("not available"). */
  accepting?: boolean;
  className?: string;
}) {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mine = useMyProfessional();
  const request = useRequestAppointment();

  const today = todayString();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');

  if (!targetId) return null;
  const box = `rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] sm:p-6 ${className}`;

  const ownProfile =
    (targetType === 'SPECIALIST' && mine.specialist?.id === targetId) ||
    (targetType === 'SERVICE_CENTER' && mine.serviceCenter?.id === targetId);
  if (ownProfile) return null;

  if (request.isSuccess) {
    return (
      <section className={box}>
        <h3 className="text-base font-semibold text-foreground">{t('appointment.sentTitle')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t('appointment.sentText')}</p>
        <Link to="/dashboard/appointments" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
          {t('appointment.myBookings')}
        </Link>
      </section>
    );
  }

  const phoneInvalid = !isValidPhone(phone);
  const canSubmit = Boolean(date) && !phoneInvalid && !request.isPending;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    request.mutate({
      targetType,
      targetId,
      date,
      time: time || undefined,
      vehicle: vehicle.trim() || undefined,
      message: message.trim() || undefined,
      phone: phone.trim(),
    });
  };

  return (
    <section className={box}>
      <h3 className="text-base font-semibold text-foreground">{t('appointment.title')}</h3>
      {!accepting ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('appointment.notAccepting')}</p>
      ) : !isAuthenticated ? (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">{t('appointment.loginRequired')}</p>
          <Link
            to="/login"
            state={{ from: location }}
            className="mt-2 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
          >
            {t('contact.login')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-3 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground" htmlFor="appt-date">
                {t('appointment.date')}
              </label>
              <input
                id="appt-date"
                type="date"
                className={inputClass}
                min={today}
                max={addDays(today, MAX_DAYS_AHEAD)}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  request.reset();
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground" htmlFor="appt-time">
                {t('appointment.time')}
              </label>
              <input id="appt-time" type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <input
            className={inputClass}
            maxLength={100}
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder={t('appointment.vehiclePlaceholder')}
            aria-label={t('appointment.vehiclePlaceholder')}
          />
          <textarea
            className={inputClass}
            rows={3}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('appointment.messagePlaceholder')}
            aria-label={t('appointment.messagePlaceholder')}
          />
          <div>
            <input
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('appointment.phonePlaceholder')}
              aria-label={t('appointment.phonePlaceholder')}
            />
            {phone.trim() && phoneInvalid ? (
              <p className="mt-1 text-xs text-destructive">{t('settings.seller.phoneInvalid')}</p>
            ) : null}
          </div>
          {request.isError ? (
            <p role="alert" className="text-xs text-destructive">
              {request.error.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
          >
            {request.isPending ? t('settings.saving') : t('appointment.request')}
          </button>
          <p className="text-xs text-muted-foreground">{t('appointment.note')}</p>
        </form>
      )}
    </section>
  );
}

export default AppointmentRequestCard;
