'use client';

import { ErrorState } from '@/components/error-state';
import { ChartConfig } from '@/components/ui/chart';
import { useState } from 'react';
import { GenericAreaChart } from '../../../components/generic-area-chart';
import { useTaskChart } from '../../hooks/queries/use-task-chart';

const chartConfig = {
  completionRate: {
    label: 'Completion Rate',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

export const TaskChartSection = () => {
  const [days, setDays] = useState(7);
  const { data: chartData, isLoading, error, refetch } = useTaskChart(days);

  if (error) {
    return (
      <ErrorState
        onRetry={refetch}
        title="Failed to load task chart"
        description="Unable to fetch task chart data. Please try again."
      />
    );
  }

  return (
    <GenericAreaChart
      title="Task Completion"
      data={chartData ?? []}
      xAxisKey="date"
      yAxisKey="completionRate"
      chartConfig={chartConfig}
      color="#3b82f6"
      gradientId="taskCompletionGradient"
      yAxisFormatter={(value) => `${value}%`}
      tooltipFormatter={(value) => `${value}%`}
      yAxisDomain={[0, 100]}
      isLoading={isLoading}
      onPeriodChange={setDays}
    />
  );
};
