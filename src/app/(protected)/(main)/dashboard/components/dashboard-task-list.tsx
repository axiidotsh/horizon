'use client';

import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useSetAtom } from 'jotai';
import { PartyPopperIcon, PlusIcon } from 'lucide-react';
import { ContentCard } from '../../components/content-card';
import { createTaskDialogAtom } from '../../tasks/atoms/task-dialogs';

import { useDashboardTasks } from '../hooks/queries/use-dashboard-tasks';
import { DashboardTaskItem } from './dashboard-task-item';

export const DashboardTaskList = () => {
  const { data: tasks = [], isLoading, error, refetch } = useDashboardTasks();
  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);

  const renderContent = () => {
    if (error) {
      return (
        <ErrorState
          onRetry={refetch}
          title="Failed to load tasks"
          description="Unable to fetch tasks. Please try again."
          className="mt-4"
        />
      );
    }

    if (isLoading) {
      return (
        <div className="my-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 pb-3">
              <Skeleton className="mt-0.5 size-4 rounded-sm" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="size-8" />
            </div>
          ))}
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16 text-center">
          <PartyPopperIcon className="mb-2 size-12 stroke-1 opacity-50" />
          <p className="text-sm font-medium">All caught up!</p>
          <p className="text-xs">No pending tasks</p>
        </div>
      );
    }

    return (
      <ScrollArea className="mt-6 h-80">
        <ul className="space-y-3 pr-4">
          {tasks.map((task) => (
            <DashboardTaskItem key={task.id} task={task} />
          ))}
        </ul>
      </ScrollArea>
    );
  };

  return (
    <ContentCard
      title="Up Next"
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCreateTaskDialog(true)}
        >
          <PlusIcon />
          New
        </Button>
      }
      isDashboard
    >
      {renderContent()}
    </ContentCard>
  );
};
