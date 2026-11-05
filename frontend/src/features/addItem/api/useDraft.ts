import { gqlRequest } from '@/lib/graphql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type ListingDraft,
  type ListingType,
} from '@/features/addItem/store/useAddItemStore';
import { validateDraft } from '@/features/addItem/utils/validateDraft';

const DRAFTS_STORAGE_KEY = 'autodump:add-item-drafts';
const DRAFT_QUERY_KEY = 'add-item-draft';

const getToken = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem('autobaz-token');

const CREATE_LISTING = `
mutation CreateListing($input: CreateListingInput!) {
  createListing(input: $input) {
    id
    title
    description
    price
  }
}
`;

const CREATE_VEHICLE = `
mutation CreateVehicle($listingId: String!, $input: CreateVehicleInput!) {
  createVehicle(listingId: $listingId, input: $input) {
    id
  }
}
`;

const CREATE_PART = `
mutation CreatePart($listingId: String!, $input: CreatePartInput!) {
  createPart(listingId: $listingId, input: $input) {
    id
  }
}
`;

const UPDATE_LISTING = `
mutation UpdateListing($id: String!, $input: UpdateListingInput!) {
  updateListing(id: $id, input: $input) {
    id
    title
    description
    price
  }
}
`;

const UPDATE_VEHICLE = `
mutation UpdateVehicle($id: String!, $input: UpdateVehicleInput!) {
  updateVehicle(id: $id, input: $input) {
    id
  }
}
`;

const UPDATE_PART = `
mutation UpdatePart($id: String!, $input: UpdatePartInput!) {
  updatePart(id: $id, input: $input) {
    id
  }
}
`;

type ListingGql = {
  id: string;
  title: string;
  description: string;
  price: number;
};

type IdGql = { id: string };

/** Avoid null description from cached/API shapes — keeps controlled textareas stable. */
const coerceDraftDescription = (draft: ListingDraft): ListingDraft => ({
  ...draft,
  common: {
    ...draft.common,
    description: draft.common.description ?? '',
  },
});

const readDrafts = (): Record<string, ListingDraft> => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, ListingDraft>;
    if (!parsed) return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([id, d]) => [id, coerceDraftDescription(d)])
    );
  } catch (error) {
    console.error('Failed to parse drafts cache', error);
    return {};
  }
};

const writeDrafts = (drafts: Record<string, ListingDraft>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
};

const applyPatch = (
  draft: ListingDraft,
  patch: Partial<ListingDraft>
): ListingDraft => {
  const mergedCommon = {
    ...draft.common,
    ...patch.common,
    pricing: {
      ...draft.common.pricing,
      ...patch.common?.pricing,
    },
    description:
      patch.common?.description ?? draft.common.description ?? '',
  };
  return {
    ...draft,
    ...patch,
    common: mergedCommon,
  media: {
    ...draft.media,
    ...patch.media,
    images: patch.media?.images ?? draft.media.images,
  },
  seller: {
    ...draft.seller,
    ...patch.seller,
  },
  vehicle: draft.vehicle
    ? {
        ...draft.vehicle,
        ...patch.vehicle,
      }
    : draft.vehicle,
  part: draft.part
    ? {
        ...draft.part,
        ...patch.part,
      }
    : draft.part,
  };
};

const finalizeStatus = (draft: ListingDraft): ListingDraft => {
  if (draft.status === 'published') return draft;
  const isReady = validateDraft(draft);
  return {
    ...draft,
    status: isReady ? 'ready' : 'draft',
  };
};

async function syncDraftToBackend(draft: ListingDraft) {
  const listingId = draft._listingId ?? draft.id;
  const price = draft.common.pricing.price ?? 0;

  await gqlRequest<{ updateListing: ListingGql }>(UPDATE_LISTING, {
    id: listingId,
    input: {
      title: draft.common.title,
      description: draft.common.description ?? '',
      price,
    },
  });

  if (draft.type === 'vehicle' && draft._vehicleId && draft.vehicle) {
    const v = draft.vehicle;
    // Only persist real URLs. Blob/data URLs are local-only preview artifacts
    // that must never reach the database.
    const cleanUrls = draft.media.images
      .map((img) => (img.url ?? '').trim())
      .filter((url) => url && !url.startsWith('blob:') && !url.startsWith('data:'));
    const imageUrls = cleanUrls.length > 0 ? cleanUrls : [];

    await gqlRequest<{ updateVehicle: IdGql }>(UPDATE_VEHICLE, {
      id: draft._vehicleId,
      input: {
        brand: v.brand,
        model: v.model,
        generation: v.generation || undefined,
        year: parseInt(v.year, 10) || 2020,
        mileage: parseInt(v.mileage, 10) || 0,
        fuel: v.fuel || 'Petrol',
        transmission: v.transmission || 'Automatic',
        displacement: v.displacement || undefined,
        horsepower: v.horsepower || undefined,
        engineVolume: 2.0,
        power: 150,
        version: v.trim || undefined,
        drive: v.drivetrain || undefined,
        condition: draft.common.condition,
        location: draft.seller.location || undefined,
        description: draft.common.description || undefined,
        price,
        currency: draft.common.pricing.currency,
        imageUrls,
      },
    });
  }

  if (draft.type === 'part' && draft._partId && draft.part) {
    const p = draft.part;
    await gqlRequest<{ updatePart: IdGql }>(UPDATE_PART, {
      id: draft._partId,
      input: {
        name: p.name,
        brand: p.brand,
        model: p.model,
        condition: p.condition || draft.common.condition,
        oemCode: p.partNumber || undefined,
        description: draft.common.description || undefined,
        price,
        currency: draft.common.pricing.currency,
        location: draft.seller.location || undefined,
      },
    });
  }
}

