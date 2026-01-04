import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';
import type { TaskPriority } from '../../hooks/types';
import { formatPriorityLabel } from '../../utils/format-priority';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  return (
    <Badge
      variant={priority === 'HIGH' ? 'destructive' : 'secondary'}
      className={cn(
        'border text-xs',
        priority === 'LOW' &&
          'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400',
        priority === 'MEDIUM' &&
          'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        priority === 'HIGH' && 'border-red-500/50',
        className
      )}
    >
      {formatPriorityLabel(priority)}
    </Badge>
  );
};
