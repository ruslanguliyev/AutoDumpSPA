const SERVICE_TIME_ZONE = 'Asia/Baku';

/** Local calendar day and clock in the service centre's timezone (Baku). */
export const getServiceLocalNow = (date = new Date()) => {
  const weekdayLong = new Intl.DateTimeFormat('en-US', {
    timeZone: SERVICE_TIME_ZONE,
    weekday: 'long',
  })
    .format(date)
    .toLowerCase();

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SERVICE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';

  return {
    dayKey: weekdayLong,
    currentTime: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
  };
};

export const getCurrentDaySchedule = (schedule, date = new Date()) => {
  if (!schedule) return null;
  const { dayKey } = getServiceLocalNow(date);
  return schedule[dayKey] ?? null;
};

export const isServiceOpen = (schedule, date = new Date()) => {
  const todaySchedule = getCurrentDaySchedule(schedule, date);
  if (!todaySchedule || todaySchedule.closed) return false;

  const { currentTime } = getServiceLocalNow(date);

  if (todaySchedule.from && todaySchedule.to) {
    return currentTime >= todaySchedule.from && currentTime <= todaySchedule.to;
  }

  return false;
};
