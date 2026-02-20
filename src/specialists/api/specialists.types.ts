import type {
  Specialization,
  SpecialistDetail,
  SpecialistProfile,
} from '@/specialists/types/specialist.types';

export type SpecialistsFiltersInput = {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  specialization?: Specialization | null;
  city?: string | null;
  minRating?: number | null;
};

export type SpecialistsQueryResponse = {
  getSpecialists: SpecialistProfile[];
};

export type SpecialistsByIdsResponse = {
  getSpecialistsByIds: SpecialistProfile[];
};

export type SpecialistBySlugResponse = {
  getSpecialistBySlug: SpecialistDetail | null;
};
