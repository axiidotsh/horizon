import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import type { DashboardMetrics } from '@/app/(protected)/(main)/dashboard/hooks/types';
import { updateDashboardMetricsForTaskToggle } from '@/app/(protected)/(main)/dashboard/utils/dashboard-calculations';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import {
  calculateTaskChartData,
  calculateTaskStats,
} from '../../utils/task-calculations';
import { TASK_QUERY_KEYS } from '../task-query-keys';
import type { ChartData, Task, TaskStats } from '../types';

export function useToggleTask(taskId?: string) {
  const queryClient = useQueryClient();

  const invalidateKeys: QueryKey[] = [
    TASK_QUERY_KEYS.tasks,
    TASK_QUERY_KEYS.stats,
    TASK_QUERY_KEYS.chart,
    DASHBOARD_QUERY_KEYS.metrics,
    DASHBOARD_QUERY_KEYS.heatmap,
  ];

  const updateAllTaskQueries = (updatedTasks: Task[]) => {
    const queries = queryClient.getQueriesData({
      queryKey: TASK_QUERY_KEYS.tasks,
    });

    queries.forEach(([queryKey]) => {
      queryClient.setQueryData(queryKey, { tasks: updatedTasks });
    });

    const newStats = calculateTaskStats(updatedTasks);
    queryClient.setQueryData<{ stats: TaskStats }>(TASK_QUERY_KEYS.stats, {
      stats: newStats,
    });

    const chartQueries = queryClient.getQueriesData<{ chartData: ChartData }>({
      queryKey: TASK_QUERY_KEYS.chart,
    });

    chartQueries.forEach(([queryKey]) => {
      const days = (
        queryKey as ReturnType<typeof TASK_QUERY_KEYS.chartWithDays>
      )[2];
      const newChartData = calculateTaskChartData(updatedTasks, days);
      queryClient.setQueryData(queryKey, { chartData: newChartData });
    });
  };

  return useApiMutation(api.tasks[':id'].toggle.$patch, {
    mutationKey: taskId ? ['toggleTask', taskId] : undefined,
    invalidateKeys,
    onMutate: async (variables) => {
      const queries = queryClient.getQueriesData<{ tasks: Task[] }>({
        queryKey: TASK_QUERY_KEYS.tasks,
      });

      const previousData = queries.map(([queryKey, data]) => ({
        queryKey,
        data,
      }));

      const chartQueries = queryClient.getQueriesData<{ chartData: ChartData }>(
        {
          queryKey: TASK_QUERY_KEYS.chart,
        }
      );

      const previousChartData = chartQueries.map(([queryKey, data]) => ({
        queryKey,
        data,
      }));

      const previousMetrics = queryClient.getQueryData<{
        metrics: DashboardMetrics;
      }>(DASHBOARD_QUERY_KEYS.metrics);

      if (queries.length > 0 && queries[0][1]) {
        const data = queries[0][1];
        const toggledTask = data.tasks.find(
          (task) => task.id === variables.param.id
        );

        const updatedTasks = data.tasks.map((task) =>
          task.id === variables.param.id
            ? {
                ...task,
                completed: !task.completed,
                updatedAt: new Date().toISOString(),
              }
            : task
        );
        updateAllTaskQueries(updatedTasks);

        if (toggledTask && previousMetrics) {
          const updatedMetrics = updateDashboardMetricsForTaskToggle(
            previousMetrics.metrics,
            toggledTask,
            toggledTask.completed
          );
          queryClient.setQueryData(DASHBOARD_QUERY_KEYS.metrics, {
            metrics: updatedMetrics,
          });
        }
      }

      const previousStats = queryClient.getQueryData(TASK_QUERY_KEYS.stats);
      return {
        previousData,
        previousStats,
        previousChartData,
        previousMetrics,
        snapshots: [],
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(TASK_QUERY_KEYS.stats, context.previousStats);
      }
      if (context?.previousChartData) {
        context.previousChartData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousMetrics) {
        queryClient.setQueryData(
          DASHBOARD_QUERY_KEYS.metrics,
          context.previousMetrics
        );
      }
    },
    errorMessage: 'Failed to toggle task',
  });
}
