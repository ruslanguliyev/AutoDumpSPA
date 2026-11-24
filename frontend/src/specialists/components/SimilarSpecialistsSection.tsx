import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

import SpecialistCard from '@/specialists/components/SpecialistCard';
import { useSpecialistsQuery } from '@/specialists/hooks/useSpecialists';
import { ROUTES, withLang } from '@/shared/constants/routes';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
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
  const { language } = useLanguageSync();

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
    <section className="min-w-0 space-y-5 [overflow-wrap:anywhere]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{t('detail.similarTitle')}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{t('detail.similarSubtitle')}</p>
        </div>
        <Link
          to={withLang(ROUTES.specialists, language)}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[15px] font-semibold text-primary-text no-underline"
        >
          {t('detail.viewAllLink')}
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
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
