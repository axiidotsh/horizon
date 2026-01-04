import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '../auth';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

function calculateDateCutoff(dateRange: string): Date | null {
  if (dateRange === 'all') {
    return null;
  }

  const now = new Date();
  const cutoffDate = new Date(now);

  switch (dateRange) {
    case '1d':
      cutoffDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '14d':
      cutoffDate.setDate(now.getDate() - 14);
      break;
    case '1m':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case '3m':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case '9m':
      cutoffDate.setMonth(now.getMonth() - 9);
      break;
    case '1y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }

  return cutoffDate;
}

export const userRouter = new Hono()
  .use(authMiddleware)
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
  .post(
    '/clear-data',
    authMiddleware,
    zValidator(
      'json',
      z.object({
        focusSessions: z.boolean(),
        tasks: z.boolean(),
        habits: z.boolean(),
        chats: z.boolean(),
        dateRange: z.string(),
      })
    ),
    async (c) => {
      const user = c.get('user');

      const { focusSessions, tasks, habits, chats, dateRange } =
        c.req.valid('json');
      const cutoffDate = calculateDateCutoff(dateRange);

      const userId = user.id;

      const deletePromises: Promise<unknown>[] = [];

      if (focusSessions) {
        const whereClause = cutoffDate
          ? { userId, createdAt: { gte: cutoffDate } }
          : { userId };

        deletePromises.push(
          db.focusSession.deleteMany({
            where: whereClause,
          })
        );
      }

      if (tasks) {
        const whereClause = cutoffDate
          ? { userId, createdAt: { gte: cutoffDate } }
          : { userId };

        deletePromises.push(
          db.task.deleteMany({
            where: whereClause,
          })
        );
      }

      if (habits) {
        const whereClause = cutoffDate
          ? { userId, createdAt: { gte: cutoffDate } }
          : { userId };

        const habitsToDelete = await db.habit.findMany({
          where: whereClause,
          select: { id: true },
        });

        if (habitsToDelete.length > 0) {
          const habitIds = habitsToDelete.map((h) => h.id);

          deletePromises.push(
            db.habitCompletion.deleteMany({
              where: { habitId: { in: habitIds } },
            }),
            db.habit.deleteMany({
              where: { id: { in: habitIds } },
            })
          );
        }
      }

      await Promise.all(deletePromises);

      return c.json({ success: true });
    }
  )
  .delete('/account', async (c) => {
    const user = c.get('user');

    await db.user.delete({
      where: { id: user.id },
    });
    await auth.api.signOut({
      headers: await headers(),
    });

    return c.json({ success: true });
  });

export type AppType = typeof userRouter;
