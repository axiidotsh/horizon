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
import { DotIcon, InboxIcon, RotateCcwIcon, TrashIcon } from 'lucide-react';
import { selectedTrashSessionsAtom } from '../atoms/trash-atoms';
import {
  useBulkDelete,
  useBulkRestore,
} from '../hooks/mutations/use-bulk-trash-action';
import { useEmptyTrashSessions } from '../hooks/mutations/use-empty-trash';
import { usePermanentDeleteSession } from '../hooks/mutations/use-permanent-delete-session';
import { useRestoreSession } from '../hooks/mutations/use-restore-session';
import { useTrashSessions } from '../hooks/queries/use-trash-sessions';
import { EmptyTrashDialog } from './empty-trash-dialog';
import { TrashToolbar } from './trash-toolbar';

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export const TrashSessionsTab = () => {
  const { data, isLoading, error, refetch } = useTrashSessions();
  const [selected, setSelected] = useAtom(selectedTrashSessionsAtom);
  const restoreSession = useRestoreSession();
  const deleteSession = usePermanentDeleteSession();
  const bulkRestore = useBulkRestore();
  const bulkDelete = useBulkDelete();
  const emptySessions = useEmptyTrashSessions();

  const sessions = data?.sessions ?? [];
  const isAllSelected =
    sessions.length > 0 && selected.size === sessions.length;

  function handleSelectAll(checked: boolean) {
    setSelected(checked ? new Set(sessions.map((s) => s.id)) : new Set());
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
      { json: { type: 'sessions', ids: [...selected] } },
      { onSuccess: () => setSelected(new Set()) }
    );
  }

  function handleDeleteSelected() {
    bulkDelete.mutate(
      { json: { type: 'sessions', ids: [...selected] } },
      { onSuccess: () => setSelected(new Set()) }
    );
  }

  function handleClearAll() {
    emptySessions.mutate({}, { onSuccess: () => setSelected(new Set()) });
  }

  if (error) {
    return (
      <div className="w-full">
        <ErrorState
          onRetry={refetch}
          title="Failed to load deleted sessions"
          description="Unable to fetch deleted sessions. Please try again."
        />
      </div>
    );
  }

  if (isLoading) {
    return <TrashTabSkeleton />;
  }

  if (sessions.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>No sessions in trash</EmptyTitle>
          <EmptyDescription>
            Deleted focus sessions will appear here
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="w-full">
      <TrashToolbar
        selectedCount={selected.size}
        totalCount={sessions.length}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onRestoreSelected={handleRestoreSelected}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
        isRestoring={bulkRestore.isPending}
        isDeleting={bulkDelete.isPending}
        isClearing={emptySessions.isPending}
        typeName="sessions"
      />
      <div className="md:hidden">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start gap-3 border-b px-4 py-3"
          >
            <Checkbox
              className="mt-0.5"
              checked={selected.has(session.id)}
              onCheckedChange={() => handleToggle(session.id)}
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium">
                {session.task ?? 'Untitled session'}
              </span>
              <div className="mt-1.5 flex items-center gap-1 text-xs">
                <span className="text-muted-foreground font-mono font-medium">
                  {formatDuration(session.durationMinutes)}
                </span>
                {session.deletedAt && (
                  <>
                    <DotIcon className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(session.deletedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() =>
                  restoreSession.mutate({ param: { id: session.id } })
                }
                disabled={restoreSession.isPending}
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
              <EmptyTrashDialog
                title="Delete session permanently?"
                description="This action cannot be undone."
                onConfirm={() =>
                  deleteSession.mutate({ param: { id: session.id } })
                }
                isPending={deleteSession.isPending}
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
              Task
            </TableHead>
            <TableHead className="text-muted-foreground w-[100px] text-xs font-normal">
              Duration
            </TableHead>
            <TableHead className="text-muted-foreground w-34 text-xs font-normal">
              Deleted
            </TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <Checkbox
                  checked={selected.has(session.id)}
                  onCheckedChange={() => handleToggle(session.id)}
                />
              </TableCell>
              <TableCell className="font-medium">
                {session.task ?? 'Untitled session'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDuration(session.durationMinutes)}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {session.deletedAt
                  ? formatDistanceToNow(new Date(session.deletedAt), {
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
                          restoreSession.mutate({
                            param: { id: session.id },
                          })
                        }
                        disabled={restoreSession.isPending}
                      >
                        <RotateCcwIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <EmptyTrashDialog
                      title="Delete session permanently?"
                      description="This action cannot be undone."
                      onConfirm={() =>
                        deleteSession.mutate({ param: { id: session.id } })
                      }
                      isPending={deleteSession.isPending}
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
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-12" />
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
            Task
          </TableHead>
          <TableHead className="text-muted-foreground w-[100px] text-xs font-normal">
            Duration
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
              <Skeleton className="h-4 w-12" />
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
