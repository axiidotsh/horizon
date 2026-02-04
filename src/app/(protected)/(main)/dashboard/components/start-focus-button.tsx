'use client';

import { createCustomSessionAtom } from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { Button } from '@/components/ui/button';
import { useSetAtom } from 'jotai';
import { TimerIcon } from 'lucide-react';

export function StartFocusButton() {
  const setCreateCustomSessionOpen = useSetAtom(createCustomSessionAtom);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCreateCustomSessionOpen(true)}
    >
      <TimerIcon />
      <span className="hidden sm:inline">Start Focusing</span>
    </Button>
  );
}
