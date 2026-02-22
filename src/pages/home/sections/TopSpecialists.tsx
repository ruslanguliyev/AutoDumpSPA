import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpecialistsQuery } from '@/specialists/hooks/useSpecialists';
import SpecialistCard from '@/specialists/components/SpecialistCard';
import SectionHeader from '@/shared/ui/SectionHeader';
import Skeleton from '@/shared/ui/Skeleton';

const SPECIALISTS_LIMIT = 4;

const TopSpecialists = () => {
  const { t } = useTranslation('home');
  const { specialists, isLoading } = useSpecialistsQuery({});

  const topSpecialists = useMemo(() => {
    const sorted = [...specialists].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted.slice(0, SPECIALISTS_LIMIT);
  }, [specialists]);

  if (isLoading) {
    return (
      <section className="py-8">
        <SectionHeader title={t('sections.topSpecialists', 'Top Specialists')} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: SPECIALISTS_LIMIT }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (topSpecialists.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <SectionHeader
        title={t('sections.topSpecialists', 'Top Specialists')}
        linkText={t('common.findSpecialists', 'Find Specialists')}
        linkHref="/specialists"
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {topSpecialists.map((specialist) => (
          <SpecialistCard key={specialist.id} specialist={specialist} />
        ))}
      </div>
    </section>
  );
};

export default TopSpecialists;
