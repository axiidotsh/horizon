import type { TaskPriority } from '../hooks/types';

export function formatPriorityLabel(priority: TaskPriority): string {
  if (priority === 'NO_PRIORITY') return '';
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}
