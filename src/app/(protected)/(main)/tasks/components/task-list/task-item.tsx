'use client';

import { useToggleTask } from '@/app/(protected)/(main)/tasks/hooks/mutations/use-toggle-task';
import type { Task } from '@/app/(protected)/(main)/tasks/hooks/types';
import {
  formatDueDate,
  getDueDateUrgency,
} from '@/app/(protected)/(main)/tasks/utils/task-filters';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/utils';

interface TaskItemProps {
  task: Task;
  showSeparator: boolean;
}

export const TaskItem = ({ task, showSeparator }: TaskItemProps) => {
  const toggleTask = useToggleTask(task.id);
  const urgency = task.dueDate
    ? getDueDateUrgency(task.dueDate, task.completed)
    : 'none';

  return (
    <div>
      <div className="flex items-start gap-3 py-3 transition-colors">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTask.mutate({ param: { id: task.id } })}
          disabled={toggleTask.isPending}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                'truncate text-sm font-medium',
                task.completed && 'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </p>
            {task.project && (
              <Badge
                variant="outline"
                style={{
                  borderColor: task.project.color || undefined,
                }}
                className="shrink-0"
              >
                {task.project.name}
              </Badge>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {task.dueDate && (
          <div
            className={cn(
              'shrink-0 text-xs whitespace-nowrap',
              urgency === 'overdue'
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {formatDueDate(task.dueDate, task.completed)}
          </div>
        )}
      </div>
      {showSeparator && <Separator />}
    </div>
  );
};
