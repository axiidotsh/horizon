import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { getDaysFromNowAt, getTodayAt } from '@/utils/date';
import {
  ClockPlusIcon,
  GoalIcon,
  LayoutListIcon,
  Settings2Icon,
  TimerIcon,
  TrophyIcon,
} from 'lucide-react';
import { FocusTimeAreaChart } from './components/charts/focus-time';
import { HabitCompletionAreaChart } from './components/charts/habit-completion';
import { TaskCompletionAreaChart } from './components/charts/task-completion';
import { DashboardHabits } from './components/habits';
import { DashboardMetricCard } from './components/metric-card';
import { ProductivityHeatmap } from './components/productivity-heatmap';
import { DashboardTasks } from './components/tasks';

const dashboardMetrics = [
  {
    title: 'Focus',
    icon: ClockPlusIcon,
    content: '2h 35m',
    footer: '+24m from yesterday',
  },
  {
    title: 'Tasks',
    icon: LayoutListIcon,
    content: '1/6',
    footer: 'Personal Best: 3/6',
  },
  {
    title: 'Habits',
    icon: GoalIcon,
    content: '4/6',
    footer: 'Personal Best: 12/12',
  },
  {
    title: 'Streak',
    icon: TrophyIcon,
    content: '12 days',
    footer: 'Personal Best: 15 days',
  },
];

const dashboardTasks = [
  {
    task: 'Review pull requests',
    completed: true,
    dueDate: getTodayAt(10, 0),
  },
  {
    task: 'Update project documentation',
    completed: false,
    dueDate: getTodayAt(14, 30),
  },
  {
    task: 'Deploy to staging',
    completed: false,
    dueDate: getTodayAt(16, 0),
  },
  {
    task: 'Team sync meeting',
    completed: false,
    dueDate: getDaysFromNowAt(1, 9, 0),
  },
  {
    task: 'Refactor authentication module',
    completed: false,
    dueDate: getDaysFromNowAt(2, 15, 30),
  },
  {
    task: 'Code review session',
    completed: true,
    dueDate: getDaysFromNowAt(3, 11, 0),
  },
  {
    task: 'Quarterly planning meeting',
    completed: false,
    dueDate: getDaysFromNowAt(5, 14, 0),
  },
];

const dashboardHabits = [
  {
    habit: 'Morning meditation',
    completed: true,
    streak: 12,
  },
  {
    habit: 'Exercise',
    completed: true,
    streak: 8,
  },
  {
    habit: 'Read for 30 minutes',
    completed: false,
    streak: 5,
  },
  {
    habit: 'Journal',
    completed: false,
    streak: 3,
  },
  {
    habit: 'Drink 8 glasses of water',
    completed: true,
    streak: 15,
  },
  {
    habit: 'No social media before noon',
    completed: false,
    streak: 2,
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PageHeading>Dashboard</PageHeading>
        <div className="flex items-center">
          <Button
            size="icon-sm"
            variant="ghost"
            tooltip="Start a new focus session"
          >
            <TimerIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            tooltip="Configure dashboard cards"
          >
            <Settings2Icon />
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <DashboardMetricCard key={metric.title} {...metric} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardTasks tasks={dashboardTasks} />
          <DashboardHabits habits={dashboardHabits} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0">
            <FocusTimeAreaChart />
          </div>
          <div className="min-w-0">
            <TaskCompletionAreaChart />
          </div>
          <div className="min-w-0">
            <HabitCompletionAreaChart />
          </div>
        </div>
        <div className="grid grid-cols-1">
          <ProductivityHeatmap />
        </div>
      </div>
    </div>
  );
}
