'use client';

import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
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
import { useDebounce } from '@/hooks/use-debounce';
import { useAtomValue, useSetAtom } from 'jotai';
import { ClipboardCheckIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import {
  searchQueryAtom,
  selectedProjectsAtom,
  selectedTagsAtom,
  sortByAtom,
  sortOrderAtom,
} from '../atoms/task-atoms';
import { createTaskDialogAtom } from '../atoms/task-dialogs';
import { useInfiniteTasks } from '../hooks/queries/use-infinite-tasks';
import { TaskMobileCard } from './task-mobile-card';
import { TaskTableRow } from './task-table-row';

export const TasksTable = () => {
  const searchQuery = useAtomValue(searchQueryAtom);
  const selectedTags = useAtomValue(selectedTagsAtom);
  const selectedProjects = useAtomValue(selectedProjectsAtom);
  const sortBy = useAtomValue(sortByAtom);
  const sortOrder = useAtomValue(sortOrderAtom);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);

  const {
    tasks,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteTasks({
    search: debouncedSearchQuery || undefined,
    sortBy,
    sortOrder,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
  });

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0,
  });

  if (error) {
    return (
      <div className="mt-8 flex w-full">
        <ErrorState
          onRetry={refetch}
          title="Failed to load tasks"
          description="Unable to fetch tasks. Please try again."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="space-y-0 md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 border-b px-4 py-3"
            >
              <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-full max-w-xs" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Table className="hidden md:table">
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
    <>
      <div className="w-full md:hidden">
        {tasks.map((task) => (
          <TaskMobileCard key={task.id} task={task} />
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Skeleton className="h-5 w-full max-w-xs px-4" />
          </div>
        )}
        <div ref={sentinelRef} className="h-px" />
      </div>
      <ScrollArea className="hidden w-full md:grid">
        <ScrollBar orientation="horizontal" />
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
        <div ref={sentinelRef} className="h-px" />
      </ScrollArea>
    </>
  );
};
