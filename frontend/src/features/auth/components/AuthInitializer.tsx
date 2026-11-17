import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCurrentUser } from '@/features/auth/api/useCurrentUser';
import { useFavoritesSync } from '@/features/favorites/useFavoritesSync';

const AuthInitializer = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  // The query result is a new object every render; `refetch` itself stays stable.
  const { refetch } = useCurrentUser({ enabled: false });
  useFavoritesSync();

  useEffect(() => {
    if (accessToken) {
      void refetch();
    }
  }, [accessToken, refetch]);

  return null;
};

export default AuthInitializer;
