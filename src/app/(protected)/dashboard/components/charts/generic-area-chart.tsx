'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SELECT_TRIGGER_STYLES } from '@/utils/chart';
import { cn } from '@/utils/utils';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { DashboardCard } from '../card';

type TimePeriod = '7' | '30' | '60' | '90';

interface GenericAreaChartProps<TData extends Record<string, unknown>> {
  // Card configuration
  title: string;

  // Data configuration
  data: TData[];
  xAxisKey: keyof TData;
  yAxisKey: keyof TData;

  // Chart styling
  chartConfig: ChartConfig;
  color: string;
  gradientId: string;

  // Axis formatters
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  tooltipLabelFormatter?: (value: unknown) => string;

  // Optional overrides
  yAxisDomain?: [number, number];
  chartHeight?: string;
}

export const GenericAreaChart = <TData extends Record<string, unknown>>({
  title,
  data,
  xAxisKey,
  yAxisKey,
  chartConfig,
  gradientId,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  tooltipLabelFormatter,
  yAxisDomain,
  chartHeight = 'h-64',
}: GenericAreaChartProps<TData>) => {
  const [period, setPeriod] = useState<TimePeriod>('7');
  const xKey = String(xAxisKey);
  const yKey = String(yAxisKey);

  return (
    <DashboardCard
      title={title}
      action={
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as TimePeriod)}
        >
          <SelectTrigger className={SELECT_TRIGGER_STYLES}>
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">60 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      }
      contentClassName="mt-6 pl-3"
    >
      <ChartContainer
        config={chartConfig}
        className={cn(chartHeight, 'w-full min-w-0 pr-3')}
      >
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 10 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={`var(--color-${yKey})`}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${yKey})`}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={xAxisFormatter}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={yAxisFormatter}
            domain={yAxisDomain}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={tooltipLabelFormatter}
                formatter={
                  tooltipFormatter
                    ? (value) => {
                        const numValue =
                          typeof value === 'number' ? value : Number(value);
                        return tooltipFormatter(numValue);
                      }
                    : undefined
                }
              />
            }
          />
          <Area
            dataKey={yKey}
            type="monotone"
            fill={`url(#${gradientId})`}
            fillOpacity={0.4}
            stroke={`var(--color-${yKey})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </DashboardCard>
  );
};
