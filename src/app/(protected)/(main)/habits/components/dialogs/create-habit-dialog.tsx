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
import { useState } from 'react';
import { createDialogOpenAtom } from '../../atoms/dialog-atoms';
import { useCreateHabit } from '../../hooks/mutations/use-create-habit';

export const CreateHabitDialog = () => {
  const [open, setOpen] = useAtom(createDialogOpenAtom);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const createHabit = useCreateHabit();

  const handleCreate = () => {
    if (!title.trim()) return;

    createHabit.mutate(
      {
        json: {
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setCategory('');
          setOpen(false);
        },
      }
    );
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create New Habit</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Add a new habit to track daily.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning meditation"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 10 minutes of mindfulness"
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., wellness, health, learning"
              maxLength={50}
            />
          </div>
        </div>
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
            disabled={!title.trim() || createHabit.isPending}
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
