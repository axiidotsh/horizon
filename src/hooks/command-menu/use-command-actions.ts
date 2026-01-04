import {
  createCustomSessionAtom,
  customDurationSettingsDialogAtom,
  deletingSessionAtom,
  editingSessionAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import {
  deletingHabitIdAtom,
  editingHabitIdAtom,
} from '@/app/(protected)/(main)/habits/atoms/dialog-atoms';
import { useToggleHabit } from '@/app/(protected)/(main)/habits/hooks/mutations/use-toggle-habit';
import { useUpdateSettings } from '@/app/(protected)/(main)/settings/hooks/mutations/use-update-settings';
import {
  deletingTaskAtom,
  editingTaskAtom,
} from '@/app/(protected)/(main)/tasks/atoms/task-dialogs';
import { useToggleTask } from '@/app/(protected)/(main)/tasks/hooks/mutations/use-toggle-task';
import type { CommandMenuItem } from '@/hooks/command-menu/types';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { toast } from 'sonner';

export function useCommandActions() {
  const setEditingTask = useSetAtom(editingTaskAtom);
  const setDeletingTask = useSetAtom(deletingTaskAtom);
  const setEditingHabitId = useSetAtom(editingHabitIdAtom);
  const setDeletingHabitId = useSetAtom(deletingHabitIdAtom);
  const setEditingSession = useSetAtom(editingSessionAtom);
  const setDeletingSession = useSetAtom(deletingSessionAtom);
  const setCreateCustomSession = useSetAtom(createCustomSessionAtom);
  const setCustomDurationSettingsDialogOpen = useSetAtom(
    customDurationSettingsDialogAtom
  );

  const toggleTask = useToggleTask();
  const toggleHabit = useToggleHabit();
  const { start } = useFocusSession();
  const { mutate: updateSettings } = useUpdateSettings();

  const handleAction = useCallback(
    (action: string, item: CommandMenuItem) => {
      if (item.type === 'focus-start') {
        if (action === 'custom') {
          setCreateCustomSession(true);
        } else if (action.startsWith('start-')) {
          const duration = parseInt(action.replace('start-', ''), 10);
          start.mutate({ json: { durationMinutes: duration } });
        }
        return;
      }

      if (item.type === 'focus-duration') {
        if (action === 'duration-custom') {
          setCustomDurationSettingsDialogOpen(true);
        } else if (action.startsWith('duration-')) {
          const duration = parseInt(action.replace('duration-', ''), 10);
          updateSettings({
            json: { defaultFocusDuration: duration },
          });
          const displayValue =
            duration >= 60
              ? `${duration / 60} hour${duration > 60 ? 's' : ''}`
              : `${duration} minutes`;
          toast.success(`Default focus duration set to ${displayValue}`);
        }
        return;
      }

      if (item.type === 'task-priority') {
        if (action.startsWith('priority-')) {
          const priority = action.replace('priority-', '') as
            | 'LOW'
            | 'MEDIUM'
            | 'HIGH';
          updateSettings({
            json: { defaultTaskPriority: priority },
          });
          toast.success(
            `Default task priority set to ${priority.toLowerCase()}`
          );
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
      setCustomDurationSettingsDialogOpen,
      updateSettings,
      start,
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
