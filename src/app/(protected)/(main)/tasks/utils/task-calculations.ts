import { addUTCDays } from '@/utils/date-utc';
import type { ChartData, Task, TaskStats } from '../hooks/types';

export function calculateTaskStats(tasks: Task[]): TaskStats {
  const now = new Date();
  const startOfWeek = addUTCDays(now, -now.getUTCDay());

  const tasksThisWeek = tasks.filter(
    (task) => new Date(task.createdAt) >= startOfWeek
  );

  const total = tasksThisWeek.length;
  const completed = tasksThisWeek.filter((task) => task.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue = tasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) < now
  ).length;

  return {
    total,
    completed,
    pending,
    completionRate,
    overdue,
  };
}

export function calculateTaskChartData(tasks: Task[], days: number): ChartData {
  const now = new Date();
  const chartData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addUTCDays(now, -i);
    const nextDate = addUTCDays(date, 1);

    const totalTasks = tasks.filter(
      (task) => new Date(task.createdAt) < nextDate
    ).length;

    const completedTasks = tasks.filter((task) => {
      if (!task.completed) return false;
      const updatedAt = new Date(task.updatedAt);
      return updatedAt >= date && updatedAt < nextDate;
    }).length;

    const dateLabel =
      days <= 7
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
        : `${date.getMonth() + 1}/${date.getDate()}`;

    chartData.push({
      date: dateLabel,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    });
  }

  return chartData;
}
