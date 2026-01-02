'use client';

import { ContentCard } from '@/app/(protected)/(main)/components/content-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  formatHeatmapTooltip,
  generateHeatmapWeeks,
  getIntensityColor,
  getMonthLabels,
  type HeatmapDay,
} from '@/utils/heatmap';
import { cn } from '@/utils/utils';
import { useHeatmapData } from '../hooks/queries/use-heatmap-data';

export function ProductivityHeatmap() {
  const { data, isLoading, error } = useHeatmapData(52);

  if (error) {
    return (
      <ContentCard title="Productivity" contentClassName="mt-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-destructive text-sm">Failed to load heatmap</p>
        </div>
      </ContentCard>
    );
  }

  if (isLoading) {
    return (
      <ContentCard title="Productivity" contentClassName="mt-6">
        <Skeleton className="h-[200px] w-full" />
      </ContentCard>
    );
  }

  const heatmapData = new Map<
    string,
    { focusMinutes: number; tasks: number; habits: number }
  >();

  data?.forEach((day) => {
    heatmapData.set(day.date, {
      focusMinutes: day.focusMinutes,
      tasks: day.tasksCompleted,
      habits: day.habitsCompleted,
    });
  });

  const weeks = generateHeatmapWeeks(52, heatmapData);
  const monthLabels = getMonthLabels(weeks);

  return (
    <ContentCard title="Productivity" contentClassName="mt-6 !px-0">
      <div className="flex flex-col gap-3">
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-fit justify-center gap-2 px-6">
            <div className="flex shrink-0 flex-col gap-1 pt-5 pr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (day, i) => (
                  <div
                    key={day}
                    className={cn(
                      'text-muted-foreground flex h-3 items-center font-mono text-[10px]',
                      i % 2 === 0 ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="relative mb-1 h-4">
                {monthLabels.map(({ month, weekIndex }) => (
                  <div
                    key={`${month}-${weekIndex}`}
                    className="text-muted-foreground absolute font-mono text-[10px]"
                    style={{ left: `${weekIndex * 16}px` }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.days.map((day, dayIndex) => (
                      <HeatmapCell key={dayIndex} day={day} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center justify-end gap-2 px-6 font-mono text-[10px]">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-3 w-3 rounded-[2px] border',
                  getIntensityColor(level)
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </ContentCard>
  );
}

function HeatmapCell({ day }: { day: HeatmapDay | null }) {
  if (!day) {
    return <div className="h-3 w-3" />;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'hover:ring-ring h-3 w-3 cursor-pointer rounded-[2px] border transition-all hover:ring-1',
              getIntensityColor(day.intensity)
            )}
          />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="font-mono text-[11px] whitespace-pre-line"
        >
          {formatHeatmapTooltip(day)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
