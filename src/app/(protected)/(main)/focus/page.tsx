'use client';

import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAtomValue } from 'jotai';
import {
  ClockPlusIcon,
  FlameIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Settings2Icon,
  TimerIcon,
  Trash2Icon,
  TrophyIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ContentCard } from '../components/content-card';
import { MetricCard } from '../components/metric-card';
import { selectedMinutesAtom } from './atoms/duration';
import { DurationDropdown } from './components/duration-dropdown';
import { FocusErrorState } from './components/focus-error-state';
import { FocusTimer } from './components/focus-timer';
import { SessionDeleteDialog } from './components/session-delete-dialog';
import { SessionDurationChart } from './components/session-duration-chart';
import { SessionEditDialog } from './components/session-edit-dialog';
import { RecentSessionsSkeleton } from './components/skeletons/recent-sessions-skeleton';
import { TimerSkeleton } from './components/skeletons/timer-skeleton';
import type { FocusSession } from './hooks/types';
import { useActiveSession } from './hooks/use-active-session';
import { useFocusStats } from './hooks/use-focus-stats';
import { useRecentSessions } from './hooks/use-recent-sessions';

function formatSessionTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getTodaysCompletedSessions(sessions: FocusSession[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sessions.filter((session) => {
    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return (
      sessionDate.getTime() === today.getTime() &&
      session.status === 'COMPLETED'
    );
  });
}

function formatMinutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getTotalFocusTime(sessions: FocusSession[]) {
  const todaysSessions = getTodaysCompletedSessions(sessions);
  const totalMinutes = todaysSessions.reduce(
    (acc, session) => acc + session.durationMinutes,
    0
  );
  return formatMinutesToTime(totalMinutes);
}

function getYesterdaysFocusMinutes(sessions: FocusSession[]) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  return sessions
    .filter((session) => {
      if (session.status !== 'COMPLETED') return false;
      const sessionDate = new Date(session.startedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === yesterday.getTime();
    })
    .reduce((acc, session) => acc + session.durationMinutes, 0);
}

function generateChartData(sessions: FocusSession[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const daySessions = sessions.filter((session) => {
      if (session.status !== 'COMPLETED') return false;
      const sessionDate = new Date(session.startedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === date.getTime();
    });

    const totalDuration = daySessions.reduce(
      (acc, session) => acc + session.durationMinutes,
      0
    );

    chartData.push({
      date: days[date.getDay()],
      duration: totalDuration,
    });
  }

  return chartData;
}

export default function FocusPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const {
    data: activeSession,
    isLoading: isLoadingActive,
    isError: isActiveError,
    refetch: refetchActive,
  } = useActiveSession();
  const {
    data: recentSessions = [],
    isLoading: isLoadingSessions,
    isError: isSessionsError,
    refetch: refetchSessions,
  } = useRecentSessions(20);
  const {
    data: focusStats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    refetch: refetchStats,
  } = useFocusStats();

  const selectedMinutes = useAtomValue(selectedMinutesAtom);
  const [editingSession, setEditingSession] = useState<FocusSession | null>(
    null
  );
  const [deletingSession, setDeletingSession] = useState<FocusSession | null>(
    null
  );

  const hasActiveSession =
    activeSession?.status === 'ACTIVE' || activeSession?.status === 'PAUSED';

  const todaysCompleted = getTodaysCompletedSessions(recentSessions);
  const totalFocusTime = getTotalFocusTime(recentSessions);
  const chartData = generateChartData(recentSessions);

  const metrics = useMemo(() => {
    const todayMinutes = todaysCompleted.reduce(
      (acc, session) => acc + session.durationMinutes,
      0
    );
    const yesterdayMinutes = getYesterdaysFocusMinutes(recentSessions);
    const timeDiff = todayMinutes - yesterdayMinutes;

    const currentStreak = focusStats?.currentStreak ?? 0;
    const bestStreak = focusStats?.bestStreak ?? 0;
    const highestDailyMinutes = focusStats?.highestDailyMinutes ?? 0;
    const highestDailyDaysAgo = focusStats?.highestDailyDaysAgo ?? null;
    const bestSessionsInDay = focusStats?.bestSessionsInDay ?? 0;

    return {
      timeDiff,
      timeDiffLabel:
        timeDiff >= 0
          ? `+${formatMinutesToTime(timeDiff)} from yesterday`
          : `${formatMinutesToTime(Math.abs(timeDiff))} less than yesterday`,
      highestEver: formatMinutesToTime(highestDailyMinutes),
      highestEverLabel:
        highestDailyDaysAgo === null
          ? 'No sessions yet'
          : highestDailyDaysAgo === 0
            ? 'Achieved today'
            : highestDailyDaysAgo === 1
              ? 'Achieved yesterday'
              : `Achieved ${highestDailyDaysAgo} days ago`,
      currentStreak: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`,
      bestStreak: `Personal Best: ${bestStreak} day${bestStreak !== 1 ? 's' : ''}`,
      personalBestSessions: `Personal Best: ${bestSessionsInDay} session${bestSessionsInDay !== 1 ? 's' : ''}`,
    };
  }, [recentSessions, todaysCompleted, focusStats]);

  const hasError = isActiveError || isSessionsError || isStatsError;
  const isLoadingMetrics = isLoadingSessions || isLoadingStats;

  const handleRetry = () => {
    if (isActiveError) refetchActive();
    if (isSessionsError) refetchSessions();
    if (isStatsError) refetchStats();
  };

  if (hasError) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <PageHeading>Focus</PageHeading>
        </div>
        <FocusErrorState onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Focus</PageHeading>
        <Button
          size="icon-sm"
          variant="ghost"
          tooltip="Configure dashboard cards"
        >
          <Settings2Icon />
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Sessions Today"
            icon={TimerIcon}
            content={todaysCompleted.length.toString()}
            footer={metrics.personalBestSessions}
            isLoading={isLoadingSessions || isLoadingMetrics}
          />
          <MetricCard
            title="Total Time Today"
            icon={ClockPlusIcon}
            content={totalFocusTime}
            footer={metrics.timeDiffLabel}
            isLoading={isLoadingSessions}
          />
          <MetricCard
            title="Highest Ever"
            icon={TrophyIcon}
            content={metrics.highestEver}
            footer={metrics.highestEverLabel}
            isLoading={isLoadingMetrics}
          />
          <MetricCard
            title="Current Streak"
            icon={FlameIcon}
            content={metrics.currentStreak}
            footer={metrics.bestStreak}
            isLoading={isLoadingMetrics}
          />
        </div>
        <ContentCard
          title={
            hasActiveSession ? 'Focus Session' : 'Start a new focus session'
          }
          action={<DurationDropdown hasActiveSession={hasActiveSession} />}
        >
          {isLoadingActive ? (
            <TimerSkeleton />
          ) : (
            <FocusTimer
              activeSession={activeSession}
              taskId={taskId}
              selectedMinutes={selectedMinutes}
            />
          )}
        </ContentCard>
        <ContentCard title="Recent Sessions">
          {isLoadingSessions ? (
            <RecentSessionsSkeleton />
          ) : recentSessions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No sessions yet. Start your first focus session!
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {recentSessions.slice(0, 5).map((session) => (
                <li
                  key={session.id}
                  className="border-border flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    {session.task ? (
                      <p className="text-sm">{session.task}</p>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Focus session
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
                      {formatSessionTime(session.startedAt)}
                      {session.completedAt && (
                        <> - {formatSessionTime(session.completedAt)}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {session.durationMinutes} min
                    </span>
                    {session.status === 'COMPLETED' ? (
                      <div className="size-2 rounded-full bg-green-500" />
                    ) : session.status === 'CANCELLED' ? (
                      <div className="size-2 rounded-full bg-red-500" />
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingSession(session)}
                        >
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeletingSession(session)}
                        >
                          <Trash2Icon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ContentCard>
        <SessionDurationChart data={chartData} isLoading={isLoadingSessions} />
      </div>
      <SessionEditDialog
        session={editingSession}
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
      />
      <SessionDeleteDialog
        session={deletingSession}
        open={!!deletingSession}
        onOpenChange={(open) => !open && setDeletingSession(null)}
      />
    </div>
  );
}
