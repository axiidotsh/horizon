import {
  cancelingSessionAtom,
  discardingSessionAtom,
  endingEarlySessionAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
import { createDialogOpenAtom } from '@/app/(protected)/(main)/habits/atoms/dialog-atoms';
import { useUpdateSettings } from '@/app/(protected)/(main)/settings/hooks/mutations/use-update-settings';
import {
  bulkAddTasksSheetAtom,
  createProjectDialogAtom,
  createTaskDialogAtom,
} from '@/app/(protected)/(main)/tasks/atoms/task-dialogs';
import { logoutDialogOpenAtom } from '@/atoms/ui-atoms';
import {
  ACCOUNT_ACTIONS,
  CREATE_COMMANDS,
  PAGES,
  POSITIONS,
  THEMES,
} from '@/config/commands';
import type { CommandDefinition } from '@/hooks/command-menu/types';
import { calculateRemainingSeconds } from '@/utils/timer';
import { useSetAtom } from 'jotai';
import { PauseIcon, PlayIcon, SaveIcon, SquareIcon, XIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export function useCommandRegistry() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: activeSession } = useActiveSession();
  const { pause, resume, complete } = useFocusSession();
  const { mutate: updateSettings } = useUpdateSettings();

  const setCreateTaskDialogOpen = useSetAtom(createTaskDialogAtom);
  const setBulkAddTasksSheetOpen = useSetAtom(bulkAddTasksSheetAtom);
  const setCreateProjectDialogOpen = useSetAtom(createProjectDialogAtom);
  const setCreateHabitDialogOpen = useSetAtom(createDialogOpenAtom);
  const setLogoutDialogOpen = useSetAtom(logoutDialogOpenAtom);
  const setCancelingSession = useSetAtom(cancelingSessionAtom);
  const setEndingEarlySession = useSetAtom(endingEarlySessionAtom);
  const setDiscardingSession = useSetAtom(discardingSessionAtom);

  const focusCommands = useMemo(() => {
    const commands: CommandDefinition[] = [];

    if (!activeSession) return commands;

    const remainingSeconds = calculateRemainingSeconds(
      activeSession.startedAt,
      activeSession.durationMinutes,
      activeSession.totalPausedSeconds,
      activeSession.pausedAt
    );
    const isDurationCompleted = remainingSeconds <= 0;

    if (isDurationCompleted) {
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
          handler: () => setDiscardingSession(activeSession),
        }
      );
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
          handler: () => setEndingEarlySession(activeSession),
        },
        {
          id: 'focus-cancel',
          name: 'Cancel focus session',
          icon: XIcon,
          keywords: ['discard', 'delete', 'remove', 'abort'],
          destructive: true,
          category: 'focus',
          handler: () => setCancelingSession(activeSession),
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
          handler: () => setEndingEarlySession(activeSession),
        },
        {
          id: 'focus-cancel',
          name: 'Cancel focus session',
          icon: XIcon,
          keywords: ['discard', 'delete', 'remove', 'abort'],
          destructive: true,
          category: 'focus',
          handler: () => setCancelingSession(activeSession),
        }
      );
    }

    return commands;
  }, [
    activeSession,
    pause,
    resume,
    complete,
    setCancelingSession,
    setEndingEarlySession,
    setDiscardingSession,
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
            case 'bulk-add-tasks':
              setBulkAddTasksSheetOpen(true);
              break;
            case 'add-project':
              setCreateProjectDialogOpen(true);
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
          updateSettings({
            json: { commandMenuPosition: position.value },
          }),
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
      updateSettings,
      setCreateTaskDialogOpen,
      setBulkAddTasksSheetOpen,
      setCreateProjectDialogOpen,
      setCreateHabitDialogOpen,
      setLogoutDialogOpen,
    ]
  );
}
