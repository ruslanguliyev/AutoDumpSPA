import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getServiceLocalNow } from '@/services/utils/serviceSchedule.utils';
import DaySchedule from './DaySchedule';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function OpeningHours({ schedule }) {
  const { t } = useTranslation('services');
  if (!schedule) return null;

  const { dayKey } = getServiceLocalNow();

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-foreground">
        <Clock size={18} strokeWidth={1.5} aria-hidden="true" />
        {t('sidebar.openingHours')}
      </div>
      <div>
        {DAY_KEYS.map((key) => (
          <DaySchedule
            key={key}
            day={t(`days.${key}`)}
            schedule={schedule[key]}
            isToday={key === dayKey}
          />
        ))}
      </div>
    </section>
  );
}
