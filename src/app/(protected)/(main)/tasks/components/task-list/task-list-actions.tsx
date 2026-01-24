'use client';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/utils';
import { useAtom, useSetAtom } from 'jotai';
import {
  ArrowDownUpIcon,
  CircleIcon,
  FilterIcon,
  FolderIcon,
  ListPlusIcon,
  PlusIcon,
} from 'lucide-react';
import {
  selectedProjectsAtom,
  selectedTagsAtom,
  sortByAtom,
} from '../../atoms/task-atoms';
import {
  bulkAddTasksSheetAtom,
  createProjectDialogAtom,
  createTaskDialogAtom,
} from '../../atoms/task-dialogs';
import { useProjects } from '../../hooks/queries/use-projects';
import { useTaskTags } from '../../hooks/queries/use-task-tags';
import type { Project } from '../../hooks/types';
import { ProjectFilterMenu } from '../project-filter-menu';
import { TagFilterMenu } from '../tag-filter-menu';

export const TaskListActions = () => {
  const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom);
  const [selectedProjects, setSelectedProjects] = useAtom(selectedProjectsAtom);
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);
  const setCreateProjectDialog = useSetAtom(createProjectDialogAtom);
  const setBulkAddTasksSheet = useSetAtom(bulkAddTasksSheetAtom);

  const { data: projects = [] } = useProjects() as {
    data: Project[] | undefined;
  };
  const { data: allTags = [] } = useTaskTags();

  const hasActiveFilters =
    selectedTags.length > 0 || selectedProjects.length > 0;

  return (
    <>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="outline"
              tooltip="Filter tasks"
              className={cn(
                'relative',
                hasActiveFilters && 'bg-foreground/20! text-foreground'
              )}
            >
              <FilterIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <ProjectFilterMenu
              projects={projects}
              selectedProjects={selectedProjects}
              onToggleProject={(projectId) =>
                setSelectedProjects((prev) =>
                  prev.includes(projectId)
                    ? prev.filter((p) => p !== projectId)
                    : [...prev, projectId]
                )
              }
              onClearFilters={() => setSelectedProjects([])}
            />
            <TagFilterMenu
              tags={allTags}
              selectedTags={selectedTags}
              onToggleTag={(tag) =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                )
              }
              onClearFilters={() => setSelectedTags([])}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="outline" tooltip="Sort tasks">
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
      </ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <PlusIcon />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setCreateTaskDialog(true)}>
            <CircleIcon />
            Task
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setBulkAddTasksSheet(true)}>
            <ListPlusIcon />
            Bulk Tasks
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCreateProjectDialog(true)}>
            <FolderIcon />
            Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
