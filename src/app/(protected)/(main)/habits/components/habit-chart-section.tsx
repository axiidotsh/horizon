'use client';

import { ChartConfig } from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import { GenericAreaChart } from '../../components/generic-area-chart';
import { useHabits } from '../hooks/queries/use-habits';
import { enrichHabitsWithMetrics } from '../utils/habit-calculations';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HabitChartSection = () => {
  const [period, setPeriod] = useState(7);
  const { data: rawHabits = [], isLoading } = useHabits(period);

  const habits = useMemo(() => enrichHabitsWithMetrics(rawHabits), [rawHabits]);

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

  return (
    <GenericAreaChart
      title="Habit Completion"
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
  );
};
