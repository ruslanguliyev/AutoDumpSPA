import type { Specialization } from '@/specialists/types/specialist.types';

export type SpecialistsFiltersInput = {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  specialization?: Specialization | null;
  city?: string | null;
  minRating?: number | null;
};

/** Row returned by `specialists` list queries (subset of fields). */
export type GqlSpecialistListRow = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  city: string;
  avatarUrl: string | null;
  coverImage: string | null;
  specializations: string[];
  skills: string[];
  experience: number;
  rating: number;
  reviewsCount: number;
  priceFrom: number | string | null;
  mobileService: boolean;
  verified: boolean;
  available: boolean;
};

/** Row returned by `specialistBySlug`. */
export type GqlSpecialistDetailRow = GqlSpecialistListRow & {
  phone: string | null;
  whatsapp: string | null;
  hourlyRate: number | string | null;
  portfolio: string[];
  supportedVehicles: Array<{
    id: string;
    brand: string;
    model: string;
    yearFrom: number | null;
    yearTo: number | null;
  }>;
};

export type SpecialistsQueryResponse = {
  specialists: GqlSpecialistListRow[];
};

export type SpecialistsByIdsResponse = {
  specialists: GqlSpecialistListRow[];
};

export type SpecialistBySlugResponse = {
  specialistBySlug: GqlSpecialistDetailRow | null;
};
