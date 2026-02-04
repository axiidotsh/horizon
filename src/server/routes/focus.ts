import { addUTCDays, getUTCStartOfDaysAgo } from '@/utils/date-utc';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { getFocusStats } from '../services/focus-stats';

const chartQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(7),
});

const sessionsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  days: z.coerce.number().min(1).max(365).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'duration', 'date']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createSessionSchema = z.object({
  durationMinutes: z.number().min(1).max(480),
  task: z.string().optional(),
});

const updateSessionSchema = z.object({
  task: z.string().optional(),
  durationMinutes: z.number().min(1).max(480).optional(),
});

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
  .get('/sessions', zValidator('query', sessionsQuerySchema), async (c) => {
    const user = c.get('user');
    const { limit, offset, days, search, sortBy, sortOrder } =
      c.req.valid('query');

    const whereClause: {
      userId: string;
      status: 'COMPLETED';
      startedAt?: { gte?: Date };
      task?: { contains: string; mode: 'insensitive' };
    } = {
      userId: user.id,
      status: 'COMPLETED',
    };

    if (days) {
      whereClause.startedAt = { gte: getUTCStartOfDaysAgo(days) };
    }

    if (search) {
      whereClause.task = { contains: search, mode: 'insensitive' };
    }

    const orderByClause = (() => {
      switch (sortBy) {
        case 'name':
          return { task: sortOrder };
        case 'duration':
          return { durationMinutes: sortOrder };
        case 'date':
        default:
          return { startedAt: sortOrder };
      }
    })();

    const sessions = await db.focusSession.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip: offset,
      take: limit + 1,
    });

    const hasMore = sessions.length > limit;
    const items = hasMore ? sessions.slice(0, limit) : sessions;
    const nextOffset = hasMore ? offset + limit : null;

    return c.json({ sessions: items, nextOffset });
  })
  .get('/stats', async (c) => {
    const user = c.get('user');
    const stats = await getFocusStats(user.id);
    return c.json({
      stats: {
        totalMinutesToday: stats.totalMinutesToday,
        allTimeBestMinutes: stats.allTimeBestMinutes,
        currentStreak: stats.currentStreak,
        totalSessions: stats.totalSessions,
      },
    });
  })
  .get('/chart', zValidator('query', chartQuerySchema), async (c) => {
    const user = c.get('user');
    const { days } = c.req.valid('query');

    const now = new Date();
    const startDate = addUTCDays(now, -(days - 1));

    const sessions = await db.focusSession.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        startedAt: { gte: startDate },
      },
      select: {
        startedAt: true,
        durationMinutes: true,
      },
    });

    const dataMap = new Map<string, { totalMinutes: number; count: number }>();

    sessions.forEach((session) => {
      const dateKey = session.startedAt.toISOString().split('T')[0];
      const existing = dataMap.get(dateKey) || { totalMinutes: 0, count: 0 };
      dataMap.set(dateKey, {
        totalMinutes: existing.totalMinutes + session.durationMinutes,
        count: existing.count + 1,
      });
    });

    const chartData = Array.from({ length: days }, (_, i) => {
      const date = addUTCDays(now, -(days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      const data = dataMap.get(dateKey) || { totalMinutes: 0, count: 0 };

      const dateLabel =
        days <= 7
          ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
          : `${date.getMonth() + 1}/${date.getDate()}`;

      return {
        date: dateLabel,
        totalMinutes: data.totalMinutes,
        sessionCount: data.count,
      };
    });

    return c.json({ chartData });
  })
  .post('/sessions', zValidator('json', createSessionSchema), async (c) => {
    const user = c.get('user');
    const { durationMinutes, task } = c.req.valid('json');

    try {
      const focusSession = await db.$transaction(async (tx) => {
        const existingActive = await tx.focusSession.findFirst({
          where: {
            userId: user.id,
            status: {
              in: ['ACTIVE', 'PAUSED'],
            },
          },
        });

        if (existingActive) {
          throw new Error('ACTIVE_SESSION_EXISTS');
        }

        return tx.focusSession.create({
          data: {
            userId: user.id,
            durationMinutes,
            task: task || null,
            status: 'ACTIVE',
          },
        });
      });

      return c.json({ session: focusSession }, 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'ACTIVE_SESSION_EXISTS') {
        return c.json(
          { error: 'You already have an active focus session' },
          409
        );
      }
      throw error;
    }
  })
  .patch(
    '/sessions/:id',
    zValidator('json', updateSessionSchema),
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

    await db.focusSession.delete({
      where: { id },
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

    const updated = await db.focusSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        pausedAt: null,
        totalPausedSeconds,
      },
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

    const updated = await db.focusSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        pausedAt: null,
        totalPausedSeconds,
        durationMinutes: actualMinutes,
      },
    });

    return c.json({ session: updated });
  });

export type AppType = typeof focusRouter;
