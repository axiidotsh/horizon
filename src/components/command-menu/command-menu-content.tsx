import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PopoverContent } from '@/components/ui/popover';
import { useEffect, type ReactNode } from 'react';

interface CommandMenuContentProps {
  mode: 'dialog' | 'popover' | 'mobile';
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
  useEffect(() => {
    if (mode === 'mobile' && open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mode, open]);

  if (mode === 'mobile') {
    return (
      <Dialog modal={false} open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="inset-0 z-70 max-h-none min-h-dvh w-full max-w-none! translate-x-0 translate-y-0 rounded-none border-0 p-0"
          onEscapeKeyDown={onEscapeKeyDown}
          showCloseButton={false}
          overlayClassName="bg-background opacity-100"
          contentClassName="pointer-events-auto overflow-y-auto"
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-mobile-dock]')) {
              e.preventDefault();
            }
          }}
        >
          {children}
          <div className="h-14 w-full" />
        </DialogContent>
      </Dialog>
    );
  }

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
      className="dark:bg-popover/70 data-[state=closed]:zoom-out-100! data-[state=open]:zoom-in-100! data-[side=bottom]:slide-in-from-top-4! w-(--radix-popover-trigger-width) p-0 shadow-lg backdrop-blur-xl backdrop-saturate-150"
      align="start"
      sideOffset={20}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onEscapeKeyDown={onEscapeKeyDown}
      onInteractOutside={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('[data-slot="command-input"]') ||
          target.closest('[data-slot="command-input-wrapper"]') ||
          target.closest('[data-slot="popover-anchor"]')
        ) {
          e.preventDefault();
        }
      }}
      onPointerDownOutside={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('[data-slot="command-input"]') ||
          target.closest('[data-slot="command-input-wrapper"]') ||
          target.closest('[data-slot="popover-anchor"]')
        ) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </PopoverContent>
  );
};
