import type { SortOption } from '../atoms/task-atoms';
import { DAYS_IN_WEEK } from '../constants';
import type { Task, TaskPriority } from '../hooks/types';

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
  NO_PRIORITY: 3,
};

function normalizeDateToMidnight(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function filterTasks(
  tasks: Task[],
  query: string,
  tagFilters: string[],
  projectFilters: string[]
): Task[] {
  let filtered = tasks;

  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery);
      const tagsMatch = task.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );
      const projectMatch = task.project?.name
        ?.toLowerCase()
        .includes(lowerQuery);
      return titleMatch || tagsMatch || projectMatch;
    });
  }

  if (tagFilters.length > 0) {
    filtered = filtered.filter((task) =>
      tagFilters.some((tag) => task.tags?.includes(tag))
    );
  }

  if (projectFilters.length > 0) {
    filtered = filtered.filter((task) =>
      task.projectId ? projectFilters.includes(task.projectId) : false
    );
  }

  return filtered;
}

export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        return (
          PRIORITY_ORDER[a.priority as TaskPriority] -
          PRIORITY_ORDER[b.priority as TaskPriority]
        );
      case 'title':
        return a.title.localeCompare(b.title);
      case 'completed':
        return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
      default:
        return 0;
    }
  });
}

export function groupTasksByDueDate(tasks: Task[]) {
  const groups = {
    overdue: [] as Task[],
    dueToday: [] as Task[],
    dueThisWeek: [] as Task[],
    upcoming: [] as Task[],
    noDueDate: [] as Task[],
  };

  const today = normalizeDateToMidnight(new Date());

  tasks.forEach((task) => {
    if (!task.dueDate) {
      groups.noDueDate.push(task);
      return;
    }

    const dueDate = normalizeDateToMidnight(new Date(task.dueDate));
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      groups.overdue.push(task);
    } else if (diffDays === 0) {
      groups.dueToday.push(task);
    } else if (diffDays <= DAYS_IN_WEEK) {
      groups.dueThisWeek.push(task);
    } else {
      groups.upcoming.push(task);
    }
  });

  return groups;
}

export function formatDueDate(
  date: Date | string,
  completed?: boolean
): string {
  const dueDate = normalizeDateToMidnight(new Date(date));
  const today = normalizeDateToMidnight(new Date());

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    if (completed) {
      return dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    const absDays = Math.abs(diffDays);
    return absDays === 1 ? '1 day overdue' : `${absDays} days overdue`;
  }
  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  if (diffDays <= DAYS_IN_WEEK) {
    return `In ${diffDays} days`;
  }
  return dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(date: Date | string): boolean {
  const today = normalizeDateToMidnight(new Date());
  const dueDate = normalizeDateToMidnight(new Date(date));
  return dueDate < today;
}

export function getDueDateUrgency(
  dueDate: Date | string,
  completed?: boolean
): 'overdue' | 'today' | 'upcoming' | 'none' {
  if (!dueDate) return 'none';

  const date = new Date(dueDate);
  const today = normalizeDateToMidnight(new Date());
  const due = normalizeDateToMidnight(date);

  if (due < today) return completed ? 'none' : 'overdue';
  if (due.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}
