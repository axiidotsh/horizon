'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/utils';
import { useEffect, useState } from 'react';
import { useUpdateSettings } from '../hooks/mutations/use-update-settings';
import { useSettings } from '../hooks/queries/use-settings';
import { SettingSection } from './setting-section';

const DURATION_OPTIONS = [
  { value: 25, label: '25 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
];

const MAX_DURATION_MINUTES = 480;

export const FocusSettings = () => {
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      const isCustomDuration = !DURATION_OPTIONS.some(
        (option) => option.value === settings.defaultFocusDuration
      );
      if (isCustomDuration && !customValue) {
        setCustomValue(settings?.defaultFocusDuration?.toString() ?? '');
        setIsCustomMode(true);
      }
    }
  }, [settings, customValue]);

  if (!settings || !('defaultFocusDuration' in settings)) return null;

  const isCustomDuration = !DURATION_OPTIONS.some(
    (option) => option.value === settings.defaultFocusDuration
  );

  const selectValue =
    isCustomMode || isCustomDuration
      ? 'custom'
      : (settings?.defaultFocusDuration?.toString() ?? '');

  function handleFocusDurationChange(value: string) {
    if (!settings || !('defaultFocusDuration' in settings)) return;

    if (value === 'custom') {
      setIsCustomMode(true);
      setCustomValue(settings?.defaultFocusDuration?.toString() ?? '');
      setError('');
    } else {
      setIsCustomMode(false);
      const duration = parseInt(value, 10);
      updateSettings({ json: { defaultFocusDuration: duration } });
      setError('');
    }
  }

  function handleCustomDurationChange(value: string) {
    setCustomValue(value);

    const numValue = parseInt(value, 10);

    if (!value || isNaN(numValue)) {
      setError('');
      return;
    }

    if (numValue < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }

    if (numValue > MAX_DURATION_MINUTES) {
      setError(`Duration cannot exceed ${MAX_DURATION_MINUTES / 60} hours`);
      return;
    }

    setError('');
    updateSettings({ json: { defaultFocusDuration: numValue } });
  }

  return (
    <SettingSection
      title="Default Session Duration"
      description="Set the default duration for new focus sessions"
    >
      <div className="max-w-xs space-y-2">
        <Label htmlFor="default-duration">Duration</Label>
        <Select value={selectValue} onValueChange={handleFocusDurationChange}>
          <SelectTrigger id="default-duration" className="w-full">
            <SelectValue>
              {isCustomMode || isCustomDuration
                ? 'Custom'
                : DURATION_OPTIONS.find(
                    (opt) => opt.value === settings.defaultFocusDuration
                  )?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {selectValue === 'custom' && (
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="custom-duration">Custom duration (minutes)</Label>
            <Input
              id="custom-duration"
              type="number"
              min={1}
              max={MAX_DURATION_MINUTES}
              value={customValue}
              onChange={(e) => handleCustomDurationChange(e.target.value)}
              placeholder="Enter duration in minutes"
              className={cn(error && 'border-destructive')}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <p className="text-muted-foreground text-xs">
              Maximum: {MAX_DURATION_MINUTES / 60} hours ({MAX_DURATION_MINUTES}{' '}
              minutes)
            </p>
          </div>
        )}
      </div>
    </SettingSection>
  );
};
