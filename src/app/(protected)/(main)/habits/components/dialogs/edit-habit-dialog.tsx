'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { editingHabitIdAtom } from '../../atoms/dialog-atoms';
import { useUpdateHabit } from '../../hooks/mutations/use-update-habit';
import { useHabits } from '../../hooks/queries/use-habits';
import { enrichHabitsWithMetrics } from '../../utils/habit-calculations';

export const EditHabitDialog = () => {
  const [editingHabitId, setEditingHabitId] = useAtom(editingHabitIdAtom);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const { data: rawHabits = [] } = useHabits(7);
  const habits = useMemo(() => enrichHabitsWithMetrics(rawHabits), [rawHabits]);
  const habit = habits.find((h) => h.id === editingHabitId) || null;

  const updateHabit = useUpdateHabit();

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setCategory(habit.category || '');
    }
  }, [habit]);

  const handleSave = () => {
    if (!habit || !title.trim()) return;

    updateHabit.mutate(
      {
        param: { id: habit.id },
        json: {
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingHabitId(null);
        },
      }
    );
  };

  return (
    <ResponsiveDialog
      open={!!editingHabitId}
      onOpenChange={(open) => !open && setEditingHabitId(null)}
    >
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Habit</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Update your habit details.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category (optional)</Label>
            <Input
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={50}
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditingHabitId(null)}
            disabled={updateHabit.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || updateHabit.isPending}
            isLoading={updateHabit.isPending}
            loadingContent="Saving..."
          >
            Save Changes
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
