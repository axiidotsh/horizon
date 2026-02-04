'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { EllipsisIcon, PencilIcon, TimerIcon, Trash2Icon } from 'lucide-react';
import {
  deletingSessionAtom,
  editingSessionAtom,
} from '../atoms/session-dialogs';
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
        <Table>
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
    <div className="w-full">
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
    </div>
  );
};

interface SessionTableRowProps {
  session: FocusSession;
}

const SessionTableRow = ({ session }: SessionTableRowProps) => {
  const setEditingSession = useSetAtom(editingSessionAtom);
  const setDeletingSession = useSetAtom(deletingSessionAtom);

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
              onSelect={() => setDeletingSession(session)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
