import { createMiddleware } from 'hono/factory';
import { auth } from '../auth';
import { Role, Session, User } from '../db/generated/client';

export type AuthVariables = {
  user: User;
  session: Session;
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const sessionResponse = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionResponse?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = {
    ...sessionResponse.session,
    ipAddress: sessionResponse.session.ipAddress ?? null,
    userAgent: sessionResponse.session.userAgent ?? null,
    impersonatedBy: sessionResponse.session.impersonatedBy ?? null,
  };
  const user = {
    ...sessionResponse.user,
    image: sessionResponse.user.image ?? null,
    role: sessionResponse.user.role as Role,
    banned: sessionResponse.user.banned ?? false,
    banReason: sessionResponse.user.banReason ?? null,
    banExpires: sessionResponse.user.banExpires ?? null,
  };

  c.set('user', user);
  c.set('session', session);

  await next();
});
