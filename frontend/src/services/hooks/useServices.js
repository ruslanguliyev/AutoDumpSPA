import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/services/api/services.query';
import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { isServiceOpen } from '@/services/utils/serviceSchedule.utils';

const SERVICES_QUERY_KEY = 'services';

export const useServices = () => {
  const filters = useFiltersStore((state) => state.filters.services);

  const query = useQuery({
    queryKey: [SERVICES_QUERY_KEY, filters],
    queryFn: () => getServices(filters),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const services = query.data ?? [];

  // Filter by openNow if enabled
  const filteredServices = useMemo(() => {
    if (!filters.openNow) return services;
    return services.filter((service) => {
      if (!service.schedule) return false;
      return isServiceOpen(service.schedule);
    });
  }, [filters.openNow, services]);

  // Sort: promotedLevel (premium > boosted > none) → rating
  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => {
      const promotedOrder = { premium: 3, boosted: 2, none: 1 };
      const aPromoted = promotedOrder[a.promotedLevel] || 1;
      const bPromoted = promotedOrder[b.promotedLevel] || 1;

      if (aPromoted !== bPromoted) {
        return bPromoted - aPromoted;
      }

      return (b.rating || 0) - (a.rating || 0);
    });
  }, [filteredServices]);

  const options = useMemo(() => {
    const serviceCodes = [];
    const brands = new Set();

    sortedServices.forEach((service) => {
      if (service.services) {
        service.services.forEach((item) => {
          if (item.code) {
            serviceCodes.push({
              value: item.code,
              label: item.title || item.code,
            });
          }
          if (item.applicableBrands) {
            item.applicableBrands.forEach((brand) => brands.add(brand));
          }
        });
      }
    });

    return {
      serviceCodes: Array.from(
        new Map(serviceCodes.map((service) => [service.value, service])).values()
      ),
      brands: Array.from(brands)
        .sort()
        .map((brand) => ({ value: brand, label: brand })),
    };
  }, [sortedServices]);

  return {
    services: sortedServices,
    options,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
