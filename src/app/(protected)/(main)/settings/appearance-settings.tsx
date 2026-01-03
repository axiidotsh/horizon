'use client';

import { type CommandMenuPosition, settingsAtom } from '@/atoms/settings-atoms';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/utils';
import { useAtom } from 'jotai';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SettingSection } from './setting-section';

interface OptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const OptionCard = ({
  title,
  description,
  selected,
  onSelect,
}: OptionCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'flex cursor-pointer flex-col gap-1 rounded-lg border p-4 text-left transition-colors duration-300',
      selected
        ? 'bg-primary/5 border-primary/15'
        : 'border-input hover:bg-muted/50'
    )}
  >
    <span className="text-sm font-medium">{title}</span>
    <span className="text-muted-foreground text-xs">{description}</span>
  </button>
);

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

export const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useAtom(settingsAtom);

  function handlePositionChange(position: CommandMenuPosition) {
    setSettings((prev) => ({ ...prev, commandMenuPosition: position }));
  }

  return (
    <div className="space-y-6">
      <SettingSection
        title="Theme"
        description="Choose your preferred color theme"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border p-4 text-left transition-colors duration-300',
                theme === option.value
                  ? 'bg-primary/5 border-primary/15'
                  : 'border-input hover:bg-muted/50'
              )}
            >
              <option.icon className="size-4" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </SettingSection>

      <Separator />

      <SettingSection
        title="Command Menu Position"
        description="Choose where the command menu appears"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            title="Top"
            description="Opens as a dropdown below the search bar"
            selected={settings.commandMenuPosition === 'top'}
            onSelect={() => handlePositionChange('top')}
          />
          <OptionCard
            title="Center"
            description="Opens as a centered modal dialog"
            selected={settings.commandMenuPosition === 'center'}
            onSelect={() => handlePositionChange('center')}
          />
        </div>
      </SettingSection>
    </div>
  );
};
