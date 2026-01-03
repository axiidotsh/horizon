'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaskPriority } from '@/server/db/generated/client';
import { useUpdateSettings } from '../hooks/mutations/use-update-settings';
import { useSettings } from '../hooks/queries/use-settings';
import { SettingSection } from './setting-section';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const TasksSettings = () => {
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();

  function handleTaskPriorityChange(priority: string) {
    updateSettings({ json: { defaultTaskPriority: priority as TaskPriority } });
  }

  if (!settings) return null;

  return (
    <SettingSection
      title="Default Task Priority"
      description="Set the default priority for new tasks"
    >
      <div className="max-w-xs space-y-2">
        <Label htmlFor="default-priority">Priority</Label>
        <Select
          value={settings.defaultTaskPriority}
          onValueChange={handleTaskPriorityChange}
        >
          <SelectTrigger id="default-priority" className="w-full">
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
    </SettingSection>
  );
};
