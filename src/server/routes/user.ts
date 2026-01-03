import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '../auth';
import { db } from '../db';

const userRouter = new Hono()
  .post(
    '/change-password',
    zValidator(
      'json',
      z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
          .string()
          .min(8, 'Password must be at least 8 characters'),
      })
    ),
    async (c) => {
      const { currentPassword, newPassword } = c.req.valid('json');

      const data = await auth.api.changePassword({
        body: {
          newPassword,
          currentPassword,
          revokeOtherSessions: true,
        },
        headers: await headers(),
      });

      if (!data) {
        return c.json({ error: 'Failed to change password' }, 400);
      }

      return c.json({ success: true });
    }
  )
  .delete('/account', async (c) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await db.user.delete({
      where: { id: session.user.id },
    });

    await auth.api.signOut({
      headers: await headers(),
    });

    return c.json({ success: true });
  });

export { userRouter };
