'use client';

import { useSetAtom } from 'jotai';
import { editingHabitAtom } from '../atoms/dialog-atoms';
import { useDeleteHabit } from './mutations/use-delete-habit';
import { useToggleHabit } from './mutations/use-toggle-habit';
import type { Habit } from './types';

export function useHabitActions(habitId?: string) {
  const setEditingHabit = useSetAtom(editingHabitAtom);
  const { toggleToday, toggleDate } = useToggleHabit(habitId);
  const deleteHabit = useDeleteHabit();

  function handleToggle(id: string) {
    toggleToday.mutate({ param: { id } });
  }

  function handleToggleDate(id: string, date: Date) {
    const utcDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
    toggleDate.mutate({
      param: { id },
      json: { date: utcDate.toISOString() },
    });
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
  }

  function handleDelete(habit: Habit) {
    deleteHabit.mutate({ param: { id: habit.id } });
  }

  return {
    handleToggle,
    handleToggleDate,
    handleEdit,
    handleDelete,
    isToggling: toggleToday.isPending || toggleDate.isPending,
  };
}
