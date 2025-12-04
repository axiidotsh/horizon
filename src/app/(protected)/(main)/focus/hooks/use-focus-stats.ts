import { api } from '@/lib/rpc';
import { useQuery } from '@tanstack/react-query';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';

export interface FocusStats {
  currentStreak: number;
  bestStreak: number;
  highestDailyMinutes: number;
  highestDailyDaysAgo: number | null;
  bestSessionsInDay: number;
}

export function useFocusStats() {
  return useQuery({
    queryKey: FOCUS_QUERY_KEYS.stats,
    queryFn: async (): Promise<FocusStats> => {
      const res = await api.focus.stats.$get();
      if (!res.ok) {
        throw new Error('Failed to fetch focus stats');
      }
      const data = await res.json();
      return data.stats;
    },
  });
}
