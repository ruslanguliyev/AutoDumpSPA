export type ServiceLocation = {
  country?: string | null;
  city?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number | null;
};

export type ServiceMedia = {
  logo?: string | null;
  cover?: string | null;
  gallery?: string[];
};

export type ServiceProfile = {
  id: string;
  slug?: string | null;
  name: string;
  legalName?: string | null;
  description?: string | null;
  type?: string | null;
  categories?: string[];
  services?: Array<{
    id: string;
    code: string;
    title: string;
    category: string;
    priceFrom?: number | null;
    priceTo?: number | null;
    currency?: string | null;
    durationMin?: number | null;
    applicableBrands?: string[];
    popular?: boolean | null;
  }>;
  supportedBrands?: string[];
  supportedModels?: Array<{
    brand: string;
    models?: string[] | null;
    yearFrom?: number | null;
    yearTo?: number | null;
  }>;
  location?: ServiceLocation | null;
  rating?: number | null;
  reviewsCount?: number | null;
  verified?: boolean | null;
  verificationLevel?: string | null;
  priceRange?: number | null;
  avgCheck?: number | null;
  schedule?: Record<string, unknown> | null;
  contacts?: Record<string, unknown> | null;
  media?: ServiceMedia | null;
  promotedLevel?: string | null;
  isActive?: boolean | null;
};
