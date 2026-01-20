import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { TASK_QUERY_KEYS } from '../task-query-keys';

export function useTaskTags() {
  return useApiQuery(api.tasks.tags.$get, {
    queryKey: TASK_QUERY_KEYS.tags,
    input: {},
    select: (data) => data.tags,
    errorMessage: 'Failed to fetch tags',
  });
}
