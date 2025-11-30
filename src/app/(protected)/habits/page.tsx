'use client';

import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { ChartConfig } from '@/components/ui/chart';
import { useAtomValue } from 'jotai';
import {
  CheckCircle2Icon,
  FlameIcon,
  GoalIcon,
  Settings2Icon,
  TrendingUpIcon,
} from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '../components/content-card';
import { GenericAreaChart } from '../components/generic-area-chart';
import { MetricCard } from '../components/metric-card';
import type { SortOption } from './components/habit-atoms';
import {
  searchQueryAtom,
  sortByAtom,
  statusFilterAtom,
} from './components/habit-atoms';
import { HabitListActions } from './components/habit-list-actions';
import { type Habit, HabitsList } from './components/habits-list';

// Helper function to generate completion history
const generateCompletionHistory = (
  daysBack: number,
  completionRate: number
) => {
  const history = [];
  const today = new Date();

  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    history.push({
      date,
      completed: Math.random() < completionRate,
    });
  }

  return history;
};

// Helper function to calculate streak from history
const calculateStreak = (
  history: { date: Date; completed: boolean }[]
): number => {
  const sortedHistory = [...history].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDate = new Date(today);

  for (const record of sortedHistory) {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate.getTime() === currentDate.getTime() && record.completed) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (recordDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  return streak;
};

const MOCK_HABITS: Habit[] = [
  {
    id: '1',
    title: 'Morning meditation',
    description: '10 minutes of mindfulness',
    completed: true,
    category: 'wellness',
    currentStreak: 0,
    bestStreak: 15,
    totalCompletions: 45,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    completionHistory: [],
  },
  {
    id: '2',
    title: 'Exercise for 30 minutes',
    completed: false,
    category: 'health',
    currentStreak: 0,
    bestStreak: 20,
    totalCompletions: 82,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    completionHistory: [],
  },
  {
    id: '3',
    title: 'Read for 30 minutes',
    completed: false,
    category: 'learning',
    currentStreak: 0,
    bestStreak: 8,
    totalCompletions: 25,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    completionHistory: [],
  },
  {
    id: '4',
    title: 'Drink 8 glasses of water',
    completed: true,
    category: 'health',
    currentStreak: 0,
    bestStreak: 25,
    totalCompletions: 67,
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
    completionHistory: [],
  },
  {
    id: '5',
    title: 'Write in journal',
    completed: true,
    category: 'wellness',
    currentStreak: 0,
    bestStreak: 12,
    totalCompletions: 38,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    completionHistory: [],
  },
  {
    id: '6',
    title: 'Practice gratitude',
    completed: false,
    category: 'mindfulness',
    currentStreak: 0,
    bestStreak: 18,
    totalCompletions: 52,
    createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
    completionHistory: [],
  },
];

// Initialize completion histories and calculate streaks
MOCK_HABITS.forEach((habit, index) => {
  // Create varied completion rates for realistic streaks
  let completionRate = 0.7;

  if (index % 5 === 0) {
    // High performers (30+ day streaks)
    completionRate = 0.95;
    habit.completionHistory = generateCompletionHistory(35, completionRate);
  } else if (index % 3 === 0) {
    // Medium performers (14+ day streaks)
    completionRate = 0.85;
    habit.completionHistory = generateCompletionHistory(20, completionRate);
  } else if (index % 2 === 0) {
    // Moderate performers (7+ day streaks)
    completionRate = 0.75;
    habit.completionHistory = generateCompletionHistory(15, completionRate);
  } else {
    // Lower performers (0-5 day streaks or broken)
    completionRate = 0.6;
    habit.completionHistory = generateCompletionHistory(10, completionRate);
  }

  // Calculate current streak based on history
  habit.currentStreak = calculateStreak(habit.completionHistory);

  // Update today's completion status from the most recent history
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRecord = habit.completionHistory.find((record) => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });
  habit.completed = todayRecord?.completed || false;
});

export default function HabitsPage() {
  const [habits] = useState<Habit[]>(MOCK_HABITS);
  const sortBy = useAtomValue(sortByAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const statusFilter = useAtomValue(statusFilterAtom);

  const getTotalHabits = () => habits.length;
  const getCompletedToday = () => habits.filter((h) => h.completed).length;
  const getCurrentStreak = () => {
    const maxStreak = Math.max(...habits.map((h) => h.currentStreak), 0);
    return maxStreak;
  };
  const getBestStreak = () => {
    const maxBest = Math.max(...habits.map((h) => h.bestStreak), 0);
    return maxBest;
  };
  const getCompletionRate = () => {
    if (habits.length === 0) return '0%';
    return `${Math.round((getCompletedToday() / getTotalHabits()) * 100)}%`;
  };

  const filterHabits = (
    habits: Habit[],
    query: string,
    statusFilter: 'all' | 'completed' | 'pending'
  ): Habit[] => {
    let filtered = habits;

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((habit) => {
        const titleMatch = habit.title.toLowerCase().includes(lowerQuery);
        return titleMatch;
      });
    }

    // Filter by status
    if (statusFilter === 'completed') {
      filtered = filtered.filter((habit) => habit.completed);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter((habit) => !habit.completed);
    }

    return filtered;
  };

  const sortHabits = (habits: Habit[], sortBy: SortOption): Habit[] => {
    return [...habits].sort((a, b) => {
      switch (sortBy) {
        case 'streak':
          return b.currentStreak - a.currentStreak;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
        default:
          return 0;
      }
    });
  };

  const filteredHabits = filterHabits(habits, searchQuery, statusFilter);
  const sortedHabits = sortHabits(filteredHabits, sortBy);

  // Generate chart data for habit completion over last 7 days
  const generateCompletionChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Count habits completed on this day
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

      chartData.push({
        date: days[date.getDay()],
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
            title="Total Habits"
            icon={GoalIcon}
            content={getTotalHabits().toString()}
            footer="Active habits"
          />
          <MetricCard
            title="Completed Today"
            icon={CheckCircle2Icon}
            content={`${getCompletedToday()}/${getTotalHabits()}`}
            footer={getCompletionRate()}
          />
          <MetricCard
            title="Current Streak"
            icon={FlameIcon}
            content={`${getCurrentStreak()} days`}
            footer={`Personal best: ${getBestStreak()} days`}
          />
          <MetricCard
            title="Completion Rate"
            icon={TrendingUpIcon}
            content={getCompletionRate()}
            footer="+5% from last week"
          />
        </div>
        <ContentCard
          title="Habit Tracker"
          action={<HabitListActions habits={habits} />}
        >
          <HabitsList habits={habits} sortedHabits={sortedHabits} />
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
        />
      </div>
    </div>
  );
}
