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
import { editingSessionAtom } from '../../atoms/session-dialogs';
import { MAX_DURATION, MIN_DURATION } from '../../constants';
import { useEditSession } from '../../hooks/mutations/use-edit-session';
import { useSessionForm } from '../../hooks/use-session-form';

export const FocusSessionEditDialog = () => {
  const [session, setSession] = useAtom(editingSessionAtom);
  const editSession = useEditSession();
  const { task, setTask, durationMinutes, setDurationMinutes, getFormData } =
    useSessionForm({
      task: session?.task ?? '',
      durationMinutes: session?.durationMinutes.toString() ?? '',
    });

  const handleSave = () => {
    if (!session) return;

    const formData = getFormData();
    if (!formData.durationMinutes) return;

    editSession.mutate(
      {
        param: { id: session.id },
        json: {
          task: formData.task,
          durationMinutes: formData.durationMinutes,
        },
      },
      {
        onSuccess: () => setSession(null),
      }
    );
  };

  function handleKeyDown(e: React.KeyboardEvent) {
    if (
      e.key === 'Enter' &&
      durationMinutes.length > 0 &&
      !editSession.isPending
    ) {
      e.preventDefault();
      handleSave();
    }
  }

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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}
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
