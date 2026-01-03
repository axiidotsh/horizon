import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { SETTINGS_QUERY_KEYS } from '../settings-query-keys';

export function useSettings() {
  return useApiQuery(api.settings.$get, {
    queryKey: SETTINGS_QUERY_KEYS.settings,
    errorMessage: 'Failed to fetch settings',
  });
}
