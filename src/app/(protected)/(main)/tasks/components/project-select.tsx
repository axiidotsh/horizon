'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { CheckIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_PROJECT_COLOR, MAX_DROPDOWN_HEIGHT } from '../constants';
import type { Project } from '../hooks/types';

interface ProjectSelectProps {
  projects: Project[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export const ProjectSelect = ({
  projects,
  value,
  onValueChange,
  placeholder = 'Select project...',
  id,
}: ProjectSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const selectedProject = projects.find((p) => p.id === value);

  const filteredProjects = searchQuery.trim()
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  return (
    <DropdownMenu onOpenChange={(open) => !open && setSearchQuery('')}>
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className="w-full justify-start font-normal"
        >
          {selectedProject ? selectedProject.name : placeholder}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <div className="flex items-center gap-2 px-2">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 rounded-none border-0 bg-transparent! px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <DropdownMenuSeparator />
        <div
          style={{ maxHeight: MAX_DROPDOWN_HEIGHT }}
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
                onSelect={() =>
                  onValueChange(value === project.id ? '' : project.id)
                }
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
                {value === project.id && <CheckIcon className="size-4" />}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
