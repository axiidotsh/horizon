'use client';

import {
  deletingSessionAtom,
  editingSessionAtom,
  showDiscardDialogAtom,
  showEndEarlyDialogAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
import { useRecentSessions } from '@/app/(protected)/(main)/focus/hooks/queries/use-recent-sessions';
import type { FocusSession } from '@/app/(protected)/(main)/focus/hooks/types';
import {
  createDialogOpenAtom,
  deletingHabitIdAtom,
  editingHabitIdAtom,
} from '@/app/(protected)/(main)/habits/atoms/dialog-atoms';
import { useHabits } from '@/app/(protected)/(main)/habits/hooks/queries/use-habits';
import type { Habit } from '@/app/(protected)/(main)/habits/hooks/types';
import {
  createTaskDialogAtom,
  deletingTaskAtom,
  editingTaskAtom,
} from '@/app/(protected)/(main)/tasks/atoms/task-dialogs';
import { useToggleTask } from '@/app/(protected)/(main)/tasks/hooks/mutations/use-toggle-task';
import { useTasks } from '@/app/(protected)/(main)/tasks/hooks/queries/use-tasks';
import type { Task } from '@/app/(protected)/(main)/tasks/hooks/types';
import {
  actionsViewOpenAtom,
  selectedItemAtom,
} from '@/atoms/command-menu-atoms';
import { logoutDialogOpenAtom } from '@/atoms/ui-atoms';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/utils/utils';
import { useAtom, useSetAtom } from 'jotai';
import {
  BrainIcon,
  CheckCircle2Icon,
  CheckSquareIcon,
  CircleIcon,
  ClockPlusIcon,
  GoalIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  LogOutIcon,
  MessageCirclePlusIcon,
  MonitorIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  SquareIcon,
  SunIcon,
  TimerIcon,
  XIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { CommandMenuActions } from './command-menu-actions';

interface CommandItemBase {
  name: string;
  searchWords?: string[];
  icon: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
}

interface PageItem extends CommandItemBase {
  href: string;
}

interface ActionCommand extends CommandItemBase {
  action: string;
}

interface ThemeItem extends CommandItemBase {
  value: string;
}

const ITEM_LIMIT = 10;

const pages: PageItem[] = [
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
];

const themes: ThemeItem[] = [
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

const accountActions: ActionCommand[] = [
  {
    name: 'Sign out',
    action: 'sign-out',
    icon: LogOutIcon,
    searchWords: ['log out', 'logout', 'sign out', 'signout'],
    destructive: true,
  },
];

type CommandMenuItem =
  | { type: 'todo'; data: Task }
  | { type: 'habit'; data: Habit }
  | { type: 'session'; data: FocusSession };

function getItemTitle(item: CommandMenuItem): string {
  if (item.type === 'todo') return item.data.title;
  if (item.type === 'habit') return item.data.title;
  if (item.type === 'session') return item.data.task || 'Focus session';
  return '';
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [actionsOpen, setActionsOpen] = useAtom(actionsViewOpenAtom);
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);
  const setLogoutDialogOpen = useSetAtom(logoutDialogOpenAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setTheme } = useTheme();

  const setCreateTaskDialogOpen = useSetAtom(createTaskDialogAtom);
  const setCreateHabitDialogOpen = useSetAtom(createDialogOpenAtom);
  const setEditingTask = useSetAtom(editingTaskAtom);
  const setDeletingTask = useSetAtom(deletingTaskAtom);
  const setEditingHabitId = useSetAtom(editingHabitIdAtom);
  const setDeletingHabitId = useSetAtom(deletingHabitIdAtom);
  const setEditingSession = useSetAtom(editingSessionAtom);
  const setDeletingSession = useSetAtom(deletingSessionAtom);
  const setShowEndEarly = useSetAtom(showEndEarlyDialogAtom);
  const setShowDiscard = useSetAtom(showDiscardDialogAtom);

  const { data: activeSession } = useActiveSession();
  const { data: recentSessions = [] } = useRecentSessions(ITEM_LIMIT);
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  const { start, pause, resume, complete } = useFocusSession();
  const toggleTask = useToggleTask();

  const itemsMap = useMemo(() => {
    const map = new Map<string, CommandMenuItem>();
    tasks.slice(0, ITEM_LIMIT).forEach((task) => {
      map.set(`todo ${task.title}`, { type: 'todo', data: task });
    });
    habits.slice(0, ITEM_LIMIT).forEach((habit) => {
      map.set(`habit ${habit.title}`, { type: 'habit', data: habit });
    });
    recentSessions.slice(0, ITEM_LIMIT).forEach((session) => {
      map.set(`session ${session.task || 'Focus session'}`, {
        type: 'session',
        data: session,
      });
    });
    return map;
  }, [tasks, habits, recentSessions]);

  useEffect(() => {
    const item = itemsMap.get(selectedValue);
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
      if (actionsOpen) setActionsOpen(false);
    }
  }, [selectedValue, itemsMap, setSelectedItem, actionsOpen, setActionsOpen]);

  const focusCommands = useMemo(() => {
    const commands: ActionCommand[] = [];

    if (!activeSession) {
      commands.push({
        name: 'Start focus session',
        action: 'start-focus',
        icon: PlayIcon,
        searchWords: ['begin', 'timer', 'pomodoro', 'work'],
      });
    } else if (activeSession.status === 'ACTIVE') {
      commands.push({
        name: 'Pause focus session',
        action: 'pause-focus',
        icon: PauseIcon,
        searchWords: ['stop', 'break', 'timer'],
      });
      commands.push({
        name: 'End focus session early',
        action: 'end-early-focus',
        icon: SquareIcon,
        searchWords: ['stop', 'finish', 'save'],
      });
    } else if (activeSession.status === 'PAUSED') {
      commands.push({
        name: 'Resume focus session',
        action: 'resume-focus',
        icon: PlayIcon,
        searchWords: ['continue', 'start', 'timer'],
      });
      commands.push({
        name: 'End focus session early',
        action: 'end-early-focus',
        icon: SquareIcon,
        searchWords: ['stop', 'finish', 'save'],
      });
    } else if (activeSession.status === 'COMPLETED') {
      commands.push({
        name: 'Save focus session',
        action: 'save-focus',
        icon: SaveIcon,
        searchWords: ['complete', 'finish', 'done'],
      });
      commands.push({
        name: 'Discard focus session',
        action: 'discard-focus',
        icon: XIcon,
        searchWords: ['cancel', 'delete', 'remove'],
        destructive: true,
      });
    }

    return commands;
  }, [activeSession]);

  const createCommands: ActionCommand[] = [
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

  const reset = useCallback(
    (shouldBlur = true) => {
      setOpen(false);
      setSearchValue('');
      setSelectedValue('');
      setActionsOpen(false);
      setSelectedItem(null);
      if (shouldBlur) {
        inputRef.current?.blur();
      }
    },
    [setActionsOpen, setSelectedItem]
  );

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      setOpen((prev) => {
        if (!prev) inputRef.current?.focus();
        return !prev;
      });
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    'mod+o',
    (e) => {
      if (!open || !selectedItem) return;
      e.preventDefault();
      setActionsOpen((prev) => !prev);
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    'escape',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!actionsOpen) {
        reset();
      }
    },
    { enableOnFormTags: true }
  );

  const handleSelect = (callback: () => void) => {
    callback();
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && actionsOpen) {
      return;
    }
    if (!newOpen) {
      reset();
    } else {
      setOpen(true);
    }
  };

  const handleCommandAction = (action: string) => {
    switch (action) {
      case 'add-task':
        setCreateTaskDialogOpen(true);
        break;
      case 'add-habit':
        setCreateHabitDialogOpen(true);
        break;
      case 'new-chat':
        router.push('/chat');
        break;
      case 'start-focus':
        start.mutate({ json: { durationMinutes: 45 } });
        router.push('/focus');
        break;
      case 'pause-focus':
        if (activeSession) pause.mutate({ param: { id: activeSession.id } });
        break;
      case 'resume-focus':
        if (activeSession) resume.mutate({ param: { id: activeSession.id } });
        break;
      case 'end-early-focus':
        setShowEndEarly(true);
        break;
      case 'save-focus':
        if (activeSession) complete.mutate({ param: { id: activeSession.id } });
        break;
      case 'discard-focus':
        setShowDiscard(true);
        break;
      case 'sign-out':
        setLogoutDialogOpen(true);
        break;
    }
  };

  const handleItemSelect = (item: CommandMenuItem) => {
    setSelectedItem(item);
    setActionsOpen(true);
  };

  const handleAction = (
    action: string,
    item: CommandMenuItem,
    extra?: unknown
  ) => {
    switch (action) {
      case 'toggle':
        if (item.type === 'todo') {
          toggleTask.mutate({ param: { id: item.data.id } });
        }
        break;
      case 'edit':
        if (item.type === 'todo') setEditingTask(item.data);
        if (item.type === 'habit') setEditingHabitId(item.data.id);
        if (item.type === 'session') setEditingSession(item.data);
        break;
      case 'delete':
        if (item.type === 'todo') setDeletingTask(item.data);
        if (item.type === 'habit') setDeletingHabitId(item.data.id);
        if (item.type === 'session') setDeletingSession(item.data);
        break;
      case 'toggle-date':
        break;
    }
    reset();
  };

  const handleCloseActions = () => {
    setActionsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Command
        className="bg-transparent **:data-[slot=command-input-wrapper]:flex-1 **:data-[slot=command-input-wrapper]:border-0 **:data-[slot=command-input-wrapper]:px-0"
        shouldFilter={true}
        value={selectedValue}
        onValueChange={setSelectedValue}
      >
        <PopoverAnchor asChild>
          <div className="flex w-full items-center">
            <CommandInput
              ref={inputRef}
              placeholder="Search for items and commands..."
              onFocus={() => setOpen(true)}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <Kbd>⌘K</Kbd>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="dark:bg-popover/70 bg-popover/50 w-(--radix-popover-trigger-width) p-0 shadow-lg backdrop-blur-xl backdrop-saturate-150"
          align="start"
          sideOffset={20}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <CommandList ref={listRef} className="max-h-80">
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.href}
                  value={[page.name, ...(page.searchWords ?? [])].join(' ')}
                  onSelect={() => handleSelect(() => router.push(page.href))}
                >
                  <page.icon className="size-3.5" />
                  <span>{page.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            {focusCommands.length > 0 && (
              <CommandGroup heading="Focus">
                {focusCommands.map((command) => (
                  <CommandItem
                    key={command.action}
                    value={[command.name, ...(command.searchWords ?? [])].join(
                      ' '
                    )}
                    onSelect={() =>
                      handleSelect(() => handleCommandAction(command.action))
                    }
                    className={command.destructive ? 'text-destructive!' : ''}
                  >
                    <command.icon
                      className={cn(
                        'size-3.5',
                        command.destructive && 'text-destructive!'
                      )}
                    />
                    <span>{command.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Create">
              {createCommands.map((command) => (
                <CommandItem
                  key={command.action}
                  value={[command.name, ...(command.searchWords ?? [])].join(
                    ' '
                  )}
                  onSelect={() =>
                    handleSelect(() => handleCommandAction(command.action))
                  }
                >
                  <command.icon className="size-3.5" />
                  <span>{command.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {tasks.length > 0 && (
              <CommandGroup heading="Todos">
                {tasks.slice(0, ITEM_LIMIT).map((task) => (
                  <CommandItem
                    key={`todo:${task.id}`}
                    value={`todo ${task.title}`}
                    onSelect={() =>
                      handleItemSelect({ type: 'todo', data: task })
                    }
                  >
                    {task.completed ? (
                      <CheckCircle2Icon className="text-muted-foreground size-3.5" />
                    ) : (
                      <CircleIcon className="size-3.5" />
                    )}
                    <span
                      className={
                        task.completed
                          ? 'text-muted-foreground line-through'
                          : ''
                      }
                    >
                      {task.title}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {habits.length > 0 && (
              <CommandGroup heading="Habits">
                {habits.slice(0, ITEM_LIMIT).map((habit) => (
                  <CommandItem
                    key={`habit:${habit.id}`}
                    value={`habit ${habit.title}`}
                    onSelect={() =>
                      handleItemSelect({ type: 'habit', data: habit })
                    }
                  >
                    <TimerIcon className="size-3.5" />
                    <span>{habit.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentSessions.length > 0 && (
              <CommandGroup heading="Recent Sessions">
                {recentSessions.slice(0, ITEM_LIMIT).map((session) => (
                  <CommandItem
                    key={`session:${session.id}`}
                    value={`session ${session.task || 'Focus session'}`}
                    onSelect={() =>
                      handleItemSelect({ type: 'session', data: session })
                    }
                  >
                    <ClockPlusIcon className="size-3.5" />
                    <span>{session.task || 'Focus session'}</span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {session.durationMinutes}m
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            <CommandGroup heading="Theme">
              {themes.map((theme) => (
                <CommandItem
                  key={theme.value}
                  value={[
                    'theme',
                    theme.name,
                    ...(theme.searchWords ?? []),
                  ].join(' ')}
                  onSelect={() => handleSelect(() => setTheme(theme.value))}
                >
                  <theme.icon className="size-3.5" />
                  <span>{theme.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Account">
              {accountActions.map((action) => (
                <CommandItem
                  key={action.action}
                  value={[action.name, ...(action.searchWords ?? [])].join(' ')}
                  onSelect={() =>
                    handleSelect(() => handleCommandAction(action.action))
                  }
                  className={action.destructive ? 'text-destructive!' : ''}
                >
                  <action.icon
                    className={cn(
                      'size-3.5',
                      action.destructive && 'text-destructive!'
                    )}
                  />
                  <span>{action.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {selectedItem && (
            <div className="relative border-t px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground truncate text-xs">
                  {getItemTitle(selectedItem)}
                </span>
                <button
                  onClick={() => setActionsOpen((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs"
                >
                  <span>Actions</span>
                  <Kbd>⌘O</Kbd>
                </button>
              </div>
              {actionsOpen && (
                <div className="absolute right-1.5 bottom-full z-50 mb-2">
                  <CommandMenuActions
                    item={selectedItem}
                    onAction={handleAction}
                    onClose={handleCloseActions}
                  />
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Command>
    </Popover>
  );
}
