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

  function handleToggle(
    id: string,
    options?: Parameters<typeof toggleToday.mutate>[1]
  ) {
    toggleToday.mutate({ param: { id } }, options);
  }

  function handleToggleDate(
    id: string,
    date: Date,
    options?: Parameters<typeof toggleDate.mutate>[1]
  ) {
    const utcDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
    toggleDate.mutate(
      {
        param: { id },
        json: { date: utcDate.toISOString() },
      },
      options
    );
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
  }

  function handleDelete(
    habit: Habit,
    options?: Parameters<typeof deleteHabit.mutate>[1]
  ) {
    deleteHabit.mutate({ param: { id: habit.id } }, options);
  }

  return {
    handleToggle,
    handleToggleDate,
    handleEdit,
    handleDelete,
    isToggling: toggleToday.isPending || toggleDate.isPending,
    isDeleting: deleteHabit.isPending,
  };
}
