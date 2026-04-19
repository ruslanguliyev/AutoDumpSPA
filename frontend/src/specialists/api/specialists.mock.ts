import type { SpecialistsFiltersInput } from '@/specialists/api/specialists.types';
import { Specialization } from '@/specialists/types/specialist.types';
import type {
  SpecialistCertification,
  SpecialistDetail,
  SpecialistProfile,
  SupportedVehicle,
} from '@/specialists/types/specialist.types';
import type { SpecialistsDataProvider } from '@/shared/api/specialists.provider';
import { MEMBERSHIPS } from '@/memberships/mock/memberships.mock';
import { MOCK_SERVICES } from '@/services/api/graphql/mocks/services.mocks';

const mockGallery = [
  'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485395037617-6f5f457f9f93?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515923162838-485e317f6804?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504222490345-c075b7b7b83e?auto=format&fit=crop&w=800&q=80',
];

const defaultCertifications: SpecialistCertification[] = [
  {
    id: 'cert-ase',
    title: 'ASE Master Certified',
    subtitle: 'Valid Jan 2025',
    validUntil: '2025-01-31',
    iconCode: 'ase',
  },
  {
    id: 'cert-ev',
    title: 'Hybrid Specialist L3',
    subtitle: 'Advanced EV Tech',
    validUntil: null,
    iconCode: 'ev',
  },
];

