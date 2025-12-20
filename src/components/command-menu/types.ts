import type { FocusSession } from '@/app/(protected)/(main)/focus/hooks/types';
import type { Habit } from '@/app/(protected)/(main)/habits/hooks/types';
import type { Task } from '@/app/(protected)/(main)/tasks/hooks/types';

export type CommandMenuItem =
  | { type: 'todo'; data: Task }
  | { type: 'habit'; data: Habit }
  | { type: 'session'; data: FocusSession }
  | { type: 'focus-start' };

export function getItemTitle(item: CommandMenuItem): string {
  if (item.type === 'todo') return item.data.title;
  if (item.type === 'habit') return item.data.title;
  if (item.type === 'session') return item.data.task || 'Focus session';
  if (item.type === 'focus-start') return 'Start focus session';
  return '';
}
