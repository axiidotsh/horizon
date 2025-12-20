import {
  createCustomSessionAtom,
  deletingSessionAtom,
  editingSessionAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import {
  deletingHabitIdAtom,
  editingHabitIdAtom,
} from '@/app/(protected)/(main)/habits/atoms/dialog-atoms';
import { useToggleHabit } from '@/app/(protected)/(main)/habits/hooks/mutations/use-toggle-habit';
import {
  deletingTaskAtom,
  editingTaskAtom,
} from '@/app/(protected)/(main)/tasks/atoms/task-dialogs';
import { useToggleTask } from '@/app/(protected)/(main)/tasks/hooks/mutations/use-toggle-task';
import type { CommandMenuItem } from '@/hooks/command-menu/types';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useCommandActions() {
  const router = useRouter();
  const setEditingTask = useSetAtom(editingTaskAtom);
  const setDeletingTask = useSetAtom(deletingTaskAtom);
  const setEditingHabitId = useSetAtom(editingHabitIdAtom);
  const setDeletingHabitId = useSetAtom(deletingHabitIdAtom);
  const setEditingSession = useSetAtom(editingSessionAtom);
  const setDeletingSession = useSetAtom(deletingSessionAtom);
  const setCreateCustomSession = useSetAtom(createCustomSessionAtom);

  const toggleTask = useToggleTask();
  const toggleHabit = useToggleHabit();
  const { start } = useFocusSession();

  const handleAction = useCallback(
    (action: string, item: CommandMenuItem) => {
      if (item.type === 'focus-start') {
        if (action === 'custom') {
          setCreateCustomSession(true);
        } else if (action.startsWith('start-')) {
          const duration = parseInt(action.replace('start-', ''), 10);
          start.mutate({ json: { durationMinutes: duration } });
          router.push('/focus');
        }
        return;
      }

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
      }
    },
    [
      toggleTask,
      setEditingTask,
      setDeletingTask,
      setEditingHabitId,
      setDeletingHabitId,
      setEditingSession,
      setDeletingSession,
      setCreateCustomSession,
      start,
      router,
    ]
  );

  const handleDateToggle = useCallback(
    (item: CommandMenuItem, date: Date) => {
      if (item.type === 'habit') {
        toggleHabit.toggleDate.mutate({
          param: { id: item.data.id },
          json: { date: date.toISOString() },
        });
      }
    },
    [toggleHabit]
  );

  return {
    handleAction,
    handleDateToggle,
  };
}
