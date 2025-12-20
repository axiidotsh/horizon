import type { CommandMenuItem } from '@/components/command-menu/types';
import { getItemTitle } from '@/components/command-menu/types';
import { CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/utils/utils';
import {
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { CommandMenuEmpty } from './command-menu-empty';

interface CommandActionsViewProps {
  item: CommandMenuItem;
  onAction: (action: string) => void;
  onDateSelect?: (date: Date) => void;
}

const PRESET_TIMERS = [
  { label: '15 minutes', value: '15' },
  { label: '25 minutes (Pomodoro)', value: '25' },
  { label: '45 minutes', value: '45' },
  { label: '60 minutes', value: '60' },
  { label: '90 minutes', value: '90' },
  { label: '120 minutes', value: '120' },
];

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getLast7Days(): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
}

export const CommandActionsView = ({
  item,
  onAction,
  onDateSelect,
}: CommandActionsViewProps) => {
  const last7Days = useMemo(() => getLast7Days(), []);

  const renderActions = () => {
    if (item.type === 'focus-start') {
      return (
        <>
          {PRESET_TIMERS.map((timer) => (
            <CommandItem
              key={timer.value}
              onSelect={() => onAction(`start-${timer.value}`)}
            >
              <ClockIcon className="size-4" />
              <span>{timer.label}</span>
            </CommandItem>
          ))}
          <CommandItem onSelect={() => onAction('custom')}>
            <PencilIcon className="size-4" />
            <span>Custom...</span>
          </CommandItem>
        </>
      );
    }

    if (item.type === 'todo') {
      return (
        <>
          <CommandItem onSelect={() => onAction('toggle')}>
            {item.data.completed ? (
              <CircleIcon className="size-4" />
            ) : (
              <CheckCircle2Icon className="size-4" />
            )}
            <span>
              {item.data.completed ? 'Mark as undone' : 'Mark as done'}
            </span>
          </CommandItem>
          <CommandItem onSelect={() => onAction('edit')}>
            <PencilIcon className="size-4" />
            <span>Edit</span>
          </CommandItem>
          <CommandItem
            onSelect={() => onAction('delete')}
            className="text-destructive!"
          >
            <TrashIcon className={cn('size-4', 'text-destructive!')} />
            <span>Delete</span>
          </CommandItem>
        </>
      );
    }

    if (item.type === 'habit') {
      return (
        <>
          <CommandItem onSelect={() => onAction('edit')}>
            <PencilIcon className="size-4" />
            <span>Edit</span>
          </CommandItem>
          <CommandItem
            onSelect={() => onAction('delete')}
            className="text-destructive!"
          >
            <TrashIcon className={cn('size-4', 'text-destructive!')} />
            <span>Delete</span>
          </CommandItem>
        </>
      );
    }

    if (item.type === 'session') {
      return (
        <>
          <CommandItem onSelect={() => onAction('edit')}>
            <PencilIcon className="size-4" />
            <span>Edit</span>
          </CommandItem>
          <CommandItem
            onSelect={() => onAction('delete')}
            className="text-destructive!"
          >
            <TrashIcon className={cn('size-4', 'text-destructive!')} />
            <span>Delete</span>
          </CommandItem>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <CommandMenuEmpty />
      <CommandGroup heading={getItemTitle(item)}>
        {renderActions()}
      </CommandGroup>
      {item.type === 'habit' && onDateSelect && (
        <CommandGroup heading="Mark done for...">
          {last7Days.map((date) => (
            <CommandItem
              key={date.toISOString()}
              value={formatDate(date)}
              onSelect={() => onDateSelect(date)}
            >
              <CalendarIcon className="size-4" />
              <span>{formatDate(date)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
};
