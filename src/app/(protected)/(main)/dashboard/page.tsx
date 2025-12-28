'use client';

import { useChartSessions } from '@/app/(protected)/(main)/focus/hooks/queries/use-chart-sessions';
import { useTaskChart } from '@/app/(protected)/(main)/tasks/hooks/queries/use-task-chart';
import { PageHeading } from '@/components/page-heading';
import { useState } from 'react';
import { FocusTimeChart } from './components/charts/focus-time-chart';
import { HabitCompletionChart } from './components/charts/habit-completion-chart';
import { TaskCompletionChart } from './components/charts/task-completion-chart';
import { DashboardHabitsCard } from './components/dashboard-habits-card';
import { DashboardMetrics } from './components/dashboard-metrics';
import { DashboardTasksCard } from './components/dashboard-tasks-card';
import { ProductivityHeatmap } from './components/productivity-heatmap';
import { MetricsSkeleton } from './components/skeletons/metrics-skeleton';
import { StartFocusButton } from './components/start-focus-button';
import { useDashboardMetrics } from './hooks/queries/use-dashboard-metrics';
import { useHabitChart } from './hooks/queries/use-habit-chart';
import { useHeatmapData } from './hooks/queries/use-heatmap-data';

export default function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState(7);

  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useDashboardMetrics();

  const {
    data: heatmapData,
    isLoading: heatmapLoading,
    error: heatmapError,
  } = useHeatmapData(52);

  const { data: taskChartData, isLoading: taskChartLoading } =
    useTaskChart(chartPeriod);

  const { data: habitChartData, isLoading: habitChartLoading } =
    useHabitChart(chartPeriod);

  const { data: focusSessions, isLoading: focusLoading } =
    useChartSessions(chartPeriod);

  if (metricsError) {
    return (
      <div className="space-y-6">
        <PageHeading>Dashboard</PageHeading>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive mb-4 text-sm">
            Failed to load dashboard
          </p>
          <button
            onClick={() => refetchMetrics()}
            className="text-primary text-sm hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Dashboard</PageHeading>
        {!metrics?.focus.activeSession && <StartFocusButton />}
      </div>

      <div className="mt-4 space-y-4">
        {metricsLoading ? (
          <MetricsSkeleton />
        ) : (
          metrics && <DashboardMetrics metrics={metrics} />
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardTasksCard />
          <DashboardHabitsCard />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0">
            <FocusTimeChart
              data={focusSessions}
              isLoading={focusLoading}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
          <div className="min-w-0">
            <TaskCompletionChart
              data={taskChartData}
              isLoading={taskChartLoading}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
          <div className="min-w-0">
            <HabitCompletionChart
              data={habitChartData}
              isLoading={habitChartLoading}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
        </div>

        <div className="grid grid-cols-1">
          <ProductivityHeatmap
            data={heatmapData}
            isLoading={heatmapLoading}
            error={heatmapError}
          />
        </div>
      </div>
    </div>
  );
}
