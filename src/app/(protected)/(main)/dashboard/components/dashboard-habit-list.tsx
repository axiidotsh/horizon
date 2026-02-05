'use client';

import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useSetAtom } from 'jotai';
import { PartyPopperIcon, PlusIcon } from 'lucide-react';
import { ContentCard } from '../../components/content-card';
import { createDialogOpenAtom } from '../../habits/atoms/dialog-atoms';
import { useDashboardHabits } from '../hooks/queries/use-dashboard-habits';
import { DashboardHabitItem } from './dashboard-habit-item';

export const DashboardHabitList = () => {
  const { data: habits = [], isLoading, error, refetch } = useDashboardHabits();
  const setCreateDialogOpen = useSetAtom(createDialogOpenAtom);

  const renderContent = () => {
    if (error) {
      return (
        <ErrorState
          onRetry={refetch}
          title="Failed to load habits"
          description="Unable to fetch habits. Please try again."
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
              </div>
              <Skeleton className="h-4 w-12" />
              <Skeleton className="size-8" />
            </div>
          ))}
        </div>
      );
    }

    if (habits.length === 0) {
      return (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16 text-center">
          <PartyPopperIcon className="mb-2 size-12 stroke-1 opacity-50" />
          <p className="text-sm font-medium">No habits yet</p>
          <p className="text-xs">Create your first habit to get started</p>
        </div>
      );
    }

    return (
      <ScrollArea className="mt-6 h-80">
        <ul className="space-y-3 pr-4">
          {habits.map((habit) => (
            <DashboardHabitItem key={habit.id} habit={habit} />
          ))}
        </ul>
      </ScrollArea>
    );
  };

  return (
    <ContentCard
      title="Keep the Streak"
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCreateDialogOpen(true)}
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
