import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Store, Wrench } from 'lucide-react';

import { settingsApi } from '@/dashboard/api/settings.api';
import { professionalApi } from '@/features/professional/api/professional.api';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

export type ProfileOption = {
  value: ActiveProfile;
  name: string | null;
  icon: typeof User;
};

export function useAvailableProfiles(): { options: ProfileOption[]; isLoading: boolean } {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userName = useAuthStore((s) => s.user?.fullName?.trim() || null);

  const sellerQuery = useQuery({
    queryKey: ['settings', 'seller'],
    queryFn: settingsApi.mySeller,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const serviceQuery = useQuery({
    queryKey: ['professional', 'service-center'],
    queryFn: professionalApi.myServiceCenter,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const options = useMemo<ProfileOption[]>(() => {
    const list: ProfileOption[] = [{ value: { type: 'user' }, name: userName, icon: User }];
    const seller = sellerQuery.data;
    if (seller?.id) {
      list.push({
        value: { type: 'seller', id: seller.id },
        name: seller.name?.trim() || null,
        icon: Store,
      });
    }
    const service = serviceQuery.data;
    if (service?.id) {
      list.push({
        value: { type: 'service', id: service.id },
        name: service.name?.trim() || null,
        icon: Wrench,
      });
    }
    return list;
  }, [userName, sellerQuery.data, serviceQuery.data]);

  return {
    options,
    isLoading: Boolean(isAuthenticated) && (sellerQuery.isLoading || serviceQuery.isLoading),
  };
}
