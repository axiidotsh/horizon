'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/utils/utils';
import { CheckIcon, CopyIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Task } from '../hooks/types';
import { useTaskActions } from '../hooks/use-task-actions';
import { formatDueDate, isOverdue } from '../utils/task-filters';
import { PriorityBadge } from './badges/priority-badge';
import { ProjectBadge } from './badges/project-badge';
import { TagBadge } from './badges/tag-badge';

interface TaskMobileCardProps {
  task: Task;
}

export const TaskMobileCard = ({ task }: TaskMobileCardProps) => {
  const { handleToggle, handleEdit, handleDelete, isToggling, isDeleting } =
    useTaskActions();
  const [isOptimisticCompleted, setIsOptimisticCompleted] = useState(
    task.completed
  );
  const contextMenuOpenRef = useRef(false);

  const onToggle = () => {
    const prevCompleted = isOptimisticCompleted;
    setIsOptimisticCompleted(true);

    handleToggle(task.id, {
      onError: () => {
        setIsOptimisticCompleted(prevCompleted);
      },
      onSuccess: (data) => {
        if ('task' in data) {
          setIsOptimisticCompleted(data.task.completed);
        }
      },
    });
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(task.title);
    toast.success('Task copied to clipboard');
  };

  const hasMetadata =
    task.dueDate ||
    task.priority !== 'NO_PRIORITY' ||
    task.project ||
    (task.tags && task.tags.length > 0);

  return (
    <ContextMenu onOpenChange={(open) => (contextMenuOpenRef.current = open)}>
      <ContextMenuTrigger asChild>
        <div
          onClick={() => {
            if (contextMenuOpenRef.current || isToggling || isDeleting) return;
            onToggle();
          }}
          className={cn(
            'flex cursor-pointer items-start gap-3 border-b px-4 py-3',
            (isOptimisticCompleted || isDeleting) && 'opacity-60'
          )}
        >
          <div
            className={cn(
              'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-all',
              isOptimisticCompleted
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30'
            )}
            aria-label={`Mark task "${task.title}" as ${isOptimisticCompleted ? 'incomplete' : 'complete'}`}
          >
            {isOptimisticCompleted && (
              <CheckIcon className="size-2.5" strokeWidth={3} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                'text-sm',
                isOptimisticCompleted && 'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </span>
            {hasMetadata && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {task.dueDate && (
                  <span
                    className={cn(
                      'text-xs',
                      isOverdue(task.dueDate) && !isOptimisticCompleted
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    )}
                  >
                    {formatDueDate(task.dueDate, isOptimisticCompleted)}
                  </span>
                )}
                {task.priority !== 'NO_PRIORITY' && (
                  <PriorityBadge priority={task.priority} />
                )}
                {task.project && (
                  <ProjectBadge
                    project={task.project}
                    className="max-w-full truncate"
                  />
                )}
                {task.tags &&
                  task.tags.length > 0 &&
                  task.tags.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      className="max-w-full truncate"
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onCopy}>
          <CopyIcon />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => handleEdit(task)}>
          <PencilIcon />
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onSelect={() => handleDelete(task)}
        >
          <TrashIcon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
