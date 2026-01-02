import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient } from '@tanstack/react-query';
import { TASK_QUERY_KEYS } from '../task-query-keys';
import type { Task } from '../types';

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useApiMutation(api.tasks[':id'].$delete, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: TASK_QUERY_KEYS.tasks });

      const previousData = queryClient.getQueryData(TASK_QUERY_KEYS.tasks);

      queryClient.setQueryData(TASK_QUERY_KEYS.tasks, (old: unknown) => {
        const data = old as { tasks: Task[] };
        return {
          ...data,
          tasks: data.tasks.filter((task) => task.id !== variables.param.id),
        };
      });

      return { previousData, snapshots: [] };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(TASK_QUERY_KEYS.tasks, context.previousData);
      }
    },
    invalidateKeys: [
      TASK_QUERY_KEYS.tasks,
      TASK_QUERY_KEYS.stats,
      TASK_QUERY_KEYS.chart,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
  });
}
