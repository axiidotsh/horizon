'use client';

import { settingsAtom } from '@/atoms/settings-atoms';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAtom } from 'jotai';
import { SettingSection } from './setting-section';

const DURATION_OPTIONS = [
  { value: 25, label: '25 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
];

export const FocusSettings = () => {
  const [settings, setSettings] = useAtom(settingsAtom);

  function handleFocusDurationChange(duration: string) {
    setSettings((prev) => ({
      ...prev,
      defaultFocusDuration: parseInt(duration, 10),
    }));
  }

  return (
    <SettingSection
      title="Default Session Duration"
      description="Set the default duration for new focus sessions"
    >
      <div className="max-w-xs space-y-2">
        <Label htmlFor="default-duration">Duration</Label>
        <Select
          value={settings.defaultFocusDuration.toString()}
          onValueChange={handleFocusDurationChange}
        >
          <SelectTrigger id="default-duration" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </SettingSection>
  );
};
