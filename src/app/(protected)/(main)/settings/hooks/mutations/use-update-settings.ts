import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { SETTINGS_QUERY_KEYS } from '../settings-query-keys';

export function useUpdateSettings() {
  return useApiMutation(api.settings.$patch, {
    invalidateKeys: [SETTINGS_QUERY_KEYS.settings],
    errorMessage: 'Failed to update settings',
  });
}
