import { api } from '@/lib/rpc';
import { useQuery } from '@tanstack/react-query';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';

export function useActiveSession() {
  return useQuery({
    queryKey: FOCUS_QUERY_KEYS.activeSession,
    queryFn: async () => {
      const res = await api.focus.sessions.active.$get();
      if (!res.ok) {
        throw new Error('Failed to fetch active session');
      }
      const data = await res.json();
      return data.session;
    },
    refetchInterval: (query) => {
      const session = query.state.data;
      if (session?.status === 'ACTIVE') {
        return 30000;
      }
      return false;
    },
  });
}
