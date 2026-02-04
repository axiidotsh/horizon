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

interface HabitWithStreak {
  id: string;
  title: string;
  currentStreak: number;
  bestStreak: number;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  mostHabitsInDay: number;
  habitWithBestCurrentStreak: {
    id: string;
    title: string;
    streak: number;
  } | null;
  habitWithBestAllTimeStreak: {
    id: string;
    title: string;
    streak: number;
  } | null;
}

export async function getHabitsWithStreaks(
  userId: string,
  client: PrismaClient | TransactionClient = db
): Promise<HabitWithStreak[]> {
  const habits = await client.habit.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      completions: {
        select: { date: true },
        orderBy: { date: 'desc' },
      },
    },
  });

  return habits.map((habit) => {
    const dates = getActivityDates(habit.completions);
    const { currentStreak, bestStreak } = calculateStreakFromDates(dates);
    return {
      id: habit.id,
      title: habit.title,
      currentStreak,
      bestStreak,
    };
  });
}

export async function getHabitStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
): Promise<HabitStats> {
  const [completions, habitsWithStreaks] = await Promise.all([
    client.habitCompletion.findMany({
      where: { userId },
      select: { date: true },
    }),
    getHabitsWithStreaks(userId, client),
  ]);

  if (completions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      mostHabitsInDay: 0,
      habitWithBestCurrentStreak: null,
      habitWithBestAllTimeStreak: null,
    };
  }

  const uniqueDates = getActivityDates(completions);
  const { currentStreak, bestStreak } = calculateStreakFromDates(uniqueDates);

  const dailyCounts = getDailyAggregates(completions, (c) => c.date);
  const mostHabitsInDay = Math.max(...dailyCounts.values());

  let habitWithBestCurrentStreak: HabitStats['habitWithBestCurrentStreak'] =
    null;
  let habitWithBestAllTimeStreak: HabitStats['habitWithBestAllTimeStreak'] =
    null;

  for (const habit of habitsWithStreaks) {
    if (
      !habitWithBestCurrentStreak ||
      habit.currentStreak > habitWithBestCurrentStreak.streak
    ) {
      habitWithBestCurrentStreak = {
        id: habit.id,
        title: habit.title,
        streak: habit.currentStreak,
      };
    }
    if (
      !habitWithBestAllTimeStreak ||
      habit.bestStreak > habitWithBestAllTimeStreak.streak
    ) {
      habitWithBestAllTimeStreak = {
        id: habit.id,
        title: habit.title,
        streak: habit.bestStreak,
      };
    }
  }

  return {
    currentStreak,
    bestStreak,
    mostHabitsInDay,
    habitWithBestCurrentStreak,
    habitWithBestAllTimeStreak,
  };
}
