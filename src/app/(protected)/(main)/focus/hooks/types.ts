import type { api } from '@/lib/rpc';
import type { InferResponseType } from 'hono/client';

type ActiveSessionResponse = InferResponseType<
  typeof api.focus.sessions.active.$get
>;

export type FocusSession = NonNullable<ActiveSessionResponse['session']>;
