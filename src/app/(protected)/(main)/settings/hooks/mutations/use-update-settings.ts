import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient } from '@tanstack/react-query';
import { SETTINGS_QUERY_KEYS } from '../settings-query-keys';

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useApiMutation(api.settings.$patch, {
    invalidateKeys: [SETTINGS_QUERY_KEYS.settings],
    errorMessage: 'Failed to update settings',
  });
}
