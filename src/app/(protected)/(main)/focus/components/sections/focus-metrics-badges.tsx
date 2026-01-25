'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFocusStats } from '../../hooks/queries/use-focus-stats';

export const FocusMetricsBadges = () => {
  const { data: stats, isLoading } = useFocusStats();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary">{stats.totalMinutesToday}m today</Badge>
      <Badge variant="outline" className="emerald theme">
        {stats.allTimeBestMinutes}m best
      </Badge>
    </div>
  );
};
