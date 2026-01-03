import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/utils';
import { useAtomValue } from 'jotai';
import { ListChecksIcon, TargetIcon } from 'lucide-react';
import { useMemo } from 'react';
import {
  searchQueryAtom,
  sortByAtom,
  statusFilterAtom,
} from '../atoms/habit-atoms';
import { useHabits } from '../hooks/queries/use-habits';
import type { HabitWithMetrics } from '../hooks/types';
import {
  enrichHabitsWithMetrics,
  filterHabits,
  sortHabits,
} from '../utils/habit-calculations';
import { HabitRow } from './habit-row';

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
  disabled?: boolean;
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

function WeekDayToggle({
  completionHistory,
  onToggleDay,
  disabled = false,
}: WeekDayToggleProps) {
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
                disabled={disabled}
                className={cn(
                  'size-3.5 cursor-pointer rounded-full border transition-all duration-150',
                  'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                  completed
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-muted-foreground/30 hover:border-muted-foreground/50 bg-transparent',
                  today && !completed && 'ring-primary/30 ring-1 ring-offset-1',
                  today && completed && 'ring-1 ring-emerald-300 ring-offset-1',
                  disabled && 'cursor-not-allowed opacity-50'
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

function HabitTrackerSkeleton() {
  return (
    <div className="my-4 space-y-3 pr-4">
      <div className="border-border mb-2 flex items-center gap-3 border-b pb-2">
        <div className="flex-1" />
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="size-3.5" />
          ))}
        </div>
        <div className="w-8 shrink-0" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-border flex items-center gap-3 border-b pb-3"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="size-3.5 rounded-full" />
            ))}
          </div>
          <Skeleton className="size-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function HabitsList() {
  const { data: rawHabits = [], isLoading } = useHabits();
  const sortBy = useAtomValue(sortByAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const statusFilter = useAtomValue(statusFilterAtom);

  const habits = useMemo(() => enrichHabitsWithMetrics(rawHabits), [rawHabits]);

  const filteredHabits = useMemo(
    () => filterHabits(habits, searchQuery, statusFilter),
    [habits, searchQuery, statusFilter]
  );

  const sortedHabits = useMemo(
    () => sortHabits(filteredHabits, sortBy),
    [filteredHabits, sortBy]
  );

  if (isLoading) {
    return <HabitTrackerSkeleton />;
  }

  return (
    <ScrollArea className="my-4">
      <div className="max-h-[600px]">
        {habits.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-20 text-center">
            <TargetIcon className="mb-2 size-12 stroke-1 opacity-50" />
            <p className="text-sm font-medium">No habits yet</p>
            <p className="text-xs">Create your first habit to get started</p>
          </div>
        ) : sortedHabits.length === 0 ? (
          <div className="text-muted-foreground flex h-[600px] flex-col items-center justify-center gap-2 py-20 text-center">
            <ListChecksIcon className="mb-2 size-12 stroke-1 opacity-50" />
            <p className="text-sm font-medium">No habits found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="pr-4">
            <div className="border-border mb-2 flex items-center gap-3 border-b pb-2">
              <span className="text-muted-foreground font-mono text-xs font-medium">
                {sortedHabits.length}{' '}
                {sortedHabits.length === 1 ? 'Habit' : 'Habits'}
              </span>
              <div className="flex-1" />
              <WeekDayHeader />
              <div className="w-8 shrink-0" />
            </div>
            <ul className="space-y-3">
              {sortedHabits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  WeekDayToggle={WeekDayToggle}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
