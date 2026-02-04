'use client';

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckIcon } from 'lucide-react';
import { DEFAULT_PROJECT_COLOR } from '../constants';
import type { Project } from '../hooks/types';
import { useSearchableList } from '../hooks/use-searchable-list';

interface ProjectFilterMenuProps {
  projects: Project[];
  selectedProjects: string[];
  onToggleProject: (projectId: string) => void;
  onClearFilters: () => void;
}

export const ProjectFilterMenu = ({
  projects,
  selectedProjects,
  onToggleProject,
  onClearFilters,
}: ProjectFilterMenuProps) => {
  const {
    searchQuery,
    setSearchQuery,
    filteredItems: filteredProjects,
  } = useSearchableList(projects, (project, query) =>
    project.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="w-48">
        <div className="flex w-full items-center justify-between">
          Filter by projects
          {selectedProjects.length > 0 && (
            <span className="bg-primary/15 text-primary ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium">
              {selectedProjects.length}
            </span>
          )}
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56">
        <div className="px-2">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 rounded-none border-0 bg-transparent! px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <DropdownMenuSeparator />
        {filteredProjects.length === 0 ? (
          <div className="text-muted-foreground px-2 py-6 text-center text-sm">
            No projects found
          </div>
        ) : (
          <ScrollArea>
            <div className="max-h-64">
              {filteredProjects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    onToggleProject(project.id);
                  }}
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
              ))}
            </div>
          </ScrollArea>
        )}
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
