'use client';

import { ErrorState } from '@/components/error-state';
import { PageHeading } from '@/components/page-heading';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClockIcon,
  ListTodoIcon,
  PaletteIcon,
  ShieldAlertIcon,
} from 'lucide-react';
import { AppearanceSettings } from './components/appearance-settings';
import { DangerZoneSettings } from './components/danger-zone-settings';
import { FocusSettings } from './components/focus-settings';
import { AppearanceSettingsSkeleton } from './components/skeletons/appearance-settings-skeleton';
import { DangerZoneSettingsSkeleton } from './components/skeletons/danger-zone-settings-skeleton';
import { FocusSettingsSkeleton } from './components/skeletons/focus-settings-skeleton';
import { TasksSettingsSkeleton } from './components/skeletons/tasks-settings-skeleton';
import { TasksSettings } from './components/tasks-settings';
import { useSettings } from './hooks/queries/use-settings';

export default function SettingsPage() {
  const { isLoading, error, refetch } = useSettings();

  const tabs = [
    {
      value: 'appearance',
      icon: PaletteIcon,
      label: 'Appearance',
      content: <AppearanceSettings />,
      skeleton: <AppearanceSettingsSkeleton />,
    },
    {
      value: 'focus',
      icon: ClockIcon,
      label: 'Focus',
      content: <FocusSettings />,
      skeleton: <FocusSettingsSkeleton />,
    },
    {
      value: 'tasks',
      icon: ListTodoIcon,
      label: 'Tasks',
      content: <TasksSettings />,
      skeleton: <TasksSettingsSkeleton />,
    },
    {
      value: 'danger',
      icon: ShieldAlertIcon,
      label: 'Danger Zone',
      content: <DangerZoneSettings />,
      skeleton: <DangerZoneSettingsSkeleton />,
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeading>Settings</PageHeading>
      <Tabs
        defaultValue="appearance"
        className="mt-4 flex flex-col md:flex-row md:items-start"
      >
        <TabsList className="h-full w-full shrink-0 flex-col items-stretch justify-start gap-1 rounded-lg bg-transparent md:w-48">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="justify-start px-3 py-2"
            >
              <tab.icon />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator
          orientation="vertical"
          className="ml-10 hidden h-[calc(100vh-10rem)]! w-px md:block"
        />
        <Separator className="my-4 md:hidden" />
        <div className="min-w-0 flex-1 md:px-10">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {error ? (
                <div className="w-full">
                  <ErrorState
                    onRetry={refetch}
                    title="Failed to fetch settings"
                    description="Unable to fetch settings. Please try again."
                  />
                </div>
              ) : isLoading ? (
                tab.skeleton
              ) : (
                tab.content
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
