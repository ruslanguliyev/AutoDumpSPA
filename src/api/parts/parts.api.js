import { apolloClient } from '@/graphql/client';
import { PartsDocument } from '@/graphql/generated/graphql';
import { sanitizeFilters, mapPartsPayloadToDomain } from '@/domain/parts/filterParts';

const buildPartsFilterInput = (filters) => ({
  search: filters.search || null,
  category: filters.category === 'all' ? null : filters.category,
  brand: filters.brand || null,
  model: filters.model || null,
  condition: filters.condition === 'all' ? null : filters.condition,
  priceFrom: filters.priceFrom === '' ? null : filters.priceFrom,
  priceTo: filters.priceTo === '' ? null : filters.priceTo,
  location: filters.location || null,
  sort: filters.sort || null,
  limit: filters.limit,
  offset: filters.offset,
});

/**
 * Fetch parts from GraphQL and convert to domain entities.
 * @param {import('@/domain/parts/parts.types').PartsFilter} filters
 * @returns {Promise<import('@/domain/parts/parts.types').PartsResult>}
 */
export const fetchParts = async (filters) => {
  const normalized = sanitizeFilters(filters);
  const variables = { filter: buildPartsFilterInput(normalized) };

  const { data } = await apolloClient.query({
    query: PartsDocument,
    variables,
    fetchPolicy: 'network-only',
  });

  return mapPartsPayloadToDomain(data?.parts);
};

