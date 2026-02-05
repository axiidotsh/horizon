'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';
import { EllipsisIcon, FlameIcon, PencilIcon, TrashIcon } from 'lucide-react';
import type { Habit } from '../hooks/types';
import { useHabitActions } from '../hooks/use-habit-actions';
import { getStreakColor } from '../utils/streak-helpers';
import { WeekDayToggle } from './week-day-toggle';

interface HabitRowProps {
  habit: Habit;
}

export const HabitRow = ({ habit }: HabitRowProps) => {
  const { handleToggleDate, handleEdit, handleDelete, isToggling } =
    useHabitActions(habit.id);

  function handleToggleDay(date: Date) {
    handleToggleDate(habit.id, date);
  }

  return (
    <li className="border-border flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm',
            habit.completed && 'text-muted-foreground line-through'
          )}
        >
          {habit.title}
        </p>
        {habit.currentStreak > 0 && (
          <div className="mt-0.5">
            <span
              className={cn(
                'flex items-center gap-1 font-mono text-xs',
                getStreakColor(habit.currentStreak)
              )}
            >
              <FlameIcon className="size-3" />
              {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      <WeekDayToggle
        completions={habit.completions}
        onToggleDay={handleToggleDay}
        disabled={isToggling}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            className="shrink-0"
            aria-label="Habit options"
          >
            <EllipsisIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(habit)}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => handleDelete(habit)}
          >
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
};
