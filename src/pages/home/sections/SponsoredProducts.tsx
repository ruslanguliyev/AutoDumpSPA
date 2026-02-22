import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParts } from '@/parts/hooks/useParts';
import PartCard from '@/parts/components/PartCard/PartCard';
import SectionHeader from '@/shared/ui/SectionHeader';
import Skeleton from '@/shared/ui/Skeleton';

const SPONSORED_LIMIT = 5;

const SponsoredProducts = () => {
  const { t } = useTranslation('home');
  const { parts, isLoading } = useParts();

  const sponsoredParts = useMemo(() => {
    return parts
      .filter((part) => part.isSponsored)
      .slice(0, SPONSORED_LIMIT);
  }, [parts]);

  if (isLoading) {
    return (
      <section className="py-8">
        <SectionHeader title={t('sections.sponsoredProducts', 'Sponsored Products')} />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from({ length: SPONSORED_LIMIT }).map((_, i) => (
            <div key={i} className="w-[220px] shrink-0">
              <Skeleton className="h-[320px] w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (sponsoredParts.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <SectionHeader title={t('sections.sponsoredProducts', 'Sponsored Products')} />
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {sponsoredParts.map((part) => (
          <div key={part.id} className="w-[220px] shrink-0">
            <PartCard part={part} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SponsoredProducts;
