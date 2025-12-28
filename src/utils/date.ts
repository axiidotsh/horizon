export const getTodayAt = (hours: number, minutes: number = 0) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const getDaysFromNowAt = (
  days: number,
  hours: number,
  minutes: number = 0
) => {
  const date = new Date();
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

export const formatDueDate = (date: Date): string => {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    // Show only time for today's tasks
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Show date + time for other days
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getDueDateUrgency = (date: Date): 'today' | 'soon' | 'later' => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const daysDiff = Math.floor(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) return 'today';
  if (daysDiff > 0 && daysDiff <= 3) return 'soon';
  return 'later';
};

// Task-specific utilities
export type Priority = 1 | 2 | 3 | 4;

export interface Project {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  projectId?: string;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  focusSessionId?: string;
}

export const sortTasksByPriority = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => {
    // Priority first (1 is highest)
    if (a.priority !== b.priority) return a.priority - b.priority;
    // Then by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
};

export interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  later: Task[];
}

export const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);

  const grouped: GroupedTasks = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  };

  tasks.forEach((task) => {
    if (!task.dueDate) {
      grouped.later.push(task);
      return;
    }

    const taskDate = new Date(
      task.dueDate.getFullYear(),
      task.dueDate.getMonth(),
      task.dueDate.getDate()
    );

    if (taskDate < today) {
      grouped.overdue.push(task);
    } else if (taskDate.getTime() === today.getTime()) {
      grouped.today.push(task);
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      grouped.tomorrow.push(task);
    } else if (taskDate >= dayAfterTomorrow && taskDate <= weekFromNow) {
      grouped.thisWeek.push(task);
    } else {
      grouped.later.push(task);
    }
  });

  return grouped;
};
