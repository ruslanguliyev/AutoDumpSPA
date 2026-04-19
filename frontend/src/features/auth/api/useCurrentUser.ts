import { useQuery } from '@tanstack/react-query';

import type { AuthUser } from '@/features/auth/api/auth.storage';
import { fetchCurrentUser } from '@/features/auth/api/auth.storage';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

type UseCurrentUserOptions = {
  enabled?: boolean;
};

export const useCurrentUser = (options: UseCurrentUserOptions = {}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery<AuthUser | null, Error>({
    queryKey: ['auth', 'me', accessToken],
    queryFn: async () => {
      const user = await fetchCurrentUser(accessToken);
      setUser(user ?? null);
      return user;
    },
    enabled: options.enabled ?? Boolean(accessToken),
    staleTime: 30_000,
  });
};
