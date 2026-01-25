import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/utils/utils';

interface TimerDisplayProps {
  progress: number;
  isPaused: boolean;
}

export const TimerDisplay = ({ progress, isPaused }: TimerDisplayProps) => {
  const isMobile = useIsMobile();
  const size = isMobile ? 280 : 340;
  const center = size / 2;
  const clockRadius = size * 0.4;
  const handLength = clockRadius * 0.7;
  const progressCircleRadius = clockRadius * 0.7;

  const rotationDegrees = (progress / 100) * 360;

  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M',
      x,
      y,
      'L',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      'Z',
    ].join(' ');
  }

  const progressPath =
    progress > 0 && progress < 100
      ? describeArc(center, center, progressCircleRadius, 0, rotationDegrees)
      : '';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i * 6 - 90) * (Math.PI / 180);
          const isHourTick = i % 5 === 0;
          const tickLength = isHourTick ? 10 : 5;
          const x1 = center + Math.cos(angle) * (clockRadius - tickLength);
          const y1 = center + Math.sin(angle) * (clockRadius - tickLength);
          const x2 = center + Math.cos(angle) * clockRadius;
          const y2 = center + Math.sin(angle) * clockRadius;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={cn(
                'stroke-muted-foreground/20',
                isHourTick && 'stroke-muted-foreground/40'
              )}
              strokeWidth={isHourTick ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {progress >= 100 ? (
          <circle
            cx={center}
            cy={center}
            r={progressCircleRadius}
            className={cn(
              'fill-primary/10',
              isPaused && 'fill-muted-foreground/10'
            )}
          />
        ) : (
          <path
            d={progressPath}
            className={cn(
              'fill-primary/10',
              isPaused && 'fill-muted-foreground/10'
            )}
          />
        )}

        <g
          style={{
            transform: `rotate(${rotationDegrees}deg)`,
            transformOrigin: `${center}px ${center}px`,
            transition: isPaused ? 'none' : 'transform 1s linear',
          }}
        >
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - handLength}
            className={cn(
              'stroke-primary',
              isPaused && 'stroke-muted-foreground'
            )}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={center}
            cy={center}
            r="6"
            className={cn('fill-primary', isPaused && 'fill-muted-foreground')}
          />
        </g>
      </svg>
    </div>
  );
};
