import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';
import { FolderIcon } from 'lucide-react';
import { PROJECT_COLOR_OPACITY } from '../../constants';

interface ProjectBadgeProps {
  project: {
    id: string;
    name: string;
    color: string | null;
  };
  showIcon?: boolean;
  className?: string;
}

function addColorOpacity(color: string, opacity: number): string {
  return `${color}${opacity.toString(16).padStart(2, '0')}`;
}

export const ProjectBadge = ({
  project,
  showIcon = true,
  className,
}: ProjectBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 border', className)}
      style={{
        backgroundColor: project.color
          ? addColorOpacity(project.color, PROJECT_COLOR_OPACITY.BACKGROUND)
          : undefined,
        borderColor: project.color
          ? addColorOpacity(project.color, PROJECT_COLOR_OPACITY.BORDER)
          : undefined,
        color: project.color || undefined,
      }}
    >
      {showIcon && <FolderIcon className="size-3" />}
      {project.name}
    </Badge>
  );
};
