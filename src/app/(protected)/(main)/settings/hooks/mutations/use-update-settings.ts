import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient } from '@tanstack/react-query';
import { SETTINGS_QUERY_KEYS } from '../settings-query-keys';
import type { UserSettings } from '../types';

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useApiMutation(api.settings.$patch, {
    invalidateKeys: [SETTINGS_QUERY_KEYS.settings],
    errorMessage: 'Failed to update settings',
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: SETTINGS_QUERY_KEYS.settings,
      });

      const previousData = queryClient.getQueryData(
        SETTINGS_QUERY_KEYS.settings
      );

      queryClient.setQueryData(SETTINGS_QUERY_KEYS.settings, (old: unknown) => {
        const data = old as UserSettings;
        return {
          ...data,
          ...variables.json,
        };
      });

      return { previousData, snapshots: [] };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          SETTINGS_QUERY_KEYS.settings,
          context.previousData
        );
      }
    },
  });
}
