import { getUTCDateKey } from '@/utils/date-utc';
import { DAY_IN_MS } from '../constants';

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

export function getActivityDates(items: { date: Date }[]): Set<string> {
  const dates = new Set<string>();
  for (const item of items) {
    dates.add(getUTCDateKey(item.date));
  }
  return dates;
}

export function calculateStreakFromDates(dates: Set<string>): StreakResult {
  if (dates.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const now = new Date();
  const todayKey = getUTCDateKey(now);
  const yesterdayKey = getUTCDateKey(new Date(now.getTime() - DAY_IN_MS));

  // Current streak
  let currentStreak = 0;
  const hasToday = dates.has(todayKey);
  const hasYesterday = dates.has(yesterdayKey);

  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? now : new Date(now.getTime() - DAY_IN_MS);
    while (dates.has(getUTCDateKey(checkDate))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - DAY_IN_MS);
    }
  }

  // Best streak
  const sortedDates = Array.from(dates).sort();
  let bestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1] + 'T00:00:00Z');
    const currDate = new Date(sortedDates[i] + 'T00:00:00Z');
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / DAY_IN_MS
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  return { currentStreak, bestStreak };
}

export function getDailyAggregates<T>(
  items: T[],
  getDate: (item: T) => Date,
  getValue: (item: T) => number = () => 1
): Map<string, number> {
  const aggregates = new Map<string, number>();
  for (const item of items) {
    const dateKey = getUTCDateKey(getDate(item));
    const current = aggregates.get(dateKey) || 0;
    aggregates.set(dateKey, current + getValue(item));
  }
  return aggregates;
}
