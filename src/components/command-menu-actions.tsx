'use client';

import type { FocusSession } from '@/app/(protected)/(main)/focus/hooks/types';
import { useToggleHabit } from '@/app/(protected)/(main)/habits/hooks/mutations/use-toggle-habit';
import type { Habit } from '@/app/(protected)/(main)/habits/hooks/types';
import type { Task } from '@/app/(protected)/(main)/tasks/hooks/types';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/utils/utils';
import {
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

type CommandMenuItem =
  | { type: 'todo'; data: Task }
  | { type: 'habit'; data: Habit }
  | { type: 'session'; data: FocusSession };

interface ActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  shortcut?: string;
}

interface CommandMenuActionsProps {
  item: CommandMenuItem;
  onAction: (action: string, item: CommandMenuItem, extra?: unknown) => void;
  onClose: () => void;
}

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

export const CommandMenuActions = ({
  item,
  onAction,
  onClose,
}: CommandMenuActionsProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const toggleHabit = useToggleHabit();

  const last7Days = useMemo(() => getLast7Days(), []);

  useHotkeys(
    'escape',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (showDatePicker) {
        setShowDatePicker(false);
        setSelectedIndex(0);
      } else {
        onClose();
      }
    },
    { enableOnFormTags: true, preventDefault: true },
    [showDatePicker, onClose]
  );

  const getItemTitle = (): string => {
    if (item.type === 'todo') return item.data.title;
    if (item.type === 'habit') return item.data.title;
    if (item.type === 'session') return item.data.task || 'Focus session';
    return '';
  };

  const actions = useMemo((): ActionItem[] => {
    const baseActions: ActionItem[] = [];

    if (item.type === 'todo') {
      baseActions.push({
        id: 'toggle',
        label: item.data.completed ? 'Mark as undone' : 'Mark as done',
        icon: item.data.completed ? CircleIcon : CheckCircle2Icon,
        shortcut: '↵',
      });
    }

    if (item.type === 'habit') {
      baseActions.push({
        id: 'mark-done',
        label: 'Mark done...',
        icon: CheckCircle2Icon,
        shortcut: '↵',
      });
    }

    baseActions.push({
      id: 'edit',
      label: 'Edit',
      icon: PencilIcon,
    });

    baseActions.push({
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      destructive: true,
    });

    return baseActions;
  }, [item]);

  const dateActions = useMemo((): ActionItem[] => {
    return last7Days.map((date) => ({
      id: `date:${date.toISOString()}`,
      label: formatDate(date),
      icon: CalendarIcon,
    }));
  }, [last7Days]);

  const currentActions = showDatePicker ? dateActions : actions;

  const filteredActions = currentActions.filter((action) =>
    action.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredActions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredActions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) handleActionSelect(action.id);
    } else if (e.key === 'Backspace') {
      if (showDatePicker && !searchValue) {
        e.preventDefault();
        setShowDatePicker(false);
        setSelectedIndex(0);
      }
    }
  };

  const handleActionSelect = (actionId: string) => {
    if (actionId === 'mark-done') {
      setShowDatePicker(true);
      setSelectedIndex(0);
      setSearchValue('');
      return;
    }

    if (actionId.startsWith('date:')) {
      const dateStr = actionId.replace('date:', '');
      const date = new Date(dateStr);
      if (item.type === 'habit') {
        toggleHabit.toggleDate.mutate({
          param: { id: item.data.id },
          json: { date: date.toISOString() },
        });
      }
      onAction('toggle-date', item, date);
      return;
    }

    onAction(actionId, item);
  };

  return (
    <div
      className="bg-popover/90 flex w-64 flex-col overflow-hidden rounded-lg border shadow-lg backdrop-blur-xl"
      onKeyDown={handleKeyDown}
    >
      <div className="border-b p-2">
        <div className="text-muted-foreground mb-2 truncate px-1 text-xs font-medium">
          {showDatePicker ? 'Mark done for...' : getItemTitle()}
        </div>
        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
          <Input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search for actions..."
            className="h-8 border-0 bg-transparent pl-7 text-sm shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto p-1">
        {filteredActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionSelect(action.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm',
              index === selectedIndex && 'bg-accent',
              action.destructive && 'text-destructive'
            )}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <action.icon
              className={cn('size-4', action.destructive && 'text-destructive')}
            />
            <span className="flex-1 text-left">{action.label}</span>
            {action.shortcut && (
              <Kbd className="text-muted-foreground text-[10px]">
                {action.shortcut}
              </Kbd>
            )}
          </button>
        ))}
        {filteredActions.length === 0 && (
          <div className="text-muted-foreground py-4 text-center text-sm">
            No actions found
          </div>
        )}
      </div>
    </div>
  );
};
