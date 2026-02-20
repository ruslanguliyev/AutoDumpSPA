import type {
  SpecialistsFiltersInput,
  SpecialistsQueryResponse,
  SpecialistsByIdsResponse,
  SpecialistBySlugResponse,
} from '@/specialists/api/specialists.types';
import type {
  SpecialistDetail,
  SpecialistProfile,
} from '@/specialists/types/specialist.types';
import type { SpecialistsDataProvider } from '@/shared/api/specialists.provider';

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

type GraphqlRequestArgs = {
  query: string;
  variables?: Record<string, unknown>;
};

const graphqlRequest = async <T>({
  query,
  variables,
}: GraphqlRequestArgs): Promise<T> => {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed (${res.status})`);
  }

  const json = await res.json();
  const firstErrorMessage = json?.errors?.[0]?.message;
  if (firstErrorMessage) {
    throw new Error(firstErrorMessage);
  }

  return json?.data ?? null;
};

const GET_SPECIALISTS_QUERY = `
query GetSpecialists($filters: SpecialistsFilterInput) {
  getSpecialists(filters: $filters) {
    id
    name
    slug
    description
    experienceYears
    rating
    reviewsCount
    verified
    mobileService
    priceFrom
    avatarUrl
    coverImage
  }
}
`;

const GET_SPECIALIST_BY_SLUG_QUERY = `
query GetSpecialistBySlug($slug: String!) {
  getSpecialistBySlug(slug: $slug) {
    id
    name
    slug
    description
    experienceYears
    rating
    reviewsCount
    verified
    mobileService
    priceFrom
    avatarUrl
    coverImage
    phone
    whatsapp
    specializations
    supportedVehicles {
      brand
      model
      yearFrom
      yearTo
    }
    portfolio
    reviews {
      id
      rating
      comment
      authorName
      createdAt
    }
  }
}
`;

const GET_SPECIALISTS_BY_IDS_QUERY = `
query GetSpecialistsByIds($ids: [ID!]!) {
  getSpecialistsByIds(ids: $ids) {
    id
    name
    slug
    description
    experienceYears
    rating
    reviewsCount
    verified
    mobileService
    priceFrom
    avatarUrl
    coverImage
  }
}
`;

const normalizeValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const toNumberOrNull = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildFiltersInput = (filters: SpecialistsFiltersInput = {}) => ({
  brand: normalizeValue(filters.brand),
  model: normalizeValue(filters.model),
  year: toNumberOrNull(filters.year),
  specialization: filters.specialization ?? null,
  city: normalizeValue(filters.city),
  minRating: toNumberOrNull(filters.minRating),
});

export const getSpecialists = async (
  filters: SpecialistsFiltersInput = {}
): Promise<SpecialistProfile[]> => {
  const data = await graphqlRequest<SpecialistsQueryResponse>({
    query: GET_SPECIALISTS_QUERY,
    variables: { filters: buildFiltersInput(filters) },
  });

  return data?.getSpecialists ?? [];
};

export const getSpecialistsByIds = async (
  ids: string[]
): Promise<SpecialistProfile[]> => {
  const safeIds = Array.from(
    new Set((ids ?? []).map((id) => String(id).trim()).filter(Boolean))
  );
  if (safeIds.length === 0) return [];

  const data = await graphqlRequest<SpecialistsByIdsResponse>({
    query: GET_SPECIALISTS_BY_IDS_QUERY,
    variables: { ids: safeIds },
  });

  return data?.getSpecialistsByIds ?? [];
};

export const getSpecialistBySlug = async (
  slug: string
): Promise<SpecialistDetail | null> => {
  const safeSlug = String(slug ?? '').trim();
  if (!safeSlug) return null;

  const data = await graphqlRequest<SpecialistBySlugResponse>({
    query: GET_SPECIALIST_BY_SLUG_QUERY,
    variables: { slug: safeSlug },
  });

  return data?.getSpecialistBySlug ?? null;
};

export const specialistsGraphqlApi: SpecialistsDataProvider = {
  getSpecialists,
  getSpecialistsByIds,
  getSpecialistBySlug,
};
