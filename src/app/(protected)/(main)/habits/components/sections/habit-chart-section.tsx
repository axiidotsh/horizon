'use client';

import { ErrorState } from '@/components/error-state';
import { ChartConfig } from '@/components/ui/chart';
import { useState } from 'react';
import { GenericAreaChart } from '../../../components/generic-area-chart';
import { useHabitChart } from '../../hooks/queries/use-habit-chart';

export const HabitChartSection = () => {
  const [period, setPeriod] = useState(7);
  const {
    data: chartData = [],
    isLoading,
    error,
    refetch,
  } = useHabitChart(period);

  function handlePeriodChange(days: number) {
    setPeriod(days);
  }

  const chartConfig = {
    completionRate: {
      label: 'Completion Rate',
      color: '#10b981',
    },
  } satisfies ChartConfig;

  if (error) {
    return (
      <ErrorState
        onRetry={refetch}
        title="Failed to load habit chart"
        description="Unable to fetch habit chart data. Please try again."
      />
    );
  }

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
