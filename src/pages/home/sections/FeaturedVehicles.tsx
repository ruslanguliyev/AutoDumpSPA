import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getAutos } from '@/vehicles/api/autos';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard';
import SectionHeader from '@/shared/ui/SectionHeader';
import Skeleton from '@/shared/ui/Skeleton';

const VEHICLES_LIMIT = 4;

const useFeaturedVehicles = () => {
  return useQuery({
    queryKey: ['autos', 'featured'],
    queryFn: getAutos,
    staleTime: 30_000,
  });
};

const FeaturedVehicles = () => {
  const { t } = useTranslation('home');
  const { data, isLoading } = useFeaturedVehicles();

  const featuredVehicles = useMemo(() => {
    const autos = data ?? [];
    return autos.slice(0, VEHICLES_LIMIT);
  }, [data]);

  if (isLoading) {
    return (
      <section className="py-8">
        <SectionHeader title={t('sections.featuredVehicles', 'Featured Vehicles')} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: VEHICLES_LIMIT }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (featuredVehicles.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <SectionHeader
        title={t('sections.featuredVehicles', 'Featured Vehicles')}
        linkText={t('common.viewInventory', 'View Inventory')}
        linkHref="/autosearch"
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredVehicles.map((car) => (
          <AutoCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedVehicles;
