'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { editingSessionAtom } from '../../atoms/session-dialogs';
import { MAX_DURATION, MIN_DURATION } from '../../constants';
import { useEditSession } from '../../hooks/mutations/use-edit-session';

export const FocusSessionEditDialog = () => {
  const [session, setSession] = useAtom(editingSessionAtom);
  const editSession = useEditSession();
  const [task, setTask] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  useEffect(() => {
    if (session) {
      setTask(session.task || '');
      setDurationMinutes(session.durationMinutes.toString());
    }
  }, [session]);

  const handleSave = () => {
    if (!session) return;

    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration < MIN_DURATION || duration > MAX_DURATION)
      return;

    editSession.mutate(
      {
        param: { id: session.id },
        json: {
          task: task || undefined,
          durationMinutes: duration,
        },
      },
      {
        onSuccess: () => setSession(null),
      }
    );
  };

  return (
    <ResponsiveDialog
      open={!!session}
      onOpenChange={(open) => !open && setSession(null)}
    >
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Session</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Update the session details below.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              placeholder="What were you working on?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={MIN_DURATION}
              max={MAX_DURATION}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline" disabled={editSession.isPending}>
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button
            onClick={handleSave}
            disabled={editSession.isPending || durationMinutes.length === 0}
            isLoading={editSession.isPending}
            loadingContent="Saving..."
          >
            Save Changes
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
