import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';
import type { FocusSession } from '../types';

export function useFocusSession(sessionId?: string) {
  const start = useApiMutation(api.focus.sessions.$post, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
  });

  const pause = useApiMutation(api.focus.sessions[':id'].pause.$patch, {
    mutationKey: sessionId ? ['focusSession', 'pause', sessionId] : undefined,
    optimisticUpdate: {
      queryKey: FOCUS_QUERY_KEYS.activeSession,
      updater: (oldData: unknown) => {
        const data = oldData as { session: FocusSession | null };
        if (!data.session) return data;
        return {
          ...data,
          session: { ...data.session, status: 'PAUSED' as const },
        };
      },
    },
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
  });

  const resume = useApiMutation(api.focus.sessions[':id'].resume.$patch, {
    mutationKey: sessionId ? ['focusSession', 'resume', sessionId] : undefined,
    optimisticUpdate: {
      queryKey: FOCUS_QUERY_KEYS.activeSession,
      updater: (oldData: unknown) => {
        const data = oldData as { session: FocusSession | null };
        if (!data.session) return data;
        return {
          ...data,
          session: { ...data.session, status: 'ACTIVE' as const },
        };
      },
    },
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
  });

  const complete = useApiMutation(api.focus.sessions[':id'].complete.$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      FOCUS_QUERY_KEYS.stats,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
  });

  const cancel = useApiMutation(api.focus.sessions[':id'].cancel.$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
  });

  const endEarly = useApiMutation(
    api.focus.sessions[':id']['end-early'].$patch,
    {
      invalidateKeys: [
        FOCUS_QUERY_KEYS.activeSession,
        FOCUS_QUERY_KEYS.sessions,
        FOCUS_QUERY_KEYS.stats,
        DASHBOARD_QUERY_KEYS.metrics,
        DASHBOARD_QUERY_KEYS.heatmap,
      ],
    }
  );

  return {
    start,
    pause,
    resume,
    complete,
    cancel,
    endEarly,
  };
}
