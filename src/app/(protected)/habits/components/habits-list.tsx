import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  EllipsisIcon,
  FlameIcon,
  ListChecksIcon,
  PencilIcon,
  TargetIcon,
  Trash2Icon,
} from 'lucide-react';

export interface CompletionRecord {
  date: Date;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category?: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  createdAt: Date;
  completionHistory: CompletionRecord[];
}

interface HabitsListProps {
  habits: Habit[];
  sortedHabits: Habit[];
}

export function HabitsList({ habits, sortedHabits }: HabitsListProps) {
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
          <ul className="space-y-3 pr-4">
            {sortedHabits.map((habit) => (
              <li
                key={habit.id}
                className="border-border flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <Checkbox
                  checked={habit.completed}
                  className="mt-0.5"
                  aria-label={`Mark habit "${habit.title}" as ${habit.completed ? 'incomplete' : 'complete'}`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${habit.completed ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {habit.title}
                  </p>
                  {habit.currentStreak > 0 && (
                    <div className="mt-1.5">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="shrink-0"
                      aria-label="Habit options"
                    >
                      <EllipsisIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ScrollArea>
  );
}
