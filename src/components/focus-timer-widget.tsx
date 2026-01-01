'use client';

import {
  showCancelDialogAtom,
  showDiscardDialogAtom,
  showEndEarlyDialogAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
import { useTimerLogic } from '@/app/(protected)/(main)/focus/hooks/timer/use-timer-logic';
import {
  formatTime,
  formatTimePreview,
} from '@/app/(protected)/(main)/focus/utils/timer-calculations';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ProgressBarProps {
  progress: number;
  isPaused: boolean;
  isCompleted: boolean;
}

const ProgressBar = ({ progress, isPaused, isCompleted }: ProgressBarProps) => {
  return (
    <div
      className={cn(
        'absolute inset-0 origin-left transition-transform duration-500',
        isPaused ? 'bg-amber-500/40' : 'bg-green-500/40',
        isCompleted && 'bg-green-500/20'
      )}
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  );
};

export function FocusTimerWidget() {
  const { data: session } = useActiveSession();
  const { pause, resume, complete } = useFocusSession(session?.id);
  const { remainingSeconds, isCompleted } = useTimerLogic(session);
  const isMobile = useIsMobile();

  const setShowCancelDialog = useSetAtom(showCancelDialogAtom);
  const setShowDiscardDialog = useSetAtom(showDiscardDialogAtom);
  const setShowEndEarlyDialog = useSetAtom(showEndEarlyDialogAtom);

  if (!session) {
    return null;
  }

  const isPaused = session.status === 'PAUSED';
  const totalSeconds = session.durationMinutes * 60;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  const displayTime = isCompleted
    ? formatTimePreview(session.durationMinutes)
    : formatTime(remainingSeconds);

  const mobileDisplayTime = (() => {
    const seconds = isCompleted
      ? session.durationMinutes * 60
      : remainingSeconds;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      const decimalHours = hours + minutes / 60;
      return `${decimalHours.toFixed(1)}h`;
    }
    if (minutes > 0) {
      const decimalMinutes = minutes + secs / 60;
      return `${decimalMinutes.toFixed(1)}m`;
    }
    return `${secs}s`;
  })();

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
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <DropdownMenu>
        {isMobile ? (
          <div className="bg-sidebar/20 flex size-14 items-center rounded-full border shadow-lg backdrop-blur-md">
            <DropdownMenuTrigger className="focus-visible:ring-ring relative flex size-full items-center justify-center overflow-hidden rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none">
              <ProgressBar
                progress={progress}
                isPaused={isPaused}
                isCompleted={isCompleted}
              />
              <span
                className={cn(
                  'relative font-mono text-xs leading-none font-medium',
                  isPaused &&
                    'animate-pulse text-amber-600 dark:text-amber-500',
                  isCompleted && 'text-green-600 dark:text-green-500'
                )}
              >
                {mobileDisplayTime}
              </span>
            </DropdownMenuTrigger>
          </div>
        ) : (
          <DropdownMenuTrigger
            className={cn(
              'focus-visible:ring-ring hover:bg-accent relative flex h-8 items-center gap-2 overflow-hidden rounded-md border px-2 font-mono text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
              isPaused && 'animate-pulse border-amber-500/50',
              isCompleted &&
                'border-green-500/50 text-green-600 dark:text-green-500'
            )}
          >
            <ProgressBar
              progress={progress}
              isPaused={isPaused}
              isCompleted={isCompleted}
            />
            <TimerIcon className="relative size-4" />
            <span className="relative">{displayTime}</span>
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent
          align={isMobile ? 'center' : 'end'}
          className="w-48"
        >
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
    </motion.div>
  );
}
