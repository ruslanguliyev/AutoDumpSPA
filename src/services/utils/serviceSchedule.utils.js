export const getCurrentDaySchedule = (schedule) => {
  if (!schedule) return null;
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date().getDay();
  const dayKey = days[today];
  return schedule[dayKey];
};

export const isServiceOpen = (schedule) => {
  const todaySchedule = getCurrentDaySchedule(schedule);
  if (!todaySchedule || todaySchedule.closed) return false;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (todaySchedule.from && todaySchedule.to) {
    return currentTime >= todaySchedule.from && currentTime <= todaySchedule.to;
  }

  return false;
};
