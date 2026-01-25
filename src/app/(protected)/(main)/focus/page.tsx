'use client';

import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { useSetAtom } from 'jotai';
import { HistoryIcon } from 'lucide-react';
import { showSessionsDialogAtom } from './atoms/session-dialogs';
import { RecentSessionsDialog } from './components/dialogs/recent-sessions-dialog';
import { FocusMetricsBadges } from './components/sections/focus-metrics-badges';
import { FocusTimer } from './components/timer/focus-timer';

export default function FocusPage() {
  const setShowSessionsDialog = useSetAtom(showSessionsDialogAtom);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col overflow-y-auto">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-row items-center gap-3">
            <PageHeading>Focus</PageHeading>
            <FocusMetricsBadges />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSessionsDialog(true)}
          >
            <HistoryIcon />
            Recent Sessions
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center">
        <FocusTimer />
      </div>
      <RecentSessionsDialog />
    </div>
  );
}
