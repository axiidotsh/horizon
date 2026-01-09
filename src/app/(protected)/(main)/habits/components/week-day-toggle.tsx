import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/utils';
import type { CompletionRecord } from '../hooks/types';
import {
  formatFullDate,
  getLast7Days,
  isSameDay,
  isToday,
} from '../utils/date-helpers';

interface WeekDayToggleProps {
  completionHistory: CompletionRecord[];
  onToggleDay: (date: Date) => void;
  disabled?: boolean;
}

export const WeekDayToggle = ({
  completionHistory,
  onToggleDay,
  disabled = false,
}: WeekDayToggleProps) => {
  const days = getLast7Days();

  function isCompleted(date: Date): boolean {
    return completionHistory.some(
      (record) => isSameDay(new Date(record.date), date) && record.completed
    );
  }

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
                  disabled &&
                    'pointer-events-none cursor-not-allowed opacity-50'
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
};
