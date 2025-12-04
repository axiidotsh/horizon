import { api } from '@/lib/rpc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const FOCUS_QUERY_KEYS = {
  activeSession: ['focus', 'active'] as const,
  sessions: ['focus', 'sessions'] as const,
};

export interface FocusSession {
  id: string;
  userId: string;
  durationMinutes: number;
  task: string | null;
  startedAt: string;
  pausedAt: string | null;
  totalPausedSeconds: number;
  completedAt: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export function useActiveSession() {
  return useQuery({
    queryKey: FOCUS_QUERY_KEYS.activeSession,
    queryFn: async () => {
      const res = await api.focus.sessions.active.$get();
      if (!res.ok) {
        throw new Error('Failed to fetch active session');
      }
      const data = await res.json();
      return data.session as FocusSession | null;
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

export function useRecentSessions(limit = 10) {
  return useQuery({
    queryKey: [...FOCUS_QUERY_KEYS.sessions, limit],
    queryFn: async () => {
      const res = await api.focus.sessions.$get({
        query: { limit: String(limit) },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await res.json();
      return data.sessions as FocusSession[];
    },
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { durationMinutes: number; task?: string }) => {
      const res = await api.focus.sessions.$post({ json: data });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          (error as { error: string }).error || 'Failed to start session'
        );
      }
      const result = await res.json();
      return result.session as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FOCUS_QUERY_KEYS.activeSession,
      });
    },
  });
}

export function usePauseSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await api.focus.sessions[':id'].pause.$patch({
        param: { id: sessionId },
      });
      if (!res.ok) {
        throw new Error('Failed to pause session');
      }
      const data = await res.json();
      return data.session as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FOCUS_QUERY_KEYS.activeSession,
      });
    },
  });
}

export function useResumeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await api.focus.sessions[':id'].resume.$patch({
        param: { id: sessionId },
      });
      if (!res.ok) {
        throw new Error('Failed to resume session');
      }
      const data = await res.json();
      return data.session as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FOCUS_QUERY_KEYS.activeSession,
      });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await api.focus.sessions[':id'].complete.$patch({
        param: { id: sessionId },
      });
      if (!res.ok) {
        throw new Error('Failed to complete session');
      }
      const data = await res.json();
      return data.session as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FOCUS_QUERY_KEYS.activeSession,
      });
      queryClient.invalidateQueries({ queryKey: FOCUS_QUERY_KEYS.sessions });
    },
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await api.focus.sessions[':id'].cancel.$patch({
        param: { id: sessionId },
      });
      if (!res.ok) {
        throw new Error('Failed to cancel session');
      }
      const data = await res.json();
      return data.session as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FOCUS_QUERY_KEYS.activeSession,
      });
      queryClient.invalidateQueries({ queryKey: FOCUS_QUERY_KEYS.sessions });
    },
  });
}
