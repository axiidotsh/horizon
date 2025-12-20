'use client';

import { ColorPicker } from '@/components/color-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { createProjectDialogAtom } from '../../atoms/task-dialogs';
import { useCreateProject } from '../../hooks/mutations/use-create-project';

export const CreateProjectDialog = () => {
  const [open, setOpen] = useAtom(createProjectDialogAtom);
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>('#3b82f6');

  const resetForm = () => {
    setName('');
    setColor('#3b82f6');
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate(
      {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="Project name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createProject.isPending}
              isLoading={createProject.isPending}
              loadingContent="Creating..."
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
