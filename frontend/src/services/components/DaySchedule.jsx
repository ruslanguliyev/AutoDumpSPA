import { useTranslation } from 'react-i18next';

export default function DaySchedule({ day, schedule, isToday = false }) {
  const { t } = useTranslation('services');
  if (!schedule) return null;

  const dayTime = schedule.closed
    ? t('sidebar.closed')
    : schedule.from && schedule.to
      ? `${schedule.from}–${schedule.to}`
      : '—';

  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-dashed border-border py-2 text-[13px] last:border-0 ${
        isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'
      }`}
    >
      <span>
        {day}
        {isToday ? ` ${t('sidebar.today')}` : ''}
      </span>
      <span className={schedule.closed ? 'text-muted-foreground' : 'text-foreground'}>{dayTime}</span>
    </div>
  );
}
