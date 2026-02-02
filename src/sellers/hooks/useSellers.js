import { useMemo } from 'react';

import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { useSellersData } from '@/sellers/hooks/useSellersData';

const DOMAIN_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'cars', label: 'Cars' },
  { value: 'parts', label: 'Parts' },
];

// Private sellers don't have public pages — don't expose them in filters.
const SELLER_TYPE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'dealer', label: 'Dealer' },
  { value: 'reseller', label: 'Reseller' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '4.5', label: '4.5+' },
  { value: '4.0', label: '4.0+' },
  { value: '3.5', label: '3.5+' },
];

const LISTING_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: '1-10', label: '1-10' },
  { value: '10-50', label: '10-50' },
  { value: '50+', label: '50+' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'listings', label: 'Listings' },
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'A-Z' },
];

const DEFAULT_RATING = '4.5';
const DEFAULT_LISTINGS = 'any';

const normalize = (value) => String(value ?? '').trim().toLowerCase();

export const useSellers = ({ vehicles, parts } = {}) => {
  const filters = useFiltersStore((state) => state.filters.sellers);
  const sellers = useSellersData({ vehicles, parts });
  const safeSellers = Array.isArray(sellers) ? sellers : [];

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
    return [{ value: '', label: 'Any city' }, ...Array.from(set).sort().map((c) => ({ value: c, label: c }))];
  }, [safeSellers]);

  const filterOptions = useMemo(
    () => ({
      domains: DOMAIN_OPTIONS,
      sellerTypes: SELLER_TYPE_OPTIONS,
      ratings: RATING_OPTIONS,
      listings: LISTING_OPTIONS,
      cities: cityOptions,
      sorts: SORT_OPTIONS,
    }),
    [cityOptions]
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
