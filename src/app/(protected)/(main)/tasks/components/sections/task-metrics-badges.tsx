'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaskStats } from '../../hooks/queries/use-task-stats';
import { useTasks } from '../../hooks/queries/use-tasks';
import { isOverdue } from '../../utils/task-filters';

export const TaskMetricsBadges = () => {
  const { data: stats, isLoading: statsLoading } = useTaskStats();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  const isLoading = statsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  if (!stats) return null;

  const overdueCount = tasks.filter(
    (task) => task.dueDate && !task.completed && isOverdue(task.dueDate)
  ).length;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1.5">
        {stats.completed}/{stats.total} done
      </Badge>
      {overdueCount > 0 && (
        <Badge
          variant="outline"
          className="gap-1.5 border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
        >
          {overdueCount} overdue
        </Badge>
      )}
    </div>
  );
};
