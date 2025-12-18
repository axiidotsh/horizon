'use client';

import {
  createDialogOpenAtom,
  deletingHabitIdAtom,
  editingHabitIdAtom,
} from '@/app/(protected)/(main)/habits/atoms/dialog-atoms';
import { CreateHabitDialog } from '@/app/(protected)/(main)/habits/components/dialogs/create-habit-dialog';
import { DeleteHabitDialog } from '@/app/(protected)/(main)/habits/components/dialogs/delete-habit-dialog';
import { EditHabitDialog } from '@/app/(protected)/(main)/habits/components/dialogs/edit-habit-dialog';
import { useHabits } from '@/app/(protected)/(main)/habits/hooks/queries/use-habits';
import { enrichHabitsWithMetrics } from '@/app/(protected)/(main)/habits/utils/habit-calculations';
import { useAtom } from 'jotai';
import { useMemo } from 'react';

export function HabitDialogs() {
  const [createDialogOpen, setCreateDialogOpen] = useAtom(createDialogOpenAtom);
  const [editingHabitId, setEditingHabitId] = useAtom(editingHabitIdAtom);
  const [deletingHabitId, setDeletingHabitId] = useAtom(deletingHabitIdAtom);

  const { data: rawHabits = [] } = useHabits(7);

  const habits = useMemo(() => enrichHabitsWithMetrics(rawHabits), [rawHabits]);

  const editingHabit = habits.find((h) => h.id === editingHabitId) || null;
  const deletingHabit = habits.find((h) => h.id === deletingHabitId) || null;

  return (
    <>
      <CreateHabitDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditHabitDialog
        habit={editingHabit}
        open={!!editingHabitId}
        onOpenChange={(open) => !open && setEditingHabitId(null)}
      />
      <DeleteHabitDialog
        habit={deletingHabit}
        open={!!deletingHabitId}
        onOpenChange={(open) => !open && setDeletingHabitId(null)}
      />
    </>
  );
}
