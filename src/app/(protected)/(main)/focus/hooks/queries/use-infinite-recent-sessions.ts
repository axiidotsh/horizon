import { useApiInfiniteQuery } from '@/hooks/use-api-infinite-query';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

interface UseInfiniteRecentSessionsOptions {
  search?: string;
  sortBy?: 'name' | 'duration' | 'date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export function useInfiniteRecentSessions(
  options: UseInfiniteRecentSessionsOptions = {}
) {
  const { search, sortBy, sortOrder = 'desc', limit = 50 } = options;

  const query = useApiInfiniteQuery(api.focus.sessions.$get, {
    queryKey: [
      ...FOCUS_QUERY_KEYS.sessions,
      'infinite',
      search,
      sortBy,
      sortOrder,
      limit,
    ],
    getInput: (offset) => ({
      query: {
        offset: offset.toString(),
        limit: limit.toString(),
        sortOrder,
        ...(search && { search }),
        ...(sortBy && { sortBy }),
      },
    }),
    errorMessage: 'Failed to fetch sessions',
  });

  const sessions = query.data?.pages.flatMap((page) => page.sessions) ?? [];

  return {
    ...query,
    sessions,
  };
}
