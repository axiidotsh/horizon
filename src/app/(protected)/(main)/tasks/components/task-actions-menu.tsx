'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisIcon, PencilIcon, TrashIcon } from 'lucide-react';

interface TaskActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export const TaskActionsMenu = ({
  onEdit,
  onDelete,
  disabled,
}: TaskActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={disabled}
        aria-label="Task options"
        tooltip="Task options"
      >
        <EllipsisIcon />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={onEdit} disabled={disabled}>
        <PencilIcon />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem
        variant="destructive"
        onSelect={onDelete}
        disabled={disabled}
      >
        <TrashIcon />
        Move to trash
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
