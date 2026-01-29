import { useMemo } from 'react';
import ServicesFilter from '@/services/components/ServicesFilter';
import ServicesGrid from '@/services/components/ServicesGrid';
import { useServices } from '@/services/hooks/useServices';
import { useServicesFiltersStore } from '@/services/store/servicesFilters.store';

export default function ServicesListPage() {
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

  const setCity = useServicesFiltersStore((state) => state.setCity);
  const setRadiusKm = useServicesFiltersStore((state) => state.setRadiusKm);
  const toggleServiceType = useServicesFiltersStore((state) => state.toggleServiceType);
  const toggleServiceCode = useServicesFiltersStore((state) => state.toggleServiceCode);
  const toggleBrand = useServicesFiltersStore((state) => state.toggleBrand);
  const toggleCategory = useServicesFiltersStore((state) => state.toggleCategory);
  const setRatingFrom = useServicesFiltersStore((state) => state.setRatingFrom);
  const togglePriceRange = useServicesFiltersStore((state) => state.togglePriceRange);
  const toggleVerified = useServicesFiltersStore((state) => state.toggleVerified);
  const reset = useServicesFiltersStore((state) => state.reset);

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

  const { services, isLoading, error } = useServices();

  // Derive options from services data
  const options = useMemo(() => {
    const serviceTypes = [
      { value: 'garage', label: 'Garage' },
      { value: 'official', label: 'Official' },
      { value: 'detailing', label: 'Detailing' },
      { value: 'tire', label: 'Tire' },
      { value: 'electric', label: 'Electric' },
      { value: 'body', label: 'Body' },
    ];

    const serviceCodes = [];
    const brands = new Set();
    const categories = new Set();
    const cities = new Set();
    const priceRanges = [
      { value: 1, label: '$' },
      { value: 2, label: '$$' },
      { value: 3, label: '$$$' },
      { value: 4, label: '$$$$' },
    ];

    services.forEach((service) => {
      if (service.location?.city) cities.add(service.location.city);
      if (service.services) {
        service.services.forEach((item) => {
          if (item.code) serviceCodes.push({ value: item.code, label: item.title || item.code });
          if (item.applicableBrands) {
            item.applicableBrands.forEach((b) => brands.add(b));
          }
        });
      }
      if (service.categories) {
        service.categories.forEach((c) => categories.add(c));
      }
    });

    return {
      serviceTypes,
      serviceCodes: Array.from(new Map(serviceCodes.map((s) => [s.value, s])).values()),
      brands: Array.from(brands).sort().map((b) => ({ value: b, label: b })),
      categories: Array.from(categories).sort().map((c) => ({ value: c, label: c })),
      cities: Array.from(cities).sort().map((c) => ({ value: c, label: c })),
      priceRanges,
    };
  }, [services]);

  const handleFilterChange = (key, value) => {
    if (key === 'city') setCity(value);
    else if (key === 'radiusKm') setRadiusKm(value);
    else if (key === 'toggleServiceType') toggleServiceType(value);
    else if (key === 'toggleServiceCode') toggleServiceCode(value);
    else if (key === 'toggleBrand') toggleBrand(value);
    else if (key === 'toggleCategory') toggleCategory(value);
    else if (key === 'ratingFrom') setRatingFrom(value);
    else if (key === 'togglePriceRange') togglePriceRange(value);
    else if (key === 'verifiedOnly') toggleVerified();
  };

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Auto Services</h1>
            <p className="mt-1 text-sm text-slate-500">
              Find professional automotive services near you
            </p>
          </div>

          <ServicesFilter
            filters={filters}
            options={options}
            onChange={handleFilterChange}
            onReset={reset}
            total={services.length}
            isLoading={isLoading}
          />
        </header>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="font-semibold">Failed to load services.</div>
            <div className="mt-1">
              {errorMessage ? <span>{errorMessage}. </span> : null}
              Check <code className="rounded bg-red-100 px-1">VITE_GRAPHQL_ENDPOINT</code>.
            </div>
          </div>
        ) : null}

        <ServicesGrid services={services} isLoading={isLoading} />
      </div>
    </div>
  );
}
