import { LucideIcon } from 'lucide-react';
import { DashboardCard } from './card';

interface DashboardMetricCardProps {
  title: string;
  icon: LucideIcon;
  content: string;
  footer?: string;
}

export const DashboardMetricCard = ({
  title,
  icon,
  content,
  footer,
}: DashboardMetricCardProps) => {
  return (
    <DashboardCard
      title={title}
      icon={icon}
      contentClassName="mt-3"
      footer={
        footer ? (
          <p className="text-muted-foreground text-xs">{footer}</p>
        ) : null
      }
    >
      <p className="text-2xl font-semibold">{content}</p>
    </DashboardCard>
  );
};
