import { gqlRequest } from '@/lib/graphql';

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'BLOCKED';
export type ListingKind = 'vehicle' | 'part' | 'service' | 'unknown';

export type MyListing = {
  id: string;
  title: string;
  price: number;
  status: ListingStatus;
  kind: ListingKind;
  itemId: string | null;
  currency: string | null;
  thumbnail: string | null;
  /** Why a moderator blocked this listing. */
  blockedReason: string | null;
  inquiriesCount: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
};

const MY_LISTINGS = `
  query MyListings {
    myListings {
      id title price status kind itemId currency thumbnail blockedReason
      inquiriesCount favoritesCount createdAt updatedAt
    }
  }
`;

const statusMutation = (name: 'publishListing' | 'unpublishListing' | 'closeListing') => `
  mutation ($id: String!) { ${name}(id: $id) { id status } }
`;

export const listingsApi = {
  mine: () => gqlRequest<{ myListings: MyListing[] }>(MY_LISTINGS).then((d) => d.myListings),
  publish: (id: string) => gqlRequest(statusMutation('publishListing'), { id }),
  unpublish: (id: string) => gqlRequest(statusMutation('unpublishListing'), { id }),
  close: (id: string) => gqlRequest(statusMutation('closeListing'), { id }),
  remove: (id: string) =>
    gqlRequest(`mutation ($id: String!) { deleteListing(id: $id) }`, { id }),
};
