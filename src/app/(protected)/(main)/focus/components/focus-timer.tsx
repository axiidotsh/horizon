'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/utils';
import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusSession } from '../hooks/types';
import { useCancelSession } from '../hooks/use-cancel-session';
import { useCompleteSession } from '../hooks/use-complete-session';
import { useEndSessionEarly } from '../hooks/use-end-session-early';
import { usePauseSession } from '../hooks/use-pause-session';
import { useResumeSession } from '../hooks/use-resume-session';
import { useStartSession } from '../hooks/use-start-session';
import { useUpdateSession } from '../hooks/use-update-session';

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
  return Math.floor(remaining / 1000);
}

function formatTime(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  const hours = Math.floor(absSeconds / 3600);
  const mins = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;
  const sign = seconds < 0 ? '+' : '';

  if (hours > 0) {
    return `${sign}${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
}

interface FocusTimerProps {
  activeSession: FocusSession | null | undefined;
  taskId?: string | null;
  selectedMinutes: number;
  onResetDuration: () => void;
}

export function FocusTimer({
  activeSession,
  taskId,
  selectedMinutes,
  onResetDuration,
}: FocusTimerProps) {
  const startSession = useStartSession();
  const pauseSession = usePauseSession();
  const resumeSession = useResumeSession();
  const completeSession = useCompleteSession();
  const cancelSession = useCancelSession();
  const endSessionEarly = useEndSessionEarly();
  const updateSession = useUpdateSession();

  const [sessionTask, setSessionTask] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showEndEarlyDialog, setShowEndEarlyDialog] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (taskId) {
      setSessionTask(`Task #${taskId}`);
    }
  }, [taskId]);

  useEffect(() => {
    if (activeSession?.task !== undefined) {
      setSessionTask(activeSession.task || '');
    }
  }, [activeSession?.task]);

  const debouncedUpdateTask = useCallback(
    (task: string) => {
      if (!activeSession) return;

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        updateSession.mutate({
          param: { id: activeSession.id },
          json: { task: task || undefined },
        });
      }, 500);
    },
    [activeSession, updateSession]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleTaskChange = (value: string) => {
    setSessionTask(value);
    if (activeSession) {
      debouncedUpdateTask(value);
    }
  };

  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      const remaining = calculateRemainingSeconds(
        activeSession.startedAt,
        activeSession.durationMinutes,
        activeSession.totalPausedSeconds,
        activeSession.pausedAt
      );
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !showCompleteDialog) {
        setShowCompleteDialog(true);
      }
    };

    updateTimer();

    if (activeSession.status === 'ACTIVE') {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession, showCompleteDialog]);

  const formatTimePreview = (minutes: number) => {
    const mins = minutes % 60;
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:00`;
    }
    return `${mins}:00`;
  };

  const handleStart = () => {
    startSession.mutate({
      json: {
        durationMinutes: selectedMinutes,
        task: sessionTask || undefined,
      },
    });
  };

  const handlePauseResume = () => {
    if (!activeSession) return;
    if (activeSession.status === 'PAUSED') {
      resumeSession.mutate({ param: { id: activeSession.id } });
    } else {
      pauseSession.mutate({ param: { id: activeSession.id } });
    }
  };

  const handleComplete = () => {
    if (!activeSession) return;
    completeSession.mutate({ param: { id: activeSession.id } });
    setShowCompleteDialog(false);
  };

  const handleCancel = () => {
    if (!activeSession) return;
    cancelSession.mutate({ param: { id: activeSession.id } });
    setShowCancelDialog(false);
  };

  const handleEndEarly = () => {
    if (!activeSession) return;
    endSessionEarly.mutate({ param: { id: activeSession.id } });
    setShowEndEarlyDialog(false);
  };

  const handleReset = () => {
    onResetDuration();
    setSessionTask('');
  };

  const isActive = activeSession?.status === 'ACTIVE';
  const isPaused = activeSession?.status === 'PAUSED';
  const hasActiveSession = isActive || isPaused;
  const isOvertime = hasActiveSession && remainingSeconds < 0;

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-8 py-20">
        <span
          className={cn(
            'font-mono text-7xl font-bold tabular-nums',
            isPaused && 'animate-pulse text-amber-500',
            isOvertime && 'text-destructive'
          )}
        >
          {hasActiveSession
            ? formatTime(remainingSeconds)
            : formatTimePreview(selectedMinutes)}
        </span>

        <div className="w-full max-w-md">
          <Input
            placeholder="What are you focusing on? (optional)"
            value={sessionTask}
            onChange={(e) => handleTaskChange(e.target.value)}
            className="resize-none rounded-none border-0 border-b bg-transparent! text-center shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-2">
          {!hasActiveSession ? (
            <>
              <Button
                size="icon-lg"
                variant="ghost"
                tooltip="Start session"
                onClick={handleStart}
                disabled={startSession.isPending}
              >
                <PlayIcon />
              </Button>
              <Button
                size="icon-lg"
                variant="ghost"
                tooltip="Reset"
                onClick={handleReset}
              >
                <RotateCcwIcon />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon-lg"
                variant="ghost"
                tooltip={isPaused ? 'Resume' : 'Pause'}
                onClick={handlePauseResume}
                disabled={pauseSession.isPending || resumeSession.isPending}
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </Button>
              {isOvertime ? (
                <Button
                  size="icon-lg"
                  variant="ghost"
                  tooltip="Complete session"
                  onClick={() => setShowCompleteDialog(true)}
                >
                  <CheckIcon />
                </Button>
              ) : (
                <Button
                  size="icon-lg"
                  variant="ghost"
                  tooltip="End session early"
                  onClick={() => setShowEndEarlyDialog(true)}
                >
                  <SquareIcon />
                </Button>
              )}
              <Button
                size="icon-lg"
                variant="ghost"
                tooltip="Cancel session"
                onClick={() => setShowCancelDialog(true)}
              >
                <XIcon />
              </Button>
            </>
          )}
        </div>
      </div>

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

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Session Complete!</DialogTitle>
            <DialogDescription>
              Great job! You&apos;ve completed your{' '}
              {activeSession?.durationMinutes} minute focus session
              {activeSession?.task ? ` on "${activeSession.task}"` : ''}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep Going</Button>
            </DialogClose>
            <Button
              onClick={handleComplete}
              disabled={completeSession.isPending}
            >
              Complete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEndEarlyDialog} onOpenChange={setShowEndEarlyDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>End Session Early?</DialogTitle>
            <DialogDescription>
              Your progress will be saved. The session duration will be updated
              to reflect the actual time spent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep Going</Button>
            </DialogClose>
            <Button
              onClick={handleEndEarly}
              disabled={endSessionEarly.isPending}
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
