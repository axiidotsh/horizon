import { getUTCMidnight } from '@/utils/date-utc';
import type { Habit } from '../../habits/hooks/types';
import type { Task } from '../../tasks/hooks/types';
import type { DashboardMetrics } from '../hooks/types';

function getTaskComparisonLabel(
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

function getHabitComparisonLabel(weeklyAverage: number): string {
  return `${weeklyAverage}% weekly average`;
}

export function updateDashboardMetricsForTaskToggle(
  currentMetrics: DashboardMetrics,
  task: Task,
  wasCompleted: boolean
): DashboardMetrics {
  const today = new Date();
  const todayKey = getUTCMidnight(today);
  const tomorrowKey = new Date(todayKey.getTime() + 24 * 60 * 60 * 1000);

  const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isDueToday =
    taskDueDate && taskDueDate >= todayKey && taskDueDate < tomorrowKey;

  if (!isDueToday) {
    const isOverdue = taskDueDate && taskDueDate < todayKey;
    if (isOverdue) {
      const newOverdue = wasCompleted
        ? currentMetrics.tasks.overdue + 1
        : Math.max(0, currentMetrics.tasks.overdue - 1);

      return {
        ...currentMetrics,
        tasks: {
          ...currentMetrics.tasks,
          overdue: newOverdue,
          comparisonLabel: getTaskComparisonLabel(
            currentMetrics.tasks.completedToday,
            currentMetrics.tasks.totalToday,
            newOverdue
          ),
        },
      };
    }
    return currentMetrics;
  }

  const newCompletedToday = wasCompleted
    ? Math.max(0, currentMetrics.tasks.completedToday - 1)
    : currentMetrics.tasks.completedToday + 1;

  const newPercentComplete =
    currentMetrics.tasks.totalToday > 0
      ? Math.round((newCompletedToday / currentMetrics.tasks.totalToday) * 100)
      : 0;

  return {
    ...currentMetrics,
    tasks: {
      ...currentMetrics.tasks,
      completedToday: newCompletedToday,
      percentComplete: newPercentComplete,
      comparisonLabel: getTaskComparisonLabel(
        newCompletedToday,
        currentMetrics.tasks.totalToday,
        currentMetrics.tasks.overdue
      ),
    },
  };
}

export function updateDashboardMetricsForHabitToggle(
  currentMetrics: DashboardMetrics,
  habits: Habit[],
  habitId: string,
  date: Date
): DashboardMetrics {
  const todayKey = getUTCMidnight(new Date());
  const toggleDateKey = getUTCMidnight(date);

  const isTodayToggle = todayKey.getTime() === toggleDateKey.getTime();

  if (!isTodayToggle) {
    return currentMetrics;
  }

  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return currentMetrics;

  const isCurrentlyCompleted = habit.completions?.some((c) => {
    const compDate = new Date(c.date);
    return getUTCMidnight(compDate).getTime() === toggleDateKey.getTime();
  });

  const newCompletedToday = isCurrentlyCompleted
    ? Math.max(0, currentMetrics.habits.completedToday - 1)
    : currentMetrics.habits.completedToday + 1;

  const newPercentComplete =
    currentMetrics.habits.totalActive > 0
      ? Math.round(
          (newCompletedToday / currentMetrics.habits.totalActive) * 100
        )
      : 0;

  return {
    ...currentMetrics,
    habits: {
      ...currentMetrics.habits,
      completedToday: newCompletedToday,
      percentComplete: newPercentComplete,
      comparisonLabel: getHabitComparisonLabel(
        currentMetrics.habits.weeklyAverage
      ),
    },
  };
}
