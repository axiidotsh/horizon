import { cn } from '@/utils/utils';

interface KanbanColumnHeaderProps {
  label: string;
  count: number;
  colorClass: string;
}

export const KanbanColumnHeader = ({
  label,
  count,
  colorClass,
}: KanbanColumnHeaderProps) => (
  <div className="flex items-center gap-2 px-1 pb-2">
    <div className={cn('h-4 w-1 rounded-full', colorClass)} />
    <span className="text-sm font-medium">{label}</span>
    <span className="text-muted-foreground text-xs">{count}</span>
  </div>
);
