'use client';

import { ContentCard } from '@/app/(protected)/(main)/components/content-card';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import { useTimerLogic } from '@/app/(protected)/(main)/focus/hooks/timer/use-timer-logic';
import type { FocusSession } from '@/app/(protected)/(main)/focus/hooks/types';
import { formatTime } from '@/app/(protected)/(main)/focus/utils/timer-calculations';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Pause, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActiveFocusSessionProps {
  session: FocusSession;
}

export function ActiveFocusSession({ session }: ActiveFocusSessionProps) {
  const router = useRouter();
  const { pause, resume, complete } = useFocusSession();
  const { remainingSeconds } = useTimerLogic(session);

  const totalSeconds = session.durationMinutes * 60;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const isPaused = session.status === 'PAUSED';

  return (
    <ContentCard
      title="Active Focus Session"
      contentClassName="mt-4"
      containerClassName="border-primary/50 bg-primary/5"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-primary size-5" />
            <span className="text-2xl font-bold">
              {formatTime(remainingSeconds)}
            </span>
          </div>

          <div className="text-muted-foreground text-sm">
            {session.task || 'Untitled session'}
          </div>
        </div>

        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex gap-2">
          {isPaused ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => resume.mutate({ param: { id: session.id } })}
              disabled={resume.isPending}
            >
              <Play className="mr-2 size-4" />
              Resume
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => pause.mutate({ param: { id: session.id } })}
              disabled={pause.isPending}
            >
              <Pause className="mr-2 size-4" />
              Pause
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => complete.mutate({ param: { id: session.id } })}
            disabled={complete.isPending}
          >
            <CheckCircle2 className="mr-2 size-4" />
            Complete
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push('/focus')}
          >
            View Details
          </Button>
        </div>
      </div>
    </ContentCard>
  );
}
