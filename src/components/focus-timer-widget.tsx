'use client';

import {
  showCancelDialogAtom,
  showDiscardDialogAtom,
  showEndEarlyDialogAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
import { useTimerLogic } from '@/app/(protected)/(main)/focus/hooks/timer/use-timer-logic';
import { formatTime } from '@/app/(protected)/(main)/focus/utils/timer-calculations';
import { cn } from '@/utils/utils';
import { useSetAtom } from 'jotai';
import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
  TimerIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function FocusTimerWidget() {
  const { data: session, isLoading } = useActiveSession();
  const { pause, resume, complete } = useFocusSession();
  const { remainingSeconds, isCompleted } = useTimerLogic(session);

  const setShowCancelDialog = useSetAtom(showCancelDialogAtom);
  const setShowDiscardDialog = useSetAtom(showDiscardDialogAtom);
  const setShowEndEarlyDialog = useSetAtom(showEndEarlyDialogAtom);

  if (isLoading || !session) {
    return null;
  }

  const isPaused = session.status === 'PAUSED';
  const totalSeconds = session.durationMinutes * 60;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  const handlePauseResume = () => {
    if (isPaused) {
      resume.mutate({ param: { id: session.id } });
    } else {
      pause.mutate({ param: { id: session.id } });
    }
  };

  const handleComplete = () => {
    complete.mutate({ param: { id: session.id } });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'relative flex h-8 items-center gap-2 overflow-hidden rounded-md border px-2 font-mono text-sm font-medium transition-colors',
            'hover:bg-accent focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            isPaused && 'animate-pulse border-amber-500/50',
            isCompleted &&
              'border-green-500/50 text-green-600 dark:text-green-500'
          )}
        >
          <div
            className={cn(
              'absolute inset-0 origin-left transition-transform duration-500',
              isPaused ? 'bg-amber-500/40' : 'bg-green-500/40',
              isCompleted && 'bg-green-500/20'
            )}
            style={{ transform: `scaleX(${progress / 100})` }}
          />
          <TimerIcon className="relative size-4" />
          <span className="relative">{formatTime(remainingSeconds)}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/focus" className="cursor-pointer">
              <TimerIcon />
              Go to Focus
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isCompleted ? (
            <>
              <DropdownMenuItem
                onClick={handleComplete}
                disabled={complete.isPending}
              >
                <CheckIcon />
                Save Session
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDiscardDialog(true)}
              >
                <XIcon />
                Discard Session
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={handlePauseResume}
                disabled={pause.isPending || resume.isPending}
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
              <DropdownMenuItem onClick={() => setShowEndEarlyDialog(true)}>
                <SquareIcon />
                End Session
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <XIcon />
                Cancel Session
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
