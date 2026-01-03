import { env } from '@/lib/config/env/client';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { handle } from 'hono/vercel';
import { auth } from './auth';
import { httpLogger } from './logger';
import { apiRateLimiter, authRateLimiter } from './middleware/rate-limit';
import { dashboardRouter } from './routes/dashboard';
import { docsRouter } from './routes/docs';
import { focusRouter } from './routes/focus';
import { habitsRouter } from './routes/habits';
import { projectsRouter } from './routes/projects';
import { tasksRouter } from './routes/tasks';
import { userRouter } from './routes/user';

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
  .on(['POST', 'GET'], '/auth/*', authRateLimiter, (c) =>
    auth.handler(c.req.raw)
  )
  .use('*', apiRateLimiter)
  .route('/focus', focusRouter)
  .route('/tasks', tasksRouter)
  .route('/projects', projectsRouter)
  .route('/habits', habitsRouter)
  .route('/dashboard', dashboardRouter)
  .route('/user', userRouter)
  .route('/docs', docsRouter);

export type AppType = typeof router;
export const httpHandler = handle(router);
