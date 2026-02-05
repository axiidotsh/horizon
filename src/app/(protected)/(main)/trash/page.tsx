'use client';

import { PageHeading } from '@/components/page-heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClockPlusIcon,
  GoalIcon,
  LayoutListIcon,
  TrashIcon,
} from 'lucide-react';
import { EmptyTrashDialog } from './components/empty-trash-dialog';
import { TrashHabitsTab } from './components/trash-habits-tab';
import { TrashSessionsTab } from './components/trash-sessions-tab';
import { TrashTasksTab } from './components/trash-tasks-tab';
import { useEmptyAllTrash } from './hooks/mutations/use-empty-trash';
import { useTrashCounts } from './hooks/queries/use-trash-counts';

export default function TrashPage() {
  const { data: counts } = useTrashCounts();
  const emptyAll = useEmptyAllTrash();

  const totalCount =
    (counts?.tasks ?? 0) + (counts?.habits ?? 0) + (counts?.sessions ?? 0);

  const tabs = [
    {
      value: 'tasks',
      icon: LayoutListIcon,
      label: 'Tasks',
      count: counts?.tasks ?? 0,
      content: <TrashTasksTab />,
    },
    {
      value: 'habits',
      icon: GoalIcon,
      label: 'Habits',
      count: counts?.habits ?? 0,
      content: <TrashHabitsTab />,
    },
    {
      value: 'sessions',
      icon: ClockPlusIcon,
      label: 'Sessions',
      count: counts?.sessions ?? 0,
      content: <TrashSessionsTab />,
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <PageHeading>Trash</PageHeading>
        {totalCount > 0 && (
          <EmptyTrashDialog
            title="Empty entire trash?"
            description={`This action cannot be undone. All ${totalCount} items will be permanently deleted.`}
            onConfirm={() => emptyAll.mutate({})}
            isPending={emptyAll.isPending}
          >
            <Button variant="outline" size="sm">
              <TrashIcon className="size-4" />
              Empty trash
            </Button>
          </EmptyTrashDialog>
        )}
      </div>
      <p className="text-muted-foreground/60 mt-2 text-xs">
        Items are automatically deleted after 30 days.
      </p>
      <Tabs
        defaultValue="tasks"
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
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator
          orientation="vertical"
          className="ml-10 hidden h-[calc(100vh-12rem)]! w-px md:block"
        />
        <Separator className="my-4 md:hidden" />
        <div className="min-w-0 flex-1 md:px-10">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              <ScrollArea className="md:h-[calc(100vh-12rem)]">
                {tab.content}
              </ScrollArea>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
