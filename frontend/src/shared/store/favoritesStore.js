import { create } from "zustand";
import { persist } from "zustand/middleware";
import { favoritesApi } from "@/features/favorites/favorites.api";

const FAVORITES_STORE_VERSION = 2;

const makeKey = (type, id) => `${type}:${String(id)}`;

const normalizeFavoriteInput = (input) => {
  const type = input?.type;
  const id = input?.id;
  if (!type || id == null) return null;

  return {
    key: makeKey(type, id),
    id: String(id),
    type,
    title: input?.title ?? "",
    thumbnail: input?.thumbnail ?? null,
  };
};

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      items: /** @type {Array<{key: string, id: string, type: 'vehicle'|'part', title: string, thumbnail: string|null}>} */ (
        []
      ),

      isFavorited: (type, id) => {
        const key = makeKey(type, id);
        return get().items.some((x) => x.key === key);
      },

      toggleFavorite: (favoriteInput) => {
        const next = normalizeFavoriteInput(favoriteInput);
        if (!next) return;

        const exists = get().items.some((x) => x.key === next.key);
        set((state) =>
          exists
            ? { items: state.items.filter((x) => x.key !== next.key) }
            : { items: [next, ...state.items] }
        );
        favoritesApi.push(exists ? "remove" : "add", next.type, next.id);
      },

      replaceItems: (items) => set({ items }),

      removeFromFavorites: (type, id) => {
        const key = makeKey(type, id);
        set((state) => ({ items: state.items.filter((x) => x.key !== key) }));
        favoritesApi.push("remove", type, String(id));
      },
    }),
    {
      name: "favorites-storage",
      version: FAVORITES_STORE_VERSION,
      migrate: (persistedState) => {
        // legacy was: { favorites: Array<id> } (no version / v0)
        if (persistedState?.favorites && Array.isArray(persistedState.favorites)) {
          return {
            items: persistedState.favorites.map((id) => ({
              key: makeKey("vehicle", id),
              id: String(id),
              type: "vehicle",
              title: "",
              thumbnail: null,
            })),
          };
        }

        // Already v2 shape
        if (persistedState?.items && Array.isArray(persistedState.items)) {
          return persistedState;
        }

        return { items: [] };
      },
    }
  )
);
