import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useFocusStats() {
  return useApiQuery(api.focus.stats.$get, {
    queryKey: FOCUS_QUERY_KEYS.stats,
    select: (data) => data.stats,
    errorMessage: 'Failed to fetch focus stats',
  });
}
