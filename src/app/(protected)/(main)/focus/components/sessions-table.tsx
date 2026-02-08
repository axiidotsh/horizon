'use client';

import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatSessionDateTime } from '@/utils/date-format';
import { useSetAtom } from 'jotai';
import {
  CopyIcon,
  EllipsisIcon,
  PencilIcon,
  TimerIcon,
  TrashIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { editingSessionAtom } from '../atoms/session-dialogs';
import { useDeleteSession } from '../hooks/mutations/use-delete-session';
import type { FocusSession } from '../hooks/types';

interface SessionsTableProps {
  sessions: FocusSession[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  sentinelRef?: (node?: Element | null) => void;
}

export const SessionsTable = ({
  sessions,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
}: SessionsTableProps) => {
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="md:hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 border-b px-4 py-3">
              <Skeleton className="h-5 w-48" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
        <Table className="hidden md:table">
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="text-muted-foreground max-w-[400px] min-w-[250px] text-xs font-normal">
                Task
              </TableHead>
              <TableHead className="text-muted-foreground w-[200px] text-xs font-normal">
                Started At
              </TableHead>
              <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
                Duration
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="max-w-[400px]">
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-24 text-center">
        <TimerIcon className="mb-2 size-12 stroke-1 opacity-50" />
        <p className="text-sm font-medium">No sessions yet</p>
        <p className="text-xs">Start your first focus session above</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full md:hidden">
        {sessions.map((session) => (
          <SessionMobileCard key={session.id} session={session} />
        ))}
        {sentinelRef && <div ref={sentinelRef} className="h-px" />}
        {isFetchingNextPage && (
          <div className="text-muted-foreground flex justify-center py-2">
            <p className="text-xs">Loading more...</p>
          </div>
        )}
      </div>
      <ScrollArea className="hidden md:block">
        <ScrollBar orientation="horizontal" />
        <Table>
          <TableHeader className="bg-background sticky top-0">
            <TableRow>
              <TableHead className="text-muted-foreground max-w-[400px] min-w-[250px] text-xs font-normal">
                Task
              </TableHead>
              <TableHead className="text-muted-foreground w-[200px] text-xs font-normal">
                Started At
              </TableHead>
              <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
                Duration
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <SessionTableRow key={session.id} session={session} />
            ))}
            {sentinelRef && (
              <TableRow ref={sentinelRef} className="h-4 hover:bg-transparent">
                <TableCell colSpan={4}>
                  {isFetchingNextPage && (
                    <div className="text-muted-foreground flex justify-center py-2">
                      <p className="text-xs">Loading more...</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  );
};

interface SessionMobileCardProps {
  session: FocusSession;
}

const SessionMobileCard = ({ session }: SessionMobileCardProps) => {
  const setEditingSession = useSetAtom(editingSessionAtom);
  const deleteSession = useDeleteSession();

  const onCopy = async () => {
    await navigator.clipboard.writeText(session.task || 'Focus session');
    toast.success('Session copied to clipboard');
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="border-b px-4 py-3">
          <span className="text-sm">{session.task || 'Focus session'}</span>
          <div className="text-muted-foreground mt-1.5 flex items-center gap-3 text-xs">
            <span>{formatSessionDateTime(session.startedAt)}</span>
            <span className="font-mono font-medium">
              {session.durationMinutes} min
            </span>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="z-70">
        <ContextMenuItem onSelect={onCopy}>
          <CopyIcon />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => setEditingSession(session)}>
          <PencilIcon />
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onSelect={() => deleteSession.mutate({ param: { id: session.id } })}
        >
          <TrashIcon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

interface SessionTableRowProps {
  session: FocusSession;
}

const SessionTableRow = ({ session }: SessionTableRowProps) => {
  const setEditingSession = useSetAtom(editingSessionAtom);
  const deleteSession = useDeleteSession();

  return (
    <TableRow>
      <TableCell className="max-w-[400px]">
        <span className="text-sm">{session.task || 'Focus session'}</span>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-xs">
          {formatSessionDateTime(session.startedAt)}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm font-medium">
          {session.durationMinutes} min
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Session options"
              tooltip="Session options"
            >
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingSession(session)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() =>
                deleteSession.mutate({ param: { id: session.id } })
              }
            >
              <TrashIcon />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
