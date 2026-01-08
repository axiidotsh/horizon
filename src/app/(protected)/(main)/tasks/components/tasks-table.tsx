'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils/utils';
import { useSetAtom } from 'jotai';
import {
  CheckIcon,
  ClipboardCheckIcon,
  EllipsisIcon,
  MinusIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import {
  createTaskDialogAtom,
  deletingTaskAtom,
  editingTaskAtom,
} from '../atoms/task-dialogs';
import { useToggleTask } from '../hooks/mutations/use-toggle-task';
import type { Task } from '../hooks/types';
import { formatDueDate, isOverdue } from '../utils/task-filters';
import { PriorityBadge } from './badges/priority-badge';
import { ProjectBadge } from './badges/project-badge';
import { TagBadge } from './badges/tag-badge';

interface TasksTableProps {
  tasks: Task[];
  isLoading?: boolean;
}

export const TasksTable = ({ tasks, isLoading }: TasksTableProps) => {
  const setEditingTask = useSetAtom(editingTaskAtom);
  const setDeletingTask = useSetAtom(deletingTaskAtom);
  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-24 text-center">
        <p className="text-sm">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-32 text-center sm:py-48">
        <ClipboardCheckIcon className="mb-2 size-12 stroke-1 opacity-50" />
        <p className="text-sm font-medium">No tasks found</p>
        <p className="text-xs">Create your first task or adjust your filters</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateTaskDialog(true)}
          className="mt-4"
        >
          Add Task
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-muted-foreground max-w-[500px] min-w-[300px] text-xs font-normal">
              Task
            </TableHead>
            <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
              Due Date
            </TableHead>
            <TableHead className="text-muted-foreground w-[100px] text-xs font-normal">
              Priority
            </TableHead>
            <TableHead className="text-muted-foreground w-[150px] text-xs font-normal">
              Project
            </TableHead>
            <TableHead className="text-muted-foreground min-w-[200px] text-xs font-normal">
              Tags
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskTableRow
              key={task.id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => setDeletingTask(task)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface TaskTableRowProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskTableRow = ({ task, onEdit, onDelete }: TaskTableRowProps) => {
  const toggleTask = useToggleTask(task.id);

  const handleToggle = () => {
    toggleTask.mutate({ param: { id: task.id } });
  };

  return (
    <TableRow className={cn(task.completed && 'opacity-60')}>
      <TableCell>
        <button
          onClick={handleToggle}
          disabled={toggleTask.isPending}
          className={cn(
            'flex size-4 cursor-pointer items-center justify-center rounded-full border transition-all disabled:opacity-50',
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
        className="max-w-[500px] cursor-pointer whitespace-normal"
        onClick={handleToggle}
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
      <TableCell>
        {task.project ? (
          <ProjectBadge project={task.project} />
        ) : (
          <span className="text-muted-foreground text-xs">
            <MinusIcon className="size-2" />
          </span>
        )}
      </TableCell>
      <TableCell>
        {task.tags && task.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">
            <MinusIcon className="size-2" />
          </span>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Task options"
              tooltip="Task options"
            >
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
