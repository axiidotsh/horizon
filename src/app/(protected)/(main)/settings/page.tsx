'use client';

import { PageHeading } from '@/components/page-heading';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClockIcon,
  ListTodoIcon,
  PaletteIcon,
  ShieldAlertIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppearanceSettings } from './appearance-settings';
import { DangerZoneSettings } from './danger-zone-settings';
import { FocusSettings } from './focus-settings';
import { TasksSettings } from './tasks-settings';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'appearance';

  function handleTabChange(value: string) {
    router.push(`/settings?tab=${value}`);
  }

  return (
    <div className="flex flex-col">
      <PageHeading>Settings</PageHeading>
      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="mt-4 flex flex-col md:flex-row md:items-start"
      >
        <TabsList className="h-full w-full shrink-0 flex-col items-stretch justify-start gap-1 rounded-lg bg-transparent md:w-48">
          {[
            {
              value: 'appearance',
              icon: PaletteIcon,
              label: 'Appearance',
            },
            {
              value: 'focus',
              icon: ClockIcon,
              label: 'Focus',
            },
            {
              value: 'tasks',
              icon: ListTodoIcon,
              label: 'Tasks',
            },
            {
              value: 'danger',
              icon: ShieldAlertIcon,
              label: 'Danger Zone',
            },
          ].map((tab) => (
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
          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="focus" className="mt-0">
            <FocusSettings />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <TasksSettings />
          </TabsContent>

          <TabsContent value="danger" className="mt-0">
            <DangerZoneSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
