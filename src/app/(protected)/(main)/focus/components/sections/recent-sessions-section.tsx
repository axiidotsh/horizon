'use client';

import { ContentCard } from '@/app/(protected)/(main)/components/content-card';
import { ErrorState } from '@/components/error-state';
import { useRecentSessions } from '../../hooks/queries/use-recent-sessions';
import { FocusSessionListItem } from '../sessions/focus-session-list-item';
import { RecentSessionsSkeleton } from '../skeletons/recent-sessions-skeleton';

export const RecentSessionsSection = () => {
  const {
    data: recentSessions = [],
    isLoading,
    isError,
    refetch,
  } = useRecentSessions(20);

  if (isError) {
    return (
      <ErrorState
        onRetry={refetch}
        title="Failed to load recent sessions"
        description="Unable to fetch recent sessions. Please try again."
      />
    );
  }

  if (isLoading) {
    return (
      <ContentCard title="Recent Sessions">
        <RecentSessionsSkeleton />
      </ContentCard>
    );
  }

  if (recentSessions.length === 0) {
    return (
      <ContentCard title="Recent Sessions">
        <p className="text-muted-foreground py-20 text-center text-sm">
          No sessions yet. Start your first focus session!
        </p>
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Recent Sessions">
      <ul className="mt-4 space-y-4">
        {recentSessions.slice(0, 5).map((session) => (
          <FocusSessionListItem key={session.id} session={session} />
        ))}
      </ul>
    </ContentCard>
  );
};
