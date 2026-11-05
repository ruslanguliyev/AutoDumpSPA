import { useQuery } from '@tanstack/react-query';

import { getAutoById } from '@/vehicles/api/autos';

const AUTO_QUERY_KEY = 'auto';

export const useAutoDetails = (id) => {
  const safeId = String(id ?? '').trim();

  return useQuery({
    queryKey: [AUTO_QUERY_KEY, safeId],
    queryFn: () => getAutoById(safeId),
    enabled: Boolean(safeId),
    staleTime: 30_000,
  });
};
