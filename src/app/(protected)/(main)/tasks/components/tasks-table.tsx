'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSetAtom } from 'jotai';
import { ClipboardCheckIcon } from 'lucide-react';
import { createTaskDialogAtom } from '../atoms/task-dialogs';
import type { Task } from '../hooks/types';
import { TaskTableRow } from './task-table-row';

interface TasksTableProps {
  tasks: Task[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  sentinelRef?: (node?: Element | null) => void;
}

export const TasksTable = ({
  tasks,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
}: TasksTableProps) => {
  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);

  if (isLoading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-muted-foreground min-w-[200px] text-xs font-normal">
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
              <TableHead className="text-muted-foreground text-xs font-normal">
                Tags
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="size-4 rounded-full" />
                </TableCell>
                <TableCell className="min-w-[200px]">
                  <Skeleton className="h-5 w-full max-w-xs" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
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
        <TableHeader className="bg-background">
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="text-muted-foreground min-w-[200px] text-xs font-normal">
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
            <TableHead className="text-muted-foreground text-xs font-normal">
              Tags
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskTableRow key={task.id} task={task} />
          ))}
          {isFetchingNextPage && (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex justify-center py-4">
                  <Skeleton className="h-5 w-full max-w-xs" />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {sentinelRef && <div ref={sentinelRef} className="h-px" />}
    </div>
  );
};
