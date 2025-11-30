'use client';

import { SearchBar } from '@/components/search-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAtom } from 'jotai';
import { ArrowDownUpIcon, FilterIcon, PlusIcon } from 'lucide-react';
import {
  searchQueryAtom,
  selectedTagsAtom,
  sortByAtom,
  tagSearchQueryAtom,
} from './task-atoms';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

interface TaskListActionsProps {
  tasks: Task[];
}

export function TaskListActions({ tasks }: TaskListActionsProps) {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom);
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [tagSearchQuery, setTagSearchQuery] = useAtom(tagSearchQueryAtom);

  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  const getFilteredTags = (): string[] => {
    const allTags = getAllTags();
    if (!tagSearchQuery.trim()) return allTags;
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  return (
    <div className="flex items-center gap-2">
      <SearchBar
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mr-1 w-[200px] border focus:w-[250px]"
        expandOnFocus
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" tooltip="Filter tasks">
            <FilterIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Filter by tags
              {selectedTags.length > 0 && (
                <span className="bg-primary text-primary-foreground ml-auto flex size-5 items-center justify-center rounded-full text-xs">
                  {selectedTags.length}
                </span>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-[200px] overflow-y-auto">
                {getFilteredTags().length === 0 ? (
                  <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                    No tags found
                  </div>
                ) : (
                  getFilteredTags().map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    >
                      <Badge variant="outline" className="h-5 text-xs">
                        {tag}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </div>
              {selectedTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={clearTagFilters}
                    className="justify-center"
                  >
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" tooltip="Sort tasks">
            <ArrowDownUpIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            checked={sortBy === 'dueDate'}
            onCheckedChange={() => setSortBy('dueDate')}
          >
            Sort by due date
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'priority'}
            onCheckedChange={() => setSortBy('priority')}
          >
            Sort by priority
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'title'}
            onCheckedChange={() => setSortBy('title')}
          >
            Sort by title
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'completed'}
            onCheckedChange={() => setSortBy('completed')}
          >
            Sort by status
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="icon-sm" variant="ghost" tooltip="Add new task">
        <PlusIcon />
      </Button>
    </div>
  );
}