const MOCK_SPECIALISTS: SpecialistDetail[] = [
  {
    id: 'spec-001',
    name: 'Rashid Auto Lab',
    slug: 'rashid-auto-lab',
    description:
      'Engine diagnostics, maintenance, and ECU tuning with factory-level tools.',
    experienceYears: 12,
    rating: 4.8,
    reviewsCount: 124,
    verified: true,
    mobileService: true,
    priceFrom: 25,
    location: 'Baku, AZ',
    avatarUrl:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80',
    phone: '+994501234567',
    whatsapp: '+994501234567',
    specializations: [Specialization.ENGINE, Specialization.DIAGNOSTICS],
    supportedVehicles: [
      { brand: 'BMW', model: 'X5', yearFrom: 2010, yearTo: 2022 },
      { brand: 'Mercedes', model: 'C-Class', yearFrom: 2012, yearTo: 2023 },
      { brand: 'Audi', model: 'A6', yearFrom: 2014, yearTo: 2022 },
    ],
    portfolio: mockGallery,
    certifications: defaultCertifications,
    reviews: [
      {
        id: 'rev-001',
        rating: 5,
        comment: 'Diagnosed a complex misfire in one hour. Great experience.',
        authorName: 'Ali',
        avatarUrl: 'https://i.pravatar.cc/48?img=11',
        createdAt: '2024-11-12',
      },
      {
        id: 'rev-002',
        rating: 4,
        comment: 'Clean workshop and transparent pricing.',
        authorName: 'Kamran',
        avatarUrl: 'https://i.pravatar.cc/48?img=22',
        createdAt: '2024-09-02',
      },
    ],
  },
  {
    id: 'spec-002',
    name: 'Gearbox Point',
    slug: 'gearbox-point',
    description: 'Transmission rebuilds, clutch replacements, and drivetrain care.',
    experienceYears: 9,
    rating: 4.6,
    reviewsCount: 88,
    verified: true,
    mobileService: false,
    priceFrom: 40,
    location: 'Sumgait, AZ',
    avatarUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    phone: '+994552223344',
    whatsapp: '+994552223344',
    specializations: [Specialization.TRANSMISSION, Specialization.SUSPENSION],
    supportedVehicles: [
      { brand: 'Toyota', model: 'Camry', yearFrom: 2008, yearTo: 2022 },
      { brand: 'Hyundai', model: 'Sonata', yearFrom: 2010, yearTo: 2023 },
    ],
    portfolio: mockGallery,
    certifications: [
      {
        id: 'cert-trans',
        title: 'Transmission Expert',
        subtitle: 'Certified Drivetrain Tech',
        validUntil: '2025-06-30',
        iconCode: 'ase',
      },
    ],
    reviews: [
      {
        id: 'rev-003',
        rating: 5,
        comment: 'Smooth shifting after rebuild. Highly recommend.',
        authorName: 'Rauf',
        avatarUrl: 'https://i.pravatar.cc/48?img=33',
        createdAt: '2024-10-15',
      },
    ],
  },
  {
    id: 'spec-003',
    name: 'ElectroFix Center',
    slug: 'electrofix-center',
    description: 'Electrical diagnostics, wiring repair, and AC servicing.',
    experienceYears: 7,
    rating: 4.3,
    reviewsCount: 56,
    verified: false,
    mobileService: true,
    priceFrom: 20,
    location: 'Ganja, AZ',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    phone: '+994707778899',
    whatsapp: '+994707778899',
    specializations: [Specialization.ELECTRICAL, Specialization.AC],
    supportedVehicles: [
      { brand: 'Volkswagen', model: 'Golf', yearFrom: 2011, yearTo: 2022 },
      { brand: 'Skoda', model: 'Octavia', yearFrom: 2012, yearTo: 2021 },
    ],
    portfolio: mockGallery,
    certifications: [],
    reviews: [],
  },
  {
    id: 'spec-004',
    name: 'DetailPro Studio',
    slug: 'detailpro-studio',
    description: 'Premium detailing, ceramic coating, and interior restoration.',
    experienceYears: 6,
    rating: 4.9,
    reviewsCount: 142,
    verified: true,
    mobileService: false,
    priceFrom: 60,
    location: 'Baku, AZ',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1519582588077-8edb8bbf0e4b?auto=format&fit=crop&w=1600&q=80',
    phone: '+994559998877',
    whatsapp: '+994559998877',
    specializations: [Specialization.DETAILING, Specialization.TUNING],
    supportedVehicles: [
      { brand: 'Lexus', model: 'RX', yearFrom: 2013, yearTo: 2023 },
      { brand: 'Porsche', model: 'Cayenne', yearFrom: 2015, yearTo: 2023 },
    ],
    portfolio: mockGallery,
    certifications: defaultCertifications,
    reviews: [
      {
        id: 'rev-004',
        rating: 5,
        comment: 'Paint looks brand new after ceramic coating.',
        authorName: 'Nijat',
        avatarUrl: 'https://i.pravatar.cc/48?img=44',
        createdAt: '2024-08-21',
      },
    ],
  },
  {
    id: 'spec-005',
    name: 'BrakePoint Garage',
    slug: 'brakepoint-garage',
    description: 'Brake and suspension specialists with fast same-day service.',
    experienceYears: 10,
    rating: 4.5,
    reviewsCount: 73,
    verified: true,
    mobileService: true,
    priceFrom: 30,
    location: 'Lankaran, AZ',
    avatarUrl:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    phone: '+994516667755',
    whatsapp: '+994516667755',
    specializations: [Specialization.BRAKES, Specialization.SUSPENSION],
    supportedVehicles: [
      { brand: 'Honda', model: 'Civic', yearFrom: 2009, yearTo: 2021 },
      { brand: 'Kia', model: 'Sportage', yearFrom: 2011, yearTo: 2022 },
    ],
    portfolio: mockGallery,
    certifications: [
      {
        id: 'cert-brakes',
        title: 'Brake System Specialist',
        subtitle: 'Safety Certified 2024',
        validUntil: '2026-01-01',
        iconCode: 'ase',
      },
    ],
    reviews: [
      {
        id: 'rev-005',
        rating: 4,
        comment: 'Quick brake pad change. Price was fair.',
        authorName: 'Emil',
        avatarUrl: 'https://i.pravatar.cc/48?img=55',
        createdAt: '2024-07-05',
      },
    ],
  },
  {
    id: 'spec-006',
    name: 'TurboLine',
    slug: 'turboline',
    description:
      'Performance tuning, turbo upgrades, and dyno-tested ECU remaps.',
    experienceYears: 8,
    rating: 4.7,
    reviewsCount: 65,
    verified: false,
    mobileService: false,
    priceFrom: 90,
    location: 'Baku, AZ',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    coverImage:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80',
    phone: '+994507778811',
    whatsapp: '+994507778811',
    specializations: [Specialization.TUNING, Specialization.ENGINE],
    supportedVehicles: [
      { brand: 'BMW', model: '3 Series', yearFrom: 2012, yearTo: 2022 },
      { brand: 'Audi', model: 'S4', yearFrom: 2013, yearTo: 2021 },
    ],
    portfolio: mockGallery,
    certifications: [
      {
        id: 'cert-tuning',
        title: 'ECU Remap Certified',
        subtitle: 'Performance Tuning Pro',
        validUntil: null,
        iconCode: 'generic',
      },
    ],
    reviews: [],
  },
];

