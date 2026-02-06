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
import { createTaskDialogAtom } from '../../atoms/task-dialogs';
import { useCreateTask } from '../../hooks/mutations/use-create-task';
import { useProjects } from '../../hooks/queries/use-projects';
import { useTaskTags } from '../../hooks/queries/use-task-tags';
import { useTaskForm } from '../../hooks/use-task-form';
import { PrioritySelect } from '../priority-select';
import { ProjectSelect } from '../project-select';
import { TagInput } from './tag-input';

export const CreateTaskDialog = () => {
  const [dialogState, setDialogState] = useAtom(createTaskDialogAtom);
  const open = !!dialogState;

  const createTask = useCreateTask();
  const form = useTaskForm();
  const { data: projects = [] } = useProjects();
  const { data: existingTags = [] } = useTaskTags();

  useEffect(() => {
    if (typeof dialogState === 'object') {
      form.setPriority(dialogState.priority);
    }
  }, [dialogState, form.setPriority]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDialogState(false);
      form.reset();
    }
    setDialogState(open);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    createTask.mutate(
      {
        json: form.getFormData(),
      },
      {
        onSuccess: () => handleOpenChange(false),
      }
    );
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create Task</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title..."
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker
                date={form.dueDate}
                setDate={form.setDueDate}
                triggerClassName="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <PrioritySelect
                id="priority"
                value={form.priority}
                onValueChange={form.setPriority}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <ProjectSelect
              id="project"
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
              onClick={() => handleOpenChange(false)}
              disabled={createTask.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.title.trim() || createTask.isPending}
              isLoading={createTask.isPending}
              loadingContent="Creating..."
            >
              Create
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
