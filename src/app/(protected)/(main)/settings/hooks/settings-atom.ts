import { api } from '@/lib/rpc';
import type { InferResponseType } from 'hono/client';
import { atomWithStorage } from 'jotai/utils';

export type Settings = InferResponseType<typeof api.settings.$get>;

export const settingsAtom = atomWithStorage<Settings | undefined>(
  'settings',
  undefined,
  undefined,
  { getOnInit: true }
);
