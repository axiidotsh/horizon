'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { signOut } from '@/lib/auth-client';
import {
  BrainIcon,
  CheckSquareIcon,
  ClockPlusIcon,
  GoalIcon,
  LayoutDashboardIcon,
  LayoutListIcon,
  LogOutIcon,
  MessageCirclePlusIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
  TimerIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface CommandItemBase {
  name: string;
  searchWords?: string[];
  icon: React.ComponentType<{ className?: string }>;
}

interface PageItem extends CommandItemBase {
  href: string;
}

interface CommandItem extends CommandItemBase {
  action: string;
}

interface ThemeItem extends CommandItemBase {
  value: string;
}

const pages: PageItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
    searchWords: ['home', 'overview', 'main'],
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: BrainIcon,
    searchWords: ['ai', 'assistant', 'conversation', 'message'],
  },
  {
    name: 'Focus',
    href: '/focus',
    icon: ClockPlusIcon,
    searchWords: ['timer', 'pomodoro', 'session', 'concentrate'],
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: LayoutListIcon,
    searchWords: ['todo', 'todos', 'list', 'items'],
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: GoalIcon,
    searchWords: ['routine', 'daily', 'goals', 'tracking'],
  },
];

const commands: CommandItem[] = [
  {
    name: 'Add new task',
    action: 'add-task',
    icon: PlusIcon,
    searchWords: ['create', 'new', 'todo'],
  },
  {
    name: 'Add new habit',
    action: 'add-habit',
    icon: CheckSquareIcon,
    searchWords: ['create', 'new', 'routine', 'goal'],
  },
  {
    name: 'Start focus session',
    action: 'start-focus',
    icon: TimerIcon,
    searchWords: ['begin', 'timer', 'pomodoro', 'work'],
  },
  {
    name: 'Create new chat',
    action: 'new-chat',
    icon: MessageCirclePlusIcon,
    searchWords: ['start', 'conversation', 'ai', 'assistant'],
  },
];

const themes: ThemeItem[] = [
  {
    name: 'Light',
    value: 'light',
    icon: SunIcon,
    searchWords: ['bright', 'day', 'white'],
  },
  {
    name: 'Dark',
    value: 'dark',
    icon: MoonIcon,
    searchWords: ['night', 'black', 'dimmed'],
  },
  {
    name: 'System',
    value: 'system',
    icon: MonitorIcon,
    searchWords: ['auto', 'default', 'os', 'preference'],
  },
];

const accountActions: CommandItem[] = [
  {
    name: 'Sign out',
    action: 'sign-out',
    icon: LogOutIcon,
    searchWords: ['log out', 'logout', 'sign out', 'signout'],
  },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setTheme } = useTheme();

  const reset = useCallback((shouldBlur = true) => {
    setOpen(false);
    setValue('');
    if (shouldBlur) {
      inputRef.current?.blur();
    }
  }, []);

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      setOpen((prev) => {
        if (!prev) inputRef.current?.focus();
        return !prev;
      });
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    'escape',
    () => {
      reset();
    },
    { enableOnFormTags: true }
  );

  const handleSelect = (callback: () => void) => {
    callback();
    reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    } else {
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Command
        className="bg-transparent **:data-[slot=command-input-wrapper]:flex-1 **:data-[slot=command-input-wrapper]:border-0 **:data-[slot=command-input-wrapper]:px-0"
        shouldFilter={true}
      >
        <PopoverAnchor asChild>
          <div className="flex w-full items-center">
            <CommandInput
              ref={inputRef}
              placeholder="Search for items and commands..."
              onFocus={() => setOpen(true)}
              value={value}
              onValueChange={setValue}
            />
            <Kbd>⌘K</Kbd>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="dark:bg-popover/70 bg-popover/50 w-(--radix-popover-trigger-width) p-0 shadow-lg backdrop-blur-xl backdrop-saturate-150"
          align="start"
          sideOffset={20}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <CommandList className="max-h-96">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
              {pages.map((page) => (
                <CommandItem
                  key={page.href}
                  value={[page.name, ...(page.searchWords ?? [])].join(' ')}
                  onSelect={() => {
                    handleSelect(() => {
                      router.push(page.href);
                    });
                  }}
                >
                  <page.icon className="size-3.5" />
                  <span>{page.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Commands">
              {commands.map((command) => (
                <CommandItem
                  key={command.action}
                  value={[command.name, ...(command.searchWords ?? [])].join(
                    ' '
                  )}
                  onSelect={() => {
                    handleSelect(() => {
                      // TODO: Execute command
                      console.log('Execute:', command.action);
                    });
                  }}
                >
                  <command.icon className="size-3.5" />
                  <span>{command.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Theme">
              {themes.map((theme) => (
                <CommandItem
                  key={theme.value}
                  value={[
                    'theme',
                    theme.name,
                    ...(theme.searchWords ?? []),
                  ].join(' ')}
                  onSelect={() => {
                    handleSelect(() => {
                      setTheme(theme.value);
                    });
                  }}
                >
                  <theme.icon className="size-3.5" />
                  <span>{theme.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Account">
              {accountActions.map((action) => (
                <CommandItem
                  key={action.action}
                  value={[action.name, ...(action.searchWords ?? [])].join(' ')}
                  onSelect={() => {
                    handleSelect(() => {
                      if (action.action === 'sign-out') {
                        signOut();
                      }
                    });
                  }}
                >
                  <action.icon className="size-3.5" />
                  <span>{action.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