export const createDraft = async (type: ListingType): Promise<ListingDraft> => {
  if (!getToken()) {
    throw new Error('Please log in to create a listing');
  }

  const { createListing: listing } = await gqlRequest<{ createListing: ListingGql }>(
    CREATE_LISTING,
    {
      input: {
        title: '',
        description: '',
        price: 0,
      },
    }
  );

  const listingId = listing.id;

  let vehicleId: string | undefined;
  let partId: string | undefined;

  if (type === 'vehicle') {
    const { createVehicle: vehicle } = await gqlRequest<{ createVehicle: IdGql }>(
      CREATE_VEHICLE,
      {
        listingId,
        input: {
          brand: '',
          model: '',
          year: 2020,
          mileage: 0,
          fuel: 'Petrol',
          transmission: 'Automatic',
          engineVolume: 2.0,
          power: 150,
        },
      }
    );
    vehicleId = vehicle.id;
  } else {
    const { createPart: part } = await gqlRequest<{ createPart: IdGql }>(CREATE_PART, {
      listingId,
      input: {
        name: '',
        category: 'Other',
        brand: '',
        model: '',
        condition: 'used',
        stock: 0,
      },
    });
    partId = part.id;
  }

  const draft: ListingDraft = {
    id: listingId,
    type,
    status: 'draft',
    _listingId: listingId,
    _vehicleId: vehicleId,
    _partId: partId,
    common: {
      title: listing.title ?? '',
      description: listing.description ?? '',
      category: '',
      condition: 'used',
      pricing: {
        price: null,
        currency: 'AZN',
        negotiable: false,
        vatIncluded: false,
      },
    },
    media: { images: [], pendingUrl: '' },
    seller: {
      type: 'dealer',
      name: '',
      phone: '',
      email: '',
      location: '',
      showPhone: true,
    },
    vehicle:
      type === 'vehicle'
        ? {
            vin: '',
            brand: '',
            model: '',
            generation: '',
            year: '',
            displacement: '',
            horsepower: '',
            trim: '',
            mileage: '',
            transmission: '',
            fuel: '',
            drivetrain: '',
          }
        : undefined,
    part:
      type === 'part'
        ? {
            name: '',
            brand: '',
            model: '',
            partNumber: '',
            condition: 'used',
            compatibility: '',
          }
        : undefined,
  };

  const drafts = readDrafts();
  drafts[listingId] = draft;
  writeDrafts(drafts);

  return draft;
};

export const getDraft = async (draftId: string): Promise<ListingDraft | null> => {
  const drafts = readDrafts();
  return drafts[draftId] ?? null;
};

export const saveDraftPatch = async (
  draftId: string,
  patch: Partial<ListingDraft>
): Promise<ListingDraft> => {
  const drafts = readDrafts();
  const current = drafts[draftId];
  if (!current) {
    throw new Error('Draft not found');
  }
  const next = finalizeStatus(applyPatch(current, patch));
  drafts[draftId] = next;
  writeDrafts(drafts);

  try {
    await syncDraftToBackend(next);
  } catch (err) {
    console.error('Draft backend sync failed', err);
  }

  return next;
};

/**
 * Force a synchronous sync of the latest draft (including images) to the
 * backend. Call before `publishListing` to guarantee the DB has the most
 * recent `imageUrls` before the listing flips to published.
 */
export const forceSyncDraft = async (draftId: string): Promise<void> => {
  const drafts = readDrafts();
  const current = drafts[draftId];
  if (!current) return;
  await syncDraftToBackend(current);
};

export const useDraft = (draftId?: string) =>
  useQuery({
    queryKey: [DRAFT_QUERY_KEY, draftId],
    queryFn: () => (draftId ? getDraft(draftId) : null),
    enabled: Boolean(draftId),
    staleTime: 10_000,
  });

export const useCreateDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDraft,
    onSuccess: (draft) => {
      writeDrafts({ ...readDrafts(), [draft.id]: draft });
      queryClient.setQueryData([DRAFT_QUERY_KEY, draft.id], draft);
    },
  });
};

export const useSaveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, patch }: { draftId: string; patch: Partial<ListingDraft> }) =>
      saveDraftPatch(draftId, patch),
    onMutate: async ({ draftId, patch }) => {
      await queryClient.cancelQueries({ queryKey: [DRAFT_QUERY_KEY, draftId] });
      const previous = queryClient.getQueryData<ListingDraft | null>([
        DRAFT_QUERY_KEY,
        draftId,
      ]);
      if (previous) {
        const optimistic = finalizeStatus(applyPatch(previous, patch));
        queryClient.setQueryData([DRAFT_QUERY_KEY, draftId], optimistic);
      }
      return { previous };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData([DRAFT_QUERY_KEY, variables.draftId], context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [DRAFT_QUERY_KEY, variables.draftId] });
    },
  });
};
