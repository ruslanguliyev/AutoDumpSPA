import { Clock } from 'lucide-react';
import DaySchedule from './DaySchedule';

export default function OpeningHours({ schedule }) {
  if (!schedule) return null;

  const getDayNumber = (dayName) => {
    const days = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
    };
    return days[dayName] ?? -1;
  };

  const today = new Date().getDay();

  return (
    <section className="opening-hours rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
      <div className="hours-header">
        <div className="hours-icon">
          <Clock size={16} />
        </div>
        <h3 className="hours-title">Opening Hours</h3>
      </div>
      <div className="hours-list">
        <DaySchedule day="Monday" schedule={schedule.monday} isToday={today === 1} />
        <DaySchedule day="Tuesday" schedule={schedule.tuesday} isToday={today === 2} />
        <DaySchedule day="Wednesday" schedule={schedule.wednesday} isToday={today === 3} />
        <DaySchedule day="Thursday" schedule={schedule.thursday} isToday={today === 4} />
        <DaySchedule day="Friday" schedule={schedule.friday} isToday={today === 5} />
        <DaySchedule day="Saturday" schedule={schedule.saturday} isToday={today === 6} />
        <DaySchedule day="Sunday" schedule={schedule.sunday} isToday={today === 0} />
      </div>
    </section>
  );
}
