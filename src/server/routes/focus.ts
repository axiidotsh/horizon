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
  .get('/sessions', async (c) => {
    const user = c.get('user');

    const sessions = await db.focusSession.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      orderBy: { startedAt: 'desc' },
    });

    return c.json({ sessions });
  })
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
        await recalculateStats(user.id);
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

    await db.focusSession.delete({
      where: { id },
    });

    if (wasCompleted) {
      await recalculateStats(user.id);
    }

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

    const pausedDuration = Math.floor(
      (Date.now() - focusSession.pausedAt.getTime()) / 1000
    );

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

    const updated = await db.focusSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        pausedAt: null,
        totalPausedSeconds:
          focusSession.totalPausedSeconds + additionalPausedSeconds,
      },
    });

    await recalculateStats(user.id);

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
    const actualMinutes = Math.max(1, Math.ceil(elapsedMs / 60000));

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

    await recalculateStats(user.id);

    return c.json({ session: updated });
  });
