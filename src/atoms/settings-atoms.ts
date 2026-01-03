import type { TaskPriority } from '@/server/db/generated/client';
import { atomWithStorage } from 'jotai/utils';

export type CommandMenuPosition = 'top' | 'center';

interface AppSettings {
  commandMenuPosition: CommandMenuPosition;
  defaultFocusDuration: number;
  defaultTaskPriority: TaskPriority;
}

const DEFAULT_SETTINGS: AppSettings = {
  commandMenuPosition: 'top',
  defaultFocusDuration: 45,
  defaultTaskPriority: 'MEDIUM',
};

export const settingsAtom = atomWithStorage<AppSettings>(
  'horizon-settings',
  DEFAULT_SETTINGS
);
