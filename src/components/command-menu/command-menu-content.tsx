import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PopoverContent } from '@/components/ui/popover';
import type { ReactNode } from 'react';

interface CommandMenuContentProps {
  mode: 'dialog' | 'popover';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  children: ReactNode;
}

export const CommandMenuContent = ({
  mode,
  open,
  onOpenChange,
  onEscapeKeyDown,
  children,
}: CommandMenuContentProps) => {
  if (mode === 'dialog') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="h-full max-h-[338px] border-0 sm:max-w-xl"
          onEscapeKeyDown={onEscapeKeyDown}
        >
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <PopoverContent
      className="dark:bg-popover/70 bg-popover/50 w-(--radix-popover-trigger-width) p-0 shadow-lg backdrop-blur-xl backdrop-saturate-150"
      align="start"
      sideOffset={20}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onEscapeKeyDown={onEscapeKeyDown}
    >
      {children}
    </PopoverContent>
  );
};
