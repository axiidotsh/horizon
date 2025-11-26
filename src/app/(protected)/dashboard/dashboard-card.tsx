import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  content: string;
  footer?: string;
}

export const DashboardCard = ({
  title,
  icon: Icon,
  content,
  footer,
}: DashboardCardProps) => {
  return (
    <Card className="bg-dashboard-card gap-0 rounded-sm shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-muted-foreground font-mono text-sm font-normal">
            {title}
          </CardTitle>
          <Icon className="text-muted-foreground size-4" />
        </div>
      </CardHeader>
      <CardContent className="mt-3">
        <p className="text-2xl font-semibold">{content}</p>
      </CardContent>
      {footer ? (
        <CardFooter className="mt-1">
          <p className="text-muted-foreground text-xs">{footer}</p>
        </CardFooter>
      ) : null}
    </Card>
  );
};
