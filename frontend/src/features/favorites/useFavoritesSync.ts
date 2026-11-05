import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { favoritesApi } from '@/features/favorites/favorites.api';
import { useFavoritesStore } from '@/shared/store/favoritesStore';

/**
 * Keeps the local favorites store in step with the server:
 * - on login: push local favorites, then replace local state with the server list
 * - on logout: clear local favorites so the next user on this device starts clean
 */
export const useFavoritesSync = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      let cancelled = false;
      (async () => {
        try {
          const local = useFavoritesStore.getState().items;
          if (local.length > 0) {
            await favoritesApi.sync(local.map((i) => ({ type: i.type, itemId: i.id })));
          }
          const server = await favoritesApi.list();
          if (cancelled) return;
          useFavoritesStore.getState().replaceItems(
            server.map((f) => ({
              key: `${f.type}:${f.itemId}`,
              id: f.itemId,
              type: f.type,
              title: f.title,
              thumbnail: f.thumbnail,
            })),
          );
        } catch {
          // keep local favorites if the server is unreachable
        }
      })();
      wasAuthenticated.current = true;
      return () => {
        cancelled = true;
      };
    }

    if (wasAuthenticated.current) {
      useFavoritesStore.getState().replaceItems([]);
      wasAuthenticated.current = false;
    }
    return undefined;
  }, [isAuthenticated]);
};
