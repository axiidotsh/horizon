import {
  formatTimeDiff,
  getHabitComparisonLabel,
  getStreakComparisonLabel,
  getTaskComparisonLabel,
} from '@/app/(protected)/(main)/dashboard/utils/dashboard-calculations';
import { addUTCDays, getUTCMidnight } from '@/utils/date-utc';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { DASHBOARD_TASK_LIMIT } from '../constants';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { getHeatmapData } from '../services/heatmap';
import { getOverallStats } from '../services/overall-stats';
import {
  calculateStreakFromDates,
  getActivityDates,
} from '../services/streak-utils';

const heatmapQuerySchema = z.object({
  weeks: z.coerce.number().min(1).max(52).default(52),
});

export const dashboardRouter = new Hono()
  .use(authMiddleware)
  .get('/tasks', async (c) => {
    const user = c.get('user');
    const today = getUTCMidnight(new Date());
    const tomorrow = addUTCDays(today, 1);

    const tasks = await db.task.findMany({
      where: {
        userId: user.id,
        dueDate: {
          not: null,
          lt: tomorrow,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: DASHBOARD_TASK_LIMIT,
    });

    return c.json({ tasks });
  })
  .get('/habits', async (c) => {
    const user = c.get('user');

    const now = new Date();
    const todayKey = getUTCMidnight(now);
    const weekAgo = addUTCDays(todayKey, -7);

    const allHabits = await db.habit.findMany({
      where: {
        userId: user.id,
      },
      include: {
        completions: {
          select: { date: true },
          orderBy: { date: 'desc' },
        },
      },
    });

    const habitsWithStreaks = allHabits.map((habit) => {
      const dates = getActivityDates(habit.completions);
      const { currentStreak, bestStreak } = calculateStreakFromDates(dates);
      const isCompletedToday = habit.completions.some(
        (c) => c.date.getTime() === todayKey.getTime()
      );
      return {
        ...habit,
        currentStreak,
        bestStreak,
        totalCompletions: habit.completions.filter((c) => c.date >= weekAgo)
          .length,
        completed: isCompletedToday,
        completionHistory: habit.completions
          .filter((c) => c.date >= weekAgo)
          .map((c) => ({
            date: c.date,
            completed: true,
          })),
      };
    });

    const sortedHabits = habitsWithStreaks.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return c.json({ habits: sortedHabits });
  })
  .get('/metrics', async (c) => {
    const user = c.get('user');

    const today = new Date();
    const todayKey = getUTCMidnight(today);
    const yesterday = addUTCDays(todayKey, -1);

    const tomorrowKey = addUTCDays(todayKey, 1);

    const weekAgoKey = addUTCDays(todayKey, -7);

    const [
      focusToday,
      focusYesterday,
      activeSession,
      tasks,
      habitCounts,
      overallStats,
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
      db.task.findMany({
        where: {
          userId: user.id,
          dueDate: {
            not: null,
            lt: tomorrowKey,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: DASHBOARD_TASK_LIMIT,
      }),
      db.$queryRaw<
        [
          {
            total_active: bigint;
            completed_today: bigint;
            last_7_days: bigint;
          },
        ]
      >`
        SELECT
          COUNT(DISTINCT h.id) as total_active,
          COUNT(DISTINCT hc1.id) as completed_today,
          COUNT(DISTINCT hc2.id) as last_7_days
        FROM habits h
        LEFT JOIN habit_completions hc1 ON h.id = hc1."habitId" AND hc1.date = ${todayKey}
        LEFT JOIN habit_completions hc2 ON h.id = hc2."habitId" AND hc2.date >= ${weekAgoKey}
        WHERE h."userId" = ${user.id}
      `,
      getOverallStats(user.id),
    ]);

    const tasksCompletedToday = tasks.filter((t) => t.completed).length;
    const totalPendingTasks = tasks.filter((t) => !t.completed).length;
    const totalTasks = tasks.length;

    const totalActiveHabits = Number(habitCounts[0].total_active);
    const habitsCompletedToday = Number(habitCounts[0].completed_today);
    const last7DaysHabitCompletions = Number(habitCounts[0].last_7_days);

    const todayMinutes = focusToday._sum.durationMinutes || 0;
    const yesterdayMinutes = focusYesterday._sum.durationMinutes || 0;
    const timeDiff = todayMinutes - yesterdayMinutes;

    const tasksPercentComplete =
      totalTasks > 0 ? Math.round((tasksCompletedToday / totalTasks) * 100) : 0;

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
      overallStats.bestStreak - overallStats.currentStreak
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
          totalToday: totalTasks,
          percentComplete: tasksPercentComplete,
          comparisonLabel: getTaskComparisonLabel(
            tasksCompletedToday,
            totalTasks
          ),
        },
        habits: {
          completedToday: habitsCompletedToday,
          totalActive: totalActiveHabits,
          percentComplete: habitsPercentComplete,
          weeklyAverage,
          comparisonLabel: getHabitComparisonLabel(weeklyAverage),
        },
        streak: {
          currentStreak: overallStats.currentStreak,
          bestStreak: overallStats.bestStreak,
          daysUntilRecord,
          comparisonLabel: getStreakComparisonLabel(
            overallStats.currentStreak,
            overallStats.bestStreak
          ),
        },
      },
    });
  })
  .get('/heatmap', zValidator('query', heatmapQuerySchema), async (c) => {
    const user = c.get('user');
    const { weeks } = c.req.valid('query');

    const heatmap = await getHeatmapData(user.id, weeks, db);

    return c.json({ heatmap });
  });

export type AppType = typeof dashboardRouter;
