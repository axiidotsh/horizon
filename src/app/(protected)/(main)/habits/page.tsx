'use client';

import { ErrorState } from '@/components/error-state';
import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useAtomValue } from 'jotai';
import {
  CheckCircle2Icon,
  FlameIcon,
  GoalIcon,
  Settings2Icon,
  TrendingUpIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ContentCard } from '../components/content-card';
import { GenericAreaChart } from '../components/generic-area-chart';
import { MetricCard } from '../components/metric-card';
import {
  searchQueryAtom,
  sortByAtom,
  statusFilterAtom,
} from './atoms/habit-atoms';
import { HabitListActions } from './components/habit-list-actions';
import { HabitsList } from './components/habits-list';
import { useHabitStats } from './hooks/queries/use-habit-stats';
import { useHabits } from './hooks/queries/use-habits';
import {
  enrichHabitsWithMetrics,
  filterHabits,
  sortHabits,
} from './utils/habit-calculations';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function HabitTrackerSkeleton() {
  return (
    <div className="my-4 space-y-3 pr-4">
      <div className="border-border mb-2 flex items-center gap-3 border-b pb-2">
        <div className="flex-1" />
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="size-3.5" />
          ))}
        </div>
        <div className="w-8 shrink-0" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-border flex items-center gap-3 border-b pb-3"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="size-3.5 rounded-full" />
            ))}
          </div>
          <Skeleton className="size-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function HabitsPage() {
  const [period, setPeriod] = useState(7);
  const {
    data: rawHabits = [],
    isLoading,
    isError,
    refetch,
  } = useHabits(period);
  const { data: statsData, isLoading: isStatsLoading } = useHabitStats();

  const sortBy = useAtomValue(sortByAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const statusFilter = useAtomValue(statusFilterAtom);

  const habits = useMemo(() => enrichHabitsWithMetrics(rawHabits), [rawHabits]);

  const filteredHabits = useMemo(
    () => filterHabits(habits, searchQuery, statusFilter),
    [habits, searchQuery, statusFilter]
  );

  const sortedHabits = useMemo(
    () => sortHabits(filteredHabits, sortBy),
    [filteredHabits, sortBy]
  );

  const handlePeriodChange = (days: number) => {
    setPeriod(days);
  };

  const generateCompletionChartData = () => {
    const today = new Date();
    const chartData = [];

    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const totalHabits = habits.length;
      const completedOnDay = habits.filter((habit) => {
        const record = habit.completionHistory.find((r) => {
          const recordDate = new Date(r.date);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === date.getTime();
        });
        return record?.completed || false;
      }).length;

      const completionRate =
        totalHabits > 0 ? Math.round((completedOnDay / totalHabits) * 100) : 0;

      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      chartData.push({
        date: DAYS[dayIndex],
        completionRate,
      });
    }

    return chartData;
  };

  const chartData = generateCompletionChartData();

  const chartConfig = {
    completionRate: {
      label: 'Completion Rate',
      color: '#10b981',
    },
  } satisfies ChartConfig;

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
        <ContentCard
          title="Habit Tracker"
          action={<HabitListActions />}
          headerClassName="max-sm:!flex-col max-sm:!items-start max-sm:!justify-start"
        >
          {isLoading ? (
            <HabitTrackerSkeleton />
          ) : (
            <HabitsList habits={habits} sortedHabits={sortedHabits} />
          )}
        </ContentCard>
        <GenericAreaChart
          title="Habit Completion Trend"
          data={chartData}
          xAxisKey="date"
          yAxisKey="completionRate"
          chartConfig={chartConfig}
          color="#10b981"
          gradientId="habitCompletionGradient"
          yAxisFormatter={(value) => `${value}%`}
          tooltipFormatter={(value) => `${value}%`}
          yAxisDomain={[0, 100]}
          isLoading={isLoading}
          onPeriodChange={handlePeriodChange}
        />
      </div>
    </div>
  );
}
