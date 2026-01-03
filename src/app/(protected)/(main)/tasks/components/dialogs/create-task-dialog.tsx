'use client';

import { useSettings } from '@/app/(protected)/(main)/settings/hooks/queries/use-settings';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { createTaskDialogAtom } from '../../atoms/task-dialogs';
import { PRIORITY_OPTIONS } from '../../constants';
import { useCreateTask } from '../../hooks/mutations/use-create-task';
import { useProjects } from '../../hooks/queries/use-projects';
import { useExistingTags } from '../../hooks/use-existing-tags';
import { ProjectSelect } from '../project-select';
import { TagInput } from './tag-input';

export const CreateTaskDialog = () => {
  const [open, setOpen] = useAtom(createTaskDialogAtom);
  const { data: settings } = useSettings();
  const createTask = useCreateTask();
  const { data: projects = [] } = useProjects();
  const existingTags = useExistingTags();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<string>(
    settings?.defaultTaskPriority ?? 'MEDIUM'
  );
  const [projectId, setProjectId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open && settings?.defaultTaskPriority) {
      setPriority(settings.defaultTaskPriority);
    }
  }, [open, settings]);

  const resetForm = () => {
    setTitle('');
    setDueDate(undefined);
    setPriority(settings?.defaultTaskPriority ?? 'MEDIUM');
    setProjectId('');
    setTags([]);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const normalizedDueDate = dueDate
      ? new Date(
          Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
        ).toISOString()
      : undefined;

    createTask.mutate(
      {
        json: {
          title: title.trim(),
          dueDate: normalizedDueDate,
          priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
          projectId: projectId || undefined,
          tags,
        },
      },
      {
        onSuccess: handleClose,
      }
    );
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker
                date={dueDate}
                setDate={setDueDate}
                triggerClassName="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <ProjectSelect
              id="project"
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
              disabled={createTask.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createTask.isPending}
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
