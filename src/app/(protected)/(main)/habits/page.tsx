'use client';

import { PageHeading } from '@/components/page-heading';
import { SearchBar } from '@/components/search-bar';
import { useDebounce } from '@/hooks/use-debounce';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  searchQueryAtom,
  sortByAtom,
  statusFilterAtom,
} from './atoms/habit-atoms';
import { HabitListActions } from './components/habit-list-actions';
import { HabitsTable } from './components/habits-table';
import { HabitMetricsBadges } from './components/sections/habit-metrics-badges';
import { useInfiniteHabits } from './hooks/queries/use-infinite-habits';
import {
  enrichHabitsWithMetrics,
  filterHabits,
  sortHabits,
} from './utils/habit-calculations';

export default function HabitsPage() {
  const sortBy = useAtomValue(sortByAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const statusFilter = useAtomValue(statusFilterAtom);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    habits: rawHabits,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteHabits({
    search: debouncedSearchQuery || undefined,
    sortBy: sortBy === 'title' ? 'title' : undefined,
    sortOrder: 'asc',
  });

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0,
  });

  const habits = useMemo(() => enrichHabitsWithMetrics(rawHabits), [rawHabits]);

  const filteredHabits = useMemo(
    () => filterHabits(habits, '', statusFilter),
    [habits, statusFilter]
  );

  const sortedHabits = useMemo(() => {
    if (sortBy === 'streak') {
      return sortHabits(filteredHabits, sortBy);
    }
    return filteredHabits;
  }, [filteredHabits, sortBy]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-row items-center gap-3">
            <PageHeading>Habits</PageHeading>
            <HabitMetricsBadges />
          </div>
          <div className="flex items-center gap-2">
            <SearchBar
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border md:w-80 lg:w-96"
            />
            <HabitListActions />
          </div>
        </div>
      </div>
      <HabitsTable
        habits={sortedHabits}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
      />
    </div>
  );
}
