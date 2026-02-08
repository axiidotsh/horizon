'use client';

import {
  commandSearchValueAtom,
  selectedItemAtom,
} from '@/atoms/command-menu-atoms';
import {
  CommandDefinitionItem,
  HabitDateActions,
  SearchActions,
  SearchItem,
} from '@/components/command-menu/items';
import type { CommandMenuItem } from '@/components/command-menu/types';
import { getItemTitle } from '@/components/command-menu/types';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import type { CommandDefinition } from '@/hooks/command-menu/types';
import { useCommandActions } from '@/hooks/command-menu/use-command-actions';
import { useCommandItems } from '@/hooks/command-menu/use-command-items';
import { useCommandRegistry } from '@/hooks/command-menu/use-command-registry';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function SearchPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useAtom(commandSearchValueAtom);
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);
  const [selectedValue, setSelectedValue] = useState('');

  const commands = useCommandRegistry();
  const items = useCommandItems();
  const { handleAction, handleDateToggle } = useCommandActions();

  const showStartFocusItem = !commands.some((cmd) => cmd.category === 'focus');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleCommandSelect = useCallback(
    (command: CommandDefinition) => {
      command.handler();
      setSearchValue('');
      setSelectedItem(null);
      if (command.category !== 'page' && command.id !== 'new-chat') {
        router.back();
      }
    },
    [router, setSearchValue, setSelectedItem]
  );

  const handleItemSelect = useCallback(
    (item: CommandMenuItem) => {
      setSelectedItem(item);
      setSearchValue('');
    },
    [setSelectedItem, setSearchValue]
  );

  const handleActionSelect = useCallback(
    (action: string) => {
      if (selectedItem) {
        handleAction(action, selectedItem);
        setSearchValue('');
        setSelectedItem(null);
        router.back();
      }
    },
    [selectedItem, handleAction, setSearchValue, setSelectedItem, router]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (selectedItem) {
        handleDateToggle(selectedItem, date);
        setSearchValue('');
        setSelectedItem(null);
        router.back();
      }
    },
    [selectedItem, handleDateToggle, setSearchValue, setSelectedItem, router]
  );

  const pageCommands = commands.filter((cmd) => cmd.category === 'page');
  const focusCommands = commands.filter((cmd) => cmd.category === 'focus');
  const createCommands = commands.filter((cmd) => cmd.category === 'create');
  const themeCommands = commands.filter((cmd) => cmd.category === 'theme');
  const positionCommands = commands.filter(
    (cmd) => cmd.category === 'position'
  );
  const trashCommands = commands.filter((cmd) => cmd.category === 'trash');
  const accountCommands = commands.filter((cmd) => cmd.category === 'account');

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <Command
        className="bg-background flex h-full flex-col"
        shouldFilter={true}
        value={selectedValue}
        onValueChange={setSelectedValue}
      >
        <CommandInput
          value={searchValue}
          onValueChange={setSearchValue}
          className="sr-only"
          containerClassName="sr-only h-0 border-0"
        />
        <CommandList className="max-h-none flex-1 overflow-y-auto">
          {!selectedItem ? (
            <>
              <CommandEmpty className="border-0 py-6 text-center text-sm">
                No results found.
              </CommandEmpty>

              <CommandGroup heading="Pages">
                {pageCommands.map((command) => (
                  <CommandDefinitionItem
                    key={command.id}
                    command={command}
                    onSelect={() => handleCommandSelect(command)}
                  />
                ))}
              </CommandGroup>

              {focusCommands.length > 0 && (
                <CommandGroup heading="Focus">
                  {focusCommands.map((command) => (
                    <CommandDefinitionItem
                      key={command.id}
                      command={command}
                      onSelect={() => handleCommandSelect(command)}
                    />
                  ))}
                </CommandGroup>
              )}

              <CommandGroup heading="Create">
                {createCommands.map((command) => (
                  <CommandDefinitionItem
                    key={command.id}
                    command={command}
                    onSelect={() => handleCommandSelect(command)}
                  />
                ))}
              </CommandGroup>

              <CommandGroup heading="Theme">
                {themeCommands.map((command) => (
                  <CommandDefinitionItem
                    key={command.id}
                    command={command}
                    onSelect={() => handleCommandSelect(command)}
                  />
                ))}
              </CommandGroup>

              <CommandGroup heading="Command Menu Position">
                {positionCommands.map((command) => (
                  <CommandDefinitionItem
                    key={command.id}
                    command={command}
                    onSelect={() => handleCommandSelect(command)}
                  />
                ))}
              </CommandGroup>

              <CommandGroup heading="Trash">
                {trashCommands.map((command) => (
                  <CommandDefinitionItem
                    key={command.id}
                    command={command}
                    onSelect={() => handleCommandSelect(command)}
                  />
                ))}
              </CommandGroup>

              <CommandGroup heading="Account">
                {accountCommands.map((command) => (
                  <CommandDefinitionItem
                    key={command.id}
                    command={command}
                    onSelect={() => handleCommandSelect(command)}
                  />
                ))}
              </CommandGroup>

              <CommandSeparator />

              {showStartFocusItem && (
                <CommandGroup heading="Focus">
                  <SearchItem
                    item={{ type: 'focus-start' }}
                    onSelect={() => handleItemSelect({ type: 'focus-start' })}
                  />
                </CommandGroup>
              )}

              <CommandGroup heading="Settings">
                <SearchItem
                  item={{ type: 'focus-duration' }}
                  onSelect={() => handleItemSelect({ type: 'focus-duration' })}
                />
                <SearchItem
                  item={{ type: 'task-priority' }}
                  onSelect={() => handleItemSelect({ type: 'task-priority' })}
                />
              </CommandGroup>

              {items.todos.length > 0 && (
                <CommandGroup heading="Todos">
                  {items.todos.map((item) => (
                    <SearchItem
                      key={`todo:${item.data.id}`}
                      item={item}
                      onSelect={() => handleItemSelect(item)}
                    />
                  ))}
                </CommandGroup>
              )}

              {items.projects.length > 0 && (
                <CommandGroup heading="Projects">
                  {items.projects.map((item) => (
                    <SearchItem
                      key={`project:${item.data.id}`}
                      item={item}
                      onSelect={() => handleItemSelect(item)}
                    />
                  ))}
                </CommandGroup>
              )}

              {items.habits.length > 0 && (
                <CommandGroup heading="Habits">
                  {items.habits.map((item) => (
                    <SearchItem
                      key={`habit:${item.data.id}`}
                      item={item}
                      onSelect={() => handleItemSelect(item)}
                    />
                  ))}
                </CommandGroup>
              )}

              {items.sessions.length > 0 && (
                <CommandGroup heading="Recent Sessions">
                  {items.sessions.map((item) => (
                    <SearchItem
                      key={`session:${item.data.id}`}
                      item={item}
                      onSelect={() => handleItemSelect(item)}
                    />
                  ))}
                </CommandGroup>
              )}
            </>
          ) : (
            <>
              <CommandEmpty className="border-0 py-6 text-center text-sm">
                No results found.
              </CommandEmpty>
              <CommandGroup heading={getItemTitle(selectedItem)}>
                <SearchActions
                  item={selectedItem}
                  onAction={handleActionSelect}
                  onDateSelect={handleDateSelect}
                />
              </CommandGroup>
              {selectedItem.type === 'habit' && (
                <CommandGroup heading="Mark done for...">
                  <HabitDateActions onDateSelect={handleDateSelect} />
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </Command>
      <div className="h-16.5 w-full shrink-0" />
    </div>
  );
}
