'use client';

import { Badge } from '@/components/ui/badge';
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

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  NO_PRIORITY: 'None',
};

const PRIORITY_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  HIGH: 'destructive',
  MEDIUM: 'default',
  LOW: 'secondary',
  NO_PRIORITY: 'outline',
};

export const TrashTasksTab = () => {
  const { data, isLoading } = useTrashTasks();
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
      <Table>
        <TableHeader className="bg-background">
          <TableRow>
            <TableHead className="w-10" />
            <TableHead className="text-muted-foreground min-w-[200px] text-xs font-normal">
              Title
            </TableHead>
            <TableHead className="text-muted-foreground w-[100px] text-xs font-normal">
              Priority
            </TableHead>
            <TableHead className="text-muted-foreground w-[150px] text-xs font-normal">
              Project
            </TableHead>
            <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
              Deleted
            </TableHead>
            <TableHead className="w-12" />
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
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant={PRIORITY_VARIANTS[task.priority]}>
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.project?.name ?? '-'}
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
  );
};

const TrashTabSkeleton = () => (
  <div className="w-full">
    <Table>
      <TableHeader className="bg-background">
        <TableRow>
          <TableHead className="w-10" />
          <TableHead className="text-muted-foreground min-w-[200px] text-xs font-normal">
            Title
          </TableHead>
          <TableHead className="text-muted-foreground w-[100px] text-xs font-normal">
            Priority
          </TableHead>
          <TableHead className="text-muted-foreground w-[150px] text-xs font-normal">
            Project
          </TableHead>
          <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
            Deleted
          </TableHead>
          <TableHead className="w-12" />
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
