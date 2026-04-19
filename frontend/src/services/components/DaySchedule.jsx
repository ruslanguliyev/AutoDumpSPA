import { useTranslation } from 'react-i18next';

export default function DaySchedule({ day, schedule, isToday = false }) {
  const { t } = useTranslation('services');
  if (!schedule) return null;
  const dayName = day;
  const dayTime = schedule.closed
    ? t('sidebar.closed')
    : schedule.from && schedule.to
      ? `${schedule.from}-${schedule.to}`
      : t('priceList.noPrice');

  return (
    <div className={`service-detail-page__sidebar hours-item ${isToday ? 'today' : ''}`}>
      <span className={`day-name ${schedule.closed ? 'closed' : ''}`}>
        {dayName}{isToday ? ` ${t('sidebar.today')}` : ''}
      </span>
      <span className={`day-time ${schedule.closed ? 'closed' : ''}`}>{dayTime}</span>
    </div>
  );
}
