import { addUTCDays, getUTCDateKey } from '@/utils/date-utc';
import type { PrismaClient } from '../db/generated/client';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

interface DayData {
  date: string;
  focusMinutes: number;
  tasksCompleted: number;
  habitsCompleted: number;
  level: number;
  totalActivity: number;
}

export async function getHeatmapData(
  userId: string,
  weeks: number,
  client: PrismaClient | TransactionClient
): Promise<DayData[]> {
  const endDate = new Date();
  const startDate = addUTCDays(endDate, -weeks * 7);

  const [focusSessions, completedTasks, habitCompletions] = await Promise.all([
    client.focusSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        startedAt: { gte: startDate },
      },
      select: { startedAt: true, durationMinutes: true },
    }),
    client.task.findMany({
      where: {
        userId,
        completed: true,
        updatedAt: { gte: startDate },
      },
      select: { updatedAt: true },
    }),
    client.habitCompletion.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      select: { date: true },
    }),
  ]);

  const dataMap = new Map<string, DayData>();

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const key = getUTCDateKey(currentDate);
    dataMap.set(key, {
      date: key,
      focusMinutes: 0,
      tasksCompleted: 0,
      habitsCompleted: 0,
      level: 0,
      totalActivity: 0,
    });
    currentDate = addUTCDays(currentDate, 1);
  }

  focusSessions.forEach((session) => {
    const key = getUTCDateKey(session.startedAt);
    const data = dataMap.get(key);
    if (data) {
      data.focusMinutes += session.durationMinutes;
    }
  });

  completedTasks.forEach((task) => {
    const key = getUTCDateKey(task.updatedAt);
    const data = dataMap.get(key);
    if (data) {
      data.tasksCompleted++;
    }
  });

  habitCompletions.forEach((completion) => {
    const key = getUTCDateKey(completion.date);
    const data = dataMap.get(key);
    if (data) {
      data.habitsCompleted++;
    }
  });

  return Array.from(dataMap.values()).map((day) => ({
    ...day,
    level: calculateLevel(day),
    totalActivity: day.focusMinutes + day.tasksCompleted + day.habitsCompleted,
  }));
}

export function calculateLevel(data: DayData): number {
  const hasFocus = data.focusMinutes > 0;
  const hasTasks = data.tasksCompleted > 0;
  const hasHabits = data.habitsCompleted > 0;
  const activityTypes = [hasFocus, hasTasks, hasHabits].filter(Boolean).length;

  if (activityTypes === 0) return 0;

  if (activityTypes === 1) {
    if (hasFocus && data.focusMinutes >= 60) return 2;
    return 1;
  }

  if (activityTypes === 2) {
    const totalScore =
      data.focusMinutes / 30 + data.tasksCompleted + data.habitsCompleted * 2;
    if (totalScore >= 6) return 3;
    return 2;
  }

  const totalScore =
    data.focusMinutes / 30 + data.tasksCompleted + data.habitsCompleted * 2;
  if (totalScore >= 10) return 4;
  return 3;
}
