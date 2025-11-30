'use client';

import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAtom } from 'jotai';
import { ArrowDownUpIcon, FilterIcon, PlusIcon } from 'lucide-react';
import { searchQueryAtom, sortByAtom, statusFilterAtom } from './habit-atoms';

interface Habit {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  createdAt: Date;
}

interface HabitListActionsProps {
  habits: Habit[];
}

export function HabitListActions({ habits }: HabitListActionsProps) {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);

  return (
    <div className="flex items-center gap-2">
      <SearchBar
        placeholder="Search habits..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mr-1 w-[200px] border focus:w-[250px]"
        expandOnFocus
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" tooltip="Filter habits">
            <FilterIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            checked={statusFilter === 'all'}
            onCheckedChange={() => setStatusFilter('all')}
          >
            All habits
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={statusFilter === 'completed'}
            onCheckedChange={() => setStatusFilter('completed')}
          >
            Completed today
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={statusFilter === 'pending'}
            onCheckedChange={() => setStatusFilter('pending')}
          >
            Pending today
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" tooltip="Sort habits">
            <ArrowDownUpIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            checked={sortBy === 'streak'}
            onCheckedChange={() => setSortBy('streak')}
          >
            Sort by streak
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'title'}
            onCheckedChange={() => setSortBy('title')}
          >
            Sort by title
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === 'status'}
            onCheckedChange={() => setSortBy('status')}
          >
            Sort by status
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="icon-sm" variant="ghost" tooltip="Add new habit">
        <PlusIcon />
      </Button>
    </div>
  );
}
