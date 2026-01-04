'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/utils';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';
import { TagBadge } from '../badges/tag-badge';

const MAX_TAGS = 5;

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

export const TagInput = ({ tags, onChange, suggestions }: TagInputProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < MAX_TAGS) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
      setOpen(true);
    }
  };

  const availableSuggestions = suggestions.filter((s) => !tags.includes(s));
  const filteredSuggestions = availableSuggestions.filter((s) =>
    s.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showCreateNew =
    inputValue.trim() &&
    !suggestions.includes(inputValue.trim().toLowerCase()) &&
    !tags.includes(inputValue.trim().toLowerCase()) &&
    tags.length < MAX_TAGS;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            'border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
            'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm',
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden'
          )}
          onClick={() => setOpen(!open)}
        >
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onRemove={(e) => {
                    e?.stopPropagation();
                    removeTag(tag);
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">
              Select tags{tags.length > 0 && ` (${tags.length}/${MAX_TAGS})`}...
            </span>
          )}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput
            placeholder="Search or create tag..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {tags.length >= MAX_TAGS
                ? `Maximum ${MAX_TAGS} tags reached`
                : 'No tags found'}
            </CommandEmpty>
            {showCreateNew && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      addTag(inputValue);
                      setOpen(true);
                    }}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">#</span>
                      <span>Create &quot;{inputValue.trim()}&quot;</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
                {filteredSuggestions.length > 0 && <CommandSeparator />}
              </>
            )}
            {filteredSuggestions.length > 0 && (
              <CommandGroup>
                {filteredSuggestions.map((suggestion) => {
                  const isDisabled =
                    !tags.includes(suggestion) && tags.length >= MAX_TAGS;
                  return (
                    <CommandItem
                      key={suggestion}
                      onSelect={() => {
                        if (!isDisabled) {
                          toggleTag(suggestion);
                          setOpen(true);
                        }
                      }}
                      disabled={isDisabled}
                      className="justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">#</span>
                        <span>{suggestion}</span>
                      </div>
                      {tags.includes(suggestion) && (
                        <CheckIcon className="size-4" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {tags.length > 0 && availableSuggestions.length > 0 && (
              <CommandSeparator />
            )}
            {tags.length > 0 && (
              <CommandGroup heading="Selected">
                {tags.map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => {
                      removeTag(tag);
                      setOpen(true);
                    }}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">#</span>
                      <span>{tag}</span>
                    </div>
                    <CheckIcon className="size-4" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
