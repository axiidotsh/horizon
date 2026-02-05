import { cn } from '@/utils/utils';
import { AlertCircleIcon, type LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';

interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export const ErrorState = ({
  onRetry,
  title = 'Something went wrong',
  description = 'Failed to load data. Please try again.',
  icon: Icon = AlertCircleIcon,
  className,
}: ErrorStateProps) => {
  return (
    <Empty className={cn('bg-dashboard-card border', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <Button onClick={onRetry} variant="outline">
        Retry
      </Button>
    </Empty>
  );
};
