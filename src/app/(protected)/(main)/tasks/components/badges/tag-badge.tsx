import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { XIcon } from 'lucide-react';

interface TagBadgeProps {
  tag: string;
  onRemove?: (e?: React.MouseEvent) => void;
  className?: string;
}

export const TagBadge = ({ tag, onRemove, className }: TagBadgeProps) => {
  if (onRemove) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'dark:bg-secondary bg-foreground/10 gap-1 pr-1',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {tag}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="size-3.5 hover:bg-transparent"
        >
          <XIcon className="size-2.5" />
        </Button>
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn('dark:bg-secondary bg-foreground/10', className)}
    >
      {tag}
    </Badge>
  );
};
