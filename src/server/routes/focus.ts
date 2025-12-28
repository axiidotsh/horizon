import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { getStatsWithDaysAgo, recalculateStats } from '../services/focus-stats';

export const focusRouter = new Hono()
  .use(authMiddleware)
  .get('/sessions/active', async (c) => {
    const user = c.get('user');

    const activeSession = await db.focusSession.findFirst({
      where: {
        userId: user.id,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      orderBy: { startedAt: 'desc' },
    });

    return c.json({ session: activeSession });
  })
  .get(
    '/sessions',
    zValidator(
      'query',
      z.object({
        limit: z.coerce.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        days: z.coerce.number().min(1).max(365).optional(),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const { limit, cursor, days } = c.req.valid('query');

      const whereClause = {
        userId: user.id,
        status: 'COMPLETED' as const,
        startedAt: undefined as { lt?: Date; gte?: Date } | undefined,
      };

      if (days) {
        const now = new Date();
        const cutoffDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - days,
            0,
            0,
            0,
            0
          )
        );
        whereClause.startedAt = { gte: cutoffDate };
      } else if (cursor) {
        whereClause.startedAt = { lt: new Date(cursor) };
      }

      const sessions = await db.focusSession.findMany({
        where: whereClause,
        orderBy: { startedAt: 'desc' },
        ...(days ? {} : { take: limit + 1 }),
      });

      if (days) {
        return c.json({ sessions, nextCursor: null });
      }

      const hasMore = sessions.length > limit;
      const items = hasMore ? sessions.slice(0, limit) : sessions;
      const nextCursor = hasMore
        ? items[items.length - 1].startedAt.toISOString()
        : null;

      return c.json({ sessions: items, nextCursor });
    }
  )
  .get('/stats', async (c) => {
    const user = c.get('user');
    const stats = await getStatsWithDaysAgo(user.id);
    return c.json({ stats });
  })
  .post(
    '/sessions',
    zValidator(
      'json',
      z.object({
        durationMinutes: z.number().min(1).max(480),
        task: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get('user');

      const existingActive = await db.focusSession.findFirst({
        where: {
          userId: user.id,
          status: {
            in: ['ACTIVE', 'PAUSED'],
          },
        },
      });

      if (existingActive) {
        return c.json(
          { error: 'You already have an active focus session' },
          409
        );
      }

      const { durationMinutes, task } = c.req.valid('json');

      const focusSession = await db.focusSession.create({
        data: {
          userId: user.id,
          durationMinutes,
          task: task || null,
          status: 'ACTIVE',
        },
      });

      return c.json({ session: focusSession }, 201);
    }
  )
  .patch(
    '/sessions/:id',
    zValidator(
      'json',
      z.object({
        task: z.string().optional(),
        durationMinutes: z.number().min(1).max(480).optional(),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const { id } = c.req.param();
      const { task, durationMinutes } = c.req.valid('json');

      const focusSession = await db.focusSession.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!focusSession) {
        return c.json({ error: 'Session not found' }, 404);
      }

      const updated = await db.focusSession.update({
        where: { id },
        data: {
          ...(task !== undefined && { task: task || null }),
          ...(durationMinutes !== undefined && { durationMinutes }),
        },
      });

      if (
        focusSession.status === 'COMPLETED' &&
        durationMinutes !== undefined
      ) {
        await db.$transaction(async (tx) => {
          await recalculateStats(user.id, tx);
        });
      }

      return c.json({ session: updated });
    }
  )
  .delete('/sessions/:id', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const focusSession = await db.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!focusSession) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const wasCompleted = focusSession.status === 'COMPLETED';

    await db.$transaction(async (tx) => {
      await tx.focusSession.delete({
        where: { id },
      });

      if (wasCompleted) {
        await recalculateStats(user.id, tx);
      }
    });

    return c.json({ success: true });
  })
  .patch('/sessions/:id/pause', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const focusSession = await db.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!focusSession) {
      return c.json({ error: 'Active session not found' }, 404);
    }

    if (focusSession.startedAt > new Date()) {
      return c.json({ error: 'Invalid session start time' }, 400);
    }

    const updated = await db.focusSession.update({
      where: { id },
      data: {
        status: 'PAUSED',
        pausedAt: new Date(),
      },
    });

    return c.json({ session: updated });
  })
  .patch('/sessions/:id/resume', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const focusSession = await db.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
        status: 'PAUSED',
      },
    });

    if (!focusSession || !focusSession.pausedAt) {
      return c.json({ error: 'Paused session not found' }, 404);
    }

    if (focusSession.pausedAt > new Date()) {
      return c.json({ error: 'Invalid pause time' }, 400);
    }

    const pausedDuration = Math.floor(
      (Date.now() - focusSession.pausedAt.getTime()) / 1000
    );

    if (pausedDuration < 0) {
      return c.json({ error: 'Invalid pause duration' }, 400);
    }

    const updated = await db.focusSession.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        pausedAt: null,
        totalPausedSeconds: focusSession.totalPausedSeconds + pausedDuration,
      },
    });

    return c.json({ session: updated });
  })
  .patch('/sessions/:id/complete', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const focusSession = await db.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    });

    if (!focusSession) {
      return c.json({ error: 'Session not found' }, 404);
    }

    let additionalPausedSeconds = 0;
    if (focusSession.status === 'PAUSED' && focusSession.pausedAt) {
      additionalPausedSeconds = Math.floor(
        (Date.now() - focusSession.pausedAt.getTime()) / 1000
      );
    }

    const totalPausedSeconds =
      focusSession.totalPausedSeconds + additionalPausedSeconds;

    const updated = await db.$transaction(async (tx) => {
      const session = await tx.focusSession.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          pausedAt: null,
          totalPausedSeconds,
        },
      });

      await recalculateStats(user.id, tx);

      return session;
    });

    return c.json({ session: updated });
  })
  .patch('/sessions/:id/cancel', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const focusSession = await db.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    });

    if (!focusSession) {
      return c.json({ error: 'Session not found' }, 404);
    }

    await db.focusSession.delete({
      where: { id },
    });

    return c.json({ success: true });
  })
  .patch('/sessions/:id/end-early', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const focusSession = await db.focusSession.findFirst({
      where: {
        id,
        userId: user.id,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    });

    if (!focusSession) {
      return c.json({ error: 'Session not found' }, 404);
    }

    let additionalPausedSeconds = 0;
    if (focusSession.status === 'PAUSED' && focusSession.pausedAt) {
      additionalPausedSeconds = Math.floor(
        (Date.now() - focusSession.pausedAt.getTime()) / 1000
      );
    }

    const totalPausedSeconds =
      focusSession.totalPausedSeconds + additionalPausedSeconds;
    const elapsedMs =
      Date.now() - focusSession.startedAt.getTime() - totalPausedSeconds * 1000;
    const actualMinutes = Math.max(1, Math.round(elapsedMs / 60000));

    const updated = await db.$transaction(async (tx) => {
      const session = await tx.focusSession.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          pausedAt: null,
          totalPausedSeconds,
          durationMinutes: actualMinutes,
        },
      });

      await recalculateStats(user.id, tx);

      return session;
    });

    return c.json({ session: updated });
  });

export type AppType = typeof focusRouter;
