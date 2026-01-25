'use client';

import { GenericAreaChart } from '@/app/(protected)/(main)/components/generic-area-chart';
import { ErrorState } from '@/components/error-state';
import type { ChartConfig } from '@/components/ui/chart';
import { chartFormatters, createGradientId } from '@/utils/chart';
import { useState } from 'react';
import { useFocusChart } from '../../hooks/queries/use-focus-chart';

const chartConfig = {
  duration: {
    label: 'Session Duration',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

export const FocusChartSection = () => {
  const [chartPeriod, setChartPeriod] = useState(7);

  const {
    data: rawChartData = [],
    isLoading,
    isError,
    refetch,
  } = useFocusChart(chartPeriod);

  const chartData = rawChartData.map((item) => ({
    date: item.date,
    duration: item.totalMinutes,
  }));

  if (isError) {
    return (
      <ErrorState
        onRetry={refetch}
        title="Failed to load chart"
        description="Unable to fetch chart data. Please try again."
      />
    );
  }

  return (
    <GenericAreaChart
      title="Focus Time"
      data={chartData}
      xAxisKey="date"
      yAxisKey="duration"
      chartConfig={chartConfig}
      color="#3b82f6"
      gradientId={createGradientId('duration')}
      xAxisFormatter={(value) => String(value)}
      yAxisFormatter={chartFormatters.time.yAxis}
      tooltipFormatter={chartFormatters.time.tooltip}
      tooltipLabelFormatter={(value) => String(value)}
      isLoading={isLoading}
      onPeriodChange={setChartPeriod}
    />
  );
};
