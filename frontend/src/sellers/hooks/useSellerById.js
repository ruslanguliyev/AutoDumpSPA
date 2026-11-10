import { useQuery } from '@tanstack/react-query';
import { getSellerById } from '@/sellers/api/sellers.api';

export const useSellerById = (sellerId, { enabled = true } = {}) => {
  const safeId = String(sellerId ?? '').trim();
  return useQuery({
    queryKey: ['seller', safeId],
    queryFn: () => getSellerById(safeId),
    enabled: enabled && Boolean(safeId),
    staleTime: 60_000,
  });
};
