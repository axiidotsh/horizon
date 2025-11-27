import { Button } from '@/components/ui/button';
import { getDaysFromNowAt, getTodayAt } from '@/utils/date';
import {
  ChartColumnIncreasingIcon,
  CheckCircleIcon,
  ClockArrowUpIcon,
  Settings2Icon,
  TimerIcon,
  TrophyIcon,
} from 'lucide-react';
import { DashboardCalendar } from './components/calendar';
import { FocusTimeAreaChart } from './components/charts/focus-time';
import { HabitCompletionAreaChart } from './components/charts/habit-completion';
import { TaskCompletionAreaChart } from './components/charts/task-completion';
import { DashboardMetricCard } from './components/metric-card';
import { DashboardTasks } from './components/tasks';

const dashboardMetrics = [
  {
    title: 'Focus',
    icon: ClockArrowUpIcon,
    content: '2h 35m',
    footer: '+24m from yesterday',
  },
  {
    title: 'Tasks',
    icon: CheckCircleIcon,
    content: '1/6',
    footer: 'Personal Best: 3/6',
  },
  {
    title: 'Habits',
    icon: ChartColumnIncreasingIcon,
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

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-muted-foreground font-mono text-sm">Dashboard</h1>
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
          <DashboardCalendar />
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
        <div className="bg-dashboard-card flex h-80 items-center justify-center rounded-sm border font-mono text-sm">
          Productivity heatmap - focus sessions + tasks done + habits done
        </div>
      </div>
    </div>
  );
}
