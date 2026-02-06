'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/utils';
import {
  CheckIcon,
  ChevronsUpDownIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react';
import { useSearchableList } from '../../hooks/use-searchable-list';
import { TagBadge } from '../badges/tag-badge';

const MAX_TAGS = 5;

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

export const TagInput = ({ tags, onChange, suggestions }: TagInputProps) => {
  const {
    searchQuery,
    setSearchQuery,
    filteredItems: filteredSuggestions,
    reset,
  } = useSearchableList(suggestions, (suggestion, query) =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < MAX_TAGS) {
      onChange([...tags, trimmed]);
    }
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

  const showCreateNew =
    searchQuery.trim() &&
    !suggestions.includes(searchQuery.trim().toLowerCase()) &&
    !tags.includes(searchQuery.trim().toLowerCase()) &&
    tags.length < MAX_TAGS;

  return (
    <DropdownMenu onOpenChange={(open) => !open && reset()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-auto min-h-9 w-full justify-between font-normal"
        >
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onRemove={(e) => {
                    e?.stopPropagation();
                    e?.preventDefault();
                    removeTag(tag);
                  }}
                />
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Select tags...</span>
          )}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width)"
      >
        <div className="flex items-center gap-2 px-2">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <Input
            type="text"
            placeholder="Search or create tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && showCreateNew) {
                e.preventDefault();
                addTag(searchQuery);
                setSearchQuery('');
              }
            }}
            className="h-8 rounded-none border-0 bg-transparent! px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <DropdownMenuSeparator />
        {showCreateNew && (
          <>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                addTag(searchQuery);
                setSearchQuery('');
              }}
              className="justify-between"
            >
              <div className="flex items-center gap-2">
                <PlusIcon className="text-muted-foreground size-4" />
                <span>Create &quot;{searchQuery.trim()}&quot;</span>
              </div>
            </DropdownMenuItem>
            {filteredSuggestions.length > 0 && <DropdownMenuSeparator />}
          </>
        )}
        {filteredSuggestions.length === 0 && !showCreateNew ? (
          <div className="text-muted-foreground px-2 py-6 text-center text-sm">
            {tags.length >= MAX_TAGS
              ? `Maximum ${MAX_TAGS} tags reached`
              : 'No tags found'}
          </div>
        ) : (
          <ScrollArea>
            <div className="max-h-64">
              {filteredSuggestions.map((suggestion) => {
                const isSelected = tags.includes(suggestion);
                const isDisabled = !isSelected && tags.length >= MAX_TAGS;
                return (
                  <DropdownMenuItem
                    key={suggestion}
                    onSelect={(e) => {
                      e.preventDefault();
                      if (!isDisabled) toggleTag(suggestion);
                    }}
                    disabled={isDisabled}
                    className={cn(
                      'justify-between',
                      isDisabled && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">#</span>
                      <span>{suggestion}</span>
                    </div>
                    {isSelected && <CheckIcon className="size-4" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
