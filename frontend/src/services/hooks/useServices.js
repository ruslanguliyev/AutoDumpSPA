import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getServices } from '@/services/api/services.query';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
const SERVICES_QUERY_KEY = 'services';

export const useServices = () => {
  const filters = useFiltersStore((state) => state.filters.services);

  const query = useQuery({
    queryKey: [SERVICES_QUERY_KEY, filters],
    queryFn: () => getServices(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const services = useMemo(() => query.data ?? [], [query.data]);

  /** Brand chips must reflect the city-scoped catalogue, not the current brand selection. */
  const brandCatalogFilters = useMemo(() => {
    const defaults = getDefaultFilters('services');
    return {
      ...defaults,
      city: filters.city ?? '',
    };
  }, [filters.city]);

  const brandCatalogQuery = useQuery({
    queryKey: [SERVICES_QUERY_KEY, 'brand-catalog', brandCatalogFilters.city],
    queryFn: () => getServices(brandCatalogFilters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const options = useMemo(() => {
    const serviceCodes = [];
    const brands = new Set();
    const catalog = brandCatalogQuery.data ?? services;

    catalog.forEach((service) => {
      service.supportedBrands?.forEach((brand) => {
        if (brand) brands.add(brand);
      });

      if (service.services) {
        service.services.forEach((item) => {
          if (item.code) {
            serviceCodes.push({
              value: item.code,
              label: item.title || item.code,
            });
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
  }, [brandCatalogQuery.data, services]);

  return {
    services,
    options,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
