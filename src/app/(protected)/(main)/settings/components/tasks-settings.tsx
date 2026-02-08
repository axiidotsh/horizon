'use client';

import { PrioritySelect } from '@/app/(protected)/(main)/tasks/components/priority-select';
import type { TaskPriority } from '@/app/(protected)/(main)/tasks/hooks/types';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useUpdateSettings } from '../hooks/mutations/use-update-settings';
import { useSettings } from '../hooks/queries/use-settings';
import { SettingSection } from './setting-section';

export const TasksSettings = () => {
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const [optimisticPriority, setOptimisticPriority] =
    useState<TaskPriority | null>(null);

  function handleTaskPriorityChange(priority: string) {
    const prevPriority = optimisticPriority;
    setOptimisticPriority(priority as TaskPriority);
    updateSettings(
      { json: { defaultTaskPriority: priority as TaskPriority } },
      {
        onError: () => setOptimisticPriority(prevPriority),
        onSuccess: (data) => setOptimisticPriority(data.defaultTaskPriority),
      }
    );
  }

  if (!settings) return null;

  const priority =
    optimisticPriority ?? settings.defaultTaskPriority ?? 'NO_PRIORITY';

  return (
    <SettingSection
      title="Default Task Priority"
      description="Set the default priority for new tasks"
    >
      <div className="max-w-xs space-y-2">
        <Label htmlFor="default-priority">Priority</Label>
        <PrioritySelect
          id="default-priority"
          value={priority}
          onValueChange={handleTaskPriorityChange}
        />
      </div>
    </SettingSection>
  );
};
