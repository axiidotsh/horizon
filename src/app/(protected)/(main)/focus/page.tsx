'use client';

import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClockPlusIcon,
  FlameIcon,
  Settings2Icon,
  TimerIcon,
  TrophyIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ContentCard } from '../components/content-card';
import { MetricCard } from '../components/metric-card';
import { FocusTimer } from './components/focus-timer';
import { SessionDurationChart } from './components/session-duration-chart';
import {
  FocusSession,
  useActiveSession,
  useRecentSessions,
} from './hooks/use-focus-sessions';

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

function getTotalFocusTime(sessions: FocusSession[]) {
  const todaysSessions = getTodaysCompletedSessions(sessions);
  const totalMinutes = todaysSessions.reduce(
    (acc, session) => acc + session.durationMinutes,
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
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

  const { data: activeSession, isLoading: isLoadingActive } =
    useActiveSession();
  const { data: recentSessions = [], isLoading: isLoadingSessions } =
    useRecentSessions(20);

  const hasActiveSession =
    activeSession?.status === 'ACTIVE' || activeSession?.status === 'PAUSED';

  const todaysCompleted = getTodaysCompletedSessions(recentSessions);
  const totalFocusTime = getTotalFocusTime(recentSessions);
  const chartData = generateChartData(recentSessions);

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
            content={
              isLoadingSessions ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                todaysCompleted.length.toString()
              )
            }
            footer="Personal Best: 8 sessions"
          />
          <MetricCard
            title="Total Time Today"
            icon={ClockPlusIcon}
            content={
              isLoadingSessions ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                totalFocusTime
              )
            }
            footer="+45m from yesterday"
          />
          <MetricCard
            title="Highest Ever"
            icon={TrophyIcon}
            content="6h 30m"
            footer="Achieved 3 days ago"
          />
          <MetricCard
            title="Current Streak"
            icon={FlameIcon}
            content="3 days"
            footer="Personal Best: 12 days"
          />
        </div>

        <ContentCard
          title={
            hasActiveSession ? 'Focus Session' : 'Start a new focus session'
          }
        >
          {isLoadingActive ? (
            <div className="flex flex-col items-center justify-center gap-8 py-20">
              <Skeleton className="h-20 w-48" />
              <Skeleton className="h-10 w-64" />
              <div className="flex gap-2">
                <Skeleton className="size-12 rounded-full" />
                <Skeleton className="size-12 rounded-full" />
              </div>
            </div>
          ) : (
            <FocusTimer activeSession={activeSession} taskId={taskId} />
          )}
        </ContentCard>

        <SessionDurationChart data={chartData} />

        <ContentCard title="Recent Sessions">
          {isLoadingSessions ? (
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
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
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ContentCard>
      </div>
    </div>
  );
}
