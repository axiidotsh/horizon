'use client';

import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  type KanbanMoveEvent,
} from '@/components/ui/kanban';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  sortByAtom,
  sortOrderAtom,
  type SortOption,
  type SortOrder,
} from '../../atoms/task-atoms';
import { createTaskDialogAtom } from '../../atoms/task-dialogs';
import { useUpdateTask } from '../../hooks/mutations/use-update-task';
import { TASK_QUERY_KEYS } from '../../hooks/task-query-keys';
import type { Task, TaskPriority } from '../../hooks/types';
import {
  KanbanColumnEmpty,
  KanbanColumnLoading,
  KanbanColumnSentinel,
  useKanbanColumn,
} from './kanban-column-body';
import { KanbanColumnHeader } from './kanban-column-header';
import { KanbanTaskCard } from './kanban-task-card';

interface ColumnConfig {
  id: string;
  label: string;
  colorClass: string;
  priority?: TaskPriority;
  completed?: boolean;
}

interface PendingMove {
  task: Task;
  from: string;
  to: string;
}

type SortableField = 'dueDate' | 'title' | 'completed' | 'createdAt';

function getSortConfig(sortBy: SortOption, sortOrder: SortOrder) {
  const field: SortableField = sortBy === 'priority' ? 'createdAt' : sortBy;
  const order: SortOrder = sortBy === 'priority' ? 'desc' : sortOrder;
  return { field, order };
}

function getFieldValue(
  task: Task,
  field: SortableField
): string | boolean | null {
  const val = task[field];
  if (val === null || val === undefined) return null;
  return val as string | boolean;
}

function findSortedIndex(
  tasks: Task[],
  task: Task,
  sortBy: SortOption,
  sortOrder: SortOrder
): number {
  const { field, order } = getSortConfig(sortBy, sortOrder);
  const taskVal = getFieldValue(task, field);

  for (let i = 0; i < tasks.length; i++) {
    const currentVal = getFieldValue(tasks[i], field);

    if (taskVal === null && currentVal === null) {
      if (order === 'asc' ? task.id <= tasks[i].id : task.id >= tasks[i].id)
        return i;
      continue;
    }
    if (taskVal === null) {
      if (order === 'desc') return i;
      continue;
    }
    if (currentVal === null) {
      if (order === 'asc') return i;
      continue;
    }

    if (order === 'asc') {
      if (taskVal < currentVal) return i;
      if (taskVal === currentVal && task.id <= tasks[i].id) return i;
    } else {
      if (taskVal > currentVal) return i;
      if (taskVal === currentVal && task.id >= tasks[i].id) return i;
    }
  }

  return tasks.length;
}

function insertSorted(
  tasks: Task[],
  newTasks: Task[],
  sortBy: SortOption,
  sortOrder: SortOrder
): Task[] {
  if (newTasks.length === 0) return tasks;
  const result = [...tasks];
  for (const task of newTasks) {
    const index = findSortedIndex(result, task, sortBy, sortOrder);
    result.splice(index, 0, task);
  }
  return result;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'HIGH',
    label: 'High',
    colorClass: 'bg-rose-500',
    priority: 'HIGH',
    completed: false,
  },
  {
    id: 'MEDIUM',
    label: 'Medium',
    colorClass: 'bg-orange-500',
    priority: 'MEDIUM',
    completed: false,
  },
  {
    id: 'LOW',
    label: 'Low',
    colorClass: 'bg-emerald-500',
    priority: 'LOW',
    completed: false,
  },
  {
    id: 'NO_PRIORITY',
    label: 'No Priority',
    colorClass: 'bg-zinc-400 dark:bg-zinc-600',
    priority: 'NO_PRIORITY',
    completed: false,
  },
  {
    id: 'COMPLETED',
    label: 'Completed',
    colorClass: 'bg-primary',
    completed: true,
  },
];

