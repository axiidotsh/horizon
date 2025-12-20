import type { CommandMenuItem } from '@/components/command-menu/types';
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import type { CommandDefinition } from '@/hooks/command-menu/types';
import { cn } from '@/utils/utils';
import {
  CheckCircle2Icon,
  CircleIcon,
  ClockPlusIcon,
  TimerIcon,
} from 'lucide-react';

interface CommandGroupsProps {
  commands: CommandDefinition[];
  todos: CommandMenuItem[];
  habits: CommandMenuItem[];
  sessions: CommandMenuItem[];
  onCommandSelect: (command: CommandDefinition) => void;
  onItemSelect: (item: CommandMenuItem) => void;
}

export const CommandGroups = ({
  commands,
  todos,
  habits,
  sessions,
  onCommandSelect,
  onItemSelect,
}: CommandGroupsProps) => {
  const pageCommands = commands.filter((cmd) => cmd.category === 'page');
  const focusCommands = commands.filter((cmd) => cmd.category === 'focus');
  const createCommands = commands.filter((cmd) => cmd.category === 'create');
  const themeCommands = commands.filter((cmd) => cmd.category === 'theme');
  const positionCommands = commands.filter(
    (cmd) => cmd.category === 'position'
  );
  const accountCommands = commands.filter((cmd) => cmd.category === 'account');

  return (
    <>
      <CommandGroup heading="Pages">
        {pageCommands.map((command) => (
          <CommandItem
            key={command.id}
            value={[command.name, ...(command.keywords ?? [])].join(' ')}
            onSelect={() => onCommandSelect(command)}
          >
            <command.icon className="size-3.5" />
            <span>{command.name}</span>
          </CommandItem>
        ))}
      </CommandGroup>

      {focusCommands.length > 0 && (
        <CommandGroup heading="Focus">
          {focusCommands.map((command) => (
            <CommandItem
              key={command.id}
              value={[command.name, ...(command.keywords ?? [])].join(' ')}
              onSelect={() => onCommandSelect(command)}
              className={command.destructive ? 'text-destructive!' : ''}
            >
              <command.icon
                className={cn(
                  'size-3.5',
                  command.destructive && 'text-destructive!'
                )}
              />
              <span>{command.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      <CommandGroup heading="Create">
        {createCommands.map((command) => (
          <CommandItem
            key={command.id}
            value={[command.name, ...(command.keywords ?? [])].join(' ')}
            onSelect={() => onCommandSelect(command)}
          >
            <command.icon className="size-3.5" />
            <span>{command.name}</span>
          </CommandItem>
        ))}
      </CommandGroup>

      <CommandSeparator />

      {todos.length > 0 && (
        <CommandGroup heading="Todos">
          {todos
            .filter((item) => item.type === 'todo')
            .map((item) => (
              <CommandItem
                key={`todo:${item.data.id}`}
                value={`todo ${item.data.title}`}
                onSelect={() => onItemSelect(item)}
              >
                {item.data.completed ? (
                  <CheckCircle2Icon className="text-muted-foreground size-3.5" />
                ) : (
                  <CircleIcon className="size-3.5" />
                )}
                <span
                  className={
                    item.data.completed
                      ? 'text-muted-foreground line-through'
                      : ''
                  }
                >
                  {item.data.title}
                </span>
                <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
                  Actions
                  <Kbd>↵</Kbd>
                </span>
              </CommandItem>
            ))}
        </CommandGroup>
      )}

      {habits.length > 0 && (
        <CommandGroup heading="Habits">
          {habits
            .filter((item) => item.type === 'habit')
            .map((item) => (
              <CommandItem
                key={`habit:${item.data.id}`}
                value={`habit ${item.data.title}`}
                onSelect={() => onItemSelect(item)}
              >
                <TimerIcon className="size-3.5" />
                <span>{item.data.title}</span>
                <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
                  Actions
                  <Kbd>↵</Kbd>
                </span>
              </CommandItem>
            ))}
        </CommandGroup>
      )}

      {sessions.length > 0 && (
        <CommandGroup heading="Recent Sessions">
          {sessions
            .filter((item) => item.type === 'session')
            .map((item) => (
              <CommandItem
                key={`session:${item.data.id}`}
                value={`session ${item.data.task || 'Focus session'}`}
                onSelect={() => onItemSelect(item)}
              >
                <ClockPlusIcon className="size-3.5" />
                <span>{item.data.task || 'Focus session'}</span>
                <span className="text-muted-foreground text-xs">
                  {item.data.durationMinutes}m
                </span>
                <span className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
                  Actions
                  <Kbd>↵</Kbd>
                </span>
              </CommandItem>
            ))}
        </CommandGroup>
      )}

      <CommandSeparator />

      <CommandGroup heading="Theme">
        {themeCommands.map((command) => (
          <CommandItem
            key={command.id}
            value={[command.name, ...(command.keywords ?? [])].join(' ')}
            onSelect={() => onCommandSelect(command)}
          >
            <command.icon className="size-3.5" />
            <span>{command.name}</span>
          </CommandItem>
        ))}
      </CommandGroup>

      <CommandGroup heading="Command Menu Position">
        {positionCommands.map((command) => (
          <CommandItem
            key={command.id}
            value={[command.name, ...(command.keywords ?? [])].join(' ')}
            onSelect={() => onCommandSelect(command)}
          >
            <command.icon className="size-3.5" />
            <span>{command.name}</span>
          </CommandItem>
        ))}
      </CommandGroup>

      <CommandGroup heading="Account">
        {accountCommands.map((command) => (
          <CommandItem
            key={command.id}
            value={[command.name, ...(command.keywords ?? [])].join(' ')}
            onSelect={() => onCommandSelect(command)}
            className={command.destructive ? 'text-destructive!' : ''}
          >
            <command.icon
              className={cn(
                'size-3.5',
                command.destructive && 'text-destructive!'
              )}
            />
            <span>{command.name}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
};
