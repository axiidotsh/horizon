'use client';

import { ContentCard } from '@/app/(protected)/(main)/components/content-card';
import { createDialogOpenAtom } from '@/app/(protected)/(main)/habits/atoms/dialog-atoms';
import { HabitItem } from '@/app/(protected)/(main)/habits/components/habit-item';
import { useHabits } from '@/app/(protected)/(main)/habits/hooks/queries/use-habits';
import { enrichHabitsWithMetrics } from '@/app/(protected)/(main)/habits/utils/habit-calculations';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAtom } from 'jotai';
import { Plus } from 'lucide-react';

export function DashboardHabitsCard() {
  const [, setCreateDialogOpen] = useAtom(createDialogOpenAtom);
  const { data: habits, isLoading } = useHabits(7);

  const enrichedHabits = habits ? enrichHabitsWithMetrics(habits) : [];

  if (isLoading) {
    return (
      <ContentCard title="Habits" contentClassName="mt-5">
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
      title="Habits"
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
      {enrichedHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-2 py-20 text-center">
          <p className="text-muted-foreground text-sm">No habits</p>
          <p className="text-muted-foreground text-xs">
            Create a habit to get started
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div>
            {enrichedHabits.slice(0, 10).map((habit, index) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                showSeparator={index < enrichedHabits.slice(0, 10).length - 1}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </ContentCard>
  );
}
