'use client';

import { SearchBar } from '@/components/search-bar';
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
  FilterIcon,
  FolderIcon,
  ListPlusIcon,
  ListTodoIcon,
  PlusIcon,
} from 'lucide-react';
import {
  projectSearchQueryAtom,
  searchQueryAtom,
  selectedProjectsAtom,
  selectedTagsAtom,
  sortByAtom,
  tagSearchQueryAtom,
} from '../../atoms/task-atoms';
import {
  bulkAddTasksSheetAtom,
  createProjectDialogAtom,
  createTaskDialogAtom,
} from '../../atoms/task-dialogs';
import { useProjects } from '../../hooks/queries/use-projects';
import type { Project } from '../../hooks/types';
import { useExistingTags } from '../../hooks/use-existing-tags';
import { ProjectFilterMenu } from '../project-filter-menu';
import { TagFilterMenu } from '../tag-filter-menu';

export const TaskListActions = () => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedTags, setSelectedTags] = useAtom(selectedTagsAtom);
  const [selectedProjects, setSelectedProjects] = useAtom(selectedProjectsAtom);
  const [sortBy, setSortBy] = useAtom(sortByAtom);
  const [tagSearchQuery, setTagSearchQuery] = useAtom(tagSearchQueryAtom);
  const [projectSearchQuery, setProjectSearchQuery] = useAtom(
    projectSearchQueryAtom
  );
  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);
  const setCreateProjectDialog = useSetAtom(createProjectDialogAtom);
  const setBulkAddTasksSheet = useSetAtom(bulkAddTasksSheetAtom);

  const { data: projects = [] } = useProjects() as {
    data: Project[] | undefined;
  };
  const allTags = useExistingTags();

  const hasActiveFilters =
    selectedTags.length > 0 || selectedProjects.length > 0;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <SearchBar
          placeholder="Search habits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 w-full border shadow-xs sm:w-60"
        />
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
                searchQuery={projectSearchQuery}
                onSearchQueryChange={setProjectSearchQuery}
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
                searchQuery={tagSearchQuery}
                onSearchQueryChange={setTagSearchQuery}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="outline" tooltip="Create new...">
                <PlusIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setCreateTaskDialog(true)}>
                <ListTodoIcon />
                Add a Task
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setBulkAddTasksSheet(true)}>
                <ListPlusIcon />
                Bulk Add Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCreateProjectDialog(true)}>
                <FolderIcon />
                Add a Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
    </div>
  );
};
