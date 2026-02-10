import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { settingsAtom } from '../settings-atom';
import { SETTINGS_QUERY_KEYS } from '../settings-query-keys';

export function useSettings() {
  const query = useApiQuery(api.settings.$get, {
    queryKey: SETTINGS_QUERY_KEYS.settings,
    errorMessage: 'Failed to fetch settings',
  });

  const [settings, setSettings] = useAtom(settingsAtom);

  useEffect(() => {
    if (query.data) {
      setSettings(query.data);
    }
  }, [query.data, setSettings]);

  return {
    ...query,
    data: settings ?? query.data,
  };
}