const normalize = (value: string | number | null | undefined) =>
  String(value ?? '').trim().toLowerCase();

const serviceCityById = new Map(
  (MOCK_SERVICES ?? []).map((service) => [
    String(service.id),
    service.location?.city ?? '',
  ])
);

const getServiceCitiesForSpecialist = (specialistId: string) => {
  const memberships = MEMBERSHIPS.filter(
    (membership) => membership.specialistId === specialistId
  );
  return memberships
    .map((membership) => serviceCityById.get(String(membership.serviceId)) ?? '')
    .filter(Boolean);
};

const matchesVehicleFilters = (
  supportedVehicles: SupportedVehicle[] | undefined,
  brand: string,
  model: string,
  year: number | null
) => {
  if (!brand && !model && !year) return true;
  if (!supportedVehicles?.length) return false;

  return supportedVehicles.some((vehicle) => {
    if (brand && !normalize(vehicle.brand).includes(brand)) return false;
    if (model && !normalize(vehicle.model).includes(model)) return false;

    if (year) {
      const yearFrom =
        vehicle.yearFrom === null || vehicle.yearFrom === undefined
          ? null
          : Number(vehicle.yearFrom);
      const yearTo =
        vehicle.yearTo === null || vehicle.yearTo === undefined
          ? null
          : Number(vehicle.yearTo);
      if (Number.isFinite(yearFrom ?? NaN) && year < (yearFrom ?? 0)) return false;
      if (Number.isFinite(yearTo ?? NaN) && year > (yearTo ?? 0)) return false;
    }

    return true;
  });
};

const applyFilters = (
  specialists: SpecialistDetail[],
  filters: SpecialistsFiltersInput
) => {
  const brand = normalize(filters.brand);
  const model = normalize(filters.model);
  const city = normalize(filters.city);
  const specialization = filters.specialization ?? null;
  const minRating =
    filters.minRating === null || filters.minRating === undefined
      ? null
      : Number(filters.minRating);
  const year =
    filters.year === null || filters.year === undefined
      ? null
      : Number(filters.year);

  return specialists.filter((specialist) => {
    if (city) {
      const cities = getServiceCitiesForSpecialist(specialist.id);
      const matchesCity = cities.some((value) => normalize(value).includes(city));
      if (!matchesCity) return false;
    }

    if (specialization) {
      if (!specialist.specializations?.includes(specialization)) return false;
    }

    if (Number.isFinite(minRating ?? NaN)) {
      const rating = Number(specialist.rating ?? 0);
      if (rating < (minRating ?? 0)) return false;
    }

    if (!matchesVehicleFilters(specialist.supportedVehicles, brand, model, year)) {
      return false;
    }

    return true;
  });
};

const toProfile = (specialist: SpecialistDetail): SpecialistProfile => ({
  id: specialist.id,
  name: specialist.name,
  slug: specialist.slug,
  description: specialist.description,
  experienceYears: specialist.experienceYears,
  rating: specialist.rating,
  reviewsCount: specialist.reviewsCount,
  verified: specialist.verified,
  mobileService: specialist.mobileService,
  priceFrom: specialist.priceFrom,
  avatarUrl: specialist.avatarUrl,
  coverImage: specialist.coverImage,
  location: specialist.location,
  specializations: specialist.specializations,
});

export const specialistsMockApi: SpecialistsDataProvider = {
  getSpecialists: async (filters = {}) => {
    const filtered = applyFilters(MOCK_SPECIALISTS, filters);
    return filtered.map(toProfile);
  },
  getSpecialistsByIds: async (ids: string[]) => {
    const safeIds = Array.from(
      new Set((ids ?? []).map((id) => String(id).trim()).filter(Boolean))
    );
    if (safeIds.length === 0) return [];
    return MOCK_SPECIALISTS.filter((item) => safeIds.includes(item.id)).map(
      toProfile
    );
  },
  getSpecialistBySlug: async (slug: string) => {
    const safeSlug = String(slug ?? '').trim();
    if (!safeSlug) return null;
    return MOCK_SPECIALISTS.find((item) => item.slug === safeSlug) ?? null;
  },
};
