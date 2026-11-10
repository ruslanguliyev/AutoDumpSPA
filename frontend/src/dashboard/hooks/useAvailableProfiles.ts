import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Wrench } from 'lucide-react';

import { settingsApi } from '@/dashboard/api/settings.api';
import { professionalApi } from '@/features/professional/api/professional.api';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

export type ProfileOption = {
  value: ActiveProfile;
  name: string | null;
  icon: typeof User;
};

export function useAvailableProfiles(): {
  options: ProfileOption[];
  hasSeller: boolean;
  isLoading: boolean;
} {
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

  const seller = sellerQuery.data;
  const service = serviceQuery.data;
  const hasSeller = Boolean(seller?.id);

  const options = useMemo<ProfileOption[]>(() => {
    const list: ProfileOption[] = [{ value: { type: 'user' }, name: userName, icon: User }];
    // Dealer is omitted until mine-queries accept sellerId: listings are the same Seller as personal.
    if (service?.id) {
      list.push({
        value: { type: 'service', id: service.id },
        name: service.name?.trim() || null,
        icon: Wrench,
      });
    }
    return list;
  }, [userName, service]);

  return {
    options,
    hasSeller,
    isLoading: Boolean(isAuthenticated) && (sellerQuery.isLoading || serviceQuery.isLoading),
  };
}
