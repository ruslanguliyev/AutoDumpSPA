import type {
  SpecialistsFiltersInput,
  SpecialistsQueryResponse,
  SpecialistsByIdsResponse,
  SpecialistBySlugResponse,
  GqlSpecialistListRow,
  GqlSpecialistDetailRow,
} from '@/specialists/api/specialists.types';
import type {
  SpecialistDetail,
  SpecialistProfile,
} from '@/specialists/types/specialist.types';
import type { SpecialistsDataProvider } from '@/shared/api/specialists.provider';

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql';

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
      'Content-Type': 'application/json',
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
query GetSpecialists($filter: SpecialistsFilterInput) {
  specialists(filter: $filter) {
    id slug name bio city
    avatarUrl coverImage
    specializations skills
    experience rating reviewsCount
    priceFrom mobileService verified available
  }
}
`;

const GET_SPECIALIST_BY_SLUG_QUERY = `
query GetSpecialistBySlug($slug: String!) {
  specialistBySlug(slug: $slug) {
    id slug name bio city phone whatsapp
    avatarUrl coverImage
    specializations skills
    experience rating reviewsCount
    priceFrom hourlyRate mobileService verified available
    portfolio
    supportedVehicles { id brand model yearFrom yearTo }
  }
}
`;

const GET_SPECIALISTS_BY_IDS_QUERY = `
query GetSpecialistsByIds {
  specialists(filter: null) {
    id slug name bio city
    avatarUrl coverImage
    specializations skills
    experience rating reviewsCount
    priceFrom mobileService verified available
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

const mapListRowToProfile = (s: GqlSpecialistListRow): SpecialistProfile => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  description: s.bio ?? null,
  experienceYears: s.experience,
  rating: s.rating,
  reviewsCount: s.reviewsCount,
  verified: s.verified,
  mobileService: s.mobileService,
  priceFrom: toNumberOrNull(s.priceFrom),
  avatarUrl: s.avatarUrl ?? null,
  coverImage: s.coverImage ?? null,
  specializations: s.specializations ?? [],
});

const mapDetailRowToDetail = (s: GqlSpecialistDetailRow): SpecialistDetail => {
  const base = mapListRowToProfile(s);
  return {
    ...base,
    phone: s.phone ?? null,
    whatsapp: s.whatsapp ?? null,
    portfolio: s.portfolio ?? [],
    skills: s.skills ?? [],
    supportedVehicles: (s.supportedVehicles ?? []).map((v) => ({
      brand: v.brand,
      model: v.model,
      yearFrom: v.yearFrom,
      yearTo: v.yearTo,
    })),
  } as SpecialistDetail;
};

const buildSpecialistsFilterInput = (filters: SpecialistsFiltersInput = {}) => {
  const city = normalizeValue(filters.city);
  const minRating = toNumberOrNull(filters.minRating);
  const skills =
    filters.specialization != null
      ? [String(filters.specialization)]
      : undefined;

  const filter: Record<string, unknown> = {};
  if (city) filter.city = city;
  if (skills?.length) filter.skills = skills;
  if (minRating != null) filter.minRating = minRating;
  return Object.keys(filter).length ? filter : undefined;
};

export const getSpecialists = async (
  filters: SpecialistsFiltersInput = {}
): Promise<SpecialistProfile[]> => {
  const data = await graphqlRequest<SpecialistsQueryResponse>({
    query: GET_SPECIALISTS_QUERY,
    variables: { filter: buildSpecialistsFilterInput(filters) ?? null },
  });

  const rows = data?.specialists ?? [];
  return rows.map(mapListRowToProfile);
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
    variables: {},
  });

  const rows = data?.specialists ?? [];
  const idSet = new Set(safeIds);
  return rows
    .filter((s) => idSet.has(s.id))
    .map(mapListRowToProfile);
};

export const getSpecialistBySlug = async (
  slug: string
): Promise<SpecialistDetail | null> => {
  const safeSlug = String(slug ?? '').trim();
  if (!safeSlug) return null;

  try {
    const data = await graphqlRequest<SpecialistBySlugResponse>({
      query: GET_SPECIALIST_BY_SLUG_QUERY,
      variables: { slug: safeSlug },
    });

    const row = data?.specialistBySlug;
    if (!row) return null;
    return mapDetailRowToDetail(row);
  } catch {
    return null;
  }
};

export const specialistsGraphqlApi: SpecialistsDataProvider = {
  getSpecialists,
  getSpecialistsByIds,
  getSpecialistBySlug,
};
