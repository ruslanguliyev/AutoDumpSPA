import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialistCard from '@/specialists/components/SpecialistCard';
import { useSpecialistsQuery } from '@/specialists/hooks/useSpecialists';
import type { Specialization } from '@/specialists/types/specialist.types';

type SimilarSpecialistsSectionProps = {
  currentId: string;
  specialization?: Specialization | null;
};

const SimilarSpecialistsSection = ({
  currentId,
  specialization,
}: SimilarSpecialistsSectionProps) => {
  const { t } = useTranslation('specialists');

  const { specialists: raw, isLoading } = useSpecialistsQuery(
    {
      specialization: specialization ?? null,
      brand: null,
      model: null,
      year: null,
      city: null,
      minRating: null,
    },
    { enabled: true }
  );

  const similar = useMemo(
    () => raw.filter((s) => s.id !== currentId).slice(0, 4),
    [raw, currentId]
  );

  if (isLoading || !similar.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('detail.similarTitle')}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('detail.similarSubtitle')}</p>
        </div>
        <Link
          to="/specialists"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t('detail.viewAllLink')}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {similar.map((item) => (
          <SpecialistCard key={item.id} specialist={item} />
        ))}
      </div>
    </section>
  );
};

export default SimilarSpecialistsSection;
