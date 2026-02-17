import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { useSellersData } from '@/sellers/hooks/useSellersData';

const DEFAULT_RATING = '4.5';
const DEFAULT_LISTINGS = 'any';

const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const useSellers = ({ vehicles, parts } = {}) => {
  const { t } = useTranslation('sellers');
  const filters = useFiltersStore((state) => state.filters.sellers);
  const sellers = useSellersData({ vehicles, parts });
  const safeSellers = Array.isArray(sellers) ? sellers : [];

  const DOMAIN_OPTIONS = useMemo(
    () => [
      { value: 'all', label: t('filters.domain.all') },
      { value: 'cars', label: t('filters.domain.cars') },
      { value: 'parts', label: t('filters.domain.parts') },
    ],
    [t]
  );

  const SELLER_TYPE_OPTIONS = useMemo(
    () => [
      { value: '', label: t('filters.sellerTypeOptions.any') },
      { value: 'dealer', label: t('filters.sellerTypeOptions.dealer') },
      { value: 'reseller', label: t('filters.sellerTypeOptions.reseller') },
    ],
    [t]
  );

  const RATING_OPTIONS = useMemo(
    () => [
      { value: '', label: t('filters.ratingOptions.any') },
      { value: '4.5', label: t('filters.ratingOptions.rating45') },
      { value: '4.0', label: t('filters.ratingOptions.rating40') },
      { value: '3.5', label: t('filters.ratingOptions.rating35') },
    ],
    [t]
  );

  const LISTING_OPTIONS = useMemo(
    () => [
      { value: 'any', label: t('filters.listingsOptions.any') },
      { value: '1-10', label: t('filters.listingsOptions.1-10') },
      { value: '10-50', label: t('filters.listingsOptions.10-50') },
      { value: '50+', label: t('filters.listingsOptions.50+') },
    ],
    [t]
  );

  const SORT_OPTIONS = useMemo(
    () => [
      { value: 'rating', label: t('filters.sortOptions.rating') },
      { value: 'listings', label: t('filters.sortOptions.listings') },
      { value: 'newest', label: t('filters.sortOptions.newest') },
      { value: 'az', label: t('filters.sortOptions.az') },
    ],
    [t]
  );

  const filteredSellers = useMemo(() => {
    const ratingMin = Number(filters.rating);
    const hasRatingMin =
      Number.isFinite(ratingMin) && String(filters.rating ?? '') !== '';

    return safeSellers.filter((seller) => {
      if (filters.domain !== 'all' && seller.domain !== filters.domain) return false;
      if (filters.sellerType && seller.type !== filters.sellerType) return false;
      if (seller?.type === 'private') return false;

      if (filters.search?.trim()) {
        const query = normalize(filters.search);
        const haystack = normalize(`${seller.name ?? ''} ${seller.city ?? ''}`);
        if (!haystack.includes(query)) return false;
      }

      if (filters.city) {
        if (normalize(seller?.city) !== normalize(filters.city)) return false;
      }

      if (hasRatingMin) {
        const rating = Number(seller?.rating);
        if (!Number.isFinite(rating) || rating < ratingMin) return false;
      }

      if (filters.listings && filters.listings !== 'any') {
        const count = Number(seller?.listingsCount);
        const n = Number.isFinite(count) ? count : 0;
        if (filters.listings === '1-10' && (n < 1 || n > 10)) return false;
        if (filters.listings === '10-50' && (n < 10 || n > 50)) return false;
        if (filters.listings === '50+' && n < 50) return false;
      }

      if (filters.verifiedOnly && !seller?.verified) return false;

      return true;
    });
  }, [
    filters.city,
    filters.domain,
    filters.listings,
    filters.rating,
    filters.search,
    filters.sellerType,
    filters.verifiedOnly,
    safeSellers,
  ]);

  const cityOptions = useMemo(() => {
    const set = new Set();
    safeSellers.forEach((seller) => {
      const city = typeof seller?.city === 'string' ? seller.city.trim() : '';
      if (city) set.add(city);
    });
    return [
      { value: '', label: t('filters.cityOptions.any') },
      ...Array.from(set).sort().map((c) => ({ value: c, label: c })),
    ];
  }, [safeSellers, t]);

  const filterOptions = useMemo(
    () => ({
      domains: DOMAIN_OPTIONS,
      sellerTypes: SELLER_TYPE_OPTIONS,
      ratings: RATING_OPTIONS,
      listings: LISTING_OPTIONS,
      cities: cityOptions,
      sorts: SORT_OPTIONS,
    }),
    [
      DOMAIN_OPTIONS,
      SELLER_TYPE_OPTIONS,
      RATING_OPTIONS,
      LISTING_OPTIONS,
      cityOptions,
      SORT_OPTIONS,
    ]
  );

  const isFiltering =
    filters.domain !== 'all' ||
    filters.sellerType !== '' ||
    filters.rating !== DEFAULT_RATING ||
    filters.listings !== DEFAULT_LISTINGS ||
    filters.city !== '' ||
    filters.search !== '' ||
    filters.verifiedOnly;

  return {
    sellers: safeSellers,
    filteredSellers,
    filterOptions,
    isFiltering,
  };
};
