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
import { getOrCreateStats } from '../services/dashboard-stats';
import { getHeatmapData } from '../services/heatmap';

const heatmapQuerySchema = z.object({
  weeks: z.coerce.number().min(1).max(52).default(52),
});

interface TaskWithProject {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  completed: boolean;
  dueDate: Date | null;
  priority: 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  project: { id: string; name: string; color: string | null } | null;
}

export const dashboardRouter = new Hono()
  .use(authMiddleware)
  .get('/tasks', async (c) => {
    const user = c.get('user');
    const today = getUTCMidnight(new Date());
    const nextWeek = addUTCDays(today, 7);

    const tasks = await db.$queryRaw<TaskWithProject[]>`
      SELECT
        t.*,
        CASE
          WHEN t."dueDate" IS NULL THEN 1000 +
            CASE t.priority
              WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 WHEN 'LOW' THEN 2 ELSE 3
            END
          WHEN t."dueDate" < ${today} THEN -100 +
            EXTRACT(EPOCH FROM (t."dueDate" - ${today})) / 86400 +
            CASE t.priority WHEN 'HIGH' THEN 0.0 WHEN 'MEDIUM' THEN 0.1 WHEN 'LOW' THEN 0.2 ELSE 0.3 END
          WHEN DATE(t."dueDate") = DATE(${today}) THEN
            CASE t.priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 WHEN 'LOW' THEN 2 ELSE 3 END
          ELSE 10 + EXTRACT(EPOCH FROM (t."dueDate" - ${today})) / 86400 +
            CASE t.priority WHEN 'HIGH' THEN 0.0 WHEN 'MEDIUM' THEN 0.1 WHEN 'LOW' THEN 0.2 ELSE 0.3 END
        END as urgency_score,
        CASE WHEN p.id IS NOT NULL THEN
          json_build_object('id', p.id, 'name', p.name, 'color', p.color)
        ELSE NULL END as project
      FROM tasks t
      LEFT JOIN projects p ON t."projectId" = p.id
      WHERE t."userId" = ${user.id}
        AND t.completed = false
        AND (t."dueDate" IS NULL OR t."dueDate" <= ${nextWeek})
      ORDER BY urgency_score ASC
      LIMIT ${DASHBOARD_TASK_LIMIT}
    `;

    return c.json({ tasks });
  })
  .get('/habits', async (c) => {
    const user = c.get('user');

    const now = new Date();
    const todayKey = getUTCMidnight(now);
    const weekAgo = addUTCDays(todayKey, -7);

    const incompleteHabits = await db.habit.findMany({
      where: {
        userId: user.id,
        archived: false,
        completions: {
          none: { date: todayKey },
        },
      },
      include: {
        completions: {
          select: { date: true },
          where: { date: { gte: weekAgo } },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { currentStreak: 'desc' },
      take: DASHBOARD_TASK_LIMIT,
    });

    const habits = incompleteHabits.map((habit) => ({
      ...habit,
      totalCompletions: habit.completions.length,
      completed: false,
      completionHistory: habit.completions.map((c) => ({
        date: c.date,
        completed: true,
      })),
    }));

    return c.json({ habits });
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
      taskCounts,
      habitCounts,
      dashboardStats,
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
      db.$queryRaw<
        [
          {
            completed_today: bigint;
            due_today: bigint;
            overdue: bigint;
          },
        ]
      >`
        SELECT
          COUNT(*) FILTER (WHERE completed = true AND "dueDate" >= ${todayKey} AND "dueDate" < ${tomorrowKey}) as completed_today,
          COUNT(*) FILTER (WHERE "dueDate" >= ${todayKey} AND "dueDate" < ${tomorrowKey}) as due_today,
          COUNT(*) FILTER (WHERE completed = false AND "dueDate" < ${todayKey}) as overdue
        FROM tasks
        WHERE "userId" = ${user.id}
      `,
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
        WHERE h."userId" = ${user.id} AND h.archived = false
      `,
      getOrCreateStats(user.id),
    ]);

    const tasksCompletedToday = Number(taskCounts[0].completed_today);
    const tasksDueToday = Number(taskCounts[0].due_today);
    const overdueTasks = Number(taskCounts[0].overdue);

    const totalActiveHabits = Number(habitCounts[0].total_active);
    const habitsCompletedToday = Number(habitCounts[0].completed_today);
    const last7DaysHabitCompletions = Number(habitCounts[0].last_7_days);

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
      dashboardStats.bestStreak - dashboardStats.currentStreak
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
          currentStreak: dashboardStats.currentStreak,
          bestStreak: dashboardStats.bestStreak,
          daysUntilRecord,
          comparisonLabel: getStreakComparisonLabel(
            dashboardStats.currentStreak,
            dashboardStats.bestStreak
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
