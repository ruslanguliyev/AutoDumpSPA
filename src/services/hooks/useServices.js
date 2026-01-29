import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/services/api/services.query';
import { useServicesFiltersStore } from '@/services/store/servicesFilters.store';

const SERVICES_QUERY_KEY = 'services';

export const useServices = () => {
  // Use separate selectors to avoid creating new objects on every render
  const city = useServicesFiltersStore((state) => state.city);
  const radiusKm = useServicesFiltersStore((state) => state.radiusKm);
  const serviceTypes = useServicesFiltersStore((state) => state.serviceTypes);
  const serviceCodes = useServicesFiltersStore((state) => state.serviceCodes);
  const brands = useServicesFiltersStore((state) => state.brands);
  const categories = useServicesFiltersStore((state) => state.categories);
  const ratingFrom = useServicesFiltersStore((state) => state.ratingFrom);
  const priceRange = useServicesFiltersStore((state) => state.priceRange);
  const verifiedOnly = useServicesFiltersStore((state) => state.verifiedOnly);

  // Memoize filters object to prevent unnecessary re-renders
  const filters = useMemo(
    () => ({
      city,
      radiusKm,
      serviceTypes,
      serviceCodes,
      brands,
      categories,
      ratingFrom,
      priceRange,
      verifiedOnly,
    }),
    [city, radiusKm, serviceTypes, serviceCodes, brands, categories, ratingFrom, priceRange, verifiedOnly]
  );

  const query = useQuery({
    queryKey: [SERVICES_QUERY_KEY, filters],
    queryFn: () => getServices(filters),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const services = query.data ?? [];
  
  // Sort: promotedLevel (premium > boosted > none) → rating
  const sortedServices = [...services].sort((a, b) => {
    const promotedOrder = { premium: 3, boosted: 2, none: 1 };
    const aPromoted = promotedOrder[a.promotedLevel] || 1;
    const bPromoted = promotedOrder[b.promotedLevel] || 1;
    
    if (aPromoted !== bPromoted) {
      return bPromoted - aPromoted;
    }
    
    return (b.rating || 0) - (a.rating || 0);
  });

  return {
    services: sortedServices,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
