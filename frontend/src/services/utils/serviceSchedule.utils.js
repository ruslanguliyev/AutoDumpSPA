const SERVICE_TIME_ZONE = 'Asia/Baku';

export const SCHEDULE_DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAY_ALIASES = {
  monday: ['monday', 'mon'],
  tuesday: ['tuesday', 'tue'],
  wednesday: ['wednesday', 'wed'],
  thursday: ['thursday', 'thu'],
  friday: ['friday', 'fri'],
  saturday: ['saturday', 'sat'],
  sunday: ['sunday', 'sun'],
};

const padHm = (value) => {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return String(value).trim();
  return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const parseDayHours = (raw) => {
  if (raw == null || raw === '') return { closed: true };
  if (typeof raw === 'string') {
    const match = raw.trim().match(/^(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})$/);
    if (!match) return { closed: true };
    return { from: padHm(match[1]), to: padHm(match[2]), closed: false };
  }
  if (typeof raw === 'object') {
    if (raw.closed) return { closed: true };
    if (raw.from && raw.to) return { from: padHm(raw.from), to: padHm(raw.to), closed: false };
  }
  return { closed: true };
};

/**
 * Seed JSON uses both `{ monday: { from, to } }` and `{ mon: '09:00-18:00', sun: null }`.
 * Returns null when nothing can be shown as hours.
 */
export const normalizeServiceSchedule = (schedule) => {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) return null;
  const normalized = {};
  let hasHours = false;
  for (const day of SCHEDULE_DAY_KEYS) {
    const raw = DAY_ALIASES[day].map((key) => schedule[key]).find((value) => value !== undefined);
    const parsed = parseDayHours(raw);
    normalized[day] = parsed;
    if (!parsed.closed) hasHours = true;
  }
  return hasHours ? normalized : null;
};

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
  const normalized = normalizeServiceSchedule(schedule);
  if (!normalized) return null;
  const { dayKey } = getServiceLocalNow(date);
  return normalized[dayKey] ?? null;
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
