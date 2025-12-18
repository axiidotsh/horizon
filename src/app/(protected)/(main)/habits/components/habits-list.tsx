import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/utils';
import { useSetAtom } from 'jotai';
import {
  EllipsisIcon,
  FlameIcon,
  ListChecksIcon,
  PencilIcon,
  TargetIcon,
  Trash2Icon,
} from 'lucide-react';
import { deletingHabitIdAtom, editingHabitIdAtom } from '../atoms/dialog-atoms';
import type { HabitWithMetrics } from '../hooks/types';

// Helper to get the last 7 days (today + 6 previous days)
function getLast7Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    days.push(date);
  }

  return days;
}

// Helper to format date for display
function formatDayLabel(date: Date): string {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return days[dayIndex];
}

// Helper to format full date for tooltip
function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Check if a date is today
function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

interface WeekDayToggleProps {
  completionHistory: CompletionRecord[];
  onToggleDay: (date: Date) => void;
}

// Fixed header showing day labels once
function WeekDayHeader() {
  const days = getLast7Days();

  return (
    <div className="flex gap-1">
      {days.map((day, index) => (
        <span
          key={index}
          className={cn(
            'text-muted-foreground w-3.5 text-center text-[9px] font-medium',
            isToday(day) && 'text-foreground font-semibold'
          )}
        >
          {formatDayLabel(day)}
        </span>
      ))}
    </div>
  );
}

function WeekDayToggle({ completionHistory, onToggleDay }: WeekDayToggleProps) {
  const days = getLast7Days();

  const isCompleted = (date: Date): boolean => {
    return completionHistory.some(
      (record) => isSameDay(new Date(record.date), date) && record.completed
    );
  };

  return (
    <div className="flex gap-1">
      {days.map((day, index) => {
        const completed = isCompleted(day);
        const today = isToday(day);

        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToggleDay(day)}
                className={cn(
                  'size-3.5 cursor-pointer rounded-full border transition-all duration-150',
                  'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                  completed
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-muted-foreground/30 hover:border-muted-foreground/50 bg-transparent',
                  today && !completed && 'ring-primary/30 ring-1 ring-offset-1',
                  today && completed && 'ring-1 ring-emerald-300 ring-offset-1'
                )}
                aria-label={`${completed ? 'Completed' : 'Not completed'} on ${formatFullDate(day)}`}
              >
                {completed && (
                  <svg
                    className="size-full text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {formatFullDate(day)}
              {today && ' (Today)'}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export interface CompletionRecord {
  date: Date;
  completed: boolean;
}

export type Habit = HabitWithMetrics;

interface HabitsListProps {
  habits: Habit[];
  sortedHabits: Habit[];
  onToggleDay: (habitId: string, date: Date) => void;
}

export function HabitsList({
  habits,
  sortedHabits,
  onToggleDay,
}: HabitsListProps) {
  const setEditingHabitId = useSetAtom(editingHabitIdAtom);
  const setDeletingHabitId = useSetAtom(deletingHabitIdAtom);

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-yellow-500';
    if (streak >= 7) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  return (
    <ScrollArea className="my-4">
      <div className="max-h-[600px]">
        {habits.length === 0 ? (
          <div className="text-muted-foreground flex h-[600px] flex-col items-center justify-center gap-2 text-center">
            <TargetIcon className="size-12 opacity-20" />
            <p className="text-sm font-medium">No habits yet</p>
            <p className="text-xs">Create your first habit to get started</p>
          </div>
        ) : sortedHabits.length === 0 ? (
          <div className="text-muted-foreground flex h-[600px] flex-col items-center justify-center gap-2 text-center">
            <ListChecksIcon className="size-12 opacity-20" />
            <p className="text-sm font-medium">No habits found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="pr-4">
            {/* Fixed header row with day labels */}
            <div className="border-border mb-2 flex items-center gap-3 border-b pb-2">
              <span className="text-muted-foreground font-mono text-xs font-medium">
                {habits.length} {habits.length === 1 ? 'Habit' : 'Habits'}
              </span>
              <div className="flex-1" />
              <WeekDayHeader />
              {/* Spacer for dropdown button alignment */}
              <div className="w-8 shrink-0" />
            </div>
            <ul className="space-y-3">
              {sortedHabits.map((habit) => (
                <li
                  key={habit.id}
                  className="border-border flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${habit.completed ? 'text-muted-foreground line-through' : ''}`}
                    >
                      {habit.title}
                    </p>
                    {habit.currentStreak > 0 && (
                      <div className="mt-0.5">
                        <span
                          className={`flex items-center gap-1 font-mono text-xs ${getStreakColor(habit.currentStreak)}`}
                        >
                          <FlameIcon className="size-3" />
                          {habit.currentStreak} day
                          {habit.currentStreak !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <WeekDayToggle
                    completionHistory={habit.completionHistory}
                    onToggleDay={(date) => onToggleDay(habit.id, date)}
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
                      <DropdownMenuItem
                        onClick={() => setEditingHabitId(habit.id)}
                      >
                        <PencilIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingHabitId(habit.id)}
                      >
                        <Trash2Icon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
