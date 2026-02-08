'use client';

import { useSettings } from '@/app/(protected)/(main)/settings/hooks/queries/use-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { createCustomSessionAtom } from '../../atoms/session-dialogs';
import { MAX_DURATION, MIN_DURATION } from '../../constants';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';

export const FocusSessionCreateDialog = () => {
  const [open, setOpen] = useAtom(createCustomSessionAtom);
  const { data: settings } = useSettings();
  const { start } = useFocusSession();
  const [task, setTask] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  useEffect(() => {
    if (settings?.defaultFocusDuration) {
      setDurationMinutes(settings.defaultFocusDuration.toString());
    }
  }, [settings?.defaultFocusDuration]);

  function handleCreate() {
    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration < MIN_DURATION || duration > MAX_DURATION)
      return;

    start.mutate(
      {
        json: {
          task: task || undefined,
          durationMinutes: duration,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && durationMinutes.length > 0 && !start.isPending) {
      e.preventDefault();
      handleCreate();
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setTask('');
    }
    setOpen(open);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Start Custom Focus Session
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Set a custom duration and task name for your focus session.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              placeholder="x"
              inputMode="numeric"
              type="number"
              min={MIN_DURATION}
              max={MAX_DURATION}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task">Task (optional)</Label>
            <Input
              id="task"
              placeholder="What will you work on?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline" disabled={start.isPending}>
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button
            onClick={handleCreate}
            disabled={start.isPending || durationMinutes.length === 0}
            isLoading={start.isPending}
            loadingContent="Starting..."
          >
            Start Session
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
