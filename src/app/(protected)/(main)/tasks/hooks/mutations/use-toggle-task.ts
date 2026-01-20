import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import type { DashboardMetrics } from '@/app/(protected)/(main)/dashboard/hooks/types';
import { updateDashboardMetricsForTaskToggle } from '@/app/(protected)/(main)/dashboard/utils/dashboard-calculations';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import {
  calculateTaskChartData,
  calculateTaskStats,
} from '../../utils/task-calculations';
import { TASK_QUERY_KEYS } from '../task-query-keys';
import type { ChartData, Task, TaskStats } from '../types';

interface TasksPage {
  tasks: Task[];
  nextOffset: number | null;
}

interface ToggleTaskContext {
  snapshots: Array<{ queryKey: QueryKey; data: unknown }>;
  previousInfiniteData: [
    QueryKey,
    InfiniteData<TasksPage, number> | undefined,
  ][];
  previousStats: unknown;
  previousChartData: [QueryKey, { chartData: ChartData } | undefined][];
  previousMetrics: { metrics: DashboardMetrics } | undefined;
}

export function useToggleTask(taskId?: string) {
  const queryClient = useQueryClient();

  const getAllTasksFromCache = (): Task[] => {
    const infiniteQueries = queryClient.getQueriesData<
      InfiniteData<TasksPage, number>
    >({
      queryKey: TASK_QUERY_KEYS.infinite,
    });

    for (const [, data] of infiniteQueries) {
      if (data?.pages) {
        return data.pages.flatMap((page) => page.tasks);
      }
    }

    return [];
  };

  const updateInfiniteQueries = (
    updateFn: (task: Task) => Task,
    taskId: string
  ) => {
    queryClient.setQueriesData<InfiniteData<TasksPage, number>>(
      { queryKey: TASK_QUERY_KEYS.infinite },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            tasks: page.tasks.map((task) =>
              task.id === taskId ? updateFn(task) : task
            ),
          })),
        };
      }
    );
  };

  const updateDerivedCaches = (allTasks: Task[]) => {
    const newStats = calculateTaskStats(allTasks);
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
      const newChartData = calculateTaskChartData(allTasks, days);
      queryClient.setQueryData(queryKey, { chartData: newChartData });
    });
  };

  return useApiMutation(api.tasks[':id'].toggle.$patch, {
    mutationKey: taskId ? ['toggleTask', taskId] : undefined,
    invalidateKeys: [
      TASK_QUERY_KEYS.all,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
    errorMessage: 'Failed to toggle task',
    onMutate: async (variables: {
      param: { id: string };
    }): Promise<ToggleTaskContext> => {
      await queryClient.cancelQueries({ queryKey: TASK_QUERY_KEYS.all });

      const previousInfiniteData = queryClient.getQueriesData<
        InfiniteData<TasksPage, number>
      >({
        queryKey: TASK_QUERY_KEYS.infinite,
      });

      const previousStats = queryClient.getQueryData(TASK_QUERY_KEYS.stats);

      const previousChartData = queryClient.getQueriesData<{
        chartData: ChartData;
      }>({
        queryKey: TASK_QUERY_KEYS.chart,
      });

      const previousMetrics = queryClient.getQueryData<{
        metrics: DashboardMetrics;
      }>(DASHBOARD_QUERY_KEYS.metrics);

      const allTasks = getAllTasksFromCache();
      const toggledTask = allTasks.find(
        (task) => task.id === variables.param.id
      );

      if (!toggledTask) {
        return {
          snapshots: [],
          previousInfiniteData,
          previousStats,
          previousChartData,
          previousMetrics,
        };
      }

      const updateFn = (task: Task): Task => ({
        ...task,
        completed: !task.completed,
        updatedAt: new Date().toISOString(),
      });

      updateInfiniteQueries(updateFn, variables.param.id);

      const updatedTasks = allTasks.map((task) =>
        task.id === variables.param.id ? updateFn(task) : task
      );
      updateDerivedCaches(updatedTasks);

      if (previousMetrics) {
        const updatedMetrics = updateDashboardMetricsForTaskToggle(
          previousMetrics.metrics,
          toggledTask,
          toggledTask.completed
        );
        queryClient.setQueryData(DASHBOARD_QUERY_KEYS.metrics, {
          metrics: updatedMetrics,
        });
      }

      return {
        snapshots: [],
        previousInfiniteData,
        previousStats,
        previousChartData,
        previousMetrics,
      };
    },
    onError: (
      _error: Error,
      _variables: { param: { id: string } },
      context?: ToggleTaskContext
    ) => {
      if (context?.previousInfiniteData) {
        context.previousInfiniteData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(TASK_QUERY_KEYS.stats, context.previousStats);
      }
      if (context?.previousChartData) {
        context.previousChartData.forEach(([queryKey, data]) => {
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
  });
}
