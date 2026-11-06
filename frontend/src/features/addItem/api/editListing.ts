import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { DRAFT_QUERY_KEY, getDraft, putDraft } from '@/features/addItem/api/useDraft';
import type {
  ListingDraft,
  ListingImage,
} from '@/features/addItem/store/useAddItemStore';
import { gqlRequest } from '@/lib/graphql';

const EDIT_QUERY = `
query EditListing($id: String!) {
  listing(id: $id) { id title description price status sellerId }
  mySeller { id name type phone showPhone contactEmail }
  vehicleByListing(listingId: $id) {
    id brand model generation version year mileage fuel transmission
    displacement horsepower engineVolume power bodyType drive condition location description
    price currency imageUrls
  }
  partByListing(listingId: $id) {
    id name category brand model condition oemCode description
    price currency location imageUrl compatibility stock
  }
}
`;

type EditQueryResult = {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    status: 'DRAFT' | 'ACTIVE' | 'SOLD';
    sellerId: string;
  };
  mySeller: {
    id: string;
    name: string;
    type: string;
    phone: string | null;
    showPhone: boolean;
    contactEmail: string | null;
  } | null;
  vehicleByListing: {
    id: string;
    brand: string;
    model: string;
    generation: string | null;
    version: string | null;
    year: number;
    mileage: number;
    fuel: string;
    transmission: string;
    displacement: string | null;
    horsepower: string | null;
    engineVolume: number | null;
    power: number | null;
    bodyType: string | null;
    drive: string | null;
    condition: string | null;
    location: string | null;
    description: string | null;
    price: number | null;
    currency: string | null;
    imageUrls: string[];
  } | null;
  partByListing: {
    id: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    condition: string;
    oemCode: string | null;
    description: string | null;
    price: number | null;
    currency: string | null;
    location: string | null;
    imageUrl: string | null;
    compatibility: string[];
    stock: number | null;
  } | null;
};

const toCondition = (value: string | null | undefined): 'new' | 'used' | 'certified' =>
  value === 'new' || value === 'certified' ? value : 'used';

const toImages = (urls: string[]): ListingImage[] =>
  urls
    .filter(Boolean)
    .map((url, index) => ({ id: `edit_${index}_${url}`, url, isMain: index === 0 }));

/**
 * Builds a wizard draft from a listing stored on the server.
 * Fields the backend does not persist (VIN, which the wizard has no input for) are carried over
 * from an existing local draft when there is one.
 */
export const buildDraftFromServer = (
  data: EditQueryResult,
  previous: ListingDraft | null
): ListingDraft => {
  const { listing, mySeller, vehicleByListing: v, partByListing: p } = data;
  const published = listing.status !== 'DRAFT';
  const type = v ? 'vehicle' : 'part';

  const price = v?.price ?? p?.price ?? listing.price;
  const currency = v?.currency ?? p?.currency ?? 'AZN';
  const description = v?.description ?? p?.description ?? listing.description ?? '';
  const location = v?.location ?? p?.location ?? '';
  const images = v ? toImages(v.imageUrls) : toImages(p?.imageUrl ? [p.imageUrl] : []);

  return {
    id: listing.id,
    type,
    status: published ? 'published' : 'ready',
    _listingId: listing.id,
    _vehicleId: v?.id,
    _partId: p?.id,
    _editing: true,
    common: {
      title: listing.title,
      description,
      category: v ? (v.bodyType ?? previous?.common.category ?? '') : (p?.category ?? ''),
      condition: toCondition(v?.condition ?? p?.condition),
      pricing: {
        price: price && price > 0 ? price : null,
        currency,
        negotiable: previous?.common.pricing.negotiable ?? false,
        vatIncluded: previous?.common.pricing.vatIncluded ?? false,
      },
    },
    media: { images, pendingUrl: '' },
    seller: {
      type: mySeller?.type === 'PRIVATE' ? 'private' : 'dealer',
      name: mySeller?.name ?? previous?.seller.name ?? '',
      phone: mySeller?.phone ?? previous?.seller.phone ?? '',
      email: mySeller?.contactEmail ?? previous?.seller.email ?? '',
      location,
      showPhone: mySeller?.showPhone ?? previous?.seller.showPhone ?? true,
    },
    vehicle: v
      ? {
          vin: previous?.vehicle?.vin ?? '',
          brand: v.brand,
          model: v.model,
          generation: v.generation ?? '',
          year: String(v.year ?? ''),
          // Older listings only have the numeric columns; show those so nothing looks empty.
          displacement: v.displacement ?? (v.engineVolume != null ? String(v.engineVolume) : ''),
          horsepower: v.horsepower ?? (v.power != null ? String(v.power) : ''),
          trim: v.version ?? '',
          mileage: String(v.mileage ?? ''),
          transmission: v.transmission ?? '',
          fuel: v.fuel ?? '',
          drivetrain: v.drive ?? '',
        }
      : undefined,
    part: p
      ? {
          name: p.name,
          brand: p.brand,
          model: p.model,
          partNumber: p.oemCode ?? '',
          condition: p.condition,
          compatibility: (p.compatibility ?? []).join(', '),
          stock: String(p.stock ?? 0),
        }
      : undefined,
  };
};

/**
 * Makes sure a local wizard draft exists for the given server listing and returns it.
 * - DRAFT listing with a local draft: the local draft is newer, keep it.
 * - Otherwise: rebuild from the server (source of truth).
 */
export const prepareEditDraft = async (listingId: string): Promise<ListingDraft> => {
  const previous = await getDraft(listingId);
  const data = await gqlRequest<EditQueryResult>(EDIT_QUERY, { id: listingId });

  if (!data.listing) throw new Error('Listing not found');
  if (!data.mySeller || data.mySeller.id !== data.listing.sellerId) {
    throw new Error('You do not own this listing');
  }
  if (!data.vehicleByListing && !data.partByListing) {
    throw new Error('Only vehicle and part listings can be edited');
  }
  if (data.listing.status === 'SOLD') {
    throw new Error('Relist the item before editing it');
  }

  if (previous && data.listing.status === 'DRAFT') return previous;

  const draft = buildDraftFromServer(data, previous);
  putDraft(draft);
  return draft;
};

/** Hook for the dashboard "Edit" button: prepares the draft, then opens the wizard. */
export const useStartEditListing = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const start = useCallback(
    async (listingId: string) => {
      setPendingId(listingId);
      setError(null);
      try {
        await prepareEditDraft(listingId);
        queryClient.removeQueries({ queryKey: [DRAFT_QUERY_KEY, listingId] });
        navigate(`/add/${listingId}`);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to open the editor'));
      } finally {
        setPendingId(null);
      }
    },
    [navigate, queryClient]
  );

  return { start, pendingId, error };
};
