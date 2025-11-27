import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/utils/utils';
import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export const DashboardCard = ({
  title,
  icon: Icon,
  action,
  footer,
  className,
  contentClassName,
  children,
}: DashboardCardProps) => {
  return (
    <Card
      className={cn(
        'bg-dashboard-card gap-0 rounded-sm shadow-none',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-muted-foreground font-mono text-sm font-normal">
          {title}
        </CardTitle>
        {(action || Icon) && (
          <div className="flex items-center gap-2">
            {action}
            {Icon ? (
              <Icon
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
            ) : null}
          </div>
        )}
      </CardHeader>
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
};
