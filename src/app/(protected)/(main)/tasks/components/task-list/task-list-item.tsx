'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';
import { useSetAtom } from 'jotai';
import { DotIcon, EllipsisIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { deletingTaskAtom, editingTaskAtom } from '../../atoms/task-dialogs';
import { useToggleTask } from '../../hooks/mutations/use-toggle-task';
import type { Task } from '../../hooks/types';
import { formatDueDate, isOverdue } from '../../utils/task-filters';
import { PriorityBadge } from '../badges/priority-badge';
import { ProjectBadge } from '../badges/project-badge';
import { TagBadge } from '../badges/tag-badge';

interface TaskListItemProps {
  task: Task;
}

export const TaskListItem = ({ task }: TaskListItemProps) => {
  const setEditingTask = useSetAtom(editingTaskAtom);
  const setDeletingTask = useSetAtom(deletingTaskAtom);
  const toggleTask = useToggleTask(task.id);

  const handleToggle = () => {
    toggleTask.mutate({ param: { id: task.id } });
  };

  const handleEdit = () => {
    setEditingTask(task);
  };

  const handleDelete = () => {
    setDeletingTask(task);
  };

  return (
    <li className="border-border flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggle}
        disabled={toggleTask.isPending}
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
            {(task.project || task.tags?.length || task.dueDate) && (
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            className="shrink-0"
            aria-label="Task options"
            tooltip="Task options"
          >
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleEdit}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
};
