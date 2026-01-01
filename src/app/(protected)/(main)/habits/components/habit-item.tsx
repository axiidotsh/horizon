'use client';

import { useToggleHabit } from '@/app/(protected)/(main)/habits/hooks/mutations/use-toggle-habit';
import type { HabitWithMetrics } from '@/app/(protected)/(main)/habits/hooks/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/utils';
import { Flame } from 'lucide-react';

function getStreakColor(streak: number): string {
  if (streak >= 30) return 'text-purple-500';
  if (streak >= 14) return 'text-yellow-500';
  if (streak >= 7) return 'text-orange-500';
  return 'text-muted-foreground';
}

interface HabitItemProps {
  habit: HabitWithMetrics;
  showSeparator: boolean;
}

export const HabitItem = ({ habit, showSeparator }: HabitItemProps) => {
  const { toggleToday } = useToggleHabit(habit.id);
  const streakColor = getStreakColor(habit.currentStreak);

  return (
    <div>
      <div className="flex items-start gap-3 py-3 transition-colors">
        <Checkbox
          checked={habit.completed}
          onCheckedChange={() =>
            toggleToday.mutate({ param: { id: habit.id } })
          }
          disabled={toggleToday.isPending}
        />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-sm font-medium',
              habit.completed && 'text-muted-foreground line-through'
            )}
          >
            {habit.title}
          </p>
          {habit.category && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {habit.category}
            </Badge>
          )}
        </div>

        {habit.currentStreak > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            <Flame className={cn('size-4', streakColor)} />
            <span className="text-xs font-medium">{habit.currentStreak}</span>
          </div>
        )}
      </div>
      {showSeparator && <Separator />}
    </div>
  );
};
