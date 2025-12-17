import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

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

export const habitsRouter = new Hono()
  .use(authMiddleware)
  .get(
    '/',
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

      const habits = await db.habit.findMany({
        where: {
          userId: user.id,
          archived: false,
        },
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
        orderBy: { createdAt: 'desc' },
      });

      return c.json({ habits });
    }
  )
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

    if (existing) {
      await db.habitCompletion.delete({
        where: { id: existing.id },
      });
      return c.json({ completed: false });
    }

    const completion = await db.habitCompletion.create({
      data: {
        habitId: id,
        userId: user.id,
        date: dateKey,
      },
    });

    return c.json({ completed: true, completion });
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

    if (existing) {
      await db.habitCompletion.delete({
        where: { id: existing.id },
      });
      return c.json({ completed: false });
    }

    const completion = await db.habitCompletion.create({
      data: {
        habitId: id,
        userId: user.id,
        date: dateKey,
      },
    });

    return c.json({ completed: true, completion });
  })
  .get('/stats', async (c) => {
    const user = c.get('user');

    const totalHabits = await db.habit.count({
      where: {
        userId: user.id,
        archived: false,
      },
    });

    const today = new Date();
    const todayKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const completedToday = await db.habitCompletion.count({
      where: {
        userId: user.id,
        date: todayKey,
        habit: { archived: false },
      },
    });

    const habits = await db.habit.findMany({
      where: {
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

    let longestStreak = 0;
    for (const habit of habits) {
      const streak = calculateCurrentStreak(habit.completions);
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    }

    const completionRate =
      totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return c.json({
      stats: {
        totalHabits,
        completedToday,
        longestStreak,
        completionRate,
      },
    });
  });

function calculateCurrentStreak(completions: { date: Date }[]): number {
  if (completions.length === 0) return 0;

  const today = new Date();
  const todayKey = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  let streak = 0;
  const checkDate = new Date(todayKey);

  for (const completion of completions) {
    const compDate = new Date(completion.date);
    const compKey = new Date(
      Date.UTC(
        compDate.getUTCFullYear(),
        compDate.getUTCMonth(),
        compDate.getUTCDate()
      )
    );

    if (compKey.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else if (compKey.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}
