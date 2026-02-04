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
    select: { completedAt: true },
  });

  if (completedTasks.length === 0) {
    return { currentStreak: 0, bestStreak: 0, mostTasksInDay: 0 };
  }

  const dates = getActivityDates(
    completedTasks.map((t) => ({ date: t.completedAt! }))
  );
  const { currentStreak, bestStreak } = calculateStreakFromDates(dates);

  const dailyCounts = getDailyAggregates(completedTasks, (t) => t.completedAt!);
  const mostTasksInDay = Math.max(...dailyCounts.values());

  return { currentStreak, bestStreak, mostTasksInDay };
}
