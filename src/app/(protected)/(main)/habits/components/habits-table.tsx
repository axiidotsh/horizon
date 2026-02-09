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
import { formatDayLabel } from '@/utils/date-format';
import { getLast7DaysUTC, isTodayUTC } from '@/utils/date-utc';
import { cn } from '@/utils/utils';
import { useAtomValue, useSetAtom } from 'jotai';
import { TargetIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { createDialogOpenAtom } from '../atoms/dialog-atoms';
import {
  searchQueryAtom,
  sortByAtom,
  sortOrderAtom,
  statusFilterAtom,
} from '../atoms/habit-atoms';
import { useInfiniteHabits } from '../hooks/queries/use-infinite-habits';
import { HabitMobileCard } from './habit-mobile-card';
import { HabitTableRow } from './habit-table-row';

export const HabitsTable = () => {
  const sortBy = useAtomValue(sortByAtom);
  const sortOrder = useAtomValue(sortOrderAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const statusFilter = useAtomValue(statusFilterAtom);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const setCreateDialogOpen = useSetAtom(createDialogOpenAtom);

  const {
    habits,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteHabits({
    search: debouncedSearchQuery || undefined,
    sortBy,
    sortOrder,
    status: statusFilter,
  });

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0,
  });

  const days = getLast7DaysUTC();

  if (error) {
    return (
      <div className="mt-8 w-full">
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
        <div className="md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 border-b px-4 py-3"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-full max-w-xs" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="size-3.5 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Table className="hidden md:table">
          <TableHeader className="bg-background">
            <TableRow>
              <TableHead className="text-muted-foreground max-w-[400px] min-w-[250px] text-xs font-normal">
                Habit
              </TableHead>
              <TableHead className="text-muted-foreground text-center text-xs font-normal">
                <div className="flex items-center justify-center gap-1">
                  {days.map((day, index) => (
                    <span
                      key={index}
                      className={cn(
                        'w-3.5 text-center',
                        isTodayUTC(day) && 'font-semibold'
                      )}
                    >
                      {formatDayLabel(day)}
                    </span>
                  ))}
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
                Streak
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="max-w-[400px]">
                  <Skeleton className="h-5 w-full max-w-xs" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="size-3.5 rounded-full" />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
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

  if (habits.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-32 text-center sm:py-48">
        <TargetIcon className="mb-2 size-12 stroke-1 opacity-50" />
        <p className="text-sm font-medium">No habits found</p>
        <p className="text-xs">
          Create your first habit or adjust your filters
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="mt-4"
        >
          Add Habit
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full md:hidden">
        {habits.map((habit) => (
          <HabitMobileCard key={habit.id} habit={habit} />
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
              <TableHead className="text-muted-foreground max-w-[400px] min-w-[250px] text-xs font-normal">
                Habit
              </TableHead>
              <TableHead className="text-muted-foreground text-center text-xs font-normal">
                <div className="flex items-center justify-center gap-1">
                  {days.map((day, index) => (
                    <span
                      key={index}
                      className={cn(
                        'w-3.5 text-center',
                        isTodayUTC(day) && 'font-semibold'
                      )}
                    >
                      {formatDayLabel(day)}
                    </span>
                  ))}
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
                Streak
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {habits.map((habit) => (
              <HabitTableRow key={habit.id} habit={habit} />
            ))}
            {isFetchingNextPage && (
              <TableRow>
                <TableCell colSpan={4}>
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
