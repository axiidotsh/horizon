import type { Session, User } from 'better-auth';
import { createMiddleware } from 'hono/factory';
import { auth } from '../auth';

export type AuthVariables = {
  user: User;
  session: Session;
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user);
  c.set('session', session.session);

  await next();
});
