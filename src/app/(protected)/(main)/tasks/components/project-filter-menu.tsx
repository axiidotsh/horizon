'use client';

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { CheckIcon } from 'lucide-react';
import { DEFAULT_PROJECT_COLOR, FILTER_MENU_MAX_HEIGHT } from '../constants';
import type { Project } from '../hooks/types';

interface ProjectFilterMenuProps {
  projects: Project[];
  selectedProjects: string[];
  onToggleProject: (projectId: string) => void;
  onClearFilters: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const ProjectFilterMenu = ({
  projects,
  selectedProjects,
  onToggleProject,
  onClearFilters,
  searchQuery,
  onSearchQueryChange,
}: ProjectFilterMenuProps) => {
  const filteredProjects = searchQuery.trim()
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        Filter by projects
        {selectedProjects.length > 0 && (
          <span className="bg-primary text-primary-foreground ml-auto flex size-5 items-center justify-center rounded-full text-xs">
            {selectedProjects.length}
          </span>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56">
        <div className="px-2">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-8 rounded-none border-0 bg-transparent! px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <DropdownMenuSeparator />
        <div
          style={{ maxHeight: FILTER_MENU_MAX_HEIGHT }}
          className="overflow-y-auto"
        >
          {filteredProjects.length === 0 ? (
            <div className="text-muted-foreground px-2 py-6 text-center text-sm">
              No projects found
            </div>
          ) : (
            filteredProjects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onSelect={() => onToggleProject(project.id)}
                className="justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: project.color || DEFAULT_PROJECT_COLOR,
                    }}
                  />
                  <span>{project.name}</span>
                </div>
                {selectedProjects.includes(project.id) && (
                  <CheckIcon className="size-4" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
        {selectedProjects.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onClearFilters}
              className="justify-center"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
