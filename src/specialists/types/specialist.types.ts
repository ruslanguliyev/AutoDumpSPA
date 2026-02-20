export enum Specialization {
  ENGINE = 'ENGINE',
  TRANSMISSION = 'TRANSMISSION',
  ELECTRICAL = 'ELECTRICAL',
  DETAILING = 'DETAILING',
  TUNING = 'TUNING',
  SUSPENSION = 'SUSPENSION',
  BRAKES = 'BRAKES',
  AC = 'AC',
  DIAGNOSTICS = 'DIAGNOSTICS',
}

export type SupportedVehicle = {
  brand: string;
  model: string;
  yearFrom?: number | null;
  yearTo?: number | null;
};

export type SpecialistProfile = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  experienceYears?: number | null;
  rating?: number | null;
  reviewsCount?: number | null;
  verified?: boolean | null;
  mobileService?: boolean | null;
  priceFrom?: number | null;
  avatarUrl?: string | null;
  coverImage?: string | null;
};

export type SpecialistReview = {
  id: string;
  rating: number;
  comment?: string | null;
  authorName?: string | null;
  createdAt?: string | null;
};

export type SpecialistDetail = SpecialistProfile & {
  specializations?: Specialization[];
  supportedVehicles?: SupportedVehicle[];
  portfolio?: string[];
  reviews?: SpecialistReview[];
  phone?: string | null;
  whatsapp?: string | null;
};
