'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';
import { EllipsisIcon, FlameIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import type { Habit } from '../../habits/hooks/types';
import { useHabitActions } from '../../habits/hooks/use-habit-actions';
import { getStreakColor } from '../../habits/utils/streak-helpers';

interface DashboardHabitItemProps {
  habit: Habit;
}

export const DashboardHabitItem = ({ habit }: DashboardHabitItemProps) => {
  const { handleToggle, handleEdit, handleDelete, isToggling } =
    useHabitActions(habit.id);
  const [isOptimisticCompleted, setIsOptimisticCompleted] = useState(
    habit.completed
  );

  const onToggle = () => {
    const prevCompleted = isOptimisticCompleted;
    setIsOptimisticCompleted(!prevCompleted);

    handleToggle(habit.id, {
      onError: () => {
        setIsOptimisticCompleted(prevCompleted);
      },
      onSuccess: (data) => {
        if ('habit' in data) {
          setIsOptimisticCompleted(data.habit.completed);
        }
      },
    });
  };

  return (
    <li className="border-border flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
      <Checkbox
        checked={isOptimisticCompleted}
        onCheckedChange={onToggle}
        disabled={isToggling}
        className="mt-0.5"
        aria-label={`Mark habit "${habit.title}" as ${isOptimisticCompleted ? 'incomplete' : 'complete'}`}
      />
      <div className="flex flex-1 items-start justify-between gap-3">
        <p
          className={cn(
            'text-sm',
            isOptimisticCompleted && 'text-muted-foreground line-through'
          )}
        >
          {habit.title}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {habit.currentStreak > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                getStreakColor(habit.currentStreak)
              )}
            >
              <FlameIcon className="size-3.5" />
              <span className="font-mono">{habit.currentStreak}</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" aria-label="Habit options">
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
        </div>
      </div>
    </li>
  );
};
