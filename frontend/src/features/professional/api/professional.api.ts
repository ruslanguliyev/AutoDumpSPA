import { gqlRequest } from '@/lib/graphql';

export type MySpecialist = {
  id: string;
  slug: string;
  name: string;
  bio: string | null;
  city: string;
  phone: string | null;
  whatsapp: string | null;
  experience: number;
  specializations: string[];
  hourlyRate: number | null;
  priceFrom: number | null;
  mobileService: boolean;
  available: boolean;
  verified: boolean;
  rating: number;
  reviewsCount: number;
};

export type PriceItem = { code: string; title: string; category: string; priceFrom: number | null };

export type MyServiceCenter = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  city: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  categories: string[];
  supportedBrands: string[];
  isActive: boolean;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  services: PriceItem[];
};

export type SpecialistFormValues = {
  name: string;
  city: string;
  phone: string;
  whatsapp: string;
  bio: string;
  experience: number;
  specializations: string[];
  hourlyRate: number | null;
  priceFrom: number | null;
  mobileService: boolean;
  available: boolean;
};

export type ServiceCenterFormValues = {
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  website: string;
  description: string;
  categories: string[];
  supportedBrands: string[];
  isActive: boolean;
  services: PriceItem[];
};

const SPECIALIST_FIELDS =
  'id slug name bio city phone whatsapp experience specializations hourlyRate priceFrom mobileService available verified rating reviewsCount';
const CENTER_FIELDS =
  'id slug name description city address phone whatsapp website categories supportedBrands isActive verified rating reviewsCount services { code title category priceFrom }';

export const professionalApi = {
  mySpecialist: () =>
    gqlRequest<{ mySpecialist: MySpecialist | null }>(`{ mySpecialist { ${SPECIALIST_FIELDS} } }`).then((d) => d.mySpecialist),

  myServiceCenter: () =>
    gqlRequest<{ myServiceCenter: MyServiceCenter | null }>(`{ myServiceCenter { ${CENTER_FIELDS} } }`).then(
      (d) => d.myServiceCenter,
    ),

  createSpecialist: (values: SpecialistFormValues & { slug: string }) => {
    // The same tags drive the specialist filters ("skills") and the profile ("specializations").
    const { available: _available, ...rest } = values;
    return gqlRequest<{ createSpecialist: MySpecialist }>(
      `mutation($input: CreateSpecialistInput!) { createSpecialist(input: $input) { ${SPECIALIST_FIELDS} } }`,
      { input: { ...rest, skills: values.specializations, portfolio: [] } },
    ).then((d) => d.createSpecialist);
  },

  updateSpecialist: (values: SpecialistFormValues) =>
    gqlRequest<{ updateSpecialist: MySpecialist }>(
      `mutation($input: UpdateSpecialistInput!) { updateSpecialist(input: $input) { ${SPECIALIST_FIELDS} } }`,
      { input: { ...values, skills: values.specializations } },
    ).then((d) => d.updateSpecialist),

  createServiceCenter: (values: ServiceCenterFormValues) => {
    const { isActive: _isActive, ...rest } = values;
    return gqlRequest<{ createServiceCenter: MyServiceCenter }>(
      `mutation($input: CreateServiceCenterInput!) { createServiceCenter(input: $input) { ${CENTER_FIELDS} } }`,
      { input: rest },
    ).then((d) => d.createServiceCenter);
  },

  updateServiceCenter: (values: ServiceCenterFormValues) =>
    gqlRequest<{ updateServiceCenter: MyServiceCenter }>(
      `mutation($input: UpdateServiceCenterInput!) { updateServiceCenter(input: $input) { ${CENTER_FIELDS} } }`,
      { input: values },
    ).then((d) => d.updateServiceCenter),
};
