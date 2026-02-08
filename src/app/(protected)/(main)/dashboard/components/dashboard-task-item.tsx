'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/utils/utils';
import { CopyIcon, DotIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { PriorityBadge } from '../../tasks/components/badges/priority-badge';
import { ProjectBadge } from '../../tasks/components/badges/project-badge';
import { TagBadge } from '../../tasks/components/badges/tag-badge';
import { TaskActionsMenu } from '../../tasks/components/task-actions-menu';
import { Task } from '../../tasks/hooks/types';
import { useTaskActions } from '../../tasks/hooks/use-task-actions';
import { formatDueDate, isOverdue } from '../../tasks/utils/task-filters';

interface DashboardTaskItemProps {
  task: Task;
}

export const DashboardTaskItem = ({ task }: DashboardTaskItemProps) => {
  const { handleToggle, handleEdit, handleDelete, isToggling } =
    useTaskActions();
  const isMobile = useIsMobile();
  const [isOptimisticCompleted, setIsOptimisticCompleted] = useState(
    task.completed
  );

  const onToggle = () => {
    const prevCompleted = isOptimisticCompleted;
    setIsOptimisticCompleted(!prevCompleted);

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

  const content = (
    <li className="border-border flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
      <Checkbox
        checked={isOptimisticCompleted}
        onCheckedChange={onToggle}
        disabled={isToggling}
        className="mt-0.5"
        aria-label={`Mark task "${task.title}" as ${isOptimisticCompleted ? 'incomplete' : 'complete'}`}
      />
      <div className="flex flex-1 items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <p
            className={cn(
              'text-sm',
              isOptimisticCompleted && 'text-muted-foreground line-through'
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
                  isOverdue(task.dueDate) && !isOptimisticCompleted
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {formatDueDate(task.dueDate, isOptimisticCompleted)}
              </span>
            )}
          </div>
        </div>
      </div>
      {!isMobile && (
        <div className="shrink-0">
          <TaskActionsMenu
            onEdit={() => handleEdit(task)}
            onDelete={() => handleDelete(task)}
          />
        </div>
      )}
    </li>
  );

  if (!isMobile) return content;

  return (
    <MobileContextMenu
      onCopy={onCopy}
      onEdit={() => handleEdit(task)}
      onDelete={() => handleDelete(task)}
    >
      {content}
    </MobileContextMenu>
  );
};

interface MobileContextMenuProps {
  children: ReactNode;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MobileContextMenu = ({
  children,
  onCopy,
  onEdit,
  onDelete,
}: MobileContextMenuProps) => (
  <ContextMenu>
    <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem onSelect={onCopy}>
        <CopyIcon />
        Copy
      </ContextMenuItem>
      <ContextMenuItem onSelect={onEdit}>
        <PencilIcon />
        Edit
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" onSelect={onDelete}>
        <TrashIcon />
        Delete
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
);
