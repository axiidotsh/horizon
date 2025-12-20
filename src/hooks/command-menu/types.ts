import type { FocusSession } from '@/app/(protected)/(main)/focus/hooks/types';
import type { Habit } from '@/app/(protected)/(main)/habits/hooks/types';
import type { Task } from '@/app/(protected)/(main)/tasks/hooks/types';
import type { ComponentType } from 'react';

export type CommandMenuItem =
  | { type: 'todo'; data: Task }
  | { type: 'habit'; data: Habit }
  | { type: 'session'; data: FocusSession };

export interface CommandDefinition {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  keywords?: string[];
  destructive?: boolean;
  category: 'page' | 'focus' | 'create' | 'theme' | 'position' | 'account';
  handler: () => void | Promise<void>;
}

export interface CommandMenuState {
  open: boolean;
  searchValue: string;
  selectedValue: string;
  selectedItem: CommandMenuItem | null;
}
