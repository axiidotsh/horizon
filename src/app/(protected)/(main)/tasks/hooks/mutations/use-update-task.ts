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

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useApiMutation(api.tasks[':id'].$patch, {
    invalidateKeys: [
      TASK_QUERY_KEYS.stats,
      TASK_QUERY_KEYS.chart,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
    errorMessage: 'Failed to update task',
    successMessage: 'Task updated',
    onSuccess: (data) => {
      if (!('task' in data)) return;

      const updatedTask = data.task as Task;

      queryClient.setQueriesData<InfiniteData<TasksPage, number>>(
        { queryKey: TASK_QUERY_KEYS.infinite },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              tasks: page.tasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              ),
            })),
          };
        }
      );
    },
  });
}
