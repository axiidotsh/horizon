'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaskStats } from '../../hooks/queries/use-task-stats';

export const TaskMetricsBadges = () => {
  const { data: stats, isLoading } = useTaskStats();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1.5">
        {stats.completed}/{stats.total} done
      </Badge>
      {stats.overdue > 0 && (
        <Badge
          variant="secondary"
          className="gap-1.5 border-0 border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-600/50 dark:bg-rose-500/20 dark:text-rose-400"
        >
          {stats.overdue} overdue
        </Badge>
      )}
    </div>
  );
};
