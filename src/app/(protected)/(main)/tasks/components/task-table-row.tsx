'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/utils';
import { CheckIcon, MinusIcon } from 'lucide-react';
import type { Task } from '../hooks/types';
import { useTaskActions } from '../hooks/use-task-actions';
import { formatDueDate, isOverdue } from '../utils/task-filters';
import { PriorityBadge } from './badges/priority-badge';
import { ProjectBadge } from './badges/project-badge';
import { TagBadge } from './badges/tag-badge';
import { TaskActionsMenu } from './task-actions-menu';

interface TaskTableRowProps {
  task: Task;
}

export const TaskTableRow = ({ task }: TaskTableRowProps) => {
  const { handleToggle, handleEdit, handleDelete, isToggling } =
    useTaskActions();

  const onToggle = () => handleToggle(task.id);

  return (
    <TableRow className={cn((task.completed || isToggling) && 'opacity-60')}>
      <TableCell>
        <button
          onClick={onToggle}
          disabled={isToggling}
          className={cn(
            'flex size-4 cursor-pointer items-center justify-center rounded-full border transition-all',
            task.completed
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30 hover:border-muted-foreground/50'
          )}
          aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        >
          {task.completed && <CheckIcon className="size-2.5" strokeWidth={3} />}
        </button>
      </TableCell>
      <TableCell
        className={cn(
          'min-w-[200px] whitespace-normal',
          !isToggling && 'cursor-pointer'
        )}
        onClick={isToggling ? undefined : onToggle}
      >
        <span
          className={cn(
            'text-sm',
            task.completed && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>
      </TableCell>
      <TableCell>
        {task.dueDate ? (
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
        ) : (
          <span className="text-muted-foreground text-xs">
            <MinusIcon className="size-2" />
          </span>
        )}
      </TableCell>
      <TableCell>
        {task.priority === 'NO_PRIORITY' ? (
          <span className="text-muted-foreground text-xs">
            <MinusIcon className="size-2" />
          </span>
        ) : (
          <PriorityBadge priority={task.priority} />
        )}
      </TableCell>
      <TableCell className="max-w-[150px]">
        {task.project ? (
          <ProjectBadge
            project={task.project}
            className="max-w-full truncate"
          />
        ) : (
          <span className="text-muted-foreground text-xs">
            <MinusIcon className="size-2" />
          </span>
        )}
      </TableCell>
      <TableCell className="whitespace-normal">
        {task.tags && task.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} className="max-w-full truncate" />
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">
            <MinusIcon className="size-2" />
          </span>
        )}
      </TableCell>
      <TableCell>
        <TaskActionsMenu
          onEdit={() => handleEdit(task)}
          onDelete={() => handleDelete(task)}
        />
      </TableCell>
    </TableRow>
  );
};
