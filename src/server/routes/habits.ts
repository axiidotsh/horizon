import {
  calculateBestStreak,
  calculateCurrentStreak,
} from '@/app/(protected)/(main)/habits/utils/habit-calculations';
import { addUTCDays, getUTCStartOfDaysAgo } from '@/utils/date-utc';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { updateStats } from '../services/dashboard-stats';

const createHabitSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

const updateHabitSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

const toggleDateSchema = z.object({
  date: z.string().datetime(),
});

const getHabitsQuerySchema = z.object({
  days: z.coerce.number().min(1).max(365).default(7),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z
    .enum(['title', 'createdAt', 'currentStreak', 'bestStreak'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['all', 'completed', 'pending']).default('all'),
});

export const habitsRouter = new Hono()
  .use(authMiddleware)
  .get('/', zValidator('query', getHabitsQuerySchema), async (c) => {
    const user = c.get('user');
    const { days, limit, offset, search, sortBy, sortOrder, status } =
      c.req.valid('query');

    const now = new Date();
    const todayKey = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const cutoffDate = getUTCStartOfDaysAgo(days);

    const where: {
      userId: string;
      archived: boolean;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        category?: { contains: string; mode: 'insensitive' };
      }>;
      completions?: {
        some?: { date: Date };
        none?: { date: Date };
      };
    } = {
      userId: user.id,
      archived: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'completed') {
      where.completions = { some: { date: todayKey } };
    } else if (status === 'pending') {
      where.completions = { none: { date: todayKey } };
    }

    const orderBy: Record<string, 'asc' | 'desc'>[] = [
      { [sortBy]: sortOrder },
      { id: sortOrder },
    ];

    const [habits, totalCount] = await Promise.all([
      db.habit.findMany({
        where,
        include: {
          completions: {
            where: {
              date: { gte: cutoffDate },
            },
            select: {
              date: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.habit.count({ where }),
    ]);

    const habitsWithStatus = habits.map((habit) => ({
      ...habit,
      completed: habit.completions.some(
        (c) => c.date.getTime() === todayKey.getTime()
      ),
    }));

    const hasMore = offset + limit < totalCount;
    const nextOffset = hasMore ? offset + limit : null;

    return c.json({ habits: habitsWithStatus, nextOffset });
  })
  .post('/', zValidator('json', createHabitSchema), async (c) => {
    const user = c.get('user');
    const { title, description, category } = c.req.valid('json');

    const habit = await db.habit.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        category: category || null,
      },
    });

    return c.json({ habit }, 201);
  })
  .patch('/:id', zValidator('json', updateHabitSchema), async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const { title, description, category } = c.req.valid('json');

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const updated = await db.habit.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(category !== undefined && { category: category || null }),
      },
    });

    return c.json({ habit: updated });
  })
  .delete('/:id', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    await db.habit.update({
      where: { id },
      data: { archived: true },
    });

    return c.json({ success: true });
  })
  .post('/:id/toggle', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
        archived: false,
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          select: { date: true },
        },
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const today = new Date();
    const dateKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const existing = await db.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dateKey,
        },
      },
    });

    const result = await db.$transaction(async (tx) => {
      let updatedCompletions = habit.completions;

      if (existing) {
        await tx.habitCompletion.delete({
          where: { id: existing.id },
        });
        updatedCompletions = habit.completions.filter(
          (c) => c.date.getTime() !== dateKey.getTime()
        );
      } else {
        await tx.habitCompletion.create({
          data: {
            habitId: id,
            userId: user.id,
            date: dateKey,
          },
        });
        updatedCompletions = [{ date: dateKey }, ...habit.completions];
      }

      const newCurrentStreak = calculateCurrentStreak(updatedCompletions);
      const newBestStreak = calculateBestStreak(updatedCompletions);

      await tx.habit.update({
        where: { id },
        data: {
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
        },
      });

      const allUserCompletions = await tx.habitCompletion.findMany({
        where: { userId: user.id },
        select: { date: true },
        orderBy: { date: 'desc' },
      });

      const uniqueDates = [
        ...new Set(allUserCompletions.map((c) => c.date.getTime())),
      ]
        .map((t) => new Date(t))
        .sort((a, b) => b.getTime() - a.getTime());

      const userLongestStreak = calculateBestStreak(
        uniqueDates.map((date) => ({ date }))
      );

      await tx.habitStats.upsert({
        where: { userId: user.id },
        update: { longestStreak: userLongestStreak },
        create: {
          userId: user.id,
          longestStreak: userLongestStreak,
          totalHabits: 0,
        },
      });

      await updateStats(user.id, dateKey, existing !== null, tx);

      return {
        completed: !existing,
        completion: existing ? null : { date: dateKey },
      };
    });

    return c.json(result);
  })
  .post('/:id/toggle-date', zValidator('json', toggleDateSchema), async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const { date: dateString } = c.req.valid('json');

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
        archived: false,
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          select: { date: true },
        },
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const inputDate = new Date(dateString);
    const dateKey = new Date(
      Date.UTC(
        inputDate.getUTCFullYear(),
        inputDate.getUTCMonth(),
        inputDate.getUTCDate()
      )
    );

    const existing = await db.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dateKey,
        },
      },
    });

    const result = await db.$transaction(async (tx) => {
      let updatedCompletions = habit.completions;

      if (existing) {
        await tx.habitCompletion.delete({
          where: { id: existing.id },
        });
        updatedCompletions = habit.completions.filter(
          (c) => c.date.getTime() !== dateKey.getTime()
        );
      } else {
        await tx.habitCompletion.create({
          data: {
            habitId: id,
            userId: user.id,
            date: dateKey,
          },
        });
        updatedCompletions = [{ date: dateKey }, ...habit.completions];
      }

      const newCurrentStreak = calculateCurrentStreak(updatedCompletions);
      const newBestStreak = calculateBestStreak(updatedCompletions);

      await tx.habit.update({
        where: { id },
        data: {
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
        },
      });

      const allUserCompletions = await tx.habitCompletion.findMany({
        where: { userId: user.id },
        select: { date: true },
        orderBy: { date: 'desc' },
      });

      const uniqueDates = [
        ...new Set(allUserCompletions.map((c) => c.date.getTime())),
      ]
        .map((t) => new Date(t))
        .sort((a, b) => b.getTime() - a.getTime());

      const userLongestStreak = calculateBestStreak(
        uniqueDates.map((date) => ({ date }))
      );

      await tx.habitStats.upsert({
        where: { userId: user.id },
        update: { longestStreak: userLongestStreak },
        create: {
          userId: user.id,
          longestStreak: userLongestStreak,
          totalHabits: 0,
        },
      });

      await updateStats(user.id, dateKey, existing !== null, tx);

      return {
        completed: !existing,
        completion: existing ? null : { date: dateKey },
      };
    });

    return c.json(result);
  })
  .get(
    '/chart',
    zValidator(
      'query',
      z.object({
        days: z.coerce.number().min(1).max(365).default(7),
      })
    ),
    async (c) => {
      const user = c.get('user');
      const { days } = c.req.valid('query');

      const endDate = new Date();

      const chartData = await Promise.all(
        Array.from({ length: days }, async (_, index) => {
          const i = days - 1 - index;
          const dateKey = addUTCDays(endDate, -i);

          const [totalHabits, completedCount] = await Promise.all([
            db.habit.count({
              where: {
                userId: user.id,
                archived: false,
                createdAt: { lte: dateKey },
              },
            }),
            db.habitCompletion.count({
              where: {
                userId: user.id,
                date: dateKey,
              },
            }),
          ]);

          const completionRate =
            totalHabits > 0
              ? Math.round((completedCount / totalHabits) * 100)
              : 0;

          const dateLabel =
            days <= 7
              ? dateKey.toLocaleDateString('en-US', { weekday: 'short' })
              : `${dateKey.getUTCMonth() + 1}/${dateKey.getUTCDate()}`;

          return {
            date: dateLabel,
            completionRate,
          };
        })
      );

      return c.json({ chartData });
    }
  )
  .get('/stats', async (c) => {
    const user = c.get('user');

    const today = new Date();
    const todayKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const habits = await db.habit.findMany({
      where: {
        userId: user.id,
        archived: false,
      },
      select: {
        currentStreak: true,
        bestStreak: true,
        completions: {
          where: { date: todayKey },
          select: { date: true },
        },
      },
    });

    const habitStats = await db.habitStats.findUnique({
      where: { userId: user.id },
      select: { longestStreak: true },
    });

    const totalHabits = habits.length;
    const completedToday = habits.filter(
      (h) => h.completions.length > 0
    ).length;
    const activeStreakCount = habits.filter((h) => h.currentStreak > 0).length;
    const longestCurrentStreak = Math.max(
      ...habits.map((h) => h.currentStreak),
      0
    );
    const bestStreak = Math.max(...habits.map((h) => h.bestStreak), 0);

    return c.json({
      stats: {
        totalHabits,
        completedToday,
        activeStreakCount,
        longestCurrentStreak,
        bestStreak,
        longestStreak: habitStats?.longestStreak ?? 0,
      },
    });
  });

export type AppType = typeof habitsRouter;
