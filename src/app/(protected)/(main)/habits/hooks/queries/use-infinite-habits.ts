import { useApiInfiniteQuery } from '@/hooks/use-api-infinite-query';
import { api } from '@/lib/rpc';
import type { InferResponseType } from 'hono/client';
import { useMemo } from 'react';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

type HabitsResponse = InferResponseType<typeof api.habits.$get>;
type Habit = HabitsResponse['habits'][number];

interface UseInfiniteHabitsOptions {
  search?: string;
  days?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export function useInfiniteHabits(options: UseInfiniteHabitsOptions = {}) {
  const { search, days = 7, limit = 50, sortBy, sortOrder = 'asc' } = options;

  const query = useApiInfiniteQuery(api.habits.$get, {
    queryKey: [
      ...HABITS_QUERY_KEYS.list,
      search,
      days,
      limit,
      sortBy,
      sortOrder,
    ],
    getInput: (offset) => ({
      query: {
        offset: offset.toString(),
        limit: limit.toString(),
        days: days.toString(),
        ...(search && { search }),
        ...(sortBy && { sortBy, sortOrder }),
      },
    }),
    errorMessage: 'Failed to fetch habits',
  });

  const habits = useMemo<Habit[]>(
    () => query.data?.pages.flatMap((page) => page.habits) ?? [],
    [query.data]
  );

  return {
    ...query,
    habits,
  };
}
