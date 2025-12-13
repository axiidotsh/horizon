'use client';

import { SessionDialogs } from '@/components/session-dialogs';
import { Input } from '@/components/ui/input';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import {
  customMinutesAtom,
  isCustomDurationAtom,
  selectedMinutesAtom,
} from '../../atoms/duration';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';
import { useSessionTask } from '../../hooks/mutations/use-session-task';
import { useTimerLogic } from '../../hooks/timer/use-timer-logic';
import type { FocusSession } from '../../hooks/types';
import {
  calculateRemainingSeconds,
  formatTime,
  formatTimePreview,
} from '../../utils/timer-calculations';
import { TimerControls } from './timer-controls';
import { TimerDisplay } from './timer-display';

interface FocusTimerProps {
  activeSession: FocusSession | null | undefined;
  taskId?: string | null;
  selectedMinutes: number;
}

export const FocusTimer = ({
  activeSession,
  taskId,
  selectedMinutes,
}: FocusTimerProps) => {
  const { start, pause, resume, complete, cancel, endEarly } =
    useFocusSession();

  const setSelectedMinutes = useSetAtom(selectedMinutesAtom);
  const setCustomMinutes = useSetAtom(customMinutesAtom);
  const setIsCustomDuration = useSetAtom(isCustomDurationAtom);

  const { sessionTask, handleTaskChange } = useSessionTask(
    activeSession,
    taskId
  );
  const { remainingSeconds, isCompleted, setIsCompleted } =
    useTimerLogic(activeSession);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEndEarlyDialog, setShowEndEarlyDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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

  const handleCancel = () => {
    if (!activeSession) return;
    cancel.mutate({ param: { id: activeSession.id } });
    setShowCancelDialog(false);
  };

  const handleDiscard = () => {
    if (!activeSession) return;
    cancel.mutate({ param: { id: activeSession.id } });
    setShowDiscardDialog(false);
    setIsCompleted(false);
  };

  const handleEndEarly = () => {
    if (!activeSession) return;
    endEarly.mutate({ param: { id: activeSession.id } });
    setShowEndEarlyDialog(false);
  };

  const handleReset = () => {
    setSelectedMinutes(45);
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

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-8 py-10">
        <TimerDisplay
          progress={progress}
          displayTime={displayTime}
          isPaused={!!isPaused}
          isCompleted={!!showCompletedUI}
        />
        <div className="w-full max-w-md">
          <Input
            placeholder="What are you focusing on? (optional)"
            value={sessionTask}
            onChange={(e) => handleTaskChange(e.target.value)}
            className="resize-none rounded-none border-0 border-b bg-transparent! text-center shadow-none focus-visible:ring-0"
          />
        </div>
        <TimerControls
          state={controlState}
          handlers={{
            onStart: handleStart,
            onPause: handlePauseResume,
            onResume: handlePauseResume,
            onComplete: handleComplete,
            onEndEarly: () => setShowEndEarlyDialog(true),
            onCancel: () => setShowCancelDialog(true),
            onDiscard: () => setShowDiscardDialog(true),
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
      <SessionDialogs
        dialogs={{
          showCancel: showCancelDialog,
          showEndEarly: showEndEarlyDialog,
          showDiscard: showDiscardDialog,
        }}
        onOpenChange={(dialog, open) => {
          if (dialog === 'cancel') setShowCancelDialog(open);
          if (dialog === 'endEarly') setShowEndEarlyDialog(open);
          if (dialog === 'discard') setShowDiscardDialog(open);
        }}
        handlers={{
          onCancel: handleCancel,
          onEndEarly: handleEndEarly,
          onDiscard: handleDiscard,
        }}
        isPending={{
          cancel: cancel.isPending,
          endEarly: endEarly.isPending,
        }}
      />
    </>
  );
};
