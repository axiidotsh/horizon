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
import { useSetAtom } from 'jotai';
import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  customMinutesAtom,
  isCustomDurationAtom,
  selectedMinutesAtom,
} from '../atoms/duration';
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

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

function CircularProgress({
  progress,
  size = 400,
  strokeWidth = 8,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const isCompleted = progress >= 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="dark:text-muted text-muted-foreground/5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'text-primary transition-all duration-300',
            isCompleted && 'text-green-500'
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface FocusTimerProps {
  activeSession: FocusSession | null | undefined;
  taskId?: string | null;
  selectedMinutes: number;
}

export function FocusTimer({
  activeSession,
  taskId,
  selectedMinutes,
}: FocusTimerProps) {
  const startSession = useStartSession();
  const pauseSession = usePauseSession();
  const resumeSession = useResumeSession();
  const completeSession = useCompleteSession();
  const cancelSession = useCancelSession();
  const endSessionEarly = useEndSessionEarly();
  const updateSession = useUpdateSession();

  const setSelectedMinutes = useSetAtom(selectedMinutesAtom);
  const setCustomMinutes = useSetAtom(customMinutesAtom);
  const setIsCustomDuration = useSetAtom(isCustomDurationAtom);

  const [sessionTask, setSessionTask] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEndEarlyDialog, setShowEndEarlyDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownToastRef = useRef(false);

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
    if (!activeSession) {
      setIsCompleted(false);
      setRemainingSeconds(0);
      hasShownToastRef.current = false;
      return;
    }

    const updateTimer = () => {
      const remaining = calculateRemainingSeconds(
        activeSession.startedAt,
        activeSession.durationMinutes,
        activeSession.totalPausedSeconds,
        activeSession.pausedAt
      );

      if (remaining <= 0 && !isCompleted && !hasShownToastRef.current) {
        setRemainingSeconds(0);
        setIsCompleted(true);
        hasShownToastRef.current = true;
        toast.success('Session complete!', {
          description: `You completed ${activeSession.durationMinutes} minutes${activeSession.task ? ` on "${activeSession.task}"` : ''}`,
        });
      } else if (!isCompleted) {
        setRemainingSeconds(remaining);
      }
    };

    updateTimer();

    if (activeSession.status === 'ACTIVE' && !isCompleted) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession, isCompleted]);

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
    setIsCompleted(false);
    hasShownToastRef.current = false;
  };

  const handleCancel = () => {
    if (!activeSession) return;
    cancelSession.mutate({ param: { id: activeSession.id } });
    setShowCancelDialog(false);
  };

  const handleDiscard = () => {
    if (!activeSession) return;
    cancelSession.mutate({ param: { id: activeSession.id } });
    setShowDiscardDialog(false);
    setIsCompleted(false);
    hasShownToastRef.current = false;
  };

  const handleEndEarly = () => {
    if (!activeSession) return;
    endSessionEarly.mutate({ param: { id: activeSession.id } });
    setShowEndEarlyDialog(false);
  };

  const handleReset = () => {
    setSelectedMinutes(45);
    setCustomMinutes('');
    setIsCustomDuration(false);
    setSessionTask('');
  };

  const isActive = activeSession?.status === 'ACTIVE';
  const isPaused = activeSession?.status === 'PAUSED';
  const hasActiveSession = isActive || isPaused;

  const isSessionNaturallyCompleted = activeSession
    ? calculateRemainingSeconds(
        activeSession.startedAt,
        activeSession.durationMinutes,
        activeSession.totalPausedSeconds,
        activeSession.pausedAt
      ) <= 0
    : false;

  const showCompletedUI =
    activeSession && (isCompleted || isSessionNaturallyCompleted);

  const totalSeconds = hasActiveSession
    ? activeSession!.durationMinutes * 60
    : selectedMinutes * 60;
  const progress = hasActiveSession
    ? Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)
    : 0;

  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-8 py-20">
        <CircularProgress progress={displayProgress}>
          {showCompletedUI ? (
            <span className="font-mono text-7xl font-bold tabular-nums">
              {formatTimePreview(activeSession!.durationMinutes)}
            </span>
          ) : (
            <span
              className={cn(
                'font-mono text-7xl font-bold tabular-nums',
                isPaused && 'animate-pulse'
              )}
            >
              {hasActiveSession
                ? formatTime(remainingSeconds)
                : formatTimePreview(selectedMinutes)}
            </span>
          )}
        </CircularProgress>

        <div className="w-full max-w-md">
          <Input
            placeholder="What are you focusing on? (optional)"
            value={sessionTask}
            onChange={(e) => handleTaskChange(e.target.value)}
            className="resize-none rounded-none border-0 border-b bg-transparent! text-center shadow-none focus-visible:ring-0"
          />
        </div>

        {showCompletedUI ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleComplete}
                disabled={completeSession.isPending}
              >
                <CheckIcon />
                Save Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDiscardDialog(true)}
              >
                Discard
              </Button>
            </div>
          </div>
        ) : (
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
                  tooltip="End session early"
                  className="rounded-full"
                  onClick={() => setShowEndEarlyDialog(true)}
                >
                  <SquareIcon />
                </Button>
                <Button
                  size="icon"
                  className="size-14 rounded-full"
                  tooltip={isPaused ? 'Resume' : 'Pause'}
                  onClick={handlePauseResume}
                  disabled={pauseSession.isPending || resumeSession.isPending}
                >
                  {isPaused ? <PlayIcon /> : <PauseIcon />}
                </Button>
                <Button
                  size="icon-lg"
                  variant="ghost"
                  tooltip="Cancel session"
                  className="rounded-full"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XIcon />
                </Button>
              </>
            )}
          </div>
        )}
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
              variant="destructive"
              onClick={handleEndEarly}
              disabled={endSessionEarly.isPending}
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Discard Completed Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard this session? This action cannot
              be undone and the session will not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDiscard}
              disabled={cancelSession.isPending}
            >
              Discard Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
