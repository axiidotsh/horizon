'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/utils';
import { CheckIcon, CopyIcon, MinusIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
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
  const [isCopied, setIsCopied] = useState(false);

  const onToggle = () => handleToggle(task.id);

  const onCopy = async () => {
    await navigator.clipboard.writeText(task.title);
    setIsCopied(true);
    toast.success('Task copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

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
        <div className="flex items-center">
          <Button
            onClick={onCopy}
            variant="ghost"
            size="icon-sm"
            aria-label="Copy task content"
            tooltip={isCopied ? 'Copied!' : 'Copy task content'}
          >
            <motion.div
              key={isCopied ? 'check' : 'copy'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {isCopied ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </motion.div>
          </Button>
          <TaskActionsMenu
            onEdit={() => handleEdit(task)}
            onDelete={() => handleDelete(task)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
