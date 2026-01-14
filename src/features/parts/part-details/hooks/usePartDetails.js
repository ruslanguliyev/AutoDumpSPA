import { useQuery } from '@tanstack/react-query';
import { fetchPartById } from '@/api/parts/parts.api';

const PART_DETAILS_QUERY_KEY = 'part';

export const usePartDetails = (partId) => {
  const safeId = String(partId ?? '').trim();

  return useQuery({
    queryKey: [PART_DETAILS_QUERY_KEY, safeId],
    enabled: Boolean(safeId),
    queryFn: async () => await fetchPartById(safeId),
    staleTime: 30_000,
  });
};


