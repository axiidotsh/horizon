'use client';

import type { CommandMenuItem } from '@/components/command-menu/types';
import { CommandItem } from '@/components/ui/command';
import { cn } from '@/utils/utils';
import {
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  ClockIcon,
  PencilIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  TrashIcon,
} from 'lucide-react';
import { useMemo } from 'react';

interface SearchActionsProps {
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

const FOCUS_DURATION_OPTIONS = [
  { label: '25 minutes', value: '25' },
  { label: '45 minutes', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '1.5 hours', value: '90' },
];

const TASK_PRIORITY_OPTIONS = [
  { label: 'Low', value: 'LOW', icon: SignalLowIcon },
  { label: 'Medium', value: 'MEDIUM', icon: SignalMediumIcon },
  { label: 'High', value: 'HIGH', icon: SignalHighIcon },
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

export const FocusStartActions = ({
  onAction,
}: {
  onAction: (action: string) => void;
}) => {
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
};

export const FocusDurationActions = ({
  onAction,
}: {
  onAction: (action: string) => void;
}) => {
  return (
    <>
      {FOCUS_DURATION_OPTIONS.map((option) => (
        <CommandItem
          key={option.value}
          onSelect={() => onAction(`duration-${option.value}`)}
        >
          <ClockIcon className="size-4" />
          <span>{option.label}</span>
        </CommandItem>
      ))}
      <CommandItem onSelect={() => onAction('duration-custom')}>
        <PencilIcon className="size-4" />
        <span>Custom...</span>
      </CommandItem>
    </>
  );
};

export const TaskPriorityActions = ({
  onAction,
}: {
  onAction: (action: string) => void;
}) => {
  return (
    <>
      {TASK_PRIORITY_OPTIONS.map((option) => (
        <CommandItem
          key={option.value}
          onSelect={() => onAction(`priority-${option.value}`)}
        >
          <option.icon className="size-4" />
          <span>{option.label}</span>
        </CommandItem>
      ))}
    </>
  );
};

export const TodoActions = ({
  item,
  onAction,
}: {
  item: Extract<CommandMenuItem, { type: 'todo' }>;
  onAction: (action: string) => void;
}) => {
  return (
    <>
      <CommandItem onSelect={() => onAction('toggle')}>
        {item.data.completed ? (
          <CircleIcon className="size-4" />
        ) : (
          <CheckCircle2Icon className="size-4" />
        )}
        <span>{item.data.completed ? 'Mark as undone' : 'Mark as done'}</span>
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
        <span>Move to Trash</span>
      </CommandItem>
    </>
  );
};

export const ProjectActions = ({
  onAction,
}: {
  onAction: (action: string) => void;
}) => {
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
        <span>Move to Trash</span>
      </CommandItem>
    </>
  );
};

export const HabitActions = ({
  onAction,
}: {
  onAction: (action: string) => void;
}) => {
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
        <span>Move to Trash</span>
      </CommandItem>
    </>
  );
};

export const SessionActions = ({
  onAction,
}: {
  onAction: (action: string) => void;
}) => {
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
        <span>Move to Trash</span>
      </CommandItem>
    </>
  );
};

export const HabitDateActions = ({
  onDateSelect,
}: {
  onDateSelect: (date: Date) => void;
}) => {
  const last7Days = useMemo(() => getLast7Days(), []);

  return (
    <>
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
    </>
  );
};

export const SearchActions = ({ item, onAction }: SearchActionsProps) => {
  switch (item.type) {
    case 'focus-start':
      return <FocusStartActions onAction={onAction} />;
    case 'focus-duration':
      return <FocusDurationActions onAction={onAction} />;
    case 'task-priority':
      return <TaskPriorityActions onAction={onAction} />;
    case 'todo':
      return <TodoActions item={item} onAction={onAction} />;
    case 'project':
      return <ProjectActions onAction={onAction} />;
    case 'habit':
      return <HabitActions onAction={onAction} />;
    case 'session':
      return <SessionActions onAction={onAction} />;
    default:
      return null;
  }
};
