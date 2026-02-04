'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { editingTaskAtom } from '../../atoms/task-dialogs';
import { useUpdateTask } from '../../hooks/mutations/use-update-task';
import { useProjects } from '../../hooks/queries/use-projects';
import { useTaskTags } from '../../hooks/queries/use-task-tags';
import { useTaskForm } from '../../hooks/use-task-form';
import { PrioritySelect } from '../priority-select';
import { ProjectSelect } from '../project-select';
import { TagInput } from './tag-input';

export const EditTaskDialog = () => {
  const [task, setTask] = useAtom(editingTaskAtom);
  const form = useTaskForm();

  const updateTask = useUpdateTask();
  const { data: projects = [] } = useProjects();
  const { data: existingTags = [] } = useTaskTags();

  useEffect(() => {
    if (task) {
      form.setTitle(task.title);
      form.setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      form.setPriority(task.priority);
      form.setProjectId(task.projectId ?? '');
      form.setTags(task.tags ?? []);
    }
  }, [task?.id]);

  const handleClose = () => {
    setTask(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !form.title.trim()) return;

    const formData = form.getFormData();

    updateTask.mutate(
      {
        param: { id: task.id },
        json: {
          ...formData,
          dueDate: formData.dueDate ?? null,
          projectId: formData.projectId || null,
        },
      },
      {
        onSuccess: handleClose,
      }
    );
  };

  return (
    <ResponsiveDialog
      open={!!task}
      onOpenChange={(open) => !open && handleClose()}
    >
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Task</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="Task title..."
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker
                date={form.dueDate}
                setDate={form.setDueDate}
                triggerClassName="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <PrioritySelect
                id="edit-priority"
                value={form.priority}
                onValueChange={form.setPriority}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-project">Project</Label>
            <ProjectSelect
              id="edit-project"
              projects={projects}
              value={form.projectId}
              onValueChange={form.setProjectId}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              tags={form.tags}
              onChange={form.setTags}
              suggestions={existingTags}
            />
          </div>
          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateTask.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.title.trim() || updateTask.isPending}
              isLoading={updateTask.isPending}
              loadingContent="Saving..."
            >
              Save
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
