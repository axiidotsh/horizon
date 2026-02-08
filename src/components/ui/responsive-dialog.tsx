'use client';

import * as React from 'react';

import { cn } from '@/utils/utils';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ResponsiveDialog = ({
  children,
  open,
  onOpenChange,
}: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
};

export const ResponsiveDialogTrigger = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTrigger {...props}>{children}</DrawerTrigger>;
  }

  return <DialogTrigger {...props}>{children}</DialogTrigger>;
};

export const ResponsiveDialogContent = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerContent className="z-70 px-6" {...props}>
        {children}
      </DrawerContent>
    );
  }

  return <DialogContent {...props}>{children}</DialogContent>;
};

export const ResponsiveDialogHeader = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerHeader {...props}>{children}</DrawerHeader>;
  }

  return <DialogHeader {...props}>{children}</DialogHeader>;
};

export const ResponsiveDialogFooter = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerFooter className="px-0" {...props}>
        {children}
      </DrawerFooter>
    );
  }

  return <DialogFooter {...props}>{children}</DialogFooter>;
};

export const ResponsiveDialogTitle = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogTitle>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTitle {...props}>{children}</DrawerTitle>;
  }

  return <DialogTitle {...props}>{children}</DialogTitle>;
};

export const ResponsiveDialogBody = ({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        className={cn('min-h-0 flex-1 overflow-y-auto', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const ResponsiveDialogDescription = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogDescription>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerDescription {...props}>{children}</DrawerDescription>;
  }

  return <DialogDescription {...props}>{children}</DialogDescription>;
};

export const ResponsiveDialogClose = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerClose {...props}>{children}</DrawerClose>;
  }

  return <DialogClose {...props}>{children}</DialogClose>;
};
