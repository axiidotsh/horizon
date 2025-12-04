import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ContentCard } from './content-card';

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  content: ReactNode;
  footer?: ReactNode;
}

export const MetricCard = ({
  title,
  icon,
  content,
  footer,
}: MetricCardProps) => {
  return (
    <ContentCard
      title={title}
      icon={icon}
      contentClassName="mt-3"
      footer={
        footer ? (
          <div className="text-muted-foreground text-xs">{footer}</div>
        ) : null
      }
    >
      <div className="text-2xl font-semibold">{content}</div>
    </ContentCard>
  );
};
