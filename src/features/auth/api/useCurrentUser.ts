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
    queryFn: () => fetchCurrentUser(accessToken),
    enabled: options.enabled ?? Boolean(accessToken),
    staleTime: 30_000,
    onSuccess: (user) => {
      setUser(user ?? null);
    },
  });
};
