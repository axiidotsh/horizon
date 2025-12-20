'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { MAX_DURATION, MIN_DURATION } from '../../constants';
import { useEditSession } from '../../hooks/mutations/use-edit-session';
import type { FocusSession } from '../../hooks/types';

interface SessionEditDialogProps {
  session: FocusSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionEditDialog = ({
  session,
  open,
  onOpenChange,
}: SessionEditDialogProps) => {
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
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>
            Update the session details below.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={editSession.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={editSession.isPending || durationMinutes.length === 0}
            isLoading={editSession.isPending}
            loadingContent="Saving..."
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
