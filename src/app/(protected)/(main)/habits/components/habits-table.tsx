'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils/utils';
import { useSetAtom } from 'jotai';
import {
  EllipsisIcon,
  FlameIcon,
  PencilIcon,
  TargetIcon,
  Trash2Icon,
} from 'lucide-react';
import {
  createDialogOpenAtom,
  deletingHabitIdAtom,
  editingHabitIdAtom,
} from '../atoms/dialog-atoms';
import { useToggleHabit } from '../hooks/mutations/use-toggle-habit';
import type { HabitWithMetrics } from '../hooks/types';
import { formatDayLabel, getLast7Days, isToday } from '../utils/date-helpers';
import { getStreakColor } from '../utils/streak-helpers';
import { WeekDayToggle } from './week-day-toggle';

interface HabitsTableProps {
  habits: HabitWithMetrics[];
  isLoading?: boolean;
}

export const HabitsTable = ({ habits, isLoading }: HabitsTableProps) => {
  const setCreateDialogOpen = useSetAtom(createDialogOpenAtom);
  const days = getLast7Days();

  if (isLoading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-10">
            <TableRow>
              <TableHead className="text-muted-foreground max-w-[400px] min-w-[250px] text-xs font-normal">
                Habit
              </TableHead>
              <TableHead className="text-muted-foreground text-center text-xs font-normal">
                <div className="flex items-center justify-center gap-1">
                  {days.map((day, index) => (
                    <span
                      key={index}
                      className={cn(
                        'w-3.5 text-center',
                        isToday(day) && 'font-semibold'
                      )}
                    >
                      {formatDayLabel(day)}
                    </span>
                  ))}
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
                Streak
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="max-w-[400px]">
                  <Skeleton className="h-5 w-full max-w-xs" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="size-3.5 rounded-full" />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-32 text-center sm:py-48">
        <TargetIcon className="mb-2 size-12 stroke-1 opacity-50" />
        <p className="text-sm font-medium">No habits found</p>
        <p className="text-xs">
          Create your first habit or adjust your filters
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="mt-4"
        >
          Add Habit
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead className="text-muted-foreground max-w-[400px] min-w-[250px] text-xs font-normal">
              Habit
            </TableHead>
            <TableHead className="text-muted-foreground text-center text-xs font-normal">
              <div className="flex items-center justify-center gap-1">
                {days.map((day, index) => (
                  <span
                    key={index}
                    className={cn(
                      'w-3.5 text-center',
                      isToday(day) && 'font-semibold'
                    )}
                  >
                    {formatDayLabel(day)}
                  </span>
                ))}
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground w-[120px] text-xs font-normal">
              Streak
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {habits.map((habit) => (
            <HabitTableRow key={habit.id} habit={habit} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface HabitTableRowProps {
  habit: HabitWithMetrics;
}

const HabitTableRow = ({ habit }: HabitTableRowProps) => {
  const setEditingHabitId = useSetAtom(editingHabitIdAtom);
  const setDeletingHabitId = useSetAtom(deletingHabitIdAtom);
  const { toggleDate } = useToggleHabit(habit.id);

  function handleToggleDay(date: Date) {
    const localYear = date.getFullYear();
    const localMonth = date.getMonth();
    const localDay = date.getDate();
    const utcDate = new Date(Date.UTC(localYear, localMonth, localDay));
    toggleDate.mutate({
      param: { id: habit.id },
      json: { date: utcDate.toISOString() },
    });
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
            completionHistory={habit.completionHistory}
            onToggleDay={handleToggleDay}
            disabled={toggleDate.isPending}
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
            <DropdownMenuItem onSelect={() => setEditingHabitId(habit.id)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeletingHabitId(habit.id)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
