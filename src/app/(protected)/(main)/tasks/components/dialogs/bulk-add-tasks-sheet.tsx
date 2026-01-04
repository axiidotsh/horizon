'use client';

import { useSettings } from '@/app/(protected)/(main)/settings/hooks/queries/use-settings';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAtom } from 'jotai';
import { PlusIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { bulkAddTasksSheetAtom } from '../../atoms/task-dialogs';
import { PRIORITY_OPTIONS } from '../../constants';
import { useBulkCreateTasks } from '../../hooks/mutations/use-bulk-create-tasks';
import { useProjects } from '../../hooks/queries/use-projects';
import type { Project, TaskPriority } from '../../hooks/types';
import { useExistingTags } from '../../hooks/use-existing-tags';
import { TagBadge } from '../badges/tag-badge';
import { ProjectSelect } from '../project-select';
import { TagInput } from './tag-input';

interface PendingTask {
  id: string;
  title: string;
}

export const BulkAddTasksSheet = () => {
  const [open, setOpen] = useAtom(bulkAddTasksSheetAtom);
  const { data: settings } = useSettings();
  const bulkCreateTasks = useBulkCreateTasks();
  const { data: projects = [] } = useProjects() as {
    data: Project[] | undefined;
  };
  const existingTags = useExistingTags();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<string>(
    settings?.defaultTaskPriority ?? 'MEDIUM'
  );
  const [projectId, setProjectId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setPendingTasks([]);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const addTask = () => {
    if (!title.trim()) return;

    const newTask: PendingTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
    };

    setPendingTasks((prev) => [...prev, newTask]);
    setTitle('');
    inputRef.current?.focus();
  };

  const removeTask = (id: string) => {
    setPendingTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateTaskTitle = (id: string, newTitle: string) => {
    setPendingTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title: newTitle } : task))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  };

  const handleSaveAll = () => {
    if (pendingTasks.length === 0) return;

    const normalizedDueDate = dueDate
      ? new Date(
          Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
        ).toISOString()
      : undefined;

    bulkCreateTasks.mutate(
      {
        json: {
          tasks: pendingTasks.map((task) => ({ title: task.title })),
          dueDate: normalizedDueDate,
          priority: priority as TaskPriority,
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="flex w-full max-w-2xl! flex-col pb-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-6">
          <SheetTitle>Bulk Add Tasks</SheetTitle>
          <SheetDescription>
            Quickly add multiple tasks with shared settings
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-hidden px-6">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                ref={inputRef}
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              size="icon"
              onClick={addTask}
              disabled={!title.trim()}
              tooltip="Add task"
            >
              <PlusIcon />
            </Button>
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
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                tags={tags}
                onChange={setTags}
                suggestions={existingTags}
              />
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
          </div>
          <div className="-mx-6 flex flex-1 flex-col gap-3 overflow-hidden border-t px-6 pt-4">
            <div className="flex items-center gap-2">
              <Label>Tasks</Label>
              <TagBadge tag={pendingTasks.length.toString()} />
            </div>
            <ScrollArea className="-mx-6 flex-1 overflow-y-auto px-6">
              {pendingTasks.length === 0 ? (
                <div className="text-muted-foreground flex h-full items-center justify-center py-20 text-center text-sm">
                  No tasks added yet
                </div>
              ) : (
                pendingTasks.map((task, index) => (
                  <div key={task.id}>
                    <div className="hover:bg-accent group flex items-center gap-2 px-2.5 py-1 transition-colors">
                      <TextareaAutosize
                        value={task.title}
                        onChange={(e) =>
                          updateTaskTitle(task.id, e.target.value)
                        }
                        className="flex-1 resize-none text-sm outline-none"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTask(task.id)}
                        className="size-7"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                    {index < pendingTasks.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex gap-2 border-t px-6 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={bulkCreateTasks.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={pendingTasks.length === 0 || bulkCreateTasks.isPending}
            isLoading={bulkCreateTasks.isPending}
            loadingContent="Creating..."
            className="flex-1"
          >
            Create {pendingTasks.length}{' '}
            {pendingTasks.length === 1 ? 'Task' : 'Tasks'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
