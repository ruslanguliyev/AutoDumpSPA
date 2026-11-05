import { gqlRequest, TOKEN_STORAGE_KEY } from '@/lib/graphql';

export type FavoriteType = 'vehicle' | 'part';

export type ServerFavorite = {
  type: FavoriteType;
  itemId: string;
  title: string;
  thumbnail: string | null;
};

const hasToken = () =>
  typeof window !== 'undefined' && Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY));

export const favoritesApi = {
  list: () =>
    gqlRequest<{ myFavorites: ServerFavorite[] }>(
      `query { myFavorites { type itemId title thumbnail } }`,
    ).then((d) => d.myFavorites),

  sync: (items: Array<{ type: string; itemId: string }>) =>
    gqlRequest<{ syncFavorites: number }>(
      `mutation ($items: [FavoriteRefInput!]!) { syncFavorites(items: $items) }`,
      { items },
    ),

  add: (type: string, itemId: string) =>
    gqlRequest(`mutation ($type: String!, $itemId: String!) { addFavorite(type: $type, itemId: $itemId) }`, {
      type,
      itemId,
    }),

  remove: (type: string, itemId: string) =>
    gqlRequest(
      `mutation ($type: String!, $itemId: String!) { removeFavorite(type: $type, itemId: $itemId) }`,
      { type, itemId },
    ),

  /** Fire-and-forget push of a single change; the local store stays the source of truth for the UI. */
  push: (action: 'add' | 'remove', type: string, itemId: string) => {
    if (!hasToken()) return;
    (action === 'add' ? favoritesApi.add(type, itemId) : favoritesApi.remove(type, itemId)).catch(
      () => {
        /* offline or item gone: next login sync reconciles */
      },
    );
  },
};
