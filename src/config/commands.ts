import type { TaskPriority } from '@/server/db/generated/client';
import {
  BrainIcon,
  CheckSquareIcon,
  ClockPlusIcon,
  GoalIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  ListPlusIcon,
  LogOutIcon,
  MessageCirclePlusIcon,
  MonitorIcon,
  MoonIcon,
  PanelTopIcon,
  PlusIcon,
  SettingsIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  SquareDashedIcon,
  SunIcon,
  TimerIcon,
  TrashIcon,
} from 'lucide-react';
import type { ComponentType } from 'react';

type CommandMenuPosition = 'top' | 'center';

interface CommandItemBase {
  name: string;
  searchWords?: string[];
  icon: ComponentType<{ className?: string }>;
  destructive?: boolean;
}

export interface PageItem extends CommandItemBase {
  href: string;
}

export interface ThemeItem extends CommandItemBase {
  value: string;
}

export interface PositionItem extends CommandItemBase {
  value: CommandMenuPosition;
}

export interface ActionCommand extends CommandItemBase {
  action: string;
}

export interface FocusDurationItem extends CommandItemBase {
  value: number;
}

export interface TaskPriorityItem extends CommandItemBase {
  value: TaskPriority;
}

export const PAGES: PageItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
    searchWords: ['home', 'overview', 'main'],
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: BrainIcon,
    searchWords: ['ai', 'assistant', 'conversation', 'message'],
  },
  {
    name: 'Focus',
    href: '/focus',
    icon: ClockPlusIcon,
    searchWords: ['timer', 'pomodoro', 'session', 'concentrate'],
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: LayoutListIcon,
    searchWords: ['todo', 'todos', 'list', 'items'],
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: GoalIcon,
    searchWords: ['routine', 'daily', 'goals', 'tracking'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    searchWords: ['preferences', 'config', 'options', 'customize'],
  },
  {
    name: 'Trash',
    href: '/trash',
    icon: TrashIcon,
    searchWords: ['deleted', 'purge', 'recycle', 'bin', 'trash'],
  },
];

export const THEMES: ThemeItem[] = [
  {
    name: 'Light',
    value: 'light',
    icon: SunIcon,
    searchWords: ['bright', 'day', 'white'],
  },
  {
    name: 'Dark',
    value: 'dark',
    icon: MoonIcon,
    searchWords: ['night', 'black', 'dimmed'],
  },
  {
    name: 'System',
    value: 'system',
    icon: MonitorIcon,
    searchWords: ['auto', 'default', 'os', 'preference'],
  },
];

export const POSITIONS: PositionItem[] = [
  {
    name: 'Top',
    value: 'top',
    icon: PanelTopIcon,
    searchWords: ['dropdown', 'search bar', 'above'],
  },
  {
    name: 'Center',
    value: 'center',
    icon: SquareDashedIcon,
    searchWords: ['modal', 'dialog', 'middle'],
  },
];

export const ACCOUNT_ACTIONS: ActionCommand[] = [
  {
    name: 'Sign out',
    action: 'sign-out',
    icon: LogOutIcon,
    searchWords: ['log out', 'logout', 'sign out', 'signout'],
    destructive: true,
  },
];

export const CREATE_COMMANDS: ActionCommand[] = [
  {
    name: 'Create new todo',
    action: 'add-task',
    icon: PlusIcon,
    searchWords: ['add', 'new', 'task'],
  },
  {
    name: 'Bulk add todos',
    action: 'bulk-add-tasks',
    icon: ListPlusIcon,
    searchWords: ['add', 'multiple', 'tasks', 'batch', 'bulk'],
  },
  {
    name: 'Create new project',
    action: 'add-project',
    icon: SquareDashedIcon,
    searchWords: ['add', 'new', 'folder', 'category'],
  },
  {
    name: 'Create new habit',
    action: 'add-habit',
    icon: CheckSquareIcon,
    searchWords: ['add', 'new', 'routine', 'goal'],
  },
  {
    name: 'Create new chat',
    action: 'new-chat',
    icon: MessageCirclePlusIcon,
    searchWords: ['start', 'conversation', 'ai', 'assistant'],
  },
];

export const FOCUS_DURATION_SETTINGS: FocusDurationItem[] = [
  {
    name: 'Set default focus: 25 minutes',
    value: 25,
    icon: TimerIcon,
    searchWords: ['duration', 'session', 'default', 'pomodoro'],
  },
  {
    name: 'Set default focus: 45 minutes',
    value: 45,
    icon: TimerIcon,
    searchWords: ['duration', 'session', 'default'],
  },
  {
    name: 'Set default focus: 1 hour',
    value: 60,
    icon: TimerIcon,
    searchWords: ['duration', 'session', 'default', '60 minutes'],
  },
  {
    name: 'Set default focus: 1.5 hours',
    value: 90,
    icon: TimerIcon,
    searchWords: ['duration', 'session', 'default', '90 minutes'],
  },
  {
    name: 'Set default focus: Custom',
    value: -1,
    icon: TimerIcon,
    searchWords: ['duration', 'session', 'default', 'custom', 'other'],
  },
];

export const TASK_PRIORITY_SETTINGS: TaskPriorityItem[] = [
  {
    name: 'Set default priority: Low',
    value: 'LOW',
    icon: SignalLowIcon,
    searchWords: ['priority', 'task', 'default'],
  },
  {
    name: 'Set default priority: Medium',
    value: 'MEDIUM',
    icon: SignalMediumIcon,
    searchWords: ['priority', 'task', 'default'],
  },
  {
    name: 'Set default priority: High',
    value: 'HIGH',
    icon: SignalHighIcon,
    searchWords: ['priority', 'task', 'default'],
  },
];
