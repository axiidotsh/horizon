import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { TASK_QUERY_KEYS } from '../task-query-keys';

export function useDeleteProject() {
  return useApiMutation(api.projects[':id'].$delete, {
    invalidateKeys: [TASK_QUERY_KEYS.projects, TASK_QUERY_KEYS.all],
    errorMessage: 'Failed to delete project',
    successMessage: 'Project deleted',
  });
}
