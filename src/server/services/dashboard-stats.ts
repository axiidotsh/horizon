import { getUTCDateKey } from '@/utils/date-utc';
import { DAY_IN_MS } from '../constants';
import { db } from '../db';
import type { PrismaClient } from '../db/generated/client';
import { calculateOverallStreak } from './overall-streak';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function getOrCreateStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
) {
  const existing = await client.dashboardStats.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  return client.dashboardStats.create({
    data: { userId },
  });
}

export async function recalculateStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
) {
  const overallStreak = await calculateOverallStreak(userId, client);

  const lastActivityDate = overallStreak.currentStreak > 0 ? new Date() : null;

  return client.dashboardStats.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: overallStreak.currentStreak,
      bestStreak: overallStreak.bestStreak,
      lastActivityDate,
    },
    update: {
      currentStreak: overallStreak.currentStreak,
      bestStreak: overallStreak.bestStreak,
      lastActivityDate,
    },
  });
}

export async function updateStats(
  userId: string,
  activityDate: Date,
  isRemoval: boolean,
  client: PrismaClient | TransactionClient = db
) {
  const stats = await getOrCreateStats(userId, client);
  const activityKey = getUTCDateKey(activityDate);
  const now = new Date();
  const todayKey = getUTCDateKey(now);
  const yesterdayKey = getUTCDateKey(new Date(Date.now() - DAY_IN_MS));

  if (isRemoval) {
    if (!stats.lastActivityDate) {
      return stats;
    }

    const daysSinceActivity = Math.floor(
      (now.getTime() - activityDate.getTime()) / DAY_IN_MS
    );

    if (daysSinceActivity <= stats.currentStreak) {
      return recalculateStats(userId, client);
    }

    return stats;
  }

  if (activityKey === todayKey || activityKey === yesterdayKey) {
    if (!stats.lastActivityDate) {
      const newStreak = 1;
      return client.dashboardStats.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          bestStreak: Math.max(stats.bestStreak, newStreak),
          lastActivityDate: activityDate,
        },
      });
    }

    const lastActivityKey = getUTCDateKey(stats.lastActivityDate);
    const daysSinceLastActivity = Math.floor(
      (activityDate.getTime() - stats.lastActivityDate.getTime()) / DAY_IN_MS
    );

    if (activityKey === lastActivityKey) {
      return stats;
    }

    if (daysSinceLastActivity === 1) {
      const newStreak = stats.currentStreak + 1;
      return client.dashboardStats.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          bestStreak: Math.max(stats.bestStreak, newStreak),
          lastActivityDate: activityDate,
        },
      });
    }

    if (daysSinceLastActivity === 0) {
      return client.dashboardStats.update({
        where: { userId },
        data: {
          lastActivityDate: activityDate,
        },
      });
    }

    const newStreak = 1;
    return client.dashboardStats.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        bestStreak: Math.max(stats.bestStreak, newStreak),
        lastActivityDate: activityDate,
      },
    });
  }

  return stats;
}
