import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSetAtom } from 'jotai';
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import {
  deletingSessionAtom,
  editingSessionAtom,
} from '../../atoms/session-dialogs';
import type { FocusSession } from '../../hooks/types';
import { formatSessionDateTime } from '../../utils/session-metrics';

interface FocusSessionListItemProps {
  session: FocusSession;
}

export const FocusSessionListItem = ({
  session,
}: FocusSessionListItemProps) => {
  const setEditingSession = useSetAtom(editingSessionAtom);
  const setDeletingSession = useSetAtom(deletingSessionAtom);

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
            <DropdownMenuItem onClick={() => setEditingSession(session)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeletingSession(session)}
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
