'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RotateCcwIcon, TrashIcon } from 'lucide-react';
import { EmptyTrashDialog } from './empty-trash-dialog';

interface TrashToolbarProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onRestoreSelected: () => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  isRestoring?: boolean;
  isDeleting?: boolean;
  isClearing?: boolean;
  typeName: string;
}

export const TrashToolbar = ({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onRestoreSelected,
  onDeleteSelected,
  onClearAll,
  isRestoring,
  isDeleting,
  isClearing,
  typeName,
}: TrashToolbarProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 border-b px-4 py-2 md:gap-3 md:px-2">
      <Checkbox
        checked={isAllSelected}
        onCheckedChange={(checked) => onSelectAll(!!checked)}
      />
      {selectedCount > 0 ? (
        <>
          <span className="text-muted-foreground truncate text-sm">
            {selectedCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={onRestoreSelected}
            disabled={isRestoring}
          >
            <RotateCcwIcon className="size-4" />
            <span className="hidden sm:inline">Restore</span>
          </Button>
          <EmptyTrashDialog
            title={`Delete ${selectedCount} ${typeName}?`}
            description="This action cannot be undone. These items will be permanently deleted."
            onConfirm={onDeleteSelected}
            isPending={isDeleting}
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive shrink-0"
              disabled={isDeleting}
            >
              <TrashIcon className="size-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </EmptyTrashDialog>
        </>
      ) : (
        <span className="text-muted-foreground truncate text-sm">
          {totalCount} {typeName}
        </span>
      )}
      <div className="ml-auto shrink-0">
        <EmptyTrashDialog
          title={`Delete all ${typeName}?`}
          description={`This action cannot be undone. All ${totalCount} ${typeName} will be permanently deleted.`}
          onConfirm={onClearAll}
          isPending={isClearing}
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={isClearing}
          >
            Clear all
          </Button>
        </EmptyTrashDialog>
      </div>
    </div>
  );
};
