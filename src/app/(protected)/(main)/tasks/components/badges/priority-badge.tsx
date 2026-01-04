import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';
import type { TaskPriority } from '../../hooks/types';
import { formatPriorityLabel } from '../../utils/format-priority';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  if (priority === 'NO_PRIORITY') {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'border text-xs',
        priority === 'LOW' &&
          'border-green-500/50 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
        priority === 'MEDIUM' &&
          'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        priority === 'HIGH' &&
          'border-red-500/50 bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        className
      )}
    >
      {formatPriorityLabel(priority)}
    </Badge>
  );
};
