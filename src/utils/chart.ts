export const SELECT_TRIGGER_STYLES =
  'hover:bg-accent! h-6! rounded-sm border-none bg-transparent! px-2 shadow-none transition-all duration-300';

export const chartFormatters = {
  time: {
    yAxis: (value: number) => `${value}m`,
    tooltip: (value: number) => `${value} minutes`,
  },
  percentage: {
    yAxis: (value: number) => `${value}%`,
    tooltip: (value: number) => `${value}%`,
  },
} as const;

export const chartDomains = {
  percentage: [0, 100] as [number, number],
  auto: undefined,
} as const;

export function createGradientId(prefix: string): string {
  return `fill${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`;
}

export function formatChartDateLabel(date: Date, daysRange: number): string {
  return daysRange <= 7
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
    : `${date.getMonth() + 1}/${date.getDate()}`;
}
