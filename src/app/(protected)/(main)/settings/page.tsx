'use client';

import { type CommandMenuPosition, settingsAtom } from '@/atoms/settings-atoms';
import { PageHeading } from '@/components/page-heading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/utils';
import { useAtom } from 'jotai';

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

export default function SettingsPage() {
  const [settings, setSettings] = useAtom(settingsAtom);

  const handlePositionChange = (position: CommandMenuPosition) => {
    setSettings((prev) => ({ ...prev, commandMenuPosition: position }));
  };

  return (
    <div className="flex flex-col">
      <PageHeading>Settings</PageHeading>
      <div className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the app looks and behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Command Menu Position</Label>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
