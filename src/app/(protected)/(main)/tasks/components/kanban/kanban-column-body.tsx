'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useAtomValue } from 'jotai';
import { InboxIcon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import {
  searchQueryAtom,
  selectedProjectsAtom,
  selectedTagsAtom,
  sortByAtom,
  sortOrderAtom,
} from '../../atoms/task-atoms';
import { useInfiniteTasks } from '../../hooks/queries/use-infinite-tasks';
import type { TaskPriority } from '../../hooks/types';

interface KanbanColumnBodyProps {
  priority?: TaskPriority;
  completed?: boolean;
}

export function useKanbanColumn({
  priority,
  completed,
}: KanbanColumnBodyProps) {
  const searchQuery = useAtomValue(searchQueryAtom);
  const selectedTags = useAtomValue(selectedTagsAtom);
  const selectedProjects = useAtomValue(selectedProjectsAtom);
  const sortBy = useAtomValue(sortByAtom);
  const sortOrder = useAtomValue(sortOrderAtom);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const effectiveSortBy = sortBy === 'priority' ? undefined : sortBy;

  const result = useInfiniteTasks({
    search: debouncedSearchQuery || undefined,
    sortBy: effectiveSortBy,
    sortOrder,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
    completed,
    priority,
    limit: 20,
  });

  return result;
}

export const KanbanColumnSentinel = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) => {
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0,
  });

  return (
    <>
      {isFetchingNextPage && (
        <div className="space-y-2 px-1">
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      )}
      <div ref={ref} className="h-px" />
    </>
  );
};

export const KanbanColumnLoading = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-20 w-full rounded-lg" />
    ))}
  </div>
);

export const KanbanColumnEmpty = () => (
  <div className="text-muted-foreground flex flex-col items-center gap-1 py-8 text-center">
    <InboxIcon className="size-5 opacity-50" />
    <p className="text-xs">No tasks</p>
  </div>
);
