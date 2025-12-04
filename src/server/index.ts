import { env } from '@/lib/config/env/client';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { handle } from 'hono/vercel';
import { auth } from './auth';
import { httpLogger } from './logger';
import { focusRouter } from './routes/focus';

const app = new Hono().basePath('/api').use(
  '*',
  cors({
    origin: env.NEXT_PUBLIC_APP_URL,
    credentials: true,
  }),
  secureHeaders(),
  requestId(),
  httpLogger()
);

const router = app
  .on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw))
  .route('/focus', focusRouter);

export type AppType = typeof router;
export const httpHandler = handle(router);
