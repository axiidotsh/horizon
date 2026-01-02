import { MetricCard } from '@/app/(protected)/(main)/components/metric-card';
import { ErrorState } from '@/components/error-state';
import { CheckCircle2, Clock, Flame, Target } from 'lucide-react';
import { useDashboardMetrics } from '../hooks/queries/use-dashboard-metrics';

export function DashboardMetrics() {
  const { data, isLoading, error, refetch } = useDashboardMetrics();

  if (error) {
    return (
      <ErrorState
        onRetry={refetch}
        title="Failed to load metrics"
        description="Unable to fetch metrics. Please try again."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Focus"
        icon={Clock}
        content={formatMinutesToTime(data?.focus.todayMinutes ?? 0)}
        footer={data?.focus.timeDiffLabel}
        isLoading={isLoading}
      />
      <MetricCard
        title="Tasks"
        icon={CheckCircle2}
        content={`${data?.tasks.completedToday}/${data?.tasks.totalToday}`}
        footer={
          data?.tasks.overdue && data?.tasks.overdue > 0
            ? `${data?.tasks.overdue} overdue`
            : data?.tasks.comparisonLabel
        }
        isLoading={isLoading}
      />
      <MetricCard
        title="Habits"
        icon={Target}
        content={`${data?.habits.completedToday}/${data?.habits.totalActive}`}
        footer={data?.habits.comparisonLabel}
        isLoading={isLoading}
      />
      <MetricCard
        title="Overall Streak"
        icon={Flame}
        content={`${data?.streak.currentStreak} days`}
        footer={data?.streak.comparisonLabel}
        isLoading={isLoading}
      />
    </div>
  );
}

function formatMinutesToTime(minutes: number): string {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
