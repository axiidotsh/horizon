import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSetAtom } from 'jotai';
import { CircleIcon, FolderIcon, ListPlusIcon, PlusIcon } from 'lucide-react';
import {
  bulkAddTasksSheetAtom,
  createProjectDialogAtom,
  createTaskDialogAtom,
} from '../../tasks/atoms/task-dialogs';

export const DashboardTaskListActions = () => {
  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);
  const setCreateProjectDialog = useSetAtom(createProjectDialogAtom);
  const setBulkAddTasksSheet = useSetAtom(bulkAddTasksSheetAtom);

  return (
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
  );
};
