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
          variant="outline"
          className="gap-1.5 border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
        >
          {stats.overdue} overdue
        </Badge>
      )}
    </div>
  );
};
