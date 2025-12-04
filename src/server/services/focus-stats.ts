import { db } from '../db';

function getDateKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getOrCreateStats(userId: string) {
  const existing = await db.focusStats.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  return db.focusStats.create({
    data: { userId },
  });
}

export async function recalculateStats(userId: string) {
  const sessions = await db.focusSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    orderBy: { startedAt: 'desc' },
  });

  if (sessions.length === 0) {
    return db.focusStats.upsert({
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

  const dailyTotals = new Map<string, { minutes: number; count: number }>();

  for (const session of sessions) {
    const dateKey = getDateKey(session.startedAt);
    const existing = dailyTotals.get(dateKey) || { minutes: 0, count: 0 };
    dailyTotals.set(dateKey, {
      minutes: existing.minutes + session.durationMinutes,
      count: existing.count + 1,
    });
  }

  let highestDailyMinutes = 0;
  let highestDailyDate: Date | null = null;
  let bestSessionsInDay = 0;

  for (const [dateKey, { minutes, count }] of dailyTotals) {
    if (minutes > highestDailyMinutes) {
      highestDailyMinutes = minutes;
      highestDailyDate = new Date(dateKey);
    }
    if (count > bestSessionsInDay) {
      bestSessionsInDay = count;
    }
  }

  const sortedDates = Array.from(dailyTotals.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let lastStreakDate: Date | null = null;

  const mostRecentDate = new Date(sortedDates[0]);
  if (
    mostRecentDate.getTime() !== today.getTime() &&
    mostRecentDate.getTime() !== yesterday.getTime()
  ) {
    currentStreak = 0;
  } else {
    let checkDate =
      mostRecentDate.getTime() === today.getTime() ? today : yesterday;
    lastStreakDate = new Date(checkDate);

    for (const dateKey of sortedDates) {
      const date = new Date(dateKey);
      if (date.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate = new Date(checkDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = i > 0 ? new Date(sortedDates[i - 1]) : null;

    if (prevDate && getDaysDifference(prevDate, currentDate) === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    bestStreak = Math.max(bestStreak, tempStreak);
  }

  return db.focusStats.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak,
      bestStreak,
      lastStreakDate,
      highestDailyMinutes,
      highestDailyDate,
      bestSessionsInDay,
    },
    update: {
      currentStreak,
      bestStreak,
      lastStreakDate,
      highestDailyMinutes,
      highestDailyDate,
      bestSessionsInDay,
    },
  });
}

export async function getStatsWithDaysAgo(userId: string) {
  const stats = await getOrCreateStats(userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let highestDailyDaysAgo: number | null = null;
  if (stats.highestDailyDate) {
    const highestDate = new Date(stats.highestDailyDate);
    highestDate.setHours(0, 0, 0, 0);
    highestDailyDaysAgo = Math.floor(
      (today.getTime() - highestDate.getTime()) / (1000 * 60 * 60 * 24)
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
