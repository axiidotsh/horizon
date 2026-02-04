'use client';

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckIcon } from 'lucide-react';
import { useSearchableList } from '../hooks/use-searchable-list';

interface TagFilterMenuProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
}

export const TagFilterMenu = ({
  tags,
  selectedTags,
  onToggleTag,
  onClearFilters,
}: TagFilterMenuProps) => {
  const {
    searchQuery,
    setSearchQuery,
    filteredItems: filteredTags,
  } = useSearchableList(tags, (tag, query) =>
    tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="w-48">
        <div className="flex w-full items-center justify-between">
          Filter by tags
          {selectedTags.length > 0 && (
            <span className="bg-primary/15 text-primary ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium">
              {selectedTags.length}
            </span>
          )}
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56">
        <div className="px-2">
          <Input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 rounded-none border-0 bg-transparent! px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <DropdownMenuSeparator />
        {filteredTags.length === 0 ? (
          <div className="text-muted-foreground px-2 py-6 text-center text-sm">
            No tags found
          </div>
        ) : (
          <ScrollArea>
            <div className="max-h-64">
              {filteredTags.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onSelect={(e) => {
                    e.preventDefault();
                    onToggleTag(tag);
                  }}
                  className="justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#</span>
                    <span>{tag}</span>
                  </div>
                  {selectedTags.includes(tag) && (
                    <CheckIcon className="size-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}
        {selectedTags.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onClearFilters}
              className="justify-center"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