const KanbanColumnData = ({
  config,
  pendingMoves,
  sortBy,
  sortOrder,
}: {
  config: ColumnConfig;
  pendingMoves: Map<string, PendingMove>;
  sortBy: SortOption;
  sortOrder: SortOrder;
}) => {
  const { tasks, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useKanbanColumn({
      priority: config.priority,
      completed: config.completed,
    });

  const displayTasks = useMemo(() => {
    if (pendingMoves.size === 0) return tasks;

    const excludeIds = new Set<string>();
    const movedIn: Task[] = [];

    pendingMoves.forEach((move, taskId) => {
      if (move.from === config.id) excludeIds.add(taskId);
      if (move.to === config.id) {
        excludeIds.add(taskId);
        movedIn.push(move.task);
      }
    });

    if (excludeIds.size === 0) return tasks;

    const filtered = tasks.filter((t) => !excludeIds.has(t.id));
    return insertSorted(filtered, movedIn, sortBy, sortOrder);
  }, [tasks, pendingMoves, config.id, sortBy, sortOrder]);

  if (isLoading) return <KanbanColumnLoading />;
  if (displayTasks.length === 0) return <KanbanColumnEmpty />;

  return (
    <>
      {displayTasks.map((task) => (
        <KanbanItem key={task.id} value={task.id}>
          <KanbanItemHandle asChild>
            <div>
              <KanbanTaskCard task={task} />
            </div>
          </KanbanItemHandle>
        </KanbanItem>
      ))}
      <KanbanColumnSentinel
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
};

const KanbanColumnWithHeader = ({
  config,
  taskCount,
  pendingMoves,
  sortBy,
  sortOrder,
  onAdd,
}: {
  config: ColumnConfig;
  taskCount: number;
  pendingMoves: Map<string, PendingMove>;
  sortBy: SortOption;
  sortOrder: SortOrder;
  onAdd?: () => void;
}) => (
  <KanbanColumn
    value={config.id}
    className="bg-muted border-border/50 rounded-xl border pt-2 opacity-100 transition-opacity data-[over]:opacity-60"
  >
    <KanbanColumnHeader
      label={config.label}
      count={taskCount}
      colorClass={config.colorClass}
      onAdd={onAdd}
    />
    <KanbanColumnContent
      value={config.id}
      className="h-[calc(100vh-16rem)] min-h-[200px] overflow-y-auto px-2 sm:h-[calc(100vh-14rem)]"
    >
      <KanbanColumnData
        config={config}
        pendingMoves={pendingMoves}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </KanbanColumnContent>
  </KanbanColumn>
);

export const TasksKanban = () => {
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();
  const sortBy = useAtomValue(sortByAtom);
  const sortOrder = useAtomValue(sortOrderAtom);
  const setCreateTaskDialog = useSetAtom(createTaskDialogAtom);

  const highCol = useKanbanColumn({ priority: 'HIGH', completed: false });
  const medCol = useKanbanColumn({ priority: 'MEDIUM', completed: false });
  const lowCol = useKanbanColumn({ priority: 'LOW', completed: false });
  const noneCol = useKanbanColumn({
    priority: 'NO_PRIORITY',
    completed: false,
  });
  const doneCol = useKanbanColumn({ completed: true });

  const columnData = useMemo(
    () => ({
      HIGH: highCol,
      MEDIUM: medCol,
      LOW: lowCol,
      NO_PRIORITY: noneCol,
      COMPLETED: doneCol,
    }),
    [highCol, medCol, lowCol, noneCol, doneCol]
  );

  const allTasks = useMemo(() => {
    const taskMap = new Map<string, Task>();
    Object.values(columnData).forEach(({ tasks }) => {
      tasks.forEach((t) => taskMap.set(t.id, t));
    });
    return taskMap;
  }, [columnData]);

  const columnsValue = useMemo(() => {
    const result: Record<string, Task[]> = {};
    COLUMNS.forEach((col) => {
      result[col.id] = columnData[col.id as keyof typeof columnData].tasks;
    });
    return result;
  }, [columnData]);

  const [pendingMoves, setPendingMoves] = useState(
    () => new Map<string, PendingMove>()
  );

  const displayColumns = useMemo(() => {
    if (pendingMoves.size === 0) return columnsValue;

    const result: Record<string, Task[]> = {};
    for (const col of COLUMNS) {
      const excludeIds = new Set<string>();
      const movedIn: Task[] = [];

      pendingMoves.forEach((move, taskId) => {
        if (move.from === col.id) excludeIds.add(taskId);
        if (move.to === col.id) {
          excludeIds.add(taskId);
          movedIn.push(move.task);
        }
      });

      const filtered =
        excludeIds.size > 0
          ? columnsValue[col.id].filter((t) => !excludeIds.has(t.id))
          : columnsValue[col.id];

      result[col.id] = insertSorted(filtered, movedIn, sortBy, sortOrder);
    }
    return result;
  }, [columnsValue, pendingMoves, sortBy, sortOrder]);

  const handleMove = useCallback(
    (event: KanbanMoveEvent) => {
      const { activeContainer, overContainer } = event;
      if (activeContainer === overContainer) return;

      const taskId = event.event.active.id as string;
      const task = allTasks.get(taskId);
      if (!task) return;

      const targetCol = COLUMNS.find((c) => c.id === overContainer);
      if (!targetCol) return;

      const updateData: { completed?: boolean; priority?: TaskPriority } = {};
      const updatedTask = { ...task };

      if (overContainer === 'COMPLETED') {
        updateData.completed = true;
        updatedTask.completed = true;
      } else if (activeContainer === 'COMPLETED') {
        updateData.completed = false;
        updateData.priority = targetCol.priority;
        updatedTask.completed = false;
        updatedTask.priority = targetCol.priority!;
      } else {
        updateData.priority = targetCol.priority;
        updatedTask.priority = targetCol.priority!;
      }

      setPendingMoves((prev) => {
        const next = new Map(prev);
        next.set(taskId, {
          task: updatedTask,
          from: activeContainer,
          to: overContainer,
        });
        return next;
      });

      updateTask.mutate(
        { param: { id: taskId }, json: updateData },
        {
          onError: () => {
            setPendingMoves((prev) => {
              const next = new Map(prev);
              next.delete(taskId);
              return next;
            });
            toast.error('Failed to move task');
          },
          onSettled: async () => {
            await queryClient.invalidateQueries({
              queryKey: TASK_QUERY_KEYS.all,
            });
            setPendingMoves((prev) => {
              const next = new Map(prev);
              next.delete(taskId);
              return next;
            });
          },
        }
      );
    },
    [allTasks, updateTask, queryClient]
  );

  const handleValueChange = useCallback(
    (_newValue: Record<string, Task[]>) => {},
    []
  );

  return (
    <ScrollArea className="mt-4 grid">
      <ScrollBar orientation="horizontal" className="z-10" />
      <div className="min-w-6xl">
        <Kanban
          value={displayColumns}
          onValueChange={handleValueChange}
          getItemValue={(task: Task) => task.id}
          onMove={handleMove}
          sortable={false}
        >
          <KanbanBoard className="grid-cols-5 sm:grid-cols-5">
            {COLUMNS.map((col) => (
              <KanbanColumnWithHeader
                key={col.id}
                config={col}
                taskCount={displayColumns[col.id].length}
                pendingMoves={pendingMoves}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onAdd={
                  col.priority
                    ? () => setCreateTaskDialog({ priority: col.priority! })
                    : undefined
                }
              />
            ))}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value }) => {
              const task = allTasks.get(value as string);
              if (!task) return null;
              return <KanbanTaskCard task={task} />;
            }}
          </KanbanOverlay>
        </Kanban>
      </div>
    </ScrollArea>
  );
};
