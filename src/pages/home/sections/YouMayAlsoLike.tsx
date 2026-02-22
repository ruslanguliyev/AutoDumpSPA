import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchParts } from '@/parts/api/parts.api';
import { PARTS_DEFAULT_FILTER } from '@/parts/utils/parts.constants';
import PartCard from '@/parts/components/PartCard/PartCard';
import SectionHeader from '@/shared/ui/SectionHeader';
import Skeleton from '@/shared/ui/Skeleton';

const RECOMMENDED_LIMIT = 5;

const useRecommendedParts = () => {
  return useQuery({
    queryKey: ['parts', 'recommended'],
    queryFn: () => fetchParts({ ...PARTS_DEFAULT_FILTER, limit: 50 }),
    staleTime: 60_000,
  });
};

const YouMayAlsoLike = () => {
  const { t } = useTranslation('home');
  const { data, isLoading } = useRecommendedParts();

  const recommendedParts = useMemo(() => {
    const items = data?.items ?? [];
    const sorted = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted.slice(0, RECOMMENDED_LIMIT);
  }, [data?.items]);

  if (isLoading) {
    return (
      <section className="py-8">
        <SectionHeader title={t('sections.youMayAlsoLike', 'You May Also Like')} />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: RECOMMENDED_LIMIT }).map((_, i) => (
            <div key={i} className="w-[220px] shrink-0">
              <Skeleton className="h-[320px] w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (recommendedParts.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <SectionHeader
        title={t('sections.youMayAlsoLike', 'You May Also Like')}
        linkText={t('common.seeMore', 'See More')}
        linkHref="/parts"
      />
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recommendedParts.map((part) => (
          <div key={part.id} className="w-[220px] shrink-0">
            <PartCard part={part} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default YouMayAlsoLike;
