'use client';

import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { Settings2Icon } from 'lucide-react';
import { TaskChartSection } from './components/sections/task-chart-section';
import { TaskListSection } from './components/sections/task-list-section';
import { TaskMetricsSection } from './components/sections/task-metrics-section';

export default function TasksPage() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Tasks</PageHeading>
        <Button
          size="icon-sm"
          variant="ghost"
          tooltip="Configure dashboard cards"
        >
          <Settings2Icon />
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        <TaskMetricsSection />
        <TaskListSection />
        <TaskChartSection />
      </div>
    </div>
  );
}
