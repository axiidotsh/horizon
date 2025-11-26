'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ChartColumnIncreasingIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartData = [
  { day: 'Mon', percentage: 67 },
  { day: 'Tue', percentage: 75 },
  { day: 'Wed', percentage: 83 },
  { day: 'Thu', percentage: 92 },
  { day: 'Fri', percentage: 100 },
  { day: 'Sat', percentage: 58 },
  { day: 'Sun', percentage: 67 },
];

const chartConfig = {
  percentage: {
    label: 'Habits Done',
    color: '#f59e0b',
  },
} satisfies ChartConfig;

export const HabitCompletionBarChart = () => {
  return (
    <Card className="bg-dashboard-card gap-0 rounded-sm shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-muted-foreground font-mono text-sm font-normal">
            Habits
          </CardTitle>
          <ChartColumnIncreasingIcon className="text-muted-foreground size-4" />
        </div>
      </CardHeader>
      <CardContent className="mt-6">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 0, top: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => `${value}%`}
                />
              }
            />
            <Bar
              dataKey="percentage"
              fill="var(--color-percentage)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
