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
import { selectedTrashHabitsAtom } from '../atoms/trash-atoms';
import {
  useBulkDelete,
  useBulkRestore,
} from '../hooks/mutations/use-bulk-trash-action';
import { useEmptyTrashHabits } from '../hooks/mutations/use-empty-trash';
import { usePermanentDeleteHabit } from '../hooks/mutations/use-permanent-delete-habit';
import { useRestoreHabit } from '../hooks/mutations/use-restore-habit';
import { useTrashHabits } from '../hooks/queries/use-trash-habits';
import { EmptyTrashDialog } from './empty-trash-dialog';
import { TrashToolbar } from './trash-toolbar';

export const TrashHabitsTab = () => {
  const { data, isLoading, error, refetch } = useTrashHabits();
  const [selected, setSelected] = useAtom(selectedTrashHabitsAtom);
  const restoreHabit = useRestoreHabit();
  const deleteHabit = usePermanentDeleteHabit();
  const bulkRestore = useBulkRestore();
  const bulkDelete = useBulkDelete();
  const emptyHabits = useEmptyTrashHabits();

  const habits = data?.habits ?? [];
  const isAllSelected = habits.length > 0 && selected.size === habits.length;

  function handleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(habits.map((h) => h.id)) : new Set());
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
      { json: { type: 'habits', ids: [...selected] } },
      { onSuccess: () => setSelected(new Set()) }
    );
  }

  function handleDeleteSelected() {
    bulkDelete.mutate(
      { json: { type: 'habits', ids: [...selected] } },
      { onSuccess: () => setSelected(new Set()) }
    );
  }

  function handleClearAll() {
    emptyHabits.mutate({}, { onSuccess: () => setSelected(new Set()) });
  }

  if (error) {
    return (
      <div className="w-full">
        <ErrorState
          onRetry={refetch}
          title="Failed to load deleted habits"
          description="Unable to fetch deleted habits. Please try again."
        />
      </div>
    );
  }

  if (isLoading) {
    return <TrashTabSkeleton />;
  }

  if (habits.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>No habits in trash</EmptyTitle>
          <EmptyDescription>Deleted habits will appear here</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="w-full">
      <TrashToolbar
        selectedCount={selected.size}
        totalCount={habits.length}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onRestoreSelected={handleRestoreSelected}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
        isRestoring={bulkRestore.isPending}
        isDeleting={bulkDelete.isPending}
        isClearing={emptyHabits.isPending}
        typeName="habits"
      />
      <div className="md:hidden">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="flex items-start gap-3 border-b px-4 py-3"
          >
            <Checkbox
              className="mt-0.5"
              checked={selected.has(habit.id)}
              onCheckedChange={() => handleToggle(habit.id)}
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium">{habit.title}</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {habit.category && (
                  <span className="text-muted-foreground text-xs">
                    {habit.category}
                  </span>
                )}
                {habit.category && habit.deletedAt && (
                  <span className="text-muted-foreground text-xs">·</span>
                )}
                {habit.deletedAt && (
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(habit.deletedAt), {
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
                onClick={() => restoreHabit.mutate({ param: { id: habit.id } })}
                disabled={restoreHabit.isPending}
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
              <EmptyTrashDialog
                title="Delete habit permanently?"
                description="This action cannot be undone. All completion history will be lost."
                onConfirm={() =>
                  deleteHabit.mutate({ param: { id: habit.id } })
                }
                isPending={deleteHabit.isPending}
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
      <Table className="hidden md:table">
        <TableHeader className="bg-background">
          <TableRow>
            <TableHead className="w-10" />
            <TableHead className="text-muted-foreground min-w-[200px] text-xs font-normal">
              Title
            </TableHead>
            <TableHead className="text-muted-foreground w-[150px] text-xs font-normal">
              Category
            </TableHead>
            <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
              Deleted
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {habits.map((habit) => (
            <TableRow key={habit.id}>
              <TableCell>
                <Checkbox
                  checked={selected.has(habit.id)}
                  onCheckedChange={() => handleToggle(habit.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{habit.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {habit.category ?? '-'}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {habit.deletedAt
                  ? formatDistanceToNow(new Date(habit.deletedAt), {
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
                          restoreHabit.mutate({ param: { id: habit.id } })
                        }
                        disabled={restoreHabit.isPending}
                      >
                        <RotateCcwIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <EmptyTrashDialog
                      title="Delete habit permanently?"
                      description="This action cannot be undone. All completion history will be lost."
                      onConfirm={() =>
                        deleteHabit.mutate({ param: { id: habit.id } })
                      }
                      isPending={deleteHabit.isPending}
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
    <div className="md:hidden">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 border-b px-4 py-3">
          <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-full max-w-xs" />
            <div className="flex gap-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
    <Table className="hidden md:table">
      <TableHeader className="bg-background">
        <TableRow>
          <TableHead className="w-10" />
          <TableHead className="text-muted-foreground min-w-[200px] text-xs font-normal">
            Title
          </TableHead>
          <TableHead className="text-muted-foreground w-[150px] text-xs font-normal">
            Category
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
