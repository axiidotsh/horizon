'use client';

import { PageHeading } from '@/components/page-heading';
import { SearchBar } from '@/components/search-bar';
import { useAtom, useAtomValue } from 'jotai';
import { searchQueryAtom, taskViewAtom } from './atoms/task-atoms';
import { TasksKanban } from './components/kanban/tasks-kanban';
import { TaskMetricsBadges } from './components/sections/task-metrics-badges';
import { TaskFilters } from './components/task-list/task-filters';
import { TaskListActions } from './components/task-list/task-list-actions';
import { TaskNewButton } from './components/task-list/task-new-button';
import { TaskViewToggle } from './components/task-view-toggle';
import { TasksTable } from './components/tasks-table';

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const view = useAtomValue(taskViewAtom);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {/* Mobile layout */}
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PageHeading>Tasks</PageHeading>
              <TaskMetricsBadges />
            </div>
            <TaskNewButton />
          </div>
          <div className="flex items-center gap-2">
            <SearchBar
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 flex-1 border"
            />
            <TaskFilters />
            <TaskViewToggle />
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden flex-col justify-between gap-3 sm:flex sm:flex-row sm:items-center">
          <div className="flex flex-row items-center gap-3">
            <PageHeading>Tasks</PageHeading>
            <TaskMetricsBadges />
          </div>
          <div className="flex items-center gap-2">
            <SearchBar
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border md:w-80 lg:w-96"
            />
            <TaskViewToggle />
            <TaskListActions />
          </div>
        </div>
      </div>
      {view === 'list' ? <TasksTable /> : <TasksKanban />}
    </div>
  );
}
