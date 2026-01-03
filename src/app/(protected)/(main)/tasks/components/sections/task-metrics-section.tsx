'use client';

import {
  CheckCircle2Icon,
  CircleDashed,
  ListTodoIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { MetricCard } from '../../../components/metric-card';
import { useTaskStats } from '../../hooks/queries/use-task-stats';

export const TaskMetricsSection = () => {
  const { data: stats, isLoading } = useTaskStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Tasks"
        icon={ListTodoIcon}
        content={stats?.total.toString() ?? '0'}
        footer="This week"
        isLoading={isLoading}
      />
      <MetricCard
        title="Completed"
        icon={CheckCircle2Icon}
        content={stats?.completed.toString() ?? '0'}
        footer="This week"
        isLoading={isLoading}
      />
      <MetricCard
        title="Pending"
        icon={CircleDashed}
        content={stats?.pending.toString() ?? '0'}
        footer="This week"
        isLoading={isLoading}
      />
      <MetricCard
        title="Completion Rate"
        icon={TrendingUpIcon}
        content={`${stats?.completionRate ?? 0}%`}
        footer="This week"
        isLoading={isLoading}
      />
    </div>
  );
};
