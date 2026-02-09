import { formatChartDateLabel } from '@/utils/chart';
import {
  addUTCDays,
  getUTCMidnight,
  getUTCStartOfDaysAgo,
} from '@/utils/date-utc';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { getHabitStats, getHabitsWithStreaks } from '../services/habit-stats';
import {
  calculateStreakFromDates,
  getActivityDates,
} from '../services/streak-utils';

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
      deletedAt: null;
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
      deletedAt: null,
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

    const shouldSortByStreak =
      sortBy === 'currentStreak' || sortBy === 'bestStreak';

    const orderBy: Record<string, 'asc' | 'desc'>[] = shouldSortByStreak
      ? [{ createdAt: 'desc' }, { id: 'desc' }]
      : [{ [sortBy]: sortOrder }, { id: sortOrder }];

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
        take: shouldSortByStreak ? undefined : limit,
        skip: shouldSortByStreak ? undefined : offset,
      }),
      db.habit.count({ where }),
    ]);

    const habitIds = habits.map((h) => h.id);
    const allCompletions = await db.habitCompletion.findMany({
      where: { habitId: { in: habitIds } },
      select: { habitId: true, date: true },
      orderBy: { date: 'desc' },
    });

    const completionsByHabit = new Map<string, { date: Date }[]>();
    for (const completion of allCompletions) {
      const existing = completionsByHabit.get(completion.habitId) || [];
      existing.push({ date: completion.date });
      completionsByHabit.set(completion.habitId, existing);
    }

    const habitsWithStreaks = habits.map((habit) => {
      const habitCompletions = completionsByHabit.get(habit.id) || [];
      const dates = getActivityDates(habitCompletions);
      const { currentStreak, bestStreak } = calculateStreakFromDates(dates);
      return {
        ...habit,
        currentStreak,
        bestStreak,
        completed: habit.completions.some(
          (c) => c.date.getTime() === todayKey.getTime()
        ),
      };
    });

    let sortedHabits = habitsWithStreaks;
    if (shouldSortByStreak) {
      const streakField = sortBy as 'currentStreak' | 'bestStreak';
      sortedHabits = habitsWithStreaks.sort((a, b) =>
        sortOrder === 'desc'
          ? b[streakField] - a[streakField]
          : a[streakField] - b[streakField]
      );
      sortedHabits = sortedHabits.slice(offset, offset + limit);
    }

    const hasMore = offset + limit < totalCount;
    const nextOffset = hasMore ? offset + limit : null;

    return c.json({ habits: sortedHabits, nextOffset });
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
        deletedAt: null,
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
        deletedAt: null,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    await db.habit.update({
      where: { id },
      data: { deletedAt: new Date() },
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
        deletedAt: null,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const today = new Date();
    const dateKey = getUTCMidnight(today);

    const existing = await db.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dateKey,
        },
      },
    });

    if (existing) {
      await db.habitCompletion.delete({
        where: { id: existing.id },
      });
      return c.json({ completed: false, completion: null });
    }

    const completion = await db.habitCompletion.create({
      data: {
        habitId: id,
        userId: user.id,
        date: dateKey,
      },
    });

    return c.json({ completed: true, completion: { date: dateKey } });
  })
  .post('/:id/toggle-date', zValidator('json', toggleDateSchema), async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const { date: dateString } = c.req.valid('json');

    const habit = await db.habit.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!habit) {
      return c.json({ error: 'Habit not found' }, 404);
    }

    const inputDate = new Date(dateString);
    const dateKey = getUTCMidnight(inputDate);

    const existing = await db.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId: id,
          date: dateKey,
        },
      },
    });

    if (existing) {
      await db.habitCompletion.delete({
        where: { id: existing.id },
      });
      return c.json({ completed: false, completion: null });
    }

    const completion = await db.habitCompletion.create({
      data: {
        habitId: id,
        userId: user.id,
        date: dateKey,
      },
    });

    return c.json({ completed: true, completion: { date: dateKey } });
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

      const now = new Date();

      const chartData = await Promise.all(
        Array.from({ length: days }, async (_, i) => {
          const daysAgo = days - 1 - i;
          const date = getUTCStartOfDaysAgo(daysAgo);
          const nextDate = addUTCDays(date, 1);

          const [totalHabits, completedCount] = await Promise.all([
            db.habit.count({
              where: {
                userId: user.id,
                deletedAt: null,
                createdAt: { lt: nextDate },
              },
            }),
            db.habitCompletion.count({
              where: {
                userId: user.id,
                date: { gte: date, lt: nextDate },
              },
            }),
          ]);

          return {
            date: formatChartDateLabel(date, days),
            completionRate:
              totalHabits > 0
                ? Math.round((completedCount / totalHabits) * 100)
                : 0,
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

    const [stats, totalHabits, completedToday, habitsWithStreaks] =
      await Promise.all([
        getHabitStats(user.id),
        db.habit.count({ where: { userId: user.id, deletedAt: null } }),
        db.habitCompletion.count({
          where: {
            userId: user.id,
            date: todayKey,
          },
        }),
        getHabitsWithStreaks(user.id),
      ]);

    const activeStreakCount = habitsWithStreaks.filter(
      (h) => h.currentStreak > 0
    ).length;
    const longestCurrentStreak = Math.max(
      ...habitsWithStreaks.map((h) => h.currentStreak),
      0
    );

    return c.json({
      stats: {
        totalHabits,
        completedToday,
        activeStreakCount,
        longestCurrentStreak,
        bestStreak: stats.bestStreak,
        longestStreak: stats.bestStreak,
      },
    });
  });

export type AppType = typeof habitsRouter;
