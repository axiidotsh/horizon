'use client';

import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { useAtom } from 'jotai';
import { ArrowDownUpIcon } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { showSessionsDialogAtom } from '../../atoms/session-dialogs';
import { useInfiniteRecentSessions } from '../../hooks/queries/use-infinite-recent-sessions';
import { SessionsTable } from '../sessions-table';

export const RecentSessionsDialog = () => {
  const [open, setOpen] = useAtom(showSessionsDialogAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'date'>('date');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    sessions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteRecentSessions({
    search: debouncedSearchQuery || undefined,
    sortBy,
    sortOrder: 'desc',
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
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogContent className="sm:max-w-3xl!">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Recent Sessions</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <SearchBar
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 flex-1 border"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  tooltip="Sort sessions"
                >
                  <ArrowDownUpIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'date'}
                  onCheckedChange={() => setSortBy('date')}
                >
                  Sort by date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'name'}
                  onCheckedChange={() => setSortBy('name')}
                >
                  Sort by name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'duration'}
                  onCheckedChange={() => setSortBy('duration')}
                >
                  Sort by duration
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="h-[60vh] overflow-y-auto">
            <SessionsTable
              sessions={sessions}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              sentinelRef={sentinelRef}
            />
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
