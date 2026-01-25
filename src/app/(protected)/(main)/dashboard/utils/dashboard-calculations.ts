import { getUTCMidnight } from '@/utils/date-utc';

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2, NO_PRIORITY: 3 } as const;

export function calculateUrgencyScore(
  task: { dueDate: Date | null; priority: string },
  today: Date
): number {
  const priorityScore =
    PRIORITY_ORDER[task.priority as keyof typeof PRIORITY_ORDER] ?? 3;

  if (!task.dueDate) {
    return 1000 + priorityScore;
  }

  const dueDate = getUTCMidnight(task.dueDate);
  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return -100 + diffDays + priorityScore * 0.1;
  }

  if (diffDays === 0) {
    return priorityScore;
  }

  return 10 + diffDays + priorityScore * 0.1;
}

export function getTaskComparisonLabel(
  completedToday: number,
  totalToday: number,
  overdue: number
): string {
  if (overdue > 0) {
    return `${overdue} overdue`;
  }

  if (totalToday === 0) {
    return 'No tasks for today';
  }

  const completionPercentage = (completedToday / totalToday) * 100;

  const now = new Date();
  const startOfDayUTC = getUTCMidnight(now);
  const endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);

  const totalDayMs = endOfDayUTC.getTime() - startOfDayUTC.getTime();
  const elapsedMs = now.getTime() - startOfDayUTC.getTime();
  const dayProgressPercentage = (elapsedMs / totalDayMs) * 100;

  if (completionPercentage >= dayProgressPercentage + 20) {
    return 'Ahead of schedule';
  } else if (completionPercentage >= dayProgressPercentage - 10) {
    return 'On track';
  } else {
    return 'Behind schedule';
  }
}

export function getHabitComparisonLabel(weeklyAverage: number): string {
  return `${weeklyAverage}% weekly average`;
}

export function getStreakComparisonLabel(
  currentStreak: number,
  bestStreak: number
): string {
  if (currentStreak === 0) {
    return 'Start your streak today!';
  }

  if (currentStreak >= bestStreak && currentStreak > 0) {
    return 'New personal record!';
  }

  const daysUntilRecord = bestStreak - currentStreak;
  if (daysUntilRecord === 1) {
    return '1 day to beat your record';
  } else if (daysUntilRecord > 0) {
    return `${daysUntilRecord} days to beat your record`;
  }

  return 'Keep it up!';
}

export function formatTimeDiff(minutes: number): string {
  if (minutes === 0) return 'Same as yesterday';
  const sign = minutes > 0 ? '+' : '';
  const absMinutes = Math.abs(minutes);

  if (absMinutes >= 60) {
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    if (mins === 0) {
      return `${sign}${hours}h from yesterday`;
    }
    return `${sign}${hours}h ${mins}m from yesterday`;
  }

  return `${sign}${absMinutes}m from yesterday`;
}
