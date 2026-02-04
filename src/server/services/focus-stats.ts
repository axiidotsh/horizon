import { getUTCMidnight } from '@/utils/date-utc';
import { db } from '../db';
import type { PrismaClient } from '../db/generated/client';
import {
  calculateStreakFromDates,
  getActivityDates,
  getDailyAggregates,
} from './streak-utils';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface FocusStats {
  currentStreak: number;
  bestStreak: number;
  highestDailyMinutes: number;
  highestDailyDate: string | null;
  mostSessionsInDay: number;
  totalMinutesToday: number;
  allTimeBestMinutes: number;
  totalSessions: number;
}

export async function getFocusStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
): Promise<FocusStats> {
  const todayStart = getUTCMidnight(new Date());

  const [sessions, todayAggregate, allTimeBest, totalSessions] =
    await Promise.all([
      client.focusSession.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { startedAt: true, durationMinutes: true },
      }),
      client.focusSession.aggregate({
        where: {
          userId,
          status: 'COMPLETED',
          startedAt: { gte: todayStart },
        },
        _sum: { durationMinutes: true },
      }),
      client.focusSession.findFirst({
        where: { userId, status: 'COMPLETED' },
        orderBy: { durationMinutes: 'desc' },
        select: { durationMinutes: true },
      }),
      client.focusSession.count({
        where: { userId, status: 'COMPLETED' },
      }),
    ]);

  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      highestDailyMinutes: 0,
      highestDailyDate: null,
      mostSessionsInDay: 0,
      totalMinutesToday: 0,
      allTimeBestMinutes: 0,
      totalSessions: 0,
    };
  }

  const dates = getActivityDates(sessions.map((s) => ({ date: s.startedAt })));
  const { currentStreak, bestStreak } = calculateStreakFromDates(dates);

  const dailyMinutes = getDailyAggregates(
    sessions,
    (s) => s.startedAt,
    (s) => s.durationMinutes
  );
  const dailyCounts = getDailyAggregates(sessions, (s) => s.startedAt);

  let highestDailyMinutes = 0;
  let highestDailyDate: string | null = null;
  for (const [dateKey, minutes] of dailyMinutes) {
    if (minutes > highestDailyMinutes) {
      highestDailyMinutes = minutes;
      highestDailyDate = dateKey;
    }
  }

  return {
    currentStreak,
    bestStreak,
    highestDailyMinutes,
    highestDailyDate,
    mostSessionsInDay: Math.max(...dailyCounts.values(), 0),
    totalMinutesToday: todayAggregate._sum.durationMinutes || 0,
    allTimeBestMinutes: allTimeBest?.durationMinutes || 0,
    totalSessions,
  };
}
