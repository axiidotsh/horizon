'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/utils';
import { PlusIcon } from 'lucide-react';
import { DashboardCard } from './card';

interface DashboardHabitProps {
  habit: string;
  completed: boolean;
  streak?: number;
}

interface DashboardHabitsProps {
  habits: DashboardHabitProps[];
}

export const DashboardHabits = ({ habits }: DashboardHabitsProps) => {
  return (
    <DashboardCard
      title="Habits"
      action={
        <Button size="icon-sm" variant="ghost" className="size-6">
          <PlusIcon />
        </Button>
      }
      contentClassName="mt-5"
    >
      <ul className="space-y-5">
        {habits.map((habit) => (
          <li
            key={habit.habit}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Checkbox checked={habit.completed} />
              <p
                className={cn(
                  'text-muted-foreground text-sm',
                  habit.completed && 'line-through'
                )}
              >
                {habit.habit}
              </p>
            </div>
            {habit.streak !== undefined && habit.streak > 0 && (
              <span className="text-muted-foreground font-mono text-xs">
                {habit.streak} day{habit.streak !== 1 ? 's' : ''}
              </span>
            )}
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};
