'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/utils';
import { EllipsisIcon, FlameIcon, PencilIcon, TrashIcon } from 'lucide-react';
import type { Habit } from '../hooks/types';
import { useHabitActions } from '../hooks/use-habit-actions';
import { getStreakColor } from '../utils/streak-helpers';
import { WeekDayToggle } from './week-day-toggle';

interface HabitTableRowProps {
  habit: Habit;
}

export const HabitTableRow = ({ habit }: HabitTableRowProps) => {
  const { handleToggleDate, handleEdit, handleDelete, isToggling } =
    useHabitActions(habit.id);

  function handleToggleDay(date: Date) {
    handleToggleDate(habit.id, date);
  }

  return (
    <TableRow>
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
            completions={habit.completions}
            onToggleDay={handleToggleDay}
            disabled={isToggling}
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
              aria-label="Habit options"
              tooltip="Habit options"
            >
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleEdit(habit)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => handleDelete(habit)}
            >
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
