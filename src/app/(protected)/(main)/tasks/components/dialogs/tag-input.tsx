'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

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
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-3 p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                  >
                    <XIcon className="size-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">
              Select tags{tags.length > 0 && ` (${tags.length}/${MAX_TAGS})`}...
            </span>
          )}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
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
