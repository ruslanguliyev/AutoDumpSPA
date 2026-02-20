import type { SpecialistsFiltersInput } from '@/specialists/api/specialists.types';
import type {
  SpecialistDetail,
  SpecialistProfile,
} from '@/specialists/types/specialist.types';

export interface SpecialistsDataProvider {
  getSpecialists: (filters?: SpecialistsFiltersInput) => Promise<SpecialistProfile[]>;
  getSpecialistsByIds: (ids: string[]) => Promise<SpecialistProfile[]>;
  getSpecialistBySlug: (slug: string) => Promise<SpecialistDetail | null>;
}
