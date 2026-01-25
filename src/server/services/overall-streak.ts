import { getUTCDateKey } from '@/utils/date-utc';
import { DAY_IN_MS } from '../constants';
import type { PrismaClient } from '../db/generated/client';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

interface DailyActivity {
  hasFocus: boolean;
  hasTasks: boolean;
  hasHabits: boolean;
}

export async function calculateOverallStreak(
  userId: string,
  client: PrismaClient | TransactionClient
): Promise<{ currentStreak: number; bestStreak: number }> {
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
      where: {
        userId,
        habit: {
          archived: false,
        },
      },
      select: { date: true },
    }),
  ]);

  const activityMap = new Map<string, DailyActivity>();

  focusSessions.forEach((session) => {
    const key = getUTCDateKey(session.startedAt);
    const activity = activityMap.get(key) || {
      hasFocus: false,
      hasTasks: false,
      hasHabits: false,
    };
    activity.hasFocus = true;
    activityMap.set(key, activity);
  });

  completedTasks.forEach((task) => {
    const key = getUTCDateKey(task.updatedAt);
    const activity = activityMap.get(key) || {
      hasFocus: false,
      hasTasks: false,
      hasHabits: false,
    };
    activity.hasTasks = true;
    activityMap.set(key, activity);
  });

  habitCompletions.forEach((completion) => {
    const key = getUTCDateKey(completion.date);
    const activity = activityMap.get(key) || {
      hasFocus: false,
      hasTasks: false,
      hasHabits: false,
    };
    activity.hasHabits = true;
    activityMap.set(key, activity);
  });

  const today = getUTCDateKey(new Date());
  const yesterday = getUTCDateKey(new Date(Date.now() - DAY_IN_MS));

  let currentStreak = 0;

  if (!activityMap.has(today) && !activityMap.has(yesterday)) {
    currentStreak = 0;
  } else {
    let currentDate = activityMap.has(today)
      ? new Date()
      : new Date(Date.now() - DAY_IN_MS);

    while (true) {
      const dateKey = getUTCDateKey(currentDate);
      if (activityMap.has(dateKey)) {
        currentStreak++;
        currentDate = new Date(currentDate.getTime() - DAY_IN_MS);
      } else {
        break;
      }
    }
  }

  const sortedDates = Array.from(activityMap.keys()).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  sortedDates.forEach((dateKey) => {
    const currentDate = new Date(dateKey);
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round(
        (currentDate.getTime() - lastDate.getTime()) / DAY_IN_MS
      );
      if (diffDays === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    lastDate = currentDate;
  });
  bestStreak = Math.max(bestStreak, tempStreak);

  return { currentStreak, bestStreak };
}
