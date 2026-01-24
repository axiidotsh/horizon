import { useApiInfiniteQuery } from '@/hooks/use-api-infinite-query';
import { api } from '@/lib/rpc';
import { TASK_QUERY_KEYS } from '../task-query-keys';

interface UseInfiniteTasksOptions {
  search?: string;
  projectIds?: string[];
  tags?: string[];
  completed?: boolean;
  sortBy?: 'dueDate' | 'priority' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export function useInfiniteTasks(options: UseInfiniteTasksOptions = {}) {
  const {
    search,
    projectIds,
    tags,
    completed,
    sortBy,
    sortOrder = 'asc',
    limit = 50,
  } = options;

  const query = useApiInfiniteQuery(api.tasks.$get, {
    queryKey: [
      ...TASK_QUERY_KEYS.infinite,
      search,
      projectIds,
      tags,
      completed,
      sortBy,
      sortOrder,
      limit,
    ],
    getInput: (offset) => ({
      query: {
        offset: offset.toString(),
        limit: limit.toString(),
        sortOrder,
        ...(search && { search }),
        ...(projectIds?.length && { projectIds: projectIds.join(',') }),
        ...(tags?.length && { tags: tags.join(',') }),
        ...(completed !== undefined && { completed: completed.toString() }),
        ...(sortBy && { sortBy }),
      },
    }),
    errorMessage: 'Failed to fetch tasks',
  });

  const tasks = query.data?.pages.flatMap((page) => page.tasks) ?? [];

  return {
    ...query,
    tasks,
  };
}
