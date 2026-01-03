'use client';

import { PageHeading } from '@/components/page-heading';
import { FocusChartSection } from '../focus/components/sections/focus-chart-section';
import { useActiveSession } from '../focus/hooks/queries/use-active-session';
import { HabitChartSection } from '../habits/components/habit-chart-section';
import { HabitListSection } from '../habits/components/sections/habit-list-section';
import { TaskChartSection } from '../tasks/components/sections/task-chart-section';
import { TaskListSection } from '../tasks/components/sections/task-list-section';
import { DashboardMetrics } from './components/dashboard-metrics';
import { ProductivityHeatmap } from './components/productivity-heatmap';
import { StartFocusButton } from './components/start-focus-button';

export default function DashboardPage() {
  const { data: activeSession } = useActiveSession();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Dashboard</PageHeading>
        {!activeSession && <StartFocusButton />}
      </div>
      <div className="mt-4 space-y-4">
        <DashboardMetrics />
        <div className="grid gap-4 lg:grid-cols-2">
          <TaskListSection isDashboard />
          <HabitListSection />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0">
            <FocusChartSection />
          </div>
          <div className="min-w-0">
            <TaskChartSection />
          </div>
          <div className="min-w-0">
            <HabitChartSection />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <ProductivityHeatmap />
        </div>
      </div>
    </div>
  );
}
