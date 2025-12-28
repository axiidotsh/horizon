import { getUTCMidnight } from '@/utils/date-utc';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { calculateLevel, getHeatmapData } from '../services/heatmap';
import { calculateOverallStreak } from '../services/overall-streak';

const heatmapQuerySchema = z.object({
  weeks: z.coerce.number().min(1).max(52).default(52),
});

function formatTimeDiff(minutes: number): string {
  if (minutes === 0) return 'Same as yesterday';
  const sign = minutes > 0 ? '+' : '';
  const absMinutes = Math.abs(minutes);

  if (absMinutes >= 60) {
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    if (mins === 0) {
      return `${sign}${hours}h from yesterday`;
    }
    return `${sign}${hours}h ${mins}m from yesterday`;
  }

  return `${sign}${absMinutes}m from yesterday`;
}

function getTaskComparisonLabel(
  completedToday: number,
  totalToday: number,
  overdue: number
): string {
  if (overdue > 0) {
    return `${overdue} overdue`;
  }

  if (totalToday === 0) {
    return 'No tasks for today';
  }

  const completionPercentage = (completedToday / totalToday) * 100;

  const now = new Date();
  const startOfDayUTC = getUTCMidnight(now);
  const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);

  const totalDayMs = endOfDayUTC.getTime() - startOfDayUTC.getTime();
  const elapsedMs = now.getTime() - startOfDayUTC.getTime();
  const dayProgressPercentage = (elapsedMs / totalDayMs) * 100;

  if (completionPercentage >= dayProgressPercentage + 20) {
    return 'Ahead of schedule';
  } else if (completionPercentage >= dayProgressPercentage - 10) {
    return 'On track';
  } else {
    return 'Behind schedule';
  }
}

function getHabitComparisonLabel(weeklyAverage: number): string {
  return `${weeklyAverage}% weekly average`;
}

function getStreakComparisonLabel(
  currentStreak: number,
  bestStreak: number
): string {
  if (currentStreak === 0) {
    return 'Start your streak today!';
  }

  if (currentStreak >= bestStreak && currentStreak > 0) {
    return 'New personal record!';
  }

  const daysUntilRecord = bestStreak - currentStreak;
  if (daysUntilRecord === 1) {
    return '1 day to beat your record';
  } else if (daysUntilRecord > 0) {
    return `${daysUntilRecord} days to beat your record`;
  }

  return 'Keep it up!';
}

export const dashboardRouter = new Hono()
  .use(authMiddleware)
  .get('/metrics', async (c) => {
    const user = c.get('user');

    const today = new Date();
    const todayKey = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    const yesterday = new Date(todayKey.getTime() - 24 * 60 * 60 * 1000);

    const tomorrowKey = new Date(todayKey.getTime() + 24 * 60 * 60 * 1000);

    const [
      focusToday,
      focusYesterday,
      activeSession,
      tasksCompletedToday,
      tasksDueToday,
      overdueTasks,
      totalActiveHabits,
      habitsCompletedToday,
      last7DaysHabitCompletions,
      overallStreak,
    ] = await Promise.all([
      db.focusSession.aggregate({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          startedAt: { gte: todayKey, lt: tomorrowKey },
        },
        _sum: { durationMinutes: true },
      }),
      db.focusSession.aggregate({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          startedAt: { gte: yesterday, lt: todayKey },
        },
        _sum: { durationMinutes: true },
      }),
      db.focusSession.findFirst({
        where: {
          userId: user.id,
          status: { in: ['ACTIVE', 'PAUSED'] },
        },
        orderBy: { startedAt: 'desc' },
      }),
      db.task.count({
        where: {
          userId: user.id,
          completed: true,
          dueDate: {
            gte: todayKey,
            lt: tomorrowKey,
          },
        },
      }),
      db.task.count({
        where: {
          userId: user.id,
          dueDate: {
            gte: todayKey,
            lt: tomorrowKey,
          },
        },
      }),
      db.task.count({
        where: {
          userId: user.id,
          completed: false,
          dueDate: { lt: todayKey },
        },
      }),
      db.habit.count({
        where: {
          userId: user.id,
          archived: false,
        },
      }),
      db.habitCompletion.count({
        where: {
          userId: user.id,
          date: todayKey,
        },
      }),
      db.habitCompletion.count({
        where: {
          userId: user.id,
          date: { gte: new Date(todayKey.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      calculateOverallStreak(user.id, db),
    ]);

    const todayMinutes = focusToday._sum.durationMinutes || 0;
    const yesterdayMinutes = focusYesterday._sum.durationMinutes || 0;
    const timeDiff = todayMinutes - yesterdayMinutes;

    const tasksPercentComplete =
      tasksDueToday > 0
        ? Math.round((tasksCompletedToday / tasksDueToday) * 100)
        : 0;

    const habitsPercentComplete =
      totalActiveHabits > 0
        ? Math.round((habitsCompletedToday / totalActiveHabits) * 100)
        : 0;

    const weeklyAverage =
      totalActiveHabits > 0
        ? Math.round(
            (last7DaysHabitCompletions / (totalActiveHabits * 7)) * 100
          )
        : 0;

    const daysUntilRecord = Math.max(
      0,
      overallStreak.bestStreak - overallStreak.currentStreak
    );

    return c.json({
      metrics: {
        focus: {
          todayMinutes,
          yesterdayMinutes,
          timeDiff,
          timeDiffLabel: formatTimeDiff(timeDiff),
          activeSession,
        },
        tasks: {
          completedToday: tasksCompletedToday,
          totalToday: tasksDueToday,
          percentComplete: tasksPercentComplete,
          comparisonLabel: getTaskComparisonLabel(
            tasksCompletedToday,
            tasksDueToday,
            overdueTasks
          ),
          overdue: overdueTasks,
        },
        habits: {
          completedToday: habitsCompletedToday,
          totalActive: totalActiveHabits,
          percentComplete: habitsPercentComplete,
          weeklyAverage,
          comparisonLabel: getHabitComparisonLabel(weeklyAverage),
        },
        streak: {
          currentStreak: overallStreak.currentStreak,
          bestStreak: overallStreak.bestStreak,
          daysUntilRecord,
          comparisonLabel: getStreakComparisonLabel(
            overallStreak.currentStreak,
            overallStreak.bestStreak
          ),
        },
      },
    });
  })
  .get('/heatmap', zValidator('query', heatmapQuerySchema), async (c) => {
    const user = c.get('user');
    const { weeks } = c.req.valid('query');

    const rawData = await getHeatmapData(user.id, weeks, db);

    const heatmap = rawData.map((day) => ({
      ...day,
      level: calculateLevel(day),
      totalActivity:
        day.focusMinutes + day.tasksCompleted + day.habitsCompleted,
    }));

    return c.json({ heatmap });
  });
