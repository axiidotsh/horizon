import { api } from '@/lib/rpc';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from './use-api-mutation';

export function useClearData() {
  const queryClient = useQueryClient();

  return useApiMutation(api.user['clear-data'].$post, {
    errorMessage: 'Failed to clear data',
    successMessage: 'Data cleared successfully',
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
