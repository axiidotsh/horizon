import type { api } from '@/lib/rpc';
import type { InferResponseType } from 'hono/client';

type SettingsResponse = InferResponseType<typeof api.settings.$get>;
export type UserSettings = SettingsResponse;
