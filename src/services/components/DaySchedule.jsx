export default function DaySchedule({ day, schedule, isToday = false }) {
  if (!schedule) return null;
  const dayName = day;
  const dayTime = schedule.closed
    ? 'Closed'
    : schedule.from && schedule.to
      ? `${schedule.from}-${schedule.to}`
      : '—';

  return (
    <div className={`service-detail-page__sidebar hours-item ${isToday ? 'today' : ''}`}>
      <span className={`day-name ${schedule.closed ? 'closed' : ''}`}>
        {dayName}{isToday ? ' (Today)' : ''}
      </span>
      <span className={`day-time ${schedule.closed ? 'closed' : ''}`}>{dayTime}</span>
    </div>
  );
}
