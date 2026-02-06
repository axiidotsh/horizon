'use client';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { cn } from '@/utils/utils';
import { useAtom } from 'jotai';
import { KanbanIcon, LayoutListIcon } from 'lucide-react';
import { taskViewAtom } from '../atoms/task-atoms';

const ACTIVE_STYLES =
  'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:bg-primary/15 dark:hover:bg-primary/20';

export const TaskViewToggle = () => {
  const [view, setView] = useAtom(taskViewAtom);

  return (
    <ButtonGroup>
      <Button
        size="icon-sm"
        variant="outline"
        tooltip="List view"
        onClick={() => setView('list')}
        className={cn(view === 'list' && ACTIVE_STYLES)}
      >
        <LayoutListIcon />
      </Button>
      <Button
        size="icon-sm"
        variant="outline"
        tooltip="Kanban view"
        onClick={() => setView('kanban')}
        className={cn(view === 'kanban' && ACTIVE_STYLES)}
      >
        <KanbanIcon />
      </Button>
    </ButtonGroup>
  );
};
