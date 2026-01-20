export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  infinite: ['tasks', 'infinite'] as const,
  stats: ['tasks', 'stats'] as const,
  tags: ['tasks', 'tags'] as const,
  chart: ['tasks', 'chart'] as const,
  chartWithDays: (days: number) => ['tasks', 'chart', days] as const,
  projects: ['projects'] as const,
};
