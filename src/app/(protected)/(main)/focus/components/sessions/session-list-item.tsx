import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import type { FocusSession } from '../../hooks/types';
import { formatSessionDateTime } from '../../utils/session-metrics';

interface SessionListItemProps {
  session: FocusSession;
  onEdit: (session: FocusSession) => void;
  onDelete: (session: FocusSession) => void;
}

export const SessionListItem = ({
  session,
  onEdit,
  onDelete,
}: SessionListItemProps) => {
  return (
    <li className="border-border flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
      <div className="flex-1">
        <p className="text-sm">{session.task || 'Focus session'}</p>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatSessionDateTime(session.startedAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium">
          {session.durationMinutes} min
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(session)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(session)}
            >
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
};
