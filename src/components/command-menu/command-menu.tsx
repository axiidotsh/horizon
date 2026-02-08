'use client';

import { useSettings } from '@/app/(protected)/(main)/settings/hooks/queries/use-settings';
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
import { useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export const CommandMenu = () => {
  const { state, actions } = useCommandState();
  const commands = useCommandRegistry();
  const items = useCommandItems();
  const { handleAction, handleDateToggle } = useCommandActions();
  const { data: settings } = useSettings();
  const isMobile = useIsMobile();

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogInputRef = useRef<HTMLInputElement>(null);

  const isCentered = settings?.commandMenuPosition === 'center';
  const showStartFocusItem = !commands.some((cmd) => cmd.category === 'focus');

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      if (state.open) {
        actions.setOpen(false);
      } else {
        actions.setOpen(true);
        requestAnimationFrame(() => {
          if (isCentered) {
            dialogInputRef.current?.focus();
          } else {
            inputRef.current?.focus();
          }
        });
      }
    },
    { enableOnFormTags: true }
  );

  const handleCommandSelect = useCallback(
    (command: CommandDefinition) => {
      command.handler();
      actions.reset();
      if (!isCentered) {
        inputRef.current?.blur();
      }
    },
    [actions, isCentered]
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
        if (!isCentered) {
          inputRef.current?.blur();
        }
      }
    },
    [state.selectedItem, handleAction, actions, isCentered]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (state.selectedItem) {
        handleDateToggle(state.selectedItem, date);
        actions.reset();
        if (!isCentered) {
          inputRef.current?.blur();
        }
      }
    },
    [state.selectedItem, handleDateToggle, actions, isCentered]
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

  const handleInputFocus = useCallback(() => {
    if (!isCentered && state.searchValue === '' && !state.open) {
      actions.setOpen(true);
    }
  }, [isCentered, state.searchValue, state.open, actions]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isCentered) {
        if (e.key === 'Escape' && state.searchValue === '' && !state.open) {
          inputRef.current?.blur();
        }
      }
    },
    [isCentered, state.searchValue, state.open]
  );

  const handleSearchValueChange = useCallback(
    (value: string) => {
      actions.setSearchValue(value);
      if (!isCentered && value !== '' && !state.open) {
        actions.setOpen(true);
      }
    },
    [isCentered, state.open, actions]
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

  // Mobile uses dedicated /search route, so we skip rendering on mobile
  if (isMobile) {
    return null;
  }

  if (isCentered) {
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
          mode="dialog"
          open={state.open}
          onOpenChange={handleOpenChange}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          <Command
            className="bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] w-full translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg border shadow-lg"
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
              showBackButton={false}
            />
            <CommandList className="max-h-80">
              {!state.selectedItem ? (
                <CommandPalette
                  commands={commands}
                  todos={items.todos}
                  projects={items.projects}
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
    <Popover modal={false} open={state.open} onOpenChange={handleOpenChange}>
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
          onSearchValueChange={handleSearchValueChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          isOpen={state.open}
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
                projects={items.projects}
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
