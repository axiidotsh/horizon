'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/utils';
import { DotIcon } from 'lucide-react';
import type { Task } from '../../hooks/types';
import { useTaskActions } from '../../hooks/use-task-actions';
import { formatDueDate, isOverdue } from '../../utils/task-filters';
import { PriorityBadge } from '../badges/priority-badge';
import { ProjectBadge } from '../badges/project-badge';
import { TagBadge } from '../badges/tag-badge';
import { TaskActionsMenu } from '../task-actions-menu';

interface TaskListItemProps {
  task: Task;
}

export const TaskListItem = ({ task }: TaskListItemProps) => {
  const { handleToggle, handleEdit, handleDelete, isToggling } =
    useTaskActions();

  return (
    <li className="border-border flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => handleToggle(task.id)}
        disabled={isToggling}
        className="mt-0.5"
        aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="flex flex-1 items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <p
            className={cn(
              'text-sm',
              task.completed && 'text-muted-foreground line-through'
            )}
          >
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={task.priority} />
            {task.priority !== 'NO_PRIORITY' &&
              (task.project || task.tags?.length || task.dueDate) && (
                <DotIcon className="text-muted-foreground size-3" />
              )}
            {task.project && (
              <>
                <ProjectBadge project={task.project} />
                {(task.tags?.length || task.dueDate) && (
                  <DotIcon className="text-muted-foreground size-3" />
                )}
              </>
            )}
            {task.tags && task.tags.length > 0 && (
              <>
                {task.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
                {task.dueDate && (
                  <DotIcon className="text-muted-foreground size-3" />
                )}
              </>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  'shrink-0 text-xs',
                  isOverdue(task.dueDate) && !task.completed
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {formatDueDate(task.dueDate, task.completed)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <TaskActionsMenu
          onEdit={() => handleEdit(task)}
          onDelete={() => handleDelete(task)}
        />
      </div>
    </li>
  );
};
