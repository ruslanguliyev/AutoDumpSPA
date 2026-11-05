import { useQuery } from '@tanstack/react-query';

import { getSellers } from '@/sellers/api/sellers.api';

export const useSellersData = () => {
  const query = useQuery({
    queryKey: ['sellers'],
    queryFn: getSellers,
    staleTime: 30_000,
  });
  return query.data ?? [];
};
