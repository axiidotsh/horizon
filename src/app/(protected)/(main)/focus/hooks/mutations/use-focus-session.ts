import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useFocusSession() {
  const start = useApiMutation(api.focus.sessions.$post, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
    successMessage: 'Focus session started',
    errorMessage: 'Failed to start focus session',
  });

  const pause = useApiMutation(api.focus.sessions[':id'].pause.$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
    errorMessage: 'Failed to pause focus session',
    successMessage: 'Session paused',
  });

  const resume = useApiMutation(api.focus.sessions[':id'].resume.$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
    errorMessage: 'Failed to resume focus session',
    successMessage: 'Session resumed',
  });

  const complete = useApiMutation(api.focus.sessions[':id'].complete.$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      FOCUS_QUERY_KEYS.stats,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
    errorMessage: 'Failed to complete focus session',
    successMessage: 'Focus session completed',
  });

  const cancel = useApiMutation(api.focus.sessions[':id'].cancel.$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      DASHBOARD_QUERY_KEYS.metrics,
    ],
    errorMessage: 'Failed to cancel focus session',
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
      errorMessage: 'Failed to end focus session early',
      successMessage: 'Focus session ended early',
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
