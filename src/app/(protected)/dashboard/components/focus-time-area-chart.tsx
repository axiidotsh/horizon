'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ClockArrowUpIcon } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { DashboardCard } from './card';

const chartData = [
  { date: 'Mon', minutes: 120 },
  { date: 'Tue', minutes: 95 },
  { date: 'Wed', minutes: 145 },
  { date: 'Thu', minutes: 110 },
  { date: 'Fri', minutes: 155 },
  { date: 'Sat', minutes: 85 },
  { date: 'Sun', minutes: 130 },
];

const chartConfig = {
  minutes: {
    label: 'Focus Time',
    color: '#8b5cf6',
  },
} satisfies ChartConfig;

export const FocusTimeAreaChart = () => {
  return (
    <DashboardCard
      title="Focus Time"
      icon={ClockArrowUpIcon}
      className="col-span-2"
      contentClassName="mt-6"
    >
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 0 }}>
          <defs>
            <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-minutes)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-minutes)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}m`}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) => value}
                formatter={(value) => `${value} minutes`}
              />
            }
          />
          <Area
            dataKey="minutes"
            type="monotone"
            fill="url(#fillMinutes)"
            fillOpacity={0.4}
            stroke="var(--color-minutes)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </DashboardCard>
  );
};
