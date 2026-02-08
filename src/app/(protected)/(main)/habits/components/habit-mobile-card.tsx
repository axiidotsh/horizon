'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { isSameDayUTC } from '@/utils/date-utc';
import { cn } from '@/utils/utils';
import { CopyIcon, FlameIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Habit } from '../hooks/types';
import { useHabitActions } from '../hooks/use-habit-actions';
import { getStreakColor } from '../utils/streak-helpers';
import { WeekDayToggle } from './week-day-toggle';

interface HabitMobileCardProps {
  habit: Habit;
}

export const HabitMobileCard = ({ habit }: HabitMobileCardProps) => {
  const { handleToggleDate, handleEdit, handleDelete, isToggling, isDeleting } =
    useHabitActions(habit.id);
  const [optimisticCompletions, setOptimisticCompletions] = useState(
    habit.completions
  );

  function handleToggleDay(date: Date) {
    if (isToggling) return;

    const prev = optimisticCompletions;
    const exists = prev.some((c) => isSameDayUTC(new Date(c.date), date));

    setOptimisticCompletions(
      exists
        ? prev.filter((c) => !isSameDayUTC(new Date(c.date), date))
        : [...prev, { date: date.toISOString() }]
    );

    handleToggleDate(habit.id, date, {
      onError: () => setOptimisticCompletions(prev),
      onSuccess: (data) => {
        if ('completed' in data) {
          setOptimisticCompletions(
            data.completed && data.completion
              ? [
                  ...prev.filter((c) => !isSameDayUTC(new Date(c.date), date)),
                  data.completion,
                ]
              : prev.filter((c) => !isSameDayUTC(new Date(c.date), date))
          );
        }
      },
    });
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(habit.title);
    toast.success('Habit copied to clipboard');
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-between gap-3 border-b px-4 py-3',
            isDeleting && 'opacity-60'
          )}
        >
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                'text-sm',
                habit.completed && 'text-muted-foreground line-through'
              )}
            >
              {habit.title}
            </span>
            {habit.currentStreak > 0 && (
              <div
                className={cn(
                  'mt-1 flex items-center gap-1 font-mono text-xs',
                  getStreakColor(habit.currentStreak)
                )}
              >
                <FlameIcon className="size-3" />
                <span>
                  {habit.currentStreak} day
                  {habit.currentStreak !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <WeekDayToggle
            completions={optimisticCompletions}
            onToggleDay={handleToggleDay}
            disabled={isToggling || isDeleting}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onCopy}>
          <CopyIcon />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => handleEdit(habit)}>
          <PencilIcon />
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onSelect={() => handleDelete(habit)}
        >
          <TrashIcon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
