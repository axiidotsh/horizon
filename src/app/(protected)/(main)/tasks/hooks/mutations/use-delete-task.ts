import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import type { InfiniteData } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { TASK_QUERY_KEYS } from '../task-query-keys';
import type { Task } from '../types';

interface TasksPage {
  tasks: Task[];
  nextOffset: number | null;
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useApiMutation(api.tasks[':id'].$delete, {
    invalidateKeys: [
      TASK_QUERY_KEYS.stats,
      TASK_QUERY_KEYS.chart,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
    errorMessage: 'Failed to delete task',
    successMessage: 'Task deleted',
    onSuccess: (_data, variables) => {
      const taskId = variables.param.id;

      queryClient.setQueriesData<InfiniteData<TasksPage, number>>(
        { queryKey: TASK_QUERY_KEYS.infinite },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              tasks: page.tasks.filter((task) => task.id !== taskId),
            })),
          };
        }
      );
    },
  });
}
