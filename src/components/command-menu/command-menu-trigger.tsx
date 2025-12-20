import { Command, CommandInput } from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { PopoverAnchor } from '@/components/ui/popover';
import type { RefObject } from 'react';

interface CommandMenuTriggerProps {
  mode: 'dialog' | 'popover';
  inputRef: RefObject<HTMLInputElement | null>;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onFocus: () => void;
}

export const CommandMenuTrigger = ({
  mode,
  inputRef,
  searchValue,
  onSearchValueChange,
  onFocus,
}: CommandMenuTriggerProps) => {
  if (mode === 'dialog') {
    return (
      <Command className="bg-transparent **:data-[slot=command-input-wrapper]:flex-1 **:data-[slot=command-input-wrapper]:border-0 **:data-[slot=command-input-wrapper]:px-0">
        <div className="flex w-full items-center">
          <CommandInput
            ref={inputRef}
            placeholder="Search for items and commands..."
            onFocus={onFocus}
            value=""
            readOnly
          />
          <Kbd>⌘K</Kbd>
        </div>
      </Command>
    );
  }

  return (
    <PopoverAnchor asChild>
      <div className="flex w-full items-center">
        <CommandInput
          ref={inputRef}
          placeholder="Search for items and commands..."
          onFocus={onFocus}
          value={searchValue}
          onValueChange={onSearchValueChange}
        />
        <Kbd>⌘K</Kbd>
      </div>
    </PopoverAnchor>
  );
};
