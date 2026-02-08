'use client';

import type { CommandMenuItem } from '@/components/command-menu/types';
import { CommandItem } from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import type { CommandDefinition } from '@/hooks/command-menu/types';
import { cn } from '@/utils/utils';
import {
  CheckCircle2Icon,
  CircleIcon,
  ClockPlusIcon,
  FolderIcon,
  PlayIcon,
  SignalIcon,
  TimerIcon,
} from 'lucide-react';

interface CommandItemBaseProps {
  onSelect: () => void;
  className?: string;
}

interface CommandDefinitionItemProps extends CommandItemBaseProps {
  command: CommandDefinition;
}

export const CommandDefinitionItem = ({
  command,
  onSelect,
  className,
}: CommandDefinitionItemProps) => {
  return (
    <CommandItem
      value={[command.id, command.name, ...(command.keywords ?? [])].join(' ')}
      onSelect={onSelect}
      className={cn(command.destructive && 'text-destructive!', className)}
    >
      <command.icon
        className={cn('size-3.5', command.destructive && 'text-destructive!')}
      />
      <span>{command.name}</span>
    </CommandItem>
  );
};

interface TodoItemProps extends CommandItemBaseProps {
  item: Extract<CommandMenuItem, { type: 'todo' }>;
  showActions?: boolean;
}

export const TodoItem = ({
  item,
  onSelect,
  showActions = true,
  className,
}: TodoItemProps) => {
  return (
    <CommandItem
      value={`todo:${item.data.id}:${item.data.title}`}
      onSelect={onSelect}
      className={className}
    >
      {item.data.completed ? (
        <CheckCircle2Icon className="text-muted-foreground size-3.5" />
      ) : (
        <CircleIcon className="size-3.5" />
      )}
      <span
        className={cn(
          'line-clamp-2',
          item.data.completed ? 'text-muted-foreground line-through' : ''
        )}
      >
        {item.data.title}
      </span>
      {showActions && (
        <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
          Actions
          <Kbd>↵</Kbd>
        </span>
      )}
    </CommandItem>
  );
};

interface ProjectItemProps extends CommandItemBaseProps {
  item: Extract<CommandMenuItem, { type: 'project' }>;
  showActions?: boolean;
}

export const ProjectItem = ({
  item,
  onSelect,
  showActions = true,
  className,
}: ProjectItemProps) => {
  return (
    <CommandItem
      value={`project:${item.data.id}:${item.data.name}`}
      onSelect={onSelect}
      className={className}
    >
      <FolderIcon className="size-3.5" />
      <span className="line-clamp-2">{item.data.name}</span>
      {showActions && (
        <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
          Actions
          <Kbd>↵</Kbd>
        </span>
      )}
    </CommandItem>
  );
};

interface HabitItemProps extends CommandItemBaseProps {
  item: Extract<CommandMenuItem, { type: 'habit' }>;
  showActions?: boolean;
}

export const HabitItem = ({
  item,
  onSelect,
  showActions = true,
  className,
}: HabitItemProps) => {
  return (
    <CommandItem
      value={`habit:${item.data.id}:${item.data.title}`}
      onSelect={onSelect}
      className={className}
    >
      <TimerIcon className="size-3.5" />
      <span className="line-clamp-2">{item.data.title}</span>
      {showActions && (
        <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
          Actions
          <Kbd>↵</Kbd>
        </span>
      )}
    </CommandItem>
  );
};

interface SessionItemProps extends CommandItemBaseProps {
  item: Extract<CommandMenuItem, { type: 'session' }>;
  showActions?: boolean;
}

export const SessionItem = ({
  item,
  onSelect,
  showActions = true,
  className,
}: SessionItemProps) => {
  return (
    <CommandItem
      value={`session:${item.data.id}:${item.data.task || 'Focus session'}`}
      onSelect={onSelect}
      className={className}
    >
      <ClockPlusIcon className="size-3.5" />
      <span className="line-clamp-2">{item.data.task || 'Focus session'}</span>
      <span className="text-muted-foreground text-xs">
        {item.data.durationMinutes}m
      </span>
      {showActions && (
        <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
          Actions
          <Kbd>↵</Kbd>
        </span>
      )}
    </CommandItem>
  );
};

type FocusStartItemProps = CommandItemBaseProps;

export const FocusStartItem = ({
  onSelect,
  className,
}: FocusStartItemProps) => {
  return (
    <CommandItem
      value="start focus session begin timer pomodoro work"
      onSelect={onSelect}
      className={className}
    >
      <PlayIcon className="size-3.5" />
      <span>Start focus session</span>
      <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
        Actions
        <Kbd>↵</Kbd>
      </span>
    </CommandItem>
  );
};

type FocusDurationItemProps = CommandItemBaseProps;

export const FocusDurationItem = ({
  onSelect,
  className,
}: FocusDurationItemProps) => {
  return (
    <CommandItem
      value="set default focus duration timer minutes session pomodoro"
      onSelect={onSelect}
      className={className}
    >
      <TimerIcon className="size-3.5" />
      <span>Set default focus duration</span>
      <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
        Actions
        <Kbd>↵</Kbd>
      </span>
    </CommandItem>
  );
};

type TaskPriorityItemProps = CommandItemBaseProps;

export const TaskPriorityItem = ({
  onSelect,
  className,
}: TaskPriorityItemProps) => {
  return (
    <CommandItem
      value="set default task priority low medium high"
      onSelect={onSelect}
      className={className}
    >
      <SignalIcon className="size-3.5" />
      <span>Set default task priority</span>
      <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
        Actions
        <Kbd>↵</Kbd>
      </span>
    </CommandItem>
  );
};

interface SearchItemProps extends CommandItemBaseProps {
  item: CommandMenuItem;
  showActions?: boolean;
}

export const SearchItem = ({
  item,
  onSelect,
  showActions = true,
  className,
}: SearchItemProps) => {
  switch (item.type) {
    case 'todo':
      return (
        <TodoItem
          item={item}
          onSelect={onSelect}
          showActions={showActions}
          className={className}
        />
      );
    case 'project':
      return (
        <ProjectItem
          item={item}
          onSelect={onSelect}
          showActions={showActions}
          className={className}
        />
      );
    case 'habit':
      return (
        <HabitItem
          item={item}
          onSelect={onSelect}
          showActions={showActions}
          className={className}
        />
      );
    case 'session':
      return (
        <SessionItem
          item={item}
          onSelect={onSelect}
          showActions={showActions}
          className={className}
        />
      );
    case 'focus-start':
      return <FocusStartItem onSelect={onSelect} className={className} />;
    case 'focus-duration':
      return <FocusDurationItem onSelect={onSelect} className={className} />;
    case 'task-priority':
      return <TaskPriorityItem onSelect={onSelect} className={className} />;
    default:
      return null;
  }
};
