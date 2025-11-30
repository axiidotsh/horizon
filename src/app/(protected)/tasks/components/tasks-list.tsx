import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ClipboardCheckIcon,
  EllipsisIcon,
  ListChecksIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

interface TasksListProps {
  tasks: Task[];
  sortedTasks: Task[];
}

export function TasksList({ tasks, sortedTasks }: TasksListProps) {
  const formatDueDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <ScrollArea className="my-4">
      <div className="max-h-[600px]">
        {tasks.length === 0 ? (
          <div className="text-muted-foreground flex h-[600px] flex-col items-center justify-center gap-2 text-center">
            <ClipboardCheckIcon className="size-12 opacity-20" />
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="text-xs">Create your first task to get started</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-muted-foreground flex h-[600px] flex-col items-center justify-center gap-2 text-center">
            <ListChecksIcon className="size-12 opacity-20" />
            <p className="text-sm font-medium">No tasks found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          <ul className="space-y-3 pr-4">
            {sortedTasks.map((task) => (
              <li
                key={task.id}
                className="border-border flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <Checkbox
                  checked={task.completed}
                  className="mt-0.5"
                  aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {task.title}
                  </p>
                  {(task.dueDate || task.tags) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {task.dueDate && (
                        <span
                          className={`font-mono text-xs ${
                            isOverdue(task.dueDate) && !task.completed
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      {task.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-foreground/10 h-5 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="shrink-0"
                      aria-label="Task options"
                    >
                      <EllipsisIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ScrollArea>
  );
}
