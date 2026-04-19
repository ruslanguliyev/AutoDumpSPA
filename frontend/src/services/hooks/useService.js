import { useQuery } from '@tanstack/react-query';
import { getServiceById, getServiceBySlug } from '@/services/api/services.query';

const SERVICE_QUERY_KEY = 'service';

export const useService = (idOrSlug) => {
  const isId = idOrSlug && !idOrSlug.includes('-');
  
  const query = useQuery({
    queryKey: [SERVICE_QUERY_KEY, idOrSlug],
    queryFn: () => {
      if (!idOrSlug) return null;
      return isId ? getServiceById(idOrSlug) : getServiceBySlug(idOrSlug);
    },
    enabled: !!idOrSlug,
    staleTime: 30_000,
  });

  return {
    service: query.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
