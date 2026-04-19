import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCurrentUser } from '@/features/auth/api/useCurrentUser';

const AuthInitializer = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserQuery = useCurrentUser({ enabled: false });

  useEffect(() => {
    if (accessToken) {
      currentUserQuery.refetch();
    }
  }, []);

  return null;
};

export default AuthInitializer;
