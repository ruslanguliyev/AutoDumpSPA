import type { ComponentType } from 'react';

import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import {
  validateBasics,
  validateDraft,
  validatePart,
  validatePhotos,
  validatePricing,
  validateSeller,
  validateVehicle,
} from '@/features/addItem/utils/validateDraft';
import BasicsStep from '@/features/addItem/steps/common/BasicsStep';
import PricingStep from '@/features/addItem/steps/common/PricingStep';
import SellerStep from '@/features/addItem/steps/common/SellerStep';
import PhotosStep from '@/features/addItem/steps/common/PhotosStep';
import PublishStep from '@/features/addItem/steps/common/PublishStep';
import VehicleStep from '@/features/addItem/steps/vehicle/VehicleStep';
import PartStep from '@/features/addItem/steps/part/PartStep';

export type StepDefinition = {
  id: string;
  label: string;
  validate: (draft: ListingDraft) => boolean;
  isAvailable: (draft: ListingDraft) => boolean;
  Component: ComponentType;
};

export const buildSteps = (draft: ListingDraft | null): StepDefinition[] => {
  if (!draft) return [];

  const typeSteps: StepDefinition[] =
    draft.type === 'vehicle'
      ? [
          {
            id: 'vehicle',
            label: 'Vehicle',
            validate: validateVehicle,
            isAvailable: () => true,
            Component: VehicleStep,
          },
        ]
      : [
          {
            id: 'part',
            label: 'Part',
            validate: validatePart,
            isAvailable: () => true,
            Component: PartStep,
          },
        ];

  return [
    {
      id: 'basics',
      label: 'Basics',
      validate: validateBasics,
      isAvailable: () => true,
      Component: BasicsStep,
    },
    ...typeSteps,
    {
      id: 'pricing',
      label: 'Pricing',
      validate: validatePricing,
      isAvailable: () => true,
      Component: PricingStep,
    },
    {
      id: 'seller',
      label: 'Seller',
      validate: validateSeller,
      isAvailable: () => true,
      Component: SellerStep,
    },
    {
      id: 'photos',
      label: 'Photos',
      validate: validatePhotos,
      isAvailable: () => true,
      Component: PhotosStep,
    },
    {
      id: 'publish',
      label: 'Publish',
      validate: validateDraft,
      isAvailable: () => true,
      Component: PublishStep,
    },
  ];
};
