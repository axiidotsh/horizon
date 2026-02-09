'use client';

import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { useAtom } from 'jotai';
import { InboxIcon, RotateCcwIcon, TrashIcon } from 'lucide-react';
import { PriorityBadge } from '../../tasks/components/badges/priority-badge';
import { ProjectBadge } from '../../tasks/components/badges/project-badge';
import { selectedTrashTasksAtom } from '../atoms/trash-atoms';
import {
  useBulkDelete,
  useBulkRestore,
} from '../hooks/mutations/use-bulk-trash-action';
import { useEmptyTrashTasks } from '../hooks/mutations/use-empty-trash';
import { usePermanentDeleteTask } from '../hooks/mutations/use-permanent-delete-task';
import { useRestoreTask } from '../hooks/mutations/use-restore-task';
import { useTrashTasks } from '../hooks/queries/use-trash-tasks';
import { EmptyTrashDialog } from './empty-trash-dialog';
import { TrashToolbar } from './trash-toolbar';

export const TrashTasksTab = () => {
  const { data, isLoading, error, refetch } = useTrashTasks();
  const [selected, setSelected] = useAtom(selectedTrashTasksAtom);
  const restoreTask = useRestoreTask();
  const deleteTask = usePermanentDeleteTask();
  const bulkRestore = useBulkRestore();
  const bulkDelete = useBulkDelete();
  const emptyTasks = useEmptyTrashTasks();

  const tasks = data?.tasks ?? [];
  const isAllSelected = tasks.length > 0 && selected.size === tasks.length;

  function handleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(tasks.map((t) => t.id)) : new Set());
  }

  function handleToggle(id: string) {
    setSelected((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRestoreSelected() {
    bulkRestore.mutate(
      { json: { type: 'tasks', ids: [...selected] } },
      { onSuccess: () => setSelected(new Set()) }
    );
  }

  function handleDeleteSelected() {
    bulkDelete.mutate(
      { json: { type: 'tasks', ids: [...selected] } },
      { onSuccess: () => setSelected(new Set()) }
    );
  }

  function handleClearAll() {
    emptyTasks.mutate({}, { onSuccess: () => setSelected(new Set()) });
  }

  if (error) {
    return (
      <div className="w-full">
        <ErrorState
          onRetry={refetch}
          title="Failed to load deleted tasks"
          description="Unable to fetch deleted tasks. Please try again."
        />
      </div>
    );
  }

  if (isLoading) {
    return <TrashTabSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>No tasks in trash</EmptyTitle>
          <EmptyDescription>Deleted tasks will appear here</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="w-full">
      <TrashToolbar
        selectedCount={selected.size}
        totalCount={tasks.length}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onRestoreSelected={handleRestoreSelected}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
        isRestoring={bulkRestore.isPending}
        isDeleting={bulkDelete.isPending}
        isClearing={emptyTasks.isPending}
        typeName="tasks"
      />
      <div className="md:hidden">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 border-b px-4 py-3"
          >
            <Checkbox
              className="mt-0.5"
              checked={selected.has(task.id)}
              onCheckedChange={() => handleToggle(task.id)}
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium">{task.title}</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {task.priority !== 'NO_PRIORITY' && (
                  <PriorityBadge priority={task.priority} />
                )}
                {task.project && <ProjectBadge project={task.project} />}
                {task.deletedAt && (
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(task.deletedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => restoreTask.mutate({ param: { id: task.id } })}
                disabled={restoreTask.isPending}
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
              <EmptyTrashDialog
                title="Delete task permanently?"
                description="This action cannot be undone."
                onConfirm={() => deleteTask.mutate({ param: { id: task.id } })}
                isPending={deleteTask.isPending}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive size-7"
                >
                  <TrashIcon className="size-3.5" />
                </Button>
              </EmptyTrashDialog>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table className="w-full min-w-[600px] table-fixed">
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="text-muted-foreground text-xs font-normal">
                Title
              </TableHead>
              <TableHead className="text-muted-foreground w-20 text-xs font-normal">
                Priority
              </TableHead>
              <TableHead className="text-muted-foreground w-28 text-xs font-normal">
                Project
              </TableHead>
              <TableHead className="text-muted-foreground w-34 text-xs font-normal">
                Deleted
              </TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(task.id)}
                    onCheckedChange={() => handleToggle(task.id)}
                  />
                </TableCell>
                <TableCell className="truncate font-medium">
                  {task.title}
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {task.project ? <ProjectBadge project={task.project} /> : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {task.deletedAt
                    ? formatDistanceToNow(new Date(task.deletedAt), {
                        addSuffix: true,
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            restoreTask.mutate({ param: { id: task.id } })
                          }
                          disabled={restoreTask.isPending}
                        >
                          <RotateCcwIcon className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Restore</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <EmptyTrashDialog
                        title="Delete task permanently?"
                        description="This action cannot be undone."
                        onConfirm={() =>
                          deleteTask.mutate({ param: { id: task.id } })
                        }
                        isPending={deleteTask.isPending}
                      >
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive size-8"
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </TooltipTrigger>
                      </EmptyTrashDialog>
                      <TooltipContent>Delete permanently</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const TrashTabSkeleton = () => (
  <div className="w-full">
    <div className="md:hidden">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 border-b px-4 py-3">
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-full max-w-xs" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
    <Table className="hidden w-full table-fixed md:table">
      <TableHeader className="bg-background">
        <TableRow>
          <TableHead className="w-10" />
          <TableHead className="text-muted-foreground text-xs font-normal">
            Title
          </TableHead>
          <TableHead className="text-muted-foreground w-20 text-xs font-normal">
            Priority
          </TableHead>
          <TableHead className="text-muted-foreground w-28 text-xs font-normal">
            Project
          </TableHead>
          <TableHead className="text-muted-foreground w-24 text-xs font-normal">
            Deleted
          </TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }, (_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="size-4 rounded-sm" />
            </TableCell>
            <TableCell className="min-w-[200px]">
              <Skeleton className="h-5 w-full max-w-xs" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-12 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="size-8 rounded-md" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
