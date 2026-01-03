'use client';

import { ErrorState } from '@/components/error-state';
import { PageHeading } from '@/components/page-heading';
import {
  CheckCircle2Icon,
  FlameIcon,
  GoalIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { MetricCard } from '../components/metric-card';
import { HabitChartSection } from './components/habit-chart-section';
import { HabitListSection } from './components/sections/habit-list-section';
import { useHabitStats } from './hooks/queries/use-habit-stats';
import { useHabits } from './hooks/queries/use-habits';

export default function HabitsPage() {
  const { isError, refetch } = useHabits();
  const { data: statsData, isLoading: isStatsLoading } = useHabitStats();

  const stats = statsData || {
    weekConsistency: 0,
    activeStreakCount: 0,
    longestStreak: 0,
    bestStreak: 0,
    completionRate: 0,
    weekStart: new Date().toISOString(),
    weekEnd: new Date().toISOString(),
  };

  const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  };

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Habits</PageHeading>
        {/* <Button
          size="icon-sm"
          variant="ghost"
          tooltip="Configure dashboard cards"
        >
          <Settings2Icon />
        </Button> */}
      </div>
      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Days"
            icon={CheckCircle2Icon}
            content={`${stats.weekConsistency}/7`}
            footer={`Days this week (${formatWeekRange(stats.weekStart, stats.weekEnd)})`}
            isLoading={isStatsLoading}
          />
          <MetricCard
            title="Active Streaks"
            icon={GoalIcon}
            content={`${stats.activeStreakCount} ${stats.activeStreakCount === 1 ? 'habit' : 'habits'}`}
            footer="On a streak"
            isLoading={isStatsLoading}
          />
          <MetricCard
            title="Current Streak"
            icon={FlameIcon}
            content={`${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`}
            footer={`Personal best: ${stats.bestStreak}`}
            isLoading={isStatsLoading}
          />
          <MetricCard
            title="Completion Rate"
            icon={TrendingUpIcon}
            content={`${stats.completionRate}%`}
            footer={`This week (${formatWeekRange(stats.weekStart, stats.weekEnd)})`}
            isLoading={isStatsLoading}
          />
        </div>
        <HabitListSection />
        <HabitChartSection />
      </div>
    </div>
  );
}
