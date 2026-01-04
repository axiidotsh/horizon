'use client';

import { Badge } from '@/components/ui/badge';
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
import {
  DotIcon,
  EllipsisIcon,
  FolderIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import { deletingTaskAtom, editingTaskAtom } from '../../atoms/task-dialogs';
import { useToggleTask } from '../../hooks/mutations/use-toggle-task';
import type { Task } from '../../hooks/types';
import { formatDueDate, isOverdue } from '../../utils/task-filters';

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

  const formattedPriority =
    task.priority.charAt(0) + task.priority.slice(1).toLowerCase();

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
            <Badge
              variant={task.priority === 'HIGH' ? 'destructive' : 'secondary'}
              className={cn(
                'border text-xs',
                task.priority === 'LOW' &&
                  'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400',
                task.priority === 'MEDIUM' &&
                  'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                task.priority === 'HIGH' && 'border-red-500/50'
              )}
            >
              {formattedPriority}
            </Badge>
            {(task.project || task.tags?.length || task.dueDate) && (
              <DotIcon className="text-muted-foreground size-3" />
            )}
            {task.project && (
              <>
                <Badge
                  variant="outline"
                  className="gap-1 border"
                  style={{
                    backgroundColor: task.project.color
                      ? `${task.project.color}20`
                      : undefined,
                    borderColor: task.project.color
                      ? `${task.project.color}80`
                      : undefined,
                    color: task.project.color || undefined,
                  }}
                >
                  <FolderIcon className="size-3" />
                  {task.project.name}
                </Badge>
                {(task.tags?.length || task.dueDate) && (
                  <DotIcon className="text-muted-foreground size-3" />
                )}
              </>
            )}
            {task.tags && task.tags.length > 0 && (
              <>
                {task.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="dark:bg-secondary bg-foreground/10"
                  >
                    {tag}
                  </Badge>
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
