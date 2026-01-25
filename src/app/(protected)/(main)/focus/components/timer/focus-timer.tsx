'use client';

import { useSettings } from '@/app/(protected)/(main)/settings/hooks/queries/use-settings';
import { ErrorState } from '@/components/error-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  calculateRemainingSeconds,
  formatTime,
  formatTimePreview,
} from '@/utils/timer';
import { cn } from '@/utils/utils';
import { useAtom, useSetAtom } from 'jotai';
import {
  customMinutesAtom,
  isCustomDurationAtom,
  selectedMinutesAtom,
} from '../../atoms/duration';
import {
  cancelingSessionAtom,
  discardingSessionAtom,
  endingEarlySessionAtom,
} from '../../atoms/session-dialogs';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';
import { useSessionTask } from '../../hooks/mutations/use-session-task';
import { useActiveSession } from '../../hooks/queries/use-active-session';
import { useTimerLogic } from '../../hooks/timer/use-timer-logic';
import { DurationDropdown } from './duration-dropdown';
import { TimerControls } from './timer-controls';
import { TimerDisplay } from './timer-display';

export const FocusTimer = () => {
  const {
    data: activeSession,
    isLoading,
    isError,
    refetch,
  } = useActiveSession();
  const { start, pause, resume, complete } = useFocusSession();
  const { data: settings } = useSettings();

  const [selectedMinutes, setSelectedMinutes] = useAtom(selectedMinutesAtom);
  const setCustomMinutes = useSetAtom(customMinutesAtom);
  const setIsCustomDuration = useSetAtom(isCustomDurationAtom);

  const setCancelingSession = useSetAtom(cancelingSessionAtom);
  const setEndingEarlySession = useSetAtom(endingEarlySessionAtom);
  const setDiscardingSession = useSetAtom(discardingSessionAtom);

  const { sessionTask, handleTaskChange } = useSessionTask(activeSession);
  const { remainingSeconds, isCompleted, setIsCompleted } =
    useTimerLogic(activeSession);

  const handleStart = () => {
    start.mutate({
      json: {
        durationMinutes: selectedMinutes,
        task: sessionTask || undefined,
      },
    });
  };

  const handlePauseResume = () => {
    if (!activeSession) return;
    if (activeSession.status === 'PAUSED') {
      resume.mutate({ param: { id: activeSession.id } });
    } else {
      pause.mutate({ param: { id: activeSession.id } });
    }
  };

  const handleComplete = () => {
    if (!activeSession) return;
    complete.mutate({ param: { id: activeSession.id } });
    setIsCompleted(false);
  };

  const handleReset = () => {
    setSelectedMinutes(settings?.defaultFocusDuration ?? 45);
    setCustomMinutes('');
    setIsCustomDuration(false);
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

  const displayTime = showCompletedUI
    ? formatTimePreview(activeSession!.durationMinutes)
    : hasActiveSession
      ? formatTime(remainingSeconds)
      : formatTimePreview(selectedMinutes);

  const controlState = showCompletedUI
    ? 'completed'
    : hasActiveSession
      ? isPaused
        ? 'paused'
        : 'active'
      : 'idle';

  if (isError) {
    return (
      <div className="w-full">
        <ErrorState
          onRetry={refetch}
          title="Failed to load session"
          description="Unable to fetch active session. Please try again."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-8 py-8">
          <div className="flex flex-col items-center gap-10">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="size-60 rounded-full sm:size-72" />
            <Skeleton className="h-10 w-full max-w-sm sm:w-96" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="size-16 rounded-full" />
              <Skeleton className="size-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-8 py-8">
        <div className="flex flex-col items-center gap-6">
          {hasActiveSession ? (
            <div className="flex items-baseline gap-2 text-sm">
              <span
                className={cn(
                  'font-mono font-semibold tabular-nums',
                  isPaused && !showCompletedUI && 'animate-pulse'
                )}
              >
                {displayTime}
              </span>
              <span className="text-muted-foreground">
                of {activeSession!.durationMinutes}{' '}
                {activeSession!.durationMinutes === 1 ? 'minute' : 'minutes'}
              </span>
            </div>
          ) : (
            <DurationDropdown hasActiveSession={hasActiveSession} />
          )}
          <TimerDisplay progress={progress} isPaused={!!isPaused} />
          <Input
            placeholder="What are you focusing on?"
            value={sessionTask}
            onChange={(e) => handleTaskChange(e.target.value)}
            className="mb-4 text-center shadow-none sm:w-96"
          />
          <TimerControls
            state={controlState}
            handlers={{
              onStart: handleStart,
              onPause: handlePauseResume,
              onResume: handlePauseResume,
              onComplete: handleComplete,
              onEndEarly: () =>
                activeSession && setEndingEarlySession(activeSession),
              onCancel: () =>
                activeSession && setCancelingSession(activeSession),
              onDiscard: () =>
                activeSession && setDiscardingSession(activeSession),
              onReset: handleReset,
            }}
            isPending={{
              start: start.isPending,
              pause: pause.isPending,
              resume: resume.isPending,
              complete: complete.isPending,
            }}
          />
        </div>
      </div>
    </div>
  );
};
