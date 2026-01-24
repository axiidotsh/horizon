'use client';

import { useSettings } from '@/app/(protected)/(main)/settings/hooks/queries/use-settings';
import { useState } from 'react';

interface TaskFormValues {
  title: string;
  dueDate: Date | undefined;
  priority: string;
  projectId: string;
  tags: string[];
}

export function useTaskForm(initialValues?: Partial<TaskFormValues>) {
  const { data: settings } = useSettings();
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialValues?.dueDate
  );
  const [priority, setPriority] = useState<string>(
    initialValues?.priority ?? 'NO_PRIORITY'
  );
  const [projectId, setProjectId] = useState<string>(
    initialValues?.projectId ?? ''
  );
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);

  function reset() {
    setTitle('');
    setDueDate(undefined);
    setPriority('NO_PRIORITY');
    setProjectId('');
    setTags([]);
  }

  function getFormData() {
    const normalizedDueDate = dueDate
      ? new Date(
          Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
        ).toISOString()
      : undefined;

    return {
      title: title.trim(),
      dueDate: normalizedDueDate,
      priority: (priority || settings?.defaultTaskPriority || 'NO_PRIORITY') as
        | 'NO_PRIORITY'
        | 'LOW'
        | 'MEDIUM'
        | 'HIGH',
      projectId: projectId || undefined,
      tags,
    };
  }

  return {
    title,
    setTitle,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    projectId,
    setProjectId,
    tags,
    setTags,
    reset,
    getFormData,
  };
}
