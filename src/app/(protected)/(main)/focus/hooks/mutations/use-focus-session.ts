import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useFocusSession() {
  const start = useApiMutation(api.focus.sessions.$post, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });

  const pause = useApiMutation(api.focus.sessions[':id'].pause.$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });

  const resume = useApiMutation(api.focus.sessions[':id'].resume.$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });

  const complete = useApiMutation(api.focus.sessions[':id'].complete.$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      FOCUS_QUERY_KEYS.stats,
    ],
  });

  const cancel = useApiMutation(api.focus.sessions[':id'].cancel.$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession, FOCUS_QUERY_KEYS.sessions],
  });

  const endEarly = useApiMutation(
    api.focus.sessions[':id']['end-early'].$patch,
    {
      invalidateKeys: [
        FOCUS_QUERY_KEYS.activeSession,
        FOCUS_QUERY_KEYS.sessions,
        FOCUS_QUERY_KEYS.stats,
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
