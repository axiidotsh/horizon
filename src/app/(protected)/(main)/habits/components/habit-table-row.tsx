'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { isSameDayUTC } from '@/utils/date-utc';
import { cn } from '@/utils/utils';
import { EllipsisIcon, FlameIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import type { Habit } from '../hooks/types';
import { useHabitActions } from '../hooks/use-habit-actions';
import { getStreakColor } from '../utils/streak-helpers';
import { WeekDayToggle } from './week-day-toggle';

interface HabitTableRowProps {
  habit: Habit;
}

export const HabitTableRow = ({ habit }: HabitTableRowProps) => {
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

  return (
    <TableRow className={cn(isDeleting && 'opacity-60')}>
      <TableCell className="max-w-[400px]">
        <span
          className={cn(
            'text-sm',
            habit.completed && 'text-muted-foreground line-through'
          )}
        >
          {habit.title}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center">
          <WeekDayToggle
            completions={optimisticCompletions}
            onToggleDay={handleToggleDay}
            disabled={isToggling || isDeleting}
          />
        </div>
      </TableCell>
      <TableCell>
        {habit.currentStreak > 0 ? (
          <div
            className={cn(
              'flex items-center gap-1.5 font-mono text-xs',
              getStreakColor(habit.currentStreak)
            )}
          >
            <FlameIcon className="size-3.5" />
            <span>
              {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No streak</span>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={isDeleting}
              aria-label="Habit options"
              tooltip="Habit options"
            >
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => handleEdit(habit)}
              disabled={isDeleting}
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => handleDelete(habit)}
              disabled={isDeleting}
            >
              <TrashIcon />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
