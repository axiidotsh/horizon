export interface HeatmapDay {
  date: Date;
  intensity: number; // 0-4 scale (0 = none, 4 = highest)
  focusMinutes: number;
  tasksCompleted: number;
  habitsCompleted: number;
}

export interface HeatmapWeek {
  days: (HeatmapDay | null)[];
}

/**
 * Generate heatmap data for the last N weeks
 * Returns array of weeks, each containing 7 days (Sun-Sat)
 */
export const generateHeatmapWeeks = (
  weeks: number,
  data: Map<string, { focusMinutes: number; tasks: number; habits: number }>
): HeatmapWeek[] => {
  const today = new Date();
  const endDate = new Date(today);

  // Calculate start date (N weeks ago)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - weeks * 7 + 1);

  // Find the Sunday before start date to align grid
  const firstSunday = new Date(startDate);
  const dayOfWeek = firstSunday.getDay();
  firstSunday.setDate(firstSunday.getDate() - dayOfWeek);

  const heatmapWeeks: HeatmapWeek[] = [];
  const currentDate = new Date(firstSunday);

  while (currentDate <= endDate) {
    const week: HeatmapWeek = { days: [] };

    for (let i = 0; i < 7; i++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = data.get(dateKey);

      // Only include days up to today
      if (currentDate <= today) {
        const focusMinutes = dayData?.focusMinutes ?? 0;
        const tasksCompleted = dayData?.tasks ?? 0;
        const habitsCompleted = dayData?.habits ?? 0;

        const intensity = calculateIntensity(
          focusMinutes,
          tasksCompleted,
          habitsCompleted
        );

        week.days.push({
          date: new Date(currentDate),
          intensity,
          focusMinutes,
          tasksCompleted,
          habitsCompleted,
        });
      } else {
        week.days.push(null);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    heatmapWeeks.push(week);
  }

  return heatmapWeeks;
};

/**
 * Calculate intensity level (0-4) based on productivity metrics
 * Uses thresholds for focus time, tasks, and habits
 */
const calculateIntensity = (
  focusMinutes: number,
  tasksCompleted: number,
  habitsCompleted: number
): number => {
  // Weight each metric (total score 0-100)
  const focusScore = Math.min((focusMinutes / 120) * 40, 40); // 120min = max
  const taskScore = Math.min((tasksCompleted / 5) * 30, 30); // 5 tasks = max
  const habitScore = Math.min((habitsCompleted / 6) * 30, 30); // 6 habits = max

  const totalScore = focusScore + taskScore + habitScore;

  // Map score to 0-4 intensity levels
  if (totalScore === 0) return 0;
  if (totalScore < 25) return 1;
  if (totalScore < 50) return 2;
  if (totalScore < 75) return 3;
  return 4;
};

/**
 * Format tooltip content for a heatmap day
 */
export const formatHeatmapTooltip = (day: HeatmapDay): string => {
  const dateStr = day.date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hours = Math.floor(day.focusMinutes / 60);
  const minutes = day.focusMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const habitText = day.habitsCompleted === 1 ? 'habit' : 'habits';
  return `${dateStr}\n${timeStr} focus • ${day.tasksCompleted} tasks • ${day.habitsCompleted} ${habitText}`;
};

/**
 * Get month labels for heatmap display
 * Returns array of {month: string, weekIndex: number} for positioning
 * Shows label at the week where each new month begins (chronologically)
 * Skips first month if it has ≤7 days of data
 */
export const getMonthLabels = (
  weeks: HeatmapWeek[]
): { month: string; weekIndex: number }[] => {
  const labels: { month: string; weekIndex: number }[] = [];
  const seenMonths = new Set<number>();
  const monthDayCounts = new Map<number, number>();

  // First pass: count days per month
  weeks.forEach((week) => {
    const daysInWeek = week.days.filter((d) => d !== null) as HeatmapDay[];
    daysInWeek.forEach((day) => {
      const month = day.date.getMonth();
      const year = day.date.getFullYear();
      const monthKey = year * 12 + month;
      monthDayCounts.set(monthKey, (monthDayCounts.get(monthKey) || 0) + 1);
    });
  });

  // Second pass: create labels, skipping first month if ≤7 days
  let isFirstMonth = true;
  weeks.forEach((week, weekIndex) => {
    const daysInWeek = week.days.filter((d) => d !== null) as HeatmapDay[];
    if (daysInWeek.length === 0) return;

    for (const day of daysInWeek) {
      const month = day.date.getMonth();
      const year = day.date.getFullYear();
      const monthKey = year * 12 + month;

      if (!seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        const dayCount = monthDayCounts.get(monthKey) || 0;

        // Skip first month if it has ≤7 days
        if (isFirstMonth && dayCount <= 7) {
          isFirstMonth = false;
          break;
        }

        labels.push({
          month: day.date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex,
        });
        isFirstMonth = false;
        break;
      }
    }
  });

  return labels;
};

export const getIntensityColor = (intensity: number): string => {
  switch (intensity) {
    case 0:
      return 'border-border bg-muted/30';
    case 1:
      return 'border-emerald-200 bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950';
    case 2:
      return 'border-emerald-300 bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-900';
    case 3:
      return 'border-emerald-400 bg-emerald-300 dark:border-emerald-700 dark:bg-emerald-800';
    case 4:
      return 'border-emerald-500 bg-emerald-400 dark:border-emerald-600 dark:bg-emerald-700';
    default:
      return 'border-border bg-muted/30';
  }
};

export const generateMockData = () => {
  const data = new Map<
    string,
    { focusMinutes: number; tasks: number; habits: number }
  >();
  const today = new Date();

  for (let i = 0; i < 52 * 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];

    if (Math.random() > 0.4) {
      data.set(dateKey, {
        focusMinutes: Math.floor(Math.random() * 180),
        tasks: Math.floor(Math.random() * 8),
        habits: Math.floor(Math.random() * 7),
      });
    }
  }

  return data;
};
