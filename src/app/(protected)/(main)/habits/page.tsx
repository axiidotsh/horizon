'use client';

import { commandMenuOpenAtom } from '@/atoms/command-menu-atoms';
import { PageHeading } from '@/components/page-heading';
import { SearchBar } from '@/components/search-bar';
import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { searchQueryAtom } from './atoms/habit-atoms';
import { HabitFilters } from './components/habit-filters';
import { HabitListActions } from './components/habit-list-actions';
import { HabitNewButton } from './components/habit-new-button';
import { HabitsTable } from './components/habits-table';
import { HabitMetricsBadges } from './components/sections/habit-metrics-badges';

export default function HabitsPage() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const isCommandMenuOpen = useAtomValue(commandMenuOpenAtom);
  const searchRef = useRef<HTMLInputElement>(null);

  useHotkeys(
    'slash',
    (e) => {
      if (isCommandMenuOpen) return;
      e.preventDefault();
      searchRef.current?.focus();
    },
    { enableOnFormTags: false }
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {/* Mobile layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PageHeading>Habits</PageHeading>
              <HabitMetricsBadges />
            </div>
            <HabitNewButton />
          </div>
          <div className="flex items-center gap-2">
            <SearchBar
              ref={searchRef}
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 flex-1 border"
            />
            <HabitFilters />
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden flex-col justify-between gap-3 lg:flex lg:flex-row lg:items-center">
          <div className="flex flex-row items-center gap-3">
            <PageHeading>Habits</PageHeading>
            <HabitMetricsBadges />
          </div>
          <div className="flex items-center gap-2">
            <SearchBar
              ref={searchRef}
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border md:w-80 lg:w-96"
            />
            <HabitListActions />
          </div>
        </div>
      </div>
      <HabitsTable />
    </div>
  );
}
