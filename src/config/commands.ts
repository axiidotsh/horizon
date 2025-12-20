import type { CommandMenuPosition } from '@/atoms/settings-atoms';
import {
  BrainIcon,
  CheckSquareIcon,
  ClockPlusIcon,
  GoalIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  LogOutIcon,
  MessageCirclePlusIcon,
  MonitorIcon,
  MoonIcon,
  PanelTopIcon,
  PlusIcon,
  SettingsIcon,
  SquareDashedIcon,
  SunIcon,
} from 'lucide-react';
import type { ComponentType } from 'react';

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
