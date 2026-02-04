import { getUTCDateKey } from '@/utils/date-utc';
import { db } from '../db';
import type { PrismaClient } from '../db/generated/client';
import { calculateStreakFromDates } from './streak-utils';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface OverallStats {
  currentStreak: number;
  bestStreak: number;
}

export async function getOverallStats(
  userId: string,
  client: PrismaClient | TransactionClient = db
): Promise<OverallStats> {
  const [focusSessions, completedTasks, habitCompletions] = await Promise.all([
    client.focusSession.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { startedAt: true },
    }),
    client.task.findMany({
      where: { userId, completed: true },
      select: { updatedAt: true },
    }),
    client.habitCompletion.findMany({
      where: { userId },
      select: { date: true },
    }),
  ]);

  const allDates = new Set<string>();

  for (const session of focusSessions) {
    allDates.add(getUTCDateKey(session.startedAt));
  }
  for (const task of completedTasks) {
    allDates.add(getUTCDateKey(task.updatedAt));
  }
  for (const completion of habitCompletions) {
    allDates.add(getUTCDateKey(completion.date));
  }

  return calculateStreakFromDates(allDates);
}
