import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParts } from '@/parts/hooks/useParts';
import PartCard from '@/parts/components/PartCard/PartCard';
import SectionHeader from '@/shared/ui/SectionHeader';
import Skeleton from '@/shared/ui/Skeleton';

const SPONSORED_LIMIT = 4;

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: SPONSORED_LIMIT }).map((_, i) => (
            <Skeleton key={i} className="h-[320px] w-full" />
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sponsoredParts.map((part) => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </section>
  );
};

export default SponsoredProducts;
