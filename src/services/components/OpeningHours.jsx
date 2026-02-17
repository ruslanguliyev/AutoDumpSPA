import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DaySchedule from './DaySchedule';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function OpeningHours({ schedule }) {
  const { t } = useTranslation('services');
  if (!schedule) return null;

  const today = new Date().getDay();

  return (
    <section className="opening-hours rounded-xl border border-border bg-card p-4 sm:rounded-2xl sm:p-6">
      <div className="hours-header">
        <div className="hours-icon">
          <Clock size={16} />
        </div>
        <h3 className="hours-title">{t('sidebar.openingHours')}</h3>
      </div>
      <div className="hours-list">
        {DAY_KEYS.map((key, idx) => (
          <DaySchedule
            key={key}
            day={t(`days.${key}`)}
            schedule={schedule[key]}
            isToday={today === (idx === 6 ? 0 : idx + 1)}
          />
        ))}
      </div>
    </section>
  );
}
