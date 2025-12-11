import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create(
    persist(
        (set, get) => ({
            favorites: [],

            toggleFavorite: (id) => {
                const exists = get().favorites.includes(id);

                set({
                    favorites: exists
                        ? get().favorites.filter((x) => x !== id)
                        : [...get().favorites, id],
                });
            },
        }),
        {
            name: "favorites-storage", // сохраняем в localStorage
        }
    )
);
