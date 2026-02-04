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
import { useEffect } from 'react';
import { editingHabitIdAtom } from '../../atoms/dialog-atoms';
import { useUpdateHabit } from '../../hooks/mutations/use-update-habit';
import { useInfiniteHabits } from '../../hooks/queries/use-infinite-habits';
import { useHabitForm } from '../../hooks/use-habit-form';

export const EditHabitDialog = () => {
  const [editingHabitId, setEditingHabitId] = useAtom(editingHabitIdAtom);
  const form = useHabitForm();

  const { habits } = useInfiniteHabits({ days: 7 });
  const habit = habits.find((h) => h.id === editingHabitId) || null;

  const updateHabit = useUpdateHabit();

  useEffect(() => {
    if (habit) {
      form.setTitle(habit.title);
      form.setDescription(habit.description || '');
      form.setCategory(habit.category || '');
    }
  }, [habit?.id]);

  const handleSave = () => {
    if (!habit || !form.title.trim()) return;

    updateHabit.mutate(
      {
        param: { id: habit.id },
        json: form.getFormData(),
      },
      {
        onSuccess: () => {
          setEditingHabitId(null);
        },
      }
    );
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && form.title.trim() && !updateHabit.isPending) {
      e.preventDefault();
      handleSave();
    }
  }

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
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category (optional)</Label>
            <Input
              id="edit-category"
              value={form.category}
              onChange={(e) => form.setCategory(e.target.value)}
              onKeyDown={handleKeyDown}
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
            disabled={!form.title.trim() || updateHabit.isPending}
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
