import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useSetAtom } from 'jotai';
import { useRef } from 'react';
import { type Settings, settingsAtom } from '../settings-atom';
import { SETTINGS_QUERY_KEYS } from '../settings-query-keys';

export function useUpdateSettings() {
  const setSettings = useSetAtom(settingsAtom);
  const snapshotRef = useRef<Settings | undefined>(undefined);

  return useApiMutation(api.settings.$patch, {
    invalidateKeys: [SETTINGS_QUERY_KEYS.settings],
    errorMessage: 'Failed to update settings',
    onMutate: (variables) => {
      setSettings((prev) => {
        snapshotRef.current = prev;
        return prev ? { ...prev, ...variables.json } : prev;
      });
    },
    onSuccess: (data) => {
      setSettings(data);
    },
    onError: () => {
      if (snapshotRef.current) {
        setSettings(snapshotRef.current);
      }
    },
  });
}
