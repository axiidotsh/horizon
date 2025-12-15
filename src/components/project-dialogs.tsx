'use client';

import { CreateProjectDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/create-project-dialog';
import { EditProjectDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/edit-project-dialog';

export function ProjectDialogs() {
  return (
    <>
      <CreateProjectDialog />
      <EditProjectDialog />
    </>
  );
}
