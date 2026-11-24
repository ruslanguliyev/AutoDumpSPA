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
import Button from '@/shared/ui/button';
import { controlClass } from '@/shared/ui/controlClass';
import { FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/Input';

const MAX_DAYS_AHEAD = 90;

const addDays = (day: string, offset: number) => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

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
  const box = `rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere] ${className}`;

  const ownProfile =
    (targetType === 'SPECIALIST' && mine.specialist?.id === targetId) ||
    (targetType === 'SERVICE_CENTER' && mine.serviceCenter?.id === targetId);
  if (ownProfile) return null;

  if (request.isSuccess) {
    return (
      <section className={box}>
        <h3 className="text-[18px] font-semibold text-foreground">{t('appointment.sentTitle')}</h3>
        <p className="mt-2 text-[15px] text-muted-foreground">{t('appointment.sentText')}</p>
        <Link
          to="/dashboard/appointments"
          className="mt-3 inline-flex min-h-11 items-center text-[15px] font-semibold text-primary-text underline"
        >
          {t('appointment.myBookings')}
        </Link>
      </section>
    );
  }

  const phoneInvalid = phone.trim().length > 0 && !isValidPhone(phone);
  const canSubmit = Boolean(date) && phone.trim().length > 0 && !phoneInvalid && !request.isPending;

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
      <h3 className="text-[18px] font-semibold text-foreground">{t('appointment.title')}</h3>
      {!accepting ? (
        <p className="mt-3 text-[15px] text-muted-foreground">{t('appointment.notAccepting')}</p>
      ) : !isAuthenticated ? (
        <div className="mt-3">
          <p className="text-[15px] text-muted-foreground">{t('appointment.loginRequired')}</p>
          <Button asChild variant="primary" className="mt-3 w-full">
            <Link to="/login" state={{ from: location }}>
              {t('contact.login')}
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label={t('appointment.date')}
              type="date"
              wrapperClassName="min-w-0"
              className="min-w-0"
              min={today}
              max={addDays(today, MAX_DAYS_AHEAD)}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                request.reset();
              }}
            />
            <Input
              label={t('appointment.time')}
              type="time"
              wrapperClassName="min-w-0"
              className="min-w-0"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <Input
            label={t('appointment.vehicle')}
            maxLength={100}
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder={t('appointment.vehiclePlaceholder')}
          />
          <div>
            <FieldLabel htmlFor="appt-note">{t('appointment.messagePlaceholder')}</FieldLabel>
            <textarea
              id="appt-note"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder={t('appointment.messagePlaceholder')}
              className={`${controlClass('md')} h-auto! min-h-24 resize-y py-2.5`}
            />
          </div>
          <Input
            label={t('appointment.phonePlaceholder')}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('appointment.phonePlaceholder')}
            error={phone.trim() && phoneInvalid ? t('settings.seller.phoneInvalid') : null}
          />
          {request.isError ? (
            <p role="alert" className="text-[13px] text-destructive">
              {request.error.message}
            </p>
          ) : null}
          <Button type="submit" disabled={!canSubmit} className="w-full">
            {request.isPending ? t('settings.saving') : t('appointment.request')}
          </Button>
          <p className="text-[13px] text-muted-foreground">{t('appointment.note')}</p>
        </form>
      )}
    </section>
  );
}

export default AppointmentRequestCard;
