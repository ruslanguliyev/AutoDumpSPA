import { PARTS_DEFAULT_FILTER } from './parts.constants';

/**
 * Merge user filters with defaults and keep only domain fields.
 * @param {import('./parts.types').PartsFilter} filters
 * @returns {import('./parts.types').PartsFilter}
 */
export const sanitizeFilters = (filters = PARTS_DEFAULT_FILTER) => {
  const merged = { ...PARTS_DEFAULT_FILTER, ...filters };

  const safeNumber = (value) => {
    if (value === '' || value === null || value === undefined) return '';
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : '';
  };

  return {
    search: merged.search?.trim() || '',
    category: merged.category || 'all',
    brand: merged.brand?.trim() || '',
    model: merged.model?.trim() || '',
    condition: merged.condition || 'all',
    priceFrom: safeNumber(merged.priceFrom),
    priceTo: safeNumber(merged.priceTo),
    location: merged.location?.trim() || '',
    sort: merged.sort || 'RELEVANCE',
    limit: merged.limit ?? PARTS_DEFAULT_FILTER.limit,
    offset: merged.offset ?? PARTS_DEFAULT_FILTER.offset,
  };
};

/**
 * Map transport-layer part to domain entity.
 * @param {{ id: string; name: string; category?: string; brand?: string; model?: string; condition?: string; description?: string; price?: number; currency?: string; oemCode?: string; compatibility?: string[]; stock?: number; location?: string; imageUrl?: string }} dto
 * @returns {import('./parts.types').PartEntity}
 */
export const mapPartToEntity = (dto) => ({
  id: dto.id,
  name: dto.name,
  category: dto.category || 'unspecified',
  brand: dto.brand || 'Unknown',
  model: dto.model || 'Compatible models',
  condition: dto.condition || 'unknown',
  description: dto.description || '',
  price: dto.price ?? 0,
  currency: dto.currency || 'USD',
  oemCode: dto.oemCode || '',
  compatibility: dto.compatibility ?? [],
  stock: dto.stock ?? 0,
  location: dto.location || 'N/A',
  imageUrl:
    dto.imageUrl ||
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=60',
});

/**
 * Map transport-layer payload to domain result.
 * @param {{ items?: Array<Record<string, unknown>>; total?: number } | null | undefined} payload
 * @returns {import('./parts.types').PartsResult}
 */
export const mapPartsPayloadToDomain = (payload) => ({
  items: (payload?.items || []).map(mapPartToEntity),
  total: payload?.total ?? 0,
});

