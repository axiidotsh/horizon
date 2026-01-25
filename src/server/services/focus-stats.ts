import { calculateFocusStats } from '@/app/(protected)/(main)/focus/utils/focus-stats-calculations';
import { getUTCDateKey } from '@/utils/date-utc';
import { db } from '../db';
import type { PrismaClient } from '../db/generated/client';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function getOrCreateStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
) {
  const existing = await client.focusStats.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  return client.focusStats.create({
    data: { userId },
  });
}

export async function recalculateStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
) {
  const sessions = await client.focusSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    select: {
      id: true,
      startedAt: true,
      durationMinutes: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { startedAt: 'desc' },
  });

  if (sessions.length === 0) {
    return client.focusStats.upsert({
      where: { userId },
      create: { userId },
      update: {
        currentStreak: 0,
        bestStreak: 0,
        lastStreakDate: null,
        highestDailyMinutes: 0,
        highestDailyDate: null,
        bestSessionsInDay: 0,
      },
    });
  }

  const stats = calculateFocusStats(
    sessions.map((s) => ({
      id: s.id,
      userId,
      task: null,
      durationMinutes: s.durationMinutes,
      startedAt: s.startedAt.toISOString(),
      pausedAt: null,
      totalPausedSeconds: 0,
      completedAt: null,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))
  );

  const now = new Date();
  const todayKey = getUTCDateKey(now);
  const yesterday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
  );
  const yesterdayKey = getUTCDateKey(yesterday);

  const mostRecentSession = sessions[0];
  const mostRecentKey = getUTCDateKey(new Date(mostRecentSession.startedAt));

  let lastStreakDate: Date | null = null;
  if (
    stats.currentStreak > 0 &&
    (mostRecentKey === todayKey || mostRecentKey === yesterdayKey)
  ) {
    const checkKey = mostRecentKey === todayKey ? todayKey : yesterdayKey;
    const [year, month, day] = checkKey.split('-').map(Number);
    lastStreakDate = new Date(Date.UTC(year, month - 1, day));
  }

  const highestDailyDate =
    stats.highestDailyDaysAgo !== null
      ? new Date(
          now.getTime() - stats.highestDailyDaysAgo * 24 * 60 * 60 * 1000
        )
      : null;

  return client.focusStats.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      lastStreakDate,
      highestDailyMinutes: stats.highestDailyMinutes,
      highestDailyDate,
      bestSessionsInDay: stats.bestSessionsInDay,
    },
    update: {
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      lastStreakDate,
      highestDailyMinutes: stats.highestDailyMinutes,
      highestDailyDate,
      bestSessionsInDay: stats.bestSessionsInDay,
    },
  });
}

export async function getStatsWithDaysAgo(userId: string) {
  const stats = await getOrCreateStats(userId);

  const now = new Date();
  const todayKey = getUTCDateKey(now);

  let highestDailyDaysAgo: number | null = null;
  if (stats.highestDailyDate) {
    const highestKey = getUTCDateKey(stats.highestDailyDate);
    const [ty, tm, td] = todayKey.split('-').map(Number);
    const [hy, hm, hd] = highestKey.split('-').map(Number);
    const todayDate = Date.UTC(ty, tm - 1, td);
    const highestDate = Date.UTC(hy, hm - 1, hd);
    highestDailyDaysAgo = Math.floor(
      (todayDate - highestDate) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    currentStreak: stats.currentStreak,
    bestStreak: stats.bestStreak,
    highestDailyMinutes: stats.highestDailyMinutes,
    highestDailyDaysAgo,
    bestSessionsInDay: stats.bestSessionsInDay,
  };
}

export async function getFocusStats(userId: string) {
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  );

  const [totalMinutesTodayResult, allTimeBestMinutes, totalSessions, stats] =
    await Promise.all([
      db.focusSession.aggregate({
        where: {
          userId,
          status: 'COMPLETED',
          startedAt: { gte: todayStart },
        },
        _sum: { durationMinutes: true },
      }),
      db.focusSession.findFirst({
        where: {
          userId,
          status: 'COMPLETED',
        },
        orderBy: { durationMinutes: 'desc' },
        select: { durationMinutes: true },
      }),
      db.focusSession.count({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),
      getOrCreateStats(userId),
    ]);

  return {
    totalMinutesToday: totalMinutesTodayResult._sum.durationMinutes ?? 0,
    allTimeBestMinutes: allTimeBestMinutes?.durationMinutes ?? 0,
    currentStreak: stats.currentStreak,
    totalSessions,
  };
}
