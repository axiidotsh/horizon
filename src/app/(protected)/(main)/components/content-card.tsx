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

interface ContentCardProps {
  title: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  footer?: ReactNode;
  containerClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}

export const ContentCard = ({
  title,
  icon: Icon,
  action,
  footer,
  containerClassName,
  headerClassName,
  footerClassName,
  contentClassName,
  children,
}: ContentCardProps) => {
  return (
    <Card
      className={cn(
        'bg-dashboard-card gap-0 rounded-sm shadow-none',
        containerClassName
      )}
    >
      <CardHeader
        className={cn(
          'flex items-center justify-between gap-2',
          headerClassName
        )}
      >
        <CardTitle className="text-muted-foreground shrink-0 font-mono text-sm font-normal">
          {title}
        </CardTitle>
        {(action || Icon) && (
          <div
            className={cn(
              'flex items-center gap-2',
              action && 'justify-end max-sm:w-full'
            )}
          >
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
      {footer ? (
        <CardFooter className={cn(footerClassName)}>{footer}</CardFooter>
      ) : null}
    </Card>
  );
};
