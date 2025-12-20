import {
  showDiscardDialogAtom,
  showEndEarlyDialogAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
import { createDialogOpenAtom } from '@/app/(protected)/(main)/habits/atoms/dialog-atoms';
import { createTaskDialogAtom } from '@/app/(protected)/(main)/tasks/atoms/task-dialogs';
import { settingsAtom } from '@/atoms/settings-atoms';
import { logoutDialogOpenAtom } from '@/atoms/ui-atoms';
import {
  ACCOUNT_ACTIONS,
  CREATE_COMMANDS,
  PAGES,
  POSITIONS,
  THEMES,
} from '@/config/commands';
import type { CommandDefinition } from '@/hooks/command-menu/types';
import { useSetAtom } from 'jotai';
import { PauseIcon, PlayIcon, SaveIcon, SquareIcon, XIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export function useCommandRegistry() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: activeSession } = useActiveSession();
  const { start, pause, resume, complete } = useFocusSession();

  const setCreateTaskDialogOpen = useSetAtom(createTaskDialogAtom);
  const setCreateHabitDialogOpen = useSetAtom(createDialogOpenAtom);
  const setLogoutDialogOpen = useSetAtom(logoutDialogOpenAtom);
  const setShowEndEarly = useSetAtom(showEndEarlyDialogAtom);
  const setShowDiscard = useSetAtom(showDiscardDialogAtom);
  const setSettings = useSetAtom(settingsAtom);

  const focusCommands = useMemo(() => {
    const commands: CommandDefinition[] = [];

    if (!activeSession) {
      commands.push({
        id: 'focus-start',
        name: 'Start focus session',
        icon: PlayIcon,
        keywords: ['begin', 'timer', 'pomodoro', 'work'],
        category: 'focus',
        handler: () => {
          start.mutate({ json: { durationMinutes: 45 } });
          router.push('/focus');
        },
      });
    } else if (activeSession.status === 'ACTIVE') {
      commands.push(
        {
          id: 'focus-pause',
          name: 'Pause focus session',
          icon: PauseIcon,
          keywords: ['stop', 'break', 'timer'],
          category: 'focus',
          handler: () => pause.mutate({ param: { id: activeSession.id } }),
        },
        {
          id: 'focus-end-early',
          name: 'End focus session early',
          icon: SquareIcon,
          keywords: ['stop', 'finish', 'save'],
          category: 'focus',
          handler: () => setShowEndEarly(true),
        }
      );
    } else if (activeSession.status === 'PAUSED') {
      commands.push(
        {
          id: 'focus-resume',
          name: 'Resume focus session',
          icon: PlayIcon,
          keywords: ['continue', 'start', 'timer'],
          category: 'focus',
          handler: () => resume.mutate({ param: { id: activeSession.id } }),
        },
        {
          id: 'focus-end-early',
          name: 'End focus session early',
          icon: SquareIcon,
          keywords: ['stop', 'finish', 'save'],
          category: 'focus',
          handler: () => setShowEndEarly(true),
        }
      );
    } else if (activeSession.status === 'COMPLETED') {
      commands.push(
        {
          id: 'focus-save',
          name: 'Save focus session',
          icon: SaveIcon,
          keywords: ['complete', 'finish', 'done'],
          category: 'focus',
          handler: () => complete.mutate({ param: { id: activeSession.id } }),
        },
        {
          id: 'focus-discard',
          name: 'Discard focus session',
          icon: XIcon,
          keywords: ['cancel', 'delete', 'remove'],
          destructive: true,
          category: 'focus',
          handler: () => setShowDiscard(true),
        }
      );
    }

    return commands;
  }, [
    activeSession,
    start,
    pause,
    resume,
    complete,
    setShowEndEarly,
    setShowDiscard,
    router,
  ]);

  return useMemo<CommandDefinition[]>(
    () => [
      ...PAGES.map((page) => ({
        id: `page-${page.href}`,
        name: page.name,
        icon: page.icon,
        keywords: page.searchWords,
        category: 'page' as const,
        handler: () => router.push(page.href),
      })),
      ...focusCommands,
      ...CREATE_COMMANDS.map((cmd) => ({
        id: cmd.action,
        name: cmd.name,
        icon: cmd.icon,
        keywords: cmd.searchWords,
        category: 'create' as const,
        handler: () => {
          switch (cmd.action) {
            case 'add-task':
              setCreateTaskDialogOpen(true);
              break;
            case 'add-habit':
              setCreateHabitDialogOpen(true);
              break;
            case 'new-chat':
              router.push('/chat');
              break;
          }
        },
      })),
      ...THEMES.map((theme) => ({
        id: `theme-${theme.value}`,
        name: theme.name,
        icon: theme.icon,
        keywords: ['theme', ...(theme.searchWords || [])],
        category: 'theme' as const,
        handler: () => setTheme(theme.value),
      })),
      ...POSITIONS.map((position) => ({
        id: `position-${position.value}`,
        name: position.name,
        icon: position.icon,
        keywords: ['position', 'command menu', ...(position.searchWords || [])],
        category: 'position' as const,
        handler: () =>
          setSettings((prev) => ({
            ...prev,
            commandMenuPosition: position.value,
          })),
      })),
      ...ACCOUNT_ACTIONS.map((action) => ({
        id: action.action,
        name: action.name,
        icon: action.icon,
        keywords: action.searchWords,
        destructive: action.destructive,
        category: 'account' as const,
        handler: () => {
          if (action.action === 'sign-out') {
            setLogoutDialogOpen(true);
          }
        },
      })),
    ],
    [
      router,
      focusCommands,
      setTheme,
      setSettings,
      setCreateTaskDialogOpen,
      setCreateHabitDialogOpen,
      setLogoutDialogOpen,
    ]
  );
}
