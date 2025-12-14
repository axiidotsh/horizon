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
  return (
    <CircularProgress
      progress={progress}
      isPaused={isPaused}
      isCompleted={isCompleted}
    >
      <span
        className={cn(
          'font-mono text-7xl font-bold tabular-nums',
          isPaused && !isCompleted && 'animate-pulse'
        )}
      >
        {displayTime}
      </span>
    </CircularProgress>
  );
};
