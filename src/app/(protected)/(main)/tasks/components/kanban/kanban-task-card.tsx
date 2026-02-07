'use client';

import { cn } from '@/utils/utils';
import { CheckIcon } from 'lucide-react';
import type { Task } from '../../hooks/types';
import { useTaskActions } from '../../hooks/use-task-actions';
import { formatDueDate, isOverdue } from '../../utils/task-filters';
import { ProjectBadge } from '../badges/project-badge';
import { TagBadge } from '../badges/tag-badge';
import { TaskActionsMenu } from '../task-actions-menu';

const MAX_VISIBLE_TAGS = 2;

interface KanbanTaskCardProps {
  task: Task;
}

export const KanbanTaskCard = ({ task }: KanbanTaskCardProps) => {
  const { handleToggle, handleEdit, handleDelete, isToggling } =
    useTaskActions();

  return (
    <div
      onClick={() => handleEdit(task)}
      className={cn(
        'bg-card border-border cursor-pointer space-y-2 rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md',
        (task.completed || isToggling) && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(task.id);
          }}
          disabled={isToggling}
          className={cn(
            'mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all',
            task.completed
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30 hover:border-muted-foreground/50'
          )}
          aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        >
          {task.completed && <CheckIcon className="size-2.5" strokeWidth={3} />}
        </button>
        <span
          className={cn(
            'line-clamp-2 flex-1 text-sm leading-snug',
            task.completed && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <TaskActionsMenu
            onEdit={() => handleEdit(task)}
            onDelete={() => handleDelete(task)}
          />
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-wrap items-center gap-1.5"
      >
        {task.dueDate && (
          <span
            className={cn(
              'text-xs',
              isOverdue(task.dueDate) && !task.completed
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {formatDueDate(task.dueDate, task.completed)}
          </span>
        )}
        {task.project && (
          <ProjectBadge
            project={task.project}
            className="max-w-[120px] truncate text-xs"
          />
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-wrap gap-1"
        >
          {task.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
            <TagBadge key={tag} tag={tag} className="text-xs" />
          ))}
          {task.tags.length > MAX_VISIBLE_TAGS && (
            <span className="text-muted-foreground text-xs">
              +{task.tags.length - MAX_VISIBLE_TAGS}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
