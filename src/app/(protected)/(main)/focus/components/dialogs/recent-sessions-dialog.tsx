'use client';

import { SearchBar } from '@/components/search-bar';
import { SortingMenu } from '@/components/sorting-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/utils/utils';
import { useAtom } from 'jotai';
import { ArrowDownUpIcon } from 'lucide-react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  sessionSortByAtom,
  sessionSortOrderAtom,
} from '../../atoms/session-atoms';
import { showSessionsDialogAtom } from '../../atoms/session-dialogs';
import { useInfiniteRecentSessions } from '../../hooks/queries/use-infinite-recent-sessions';
import { SessionsTable } from '../sessions-table';

export const RecentSessionsDialog = () => {
  const [open, setOpen] = useAtom(showSessionsDialogAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useAtom(sessionSortByAtom);
  const [sortOrder, setSortOrder] = useAtom(sessionSortOrderAtom);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const isMobile = useIsMobile();

  const hasActiveSorting = sortBy !== 'date' || sortOrder !== 'desc';

  const {
    sessions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteRecentSessions({
    search: debouncedSearchQuery || undefined,
    sortBy,
    sortOrder,
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
      <ResponsiveDialogContent className="px-6 md:max-w-3xl">
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
                  className={cn(
                    hasActiveSorting &&
                      'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:hover:bg-primary/20'
                  )}
                >
                  <ArrowDownUpIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <SortingMenu
                  title="Date"
                  sortKey="date"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                  }}
                  options={[
                    { label: 'Newest → Oldest', order: 'desc' },
                    { label: 'Oldest → Newest', order: 'asc' },
                  ]}
                />
                <SortingMenu
                  title="Name"
                  sortKey="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                  }}
                  options={[
                    { label: 'A → Z', order: 'asc' },
                    { label: 'Z → A', order: 'desc' },
                  ]}
                />
                <SortingMenu
                  title="Duration"
                  sortKey="duration"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onChange={(by, order) => {
                    setSortBy(by);
                    setSortOrder(order);
                  }}
                  options={[
                    { label: 'Longest → Shortest', order: 'desc' },
                    { label: 'Shortest → Longest', order: 'asc' },
                  ]}
                />
                {hasActiveSorting && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => {
                        setSortBy('date');
                        setSortOrder('desc');
                      }}
                      className="justify-center"
                    >
                      Reset sorting
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isMobile ? (
            <div className="-mx-6 h-[60vh] overflow-auto px-6">
              <SessionsTable
                sessions={sessions}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                sentinelRef={sentinelRef}
              />
            </div>
          ) : (
            <ScrollArea className="-mx-6 h-[60vh] px-6">
              <SessionsTable
                sessions={sessions}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                sentinelRef={sentinelRef}
              />
            </ScrollArea>
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
