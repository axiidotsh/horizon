'use client';

import { ContentCard } from '@/app/(protected)/(main)/components/content-card';
import { createTaskDialogAtom } from '@/app/(protected)/(main)/tasks/atoms/task-dialogs';
import { TaskItem } from '@/app/(protected)/(main)/tasks/components/task-list/task-item';
import { useTasks } from '@/app/(protected)/(main)/tasks/hooks/queries/use-tasks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAtom } from 'jotai';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function DashboardTasksCard() {
  const [, setCreateDialogOpen] = useAtom(createTaskDialogAtom);
  const { data: allTasks, isLoading } = useTasks();

  const displayTasks = allTasks?.slice(0, 10) || [];

  if (isLoading) {
    return (
      <ContentCard title="Tasks" contentClassName="mt-5">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </ContentCard>
    );
  }

  return (
    <ContentCard
      title="Tasks"
      action={
        <Button
          size="icon-sm"
          variant="ghost"
          className="size-6"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus />
        </Button>
      }
      contentClassName="mt-5"
    >
      {displayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-2 py-20 text-center">
          <p className="text-muted-foreground text-sm">No tasks</p>
          <p className="text-muted-foreground text-xs">
            Create a task to get started
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[300px]">
            <div>
              {displayTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  showSeparator={index < displayTasks.length - 1}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3">
            <Link href="/tasks">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground w-full text-xs"
              >
                View all
              </Button>
            </Link>
          </div>
        </>
      )}
    </ContentCard>
  );
}
