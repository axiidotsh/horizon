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

export interface TaskStats {
  currentStreak: number;
  bestStreak: number;
  mostTasksInDay: number;
}

export async function getTaskStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
): Promise<TaskStats> {
  const completedTasks = await client.task.findMany({
    where: { userId, completed: true },
    select: { updatedAt: true },
  });

  if (completedTasks.length === 0) {
    return { currentStreak: 0, bestStreak: 0, mostTasksInDay: 0 };
  }

  const dates = getActivityDates(
    completedTasks.map((t) => ({ date: t.updatedAt }))
  );
  const { currentStreak, bestStreak } = calculateStreakFromDates(dates);

  const dailyCounts = getDailyAggregates(completedTasks, (t) => t.updatedAt);
  const mostTasksInDay = Math.max(...dailyCounts.values());

  return { currentStreak, bestStreak, mostTasksInDay };
}
