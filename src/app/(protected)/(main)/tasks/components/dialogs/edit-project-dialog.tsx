'use client';

import { ColorPicker } from '@/components/color-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { editingProjectAtom } from '../../atoms/task-dialogs';
import { DEFAULT_BLUE_COLOR } from '../../constants';
import { useUpdateProject } from '../../hooks/mutations/use-update-project';

export const EditProjectDialog = () => {
  const [project, setProject] = useAtom(editingProjectAtom);
  const updateProject = useUpdateProject();

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(DEFAULT_BLUE_COLOR);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color ?? DEFAULT_BLUE_COLOR);
    }
  }, [project]);

  const handleClose = () => {
    setProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !name.trim()) return;

    updateProject.mutate(
      {
        param: { id: project.id },
        json: {
          name: name.trim(),
          color,
        },
      },
      {
        onSuccess: handleClose,
      }
    );
  };

  return (
    <ResponsiveDialog
      open={!!project}
      onOpenChange={(open) => !open && handleClose()}
    >
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edit Project</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Name</Label>
              <Input
                id="edit-project-name"
                placeholder="Project name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
                    #
                  </span>
                  <Input
                    value={color.replace('#', '')}
                    onChange={(e) => {
                      const hex = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                      if (hex.length <= 6) {
                        setColor(`#${hex}`);
                      }
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="pl-7"
                  />
                </div>
                <ColorPicker
                  value={color}
                  onChange={setColor}
                  className="size-9"
                />
              </div>
            </div>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateProject.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || updateProject.isPending}
              isLoading={updateProject.isPending}
              loadingContent="Saving..."
            >
              Save
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
