import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/utils/utils';
import { CircularProgress } from './circular-progress';

interface TimerDisplayProps {
  progress: number;
  displayTime: string;
  isPaused: boolean;
  isCompleted: boolean;
}

export const TimerDisplay = ({
  progress,
  displayTime,
  isPaused,
  isCompleted,
}: TimerDisplayProps) => {
  const isMobile = useIsMobile();

  return (
    <CircularProgress
      size={isMobile ? 320 : 400}
      progress={progress}
      isPaused={isPaused}
      isCompleted={isCompleted}
    >
      <span
        className={cn(
          'font-mono text-5xl font-bold tabular-nums sm:text-7xl',
          isPaused && !isCompleted && 'animate-pulse'
        )}
      >
        {displayTime}
      </span>
    </CircularProgress>
  );
};
