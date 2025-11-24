import { Button } from '@/components/ui/button';
import { getDaysFromNowAt, getTodayAt } from '@/lib/date';
import {
  ChartColumnIncreasingIcon,
  CheckCircleIcon,
  Settings2Icon,
  TrendingUpIcon,
  TrophyIcon,
} from 'lucide-react';
import { DashboardCalendar } from './dashboard-calendar';
import { DashboardCard } from './dashboard-card';
import { DashboardTasks } from './dashboard-tasks';

const dashboardMetrics = [
  {
    title: 'Efficiency',
    icon: TrendingUpIcon,
    content: '90%',
    footer: '+4% from yesterday',
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
        <Button size="icon-sm" variant="ghost">
          <Settings2Icon />
          <span className="sr-only">Configure dashboard cards</span>
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {dashboardMetrics.map((metric) => (
            <DashboardCard key={metric.title} {...metric} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DashboardTasks tasks={dashboardTasks} />
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}
