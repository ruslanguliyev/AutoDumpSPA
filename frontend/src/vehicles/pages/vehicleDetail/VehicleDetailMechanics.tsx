import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';

import SpecialistCard from '@/specialists/components/SpecialistCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import type { SpecialistProfile } from '@/specialists/types/specialist.types';

type Props = {
  specialists: SpecialistProfile[];
  isLoading: boolean;
  isError: boolean;
};

export function VehicleDetailMechanics({ specialists, isLoading, isError }: Props) {
  const { t } = useTranslation('specialists');

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
      <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{t('match.title')}</h2>

      {isLoading ? (
        <p className="mt-4 text-[15px] text-muted-foreground">{t('match.loading')}</p>
      ) : isError ? (
        <p className="mt-4 text-[15px] text-destructive" role="alert">
          {t('match.errorFailed')}
        </p>
      ) : specialists.length > 0 ? (
        <ul className="mt-4 grid list-none grid-cols-1 gap-4 lg:grid-cols-2">
          {specialists.map((specialist) => (
            <li key={specialist.id} className="min-w-0">
              <SpecialistCard specialist={specialist} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-4" icon={<Wrench size={26} strokeWidth={1.5} />}>
          {t('match.empty')}
        </EmptyState>
      )}
    </section>
  );
}

export default VehicleDetailMechanics;
