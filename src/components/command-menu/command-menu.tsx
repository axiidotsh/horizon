'use client';

import { settingsAtom } from '@/atoms/settings-atoms';
import { CommandActionsView } from '@/components/command-menu/command-actions-view';
import { CommandMenuContent } from '@/components/command-menu/command-menu-content';
import { CommandMenuFooter } from '@/components/command-menu/command-menu-footer';
import { CommandMenuTrigger } from '@/components/command-menu/command-menu-trigger';
import { CommandPalette } from '@/components/command-menu/command-palette';
import { Command, CommandInput, CommandList } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import type { CommandDefinition } from '@/hooks/command-menu/types';
import { useCommandActions } from '@/hooks/command-menu/use-command-actions';
import { useCommandItems } from '@/hooks/command-menu/use-command-items';
import { useCommandRegistry } from '@/hooks/command-menu/use-command-registry';
import { useCommandState } from '@/hooks/command-menu/use-command-state';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAtomValue } from 'jotai';
import { useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export const CommandMenu = () => {
  const { state, actions } = useCommandState();
  const commands = useCommandRegistry();
  const items = useCommandItems();
  const { handleAction, handleDateToggle } = useCommandActions();
  const settings = useAtomValue(settingsAtom);
  const isMobile = useIsMobile();

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

  const isCentered = settings.commandMenuPosition === 'center';
  const showStartFocusItem = !commands.some((cmd) => cmd.category === 'focus');

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      actions.setOpen((prev) => {
        if (!prev) {
          setTimeout(() => {
            if (isCentered) {
              dialogInputRef.current?.focus();
            } else {
              inputRef.current?.focus();
            }
          }, 0);
        }
        return !prev;
      });
    },
    { enableOnFormTags: true }
  );

  const handleCommandSelect = useCallback(
    (command: CommandDefinition) => {
      command.handler();
      actions.reset();
    },
    [actions]
  );

  const handleItemSelect = useCallback(
    (item: typeof state.selectedItem) => {
      actions.setSelectedItem(item);
      actions.setSearchValue('');
    },
    [actions, state.selectedItem]
  );

  const handleActionSelect = useCallback(
    (action: string) => {
      if (state.selectedItem) {
        handleAction(action, state.selectedItem);
        actions.reset();
      }
    },
    [state.selectedItem, handleAction, actions]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (state.selectedItem) {
        handleDateToggle(state.selectedItem, date);
        actions.reset();
      }
    },
    [state.selectedItem, handleDateToggle, actions]
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        actions.reset();
      } else {
        actions.setOpen(true);
      }
    },
    [actions]
  );

  const handleEscapeKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state.selectedItem) {
        e.preventDefault();
        actions.setSelectedItem(null);
        actions.setSelectedValue('');
      }
    },
    [state.selectedItem, actions]
  );

  const mode = isMobile ? 'mobile' : 'dialog';

  if (isCentered || isMobile) {
    return (
      <>
        <CommandMenuTrigger
          mode="dialog"
          inputRef={inputRef}
          searchValue=""
          onSearchValueChange={() => {}}
          onFocus={() => actions.setOpen(true)}
        />
        <CommandMenuContent
          mode={mode}
          open={state.open}
          onOpenChange={handleOpenChange}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <Command
            className={
              isMobile
                ? 'bg-background flex h-full flex-col'
                : 'bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-70 w-full translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg border shadow-lg'
            }
            shouldFilter={true}
            value={state.selectedValue}
            onValueChange={actions.setSelectedValue}
          >
            <CommandInput
              ref={dialogInputRef}
              placeholder="Search for items and commands..."
              value={state.searchValue}
              onValueChange={actions.setSearchValue}
              containerClassName="h-10!"
              className="h-10!"
              showBackButton={isMobile && !!state.selectedItem}
              onBackClick={() => {
                actions.setSelectedItem(null);
                actions.setSelectedValue('');
              }}
            />
            <CommandList
              className={isMobile ? 'max-h-none flex-1' : 'max-h-80'}
            >
              {!state.selectedItem ? (
                <CommandPalette
                  commands={commands}
                  todos={items.todos}
                  habits={items.habits}
                  sessions={items.sessions}
                  showStartFocusItem={showStartFocusItem}
                  onCommandSelect={handleCommandSelect}
                  onItemSelect={handleItemSelect}
                />
              ) : (
                <CommandActionsView
                  item={state.selectedItem}
                  onAction={handleActionSelect}
                  onDateSelect={handleDateSelect}
                />
              )}
            </CommandList>
            {state.selectedItem && <CommandMenuFooter />}
          </Command>
        </CommandMenuContent>
      </>
    );
  }

  return (
    <Popover open={state.open} onOpenChange={handleOpenChange}>
      <Command
        className="bg-transparent **:data-[slot=command-input-wrapper]:flex-1 **:data-[slot=command-input-wrapper]:border-0 **:data-[slot=command-input-wrapper]:px-0"
        shouldFilter={true}
        value={state.selectedValue}
        onValueChange={actions.setSelectedValue}
      >
        <CommandMenuTrigger
          mode="popover"
          inputRef={inputRef}
          searchValue={state.searchValue}
          onSearchValueChange={actions.setSearchValue}
          onFocus={() => actions.setOpen(true)}
        />
        <CommandMenuContent
          mode="popover"
          open={state.open}
          onOpenChange={handleOpenChange}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <CommandList className="max-h-80">
            {!state.selectedItem ? (
              <CommandPalette
                commands={commands}
                todos={items.todos}
                habits={items.habits}
                sessions={items.sessions}
                showStartFocusItem={showStartFocusItem}
                onCommandSelect={handleCommandSelect}
                onItemSelect={handleItemSelect}
              />
            ) : (
              <CommandActionsView
                item={state.selectedItem}
                onAction={handleActionSelect}
                onDateSelect={handleDateSelect}
              />
            )}
          </CommandList>
          {state.selectedItem && <CommandMenuFooter />}
        </CommandMenuContent>
      </Command>
    </Popover>
  );
};
