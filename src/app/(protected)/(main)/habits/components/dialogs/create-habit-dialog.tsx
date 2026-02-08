'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAtom } from 'jotai';
import { createDialogOpenAtom } from '../../atoms/dialog-atoms';
import { useCreateHabit } from '../../hooks/mutations/use-create-habit';
import { useHabitForm } from '../../hooks/use-habit-form';

export const CreateHabitDialog = () => {
  const [open, setOpen] = useAtom(createDialogOpenAtom);
  const form = useHabitForm();
  const createHabit = useCreateHabit();

  const handleCreate = () => {
    if (!form.title.trim()) return;

    createHabit.mutate(
      {
        json: form.getFormData(),
      },
      {
        onSuccess: () => {
          form.reset();
          setOpen(false);
        },
      }
    );
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && form.title.trim() && !createHabit.isPending) {
      e.preventDefault();
      handleCreate();
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create New Habit</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Add a new habit to track daily.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Morning meditation"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
              placeholder="e.g., 10 minutes of mindfulness"
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => form.setCategory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., wellness, health, learning"
              maxLength={50}
            />
          </div>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createHabit.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!form.title.trim() || createHabit.isPending}
            isLoading={createHabit.isPending}
            loadingContent="Creating..."
          >
            Create Habit
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
