'use client';

import { PageHeading } from '@/components/page-heading';
import { FocusChartSection } from './components/sections/focus-chart-section';
import { FocusMetricsSection } from './components/sections/focus-metrics-section';
import { FocusTimerSection } from './components/sections/focus-timer-section';
import { RecentSessionsSection } from './components/sections/recent-sessions-section';

export default function FocusPage() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Focus</PageHeading>
        {/* <Button
          size="icon-sm"
          variant="ghost"
          tooltip="Configure dashboard cards"
        >
          <Settings2Icon />
        </Button> */}
      </div>
      <div className="mt-4 space-y-4">
        <FocusMetricsSection />
        <FocusTimerSection />
        <RecentSessionsSection />
        <FocusChartSection />
      </div>
    </div>
  );
}
