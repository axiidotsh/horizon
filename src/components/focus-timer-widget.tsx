'use client';

import {
  useActiveSession,
  useCancelSession,
  usePauseSession,
  useResumeSession,
} from '@/app/(protected)/(main)/focus/hooks/use-focus-sessions';
import { cn } from '@/utils/utils';
import { PauseIcon, PlayIcon, TimerIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

function calculateRemainingSeconds(
  startedAt: string,
  durationMinutes: number,
  totalPausedSeconds: number,
  pausedAt: string | null
): number {
  const startTime = new Date(startedAt).getTime();
  const durationMs = durationMinutes * 60 * 1000;
  const pausedMs = totalPausedSeconds * 1000;

  let elapsed: number;
  if (pausedAt) {
    elapsed = new Date(pausedAt).getTime() - startTime - pausedMs;
  } else {
    elapsed = Date.now() - startTime - pausedMs;
  }

  const remaining = durationMs - elapsed;
  return Math.max(0, Math.floor(remaining / 1000));
}

function formatTime(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const sign = seconds < 0 ? '+' : '';
  return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
}

export function FocusTimerWidget() {
  const { data: session, isLoading } = useActiveSession();
  const pauseSession = usePauseSession();
  const resumeSession = useResumeSession();
  const cancelSession = useCancelSession();

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (!session) return;

    const updateTimer = () => {
      const remaining = calculateRemainingSeconds(
        session.startedAt,
        session.durationMinutes,
        session.totalPausedSeconds,
        session.pausedAt
      );
      setRemainingSeconds(remaining);
    };

    updateTimer();

    if (session.status === 'ACTIVE') {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  if (isLoading || !session) {
    return null;
  }

  const isPaused = session.status === 'PAUSED';
  const isOvertime = remainingSeconds <= 0;
  const totalSeconds = session.durationMinutes * 60;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession.mutate(session.id);
    } else {
      pauseSession.mutate(session.id);
    }
  };

  const handleCancel = () => {
    cancelSession.mutate(session.id);
    setShowCancelDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'relative flex h-8 items-center gap-2 overflow-hidden rounded-md border px-2 font-mono text-sm font-medium transition-colors',
              'hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              isPaused && 'animate-pulse border-amber-500/50',
              isOvertime && 'border-destructive/50 text-destructive'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 origin-left transition-transform duration-1000',
                isPaused ? 'bg-amber-500/20' : 'bg-green-500/20',
                isOvertime && 'bg-destructive/20'
              )}
              style={{ transform: `scaleX(${progress / 100})` }}
            />
            <TimerIcon className="relative size-4" />
            <span className="relative">{formatTime(remainingSeconds)}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/focus" className="cursor-pointer">
              <TimerIcon />
              Go to Focus
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handlePauseResume}
            disabled={pauseSession.isPending || resumeSession.isPending}
          >
            {isPaused ? (
              <>
                <PlayIcon />
                Resume
              </>
            ) : (
              <>
                <PauseIcon />
                Pause
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            <XIcon />
            Cancel Session
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Cancel Focus Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this focus session? Your progress
              will not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep Going</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelSession.isPending}
            >
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
