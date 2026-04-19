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

export type SpecialistCertification = {
  id: string;
  title: string;
  subtitle?: string | null;
  validUntil?: string | null;
  iconCode?: 'ase' | 'ev' | 'generic' | null;
};

export type SpecialistProfile = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  experienceYears?: number | null;
  yearsExperience?: number | null;
  rating?: number | null;
  reviewsCount?: number | null;
  verified?: boolean | null;
  mobileService?: boolean | null;
  priceFrom?: number | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
  banner?: string | null;
  location?: string | null;
  specializations?: string[];
};

export type SpecialistReview = {
  id: string;
  rating: number;
  comment?: string | null;
  authorName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
};

export type SpecialistDetail = SpecialistProfile & {
  specializations?: Specialization[];
  supportedVehicles?: SupportedVehicle[];
  portfolio?: string[];
  reviews?: SpecialistReview[];
  certifications?: SpecialistCertification[];
  phone?: string | null;
  whatsapp?: string | null;
};
