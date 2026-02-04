'use client';

import { SortingMenu } from '@/components/sorting-menu';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';
import { useAtom, useSetAtom } from 'jotai';
import { ArrowDownUpIcon, FilterIcon, PlusIcon } from 'lucide-react';
import { createDialogOpenAtom } from '../atoms/dialog-atoms';
import {
  sortByAtom,
  sortOrderAtom,
  statusFilterAtom,
} from '../atoms/habit-atoms';

export const HabitListActions = () => {
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [sortOrder, setSortOrder] = useAtom(sortOrderAtom);
  const [statusFilter, setStatusFilter] = useAtom(statusFilterAtom);
  const setCreateDialogOpen = useSetAtom(createDialogOpenAtom);

  const hasActiveFilters = statusFilter !== 'all';
  const hasActiveSorting = sortBy !== 'currentStreak' || sortOrder !== 'desc';

  return (
    <>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="outline"
              tooltip="Filter habits"
              className={cn(
                hasActiveFilters &&
                  'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
              )}
            >
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
            <Button
              size="icon-sm"
              variant="outline"
              tooltip="Sort habits"
              className={cn(
                hasActiveSorting &&
                  'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
              )}
            >
              <ArrowDownUpIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <SortingMenu
              title="Streak"
              sortKey="currentStreak"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onChange={(by, order) => {
                setSortBy(by);
                setSortOrder(order);
              }}
              options={[
                { label: 'High → Low', order: 'desc' },
                { label: 'Low → High', order: 'asc' },
              ]}
            />
            <SortingMenu
              title="Best Streak"
              sortKey="bestStreak"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onChange={(by, order) => {
                setSortBy(by);
                setSortOrder(order);
              }}
              options={[
                { label: 'High → Low', order: 'desc' },
                { label: 'Low → High', order: 'asc' },
              ]}
            />
            <SortingMenu
              title="Title"
              sortKey="title"
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
              title="Created"
              sortKey="createdAt"
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
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setCreateDialogOpen(true)}
      >
        <PlusIcon />
        New
      </Button>
    </>
  );
};
