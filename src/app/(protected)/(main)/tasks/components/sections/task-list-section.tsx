'use client';

import { useAtomValue } from 'jotai';
import { ClipboardCheckIcon, ListChecksIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ContentCard } from '../../../components/content-card';
import {
  searchQueryAtom,
  selectedProjectsAtom,
  selectedTagsAtom,
  sortByAtom,
} from '../../atoms/task-atoms';
import { useTasks } from '../../hooks/queries/use-tasks';
import {
  filterTasks,
  groupTasksByDueDate,
  sortTasks,
} from '../../utils/task-filters';
import { TaskListSkeleton } from '../skeletons/task-list-skeleton';
import { TaskListActions } from '../task-list/task-list-actions';
import { TaskListGroup } from '../task-list/task-list-group';

interface TaskListSectionProps {
  isDashboard?: boolean;
}

export const TaskListSection = ({
  isDashboard = false,
}: TaskListSectionProps) => {
  const { data: tasks = [], isLoading } = useTasks();
  const sortBy = useAtomValue(sortByAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const selectedTags = useAtomValue(selectedTagsAtom);
  const selectedProjects = useAtomValue(selectedProjectsAtom);

  const filteredTasks = filterTasks(
    tasks,
    searchQuery,
    selectedTags,
    selectedProjects
  );
  const sortedTasks = sortTasks(filteredTasks, sortBy);
  const groupedTasks = groupTasksByDueDate(sortedTasks);

  const defaultOpenSection = useMemo(() => {
    if (isDashboard) {
      if (groupedTasks.dueToday.length > 0) return 'dueToday';
      if (groupedTasks.overdue.length > 0) return 'overdue';
      return 'dueToday';
    }
    if (groupedTasks.dueToday.length > 0) return 'dueToday';
    if (groupedTasks.dueThisWeek.length > 0) return 'dueThisWeek';
    if (groupedTasks.upcoming.length > 0) return 'upcoming';
    if (groupedTasks.overdue.length > 0) return 'overdue';
    if (groupedTasks.noDueDate.length > 0) return 'noDueDate';
    return 'dueToday';
  }, [groupedTasks, isDashboard]);

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setOpenSections(new Set([defaultOpenSection]));
  }, [defaultOpenSection]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return <TaskListSkeleton />;
    }

    if (tasks.length === 0) {
      return (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-24 text-center">
          <ClipboardCheckIcon className="mb-2 size-12 stroke-1 opacity-50" />
          <p className="text-sm font-medium">No tasks yet</p>
          <p className="text-xs">Create your first task to get started</p>
        </div>
      );
    }

    if (sortedTasks.length === 0) {
      return (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-24 text-center">
          <ListChecksIcon className="mb-2 size-12 stroke-1 opacity-50" />
          <p className="text-sm font-medium">No tasks found</p>
          <p className="text-xs">Try adjusting your search or filters</p>
        </div>
      );
    }

    if (isDashboard) {
      return (
        <div className="my-4 space-y-1">
          <TaskListGroup
            title="Due Today"
            tasks={groupedTasks.dueToday}
            isOpen={openSections.has('dueToday')}
            onToggle={() => toggleSection('dueToday')}
          />
          <TaskListGroup
            title="Overdue"
            tasks={groupedTasks.overdue}
            isOpen={openSections.has('overdue')}
            onToggle={() => toggleSection('overdue')}
          />
          <TaskListGroup
            title="No due date"
            tasks={groupedTasks.noDueDate}
            isOpen={openSections.has('noDueDate')}
            onToggle={() => toggleSection('noDueDate')}
          />
          <TaskListGroup
            title="Due this week"
            tasks={groupedTasks.dueThisWeek}
            isOpen={openSections.has('dueThisWeek')}
            onToggle={() => toggleSection('dueThisWeek')}
          />
          <TaskListGroup
            title="Upcoming"
            tasks={groupedTasks.upcoming}
            isOpen={openSections.has('upcoming')}
            onToggle={() => toggleSection('upcoming')}
          />
        </div>
      );
    }

    return (
      <div className="my-4 space-y-1">
        <TaskListGroup
          title="Overdue"
          tasks={groupedTasks.overdue}
          isOpen={openSections.has('overdue')}
          onToggle={() => toggleSection('overdue')}
        />
        <TaskListGroup
          title="Due Today"
          tasks={groupedTasks.dueToday}
          isOpen={openSections.has('dueToday')}
          onToggle={() => toggleSection('dueToday')}
        />
        <TaskListGroup
          title="Due this week"
          tasks={groupedTasks.dueThisWeek}
          isOpen={openSections.has('dueThisWeek')}
          onToggle={() => toggleSection('dueThisWeek')}
        />
        <TaskListGroup
          title="Upcoming"
          tasks={groupedTasks.upcoming}
          isOpen={openSections.has('upcoming')}
          onToggle={() => toggleSection('upcoming')}
        />
        <TaskListGroup
          title="No due date"
          tasks={groupedTasks.noDueDate}
          isOpen={openSections.has('noDueDate')}
          onToggle={() => toggleSection('noDueDate')}
        />
      </div>
    );
  };

  return (
    <ContentCard
      title="Task List"
      action={<TaskListActions />}
      headerClassName="max-sm:!flex-col max-sm:!items-start max-sm:!justify-start"
    >
      {renderContent()}
    </ContentCard>
  );
};
