import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCurrentUser } from '@/features/auth/api/useCurrentUser';
import { useFavoritesSync } from '@/features/favorites/useFavoritesSync';

const AuthInitializer = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserQuery = useCurrentUser({ enabled: false });
  useFavoritesSync();

  useEffect(() => {
    if (accessToken) {
      currentUserQuery.refetch();
    }
  }, []);

  return null;
};

export default AuthInitializer;
