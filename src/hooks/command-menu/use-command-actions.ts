import {
  deletingSessionAtom,
  editingSessionAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
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
import { useCallback } from 'react';

export function useCommandActions() {
  const setEditingTask = useSetAtom(editingTaskAtom);
  const setDeletingTask = useSetAtom(deletingTaskAtom);
  const setEditingHabitId = useSetAtom(editingHabitIdAtom);
  const setDeletingHabitId = useSetAtom(deletingHabitIdAtom);
  const setEditingSession = useSetAtom(editingSessionAtom);
  const setDeletingSession = useSetAtom(deletingSessionAtom);

  const toggleTask = useToggleTask();
  const toggleHabit = useToggleHabit();

  const handleAction = useCallback(
    (action: string, item: CommandMenuItem) => {
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
