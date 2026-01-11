'use client';

import { PageHeading } from '@/components/page-heading';
import { SearchBar } from '@/components/search-bar';
import { useAtom, useAtomValue } from 'jotai';
import { useInView } from 'react-intersection-observer';
import {
  searchQueryAtom,
  selectedProjectsAtom,
  selectedTagsAtom,
  sortByAtom,
} from './atoms/task-atoms';
import { TaskMetricsBadges } from './components/sections/task-metrics-badges';
import { TaskListActions } from './components/task-list/task-list-actions';
import { TasksTable } from './components/tasks-table';
import { useInfiniteTasks } from './hooks/queries/use-infinite-tasks';

export default function TasksPage() {
  const sortBy = useAtomValue(sortByAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const selectedTags = useAtomValue(selectedTagsAtom);
  const selectedProjects = useAtomValue(selectedProjectsAtom);

  const { tasks, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteTasks({
      search: searchQuery || undefined,
      sortBy: sortBy === 'completed' ? 'createdAt' : sortBy,
      sortOrder: sortBy === 'priority' ? 'desc' : 'asc',
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
    });

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
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
            <TaskListActions />
          </div>
        </div>
      </div>
      <TasksTable
        tasks={tasks}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
      />
    </div>
  );
}
