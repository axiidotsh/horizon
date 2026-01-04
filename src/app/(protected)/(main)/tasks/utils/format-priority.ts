import type { TaskPriority } from '../hooks/types';

export function formatPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}
