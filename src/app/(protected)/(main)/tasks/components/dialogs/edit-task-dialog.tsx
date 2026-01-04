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
import { useEffect, useState } from 'react';
import { editingTaskAtom } from '../../atoms/task-dialogs';
import { useUpdateTask } from '../../hooks/mutations/use-update-task';
import { useProjects } from '../../hooks/queries/use-projects';
import type { Project } from '../../hooks/types';
import { useExistingTags } from '../../hooks/use-existing-tags';
import { PrioritySelect } from '../priority-select';
import { ProjectSelect } from '../project-select';
import { TagInput } from './tag-input';

export const EditTaskDialog = () => {
  const [task, setTask] = useAtom(editingTaskAtom);
  const updateTask = useUpdateTask();
  const { data: projects = [] } = useProjects() as {
    data: Project[] | undefined;
  };
  const existingTags = useExistingTags();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<string>('NO_PRIORITY');
  const [projectId, setProjectId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setPriority(task.priority);
      setProjectId(task.projectId ?? '');
      setTags(task.tags ?? []);
    }
  }, [task]);

  const handleClose = () => {
    setTask(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;

    const normalizedDueDate = dueDate
      ? new Date(
          Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
        ).toISOString()
      : null;

    updateTask.mutate(
      {
        param: { id: task.id },
        json: {
          title: title.trim(),
          dueDate: normalizedDueDate,
          priority: priority as 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH',
          projectId: projectId || null,
          tags,
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker
                date={dueDate}
                setDate={setDueDate}
                triggerClassName="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <PrioritySelect
                id="edit-priority"
                value={priority}
                onValueChange={setPriority}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-project">Project</Label>
            <ProjectSelect
              id="edit-project"
              projects={projects}
              value={projectId}
              onValueChange={setProjectId}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onChange={setTags}
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
              disabled={!title.trim() || updateTask.isPending}
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
