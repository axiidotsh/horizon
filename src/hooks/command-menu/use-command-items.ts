import { useRecentSessions } from '@/app/(protected)/(main)/focus/hooks/queries/use-recent-sessions';
import type { FocusSession } from '@/app/(protected)/(main)/focus/hooks/types';
import { useHabits } from '@/app/(protected)/(main)/habits/hooks/queries/use-habits';
import type { Habit } from '@/app/(protected)/(main)/habits/hooks/types';
import { useTasks } from '@/app/(protected)/(main)/tasks/hooks/queries/use-tasks';
import type { Task } from '@/app/(protected)/(main)/tasks/hooks/types';
import type { CommandMenuItem } from '@/hooks/command-menu/types';
import { useMemo } from 'react';

const ITEM_LIMIT = 10;

export function useCommandItems() {
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();
  const { data: recentSessions = [] } = useRecentSessions(ITEM_LIMIT);

  return useMemo(
    () => ({
      todos: tasks
        .slice(0, ITEM_LIMIT)
        .map((task) => ({ type: 'todo' as const, data: task })),
      habits: habits
        .slice(0, ITEM_LIMIT)
        .map((habit) => ({ type: 'habit' as const, data: habit })),
      sessions: recentSessions.map((session) => ({
        type: 'session' as const,
        data: session,
      })),
      itemsMap: createItemsMap(tasks, habits, recentSessions),
    }),
    [tasks, habits, recentSessions]
  );
}

function createItemsMap(
  tasks: Task[],
  habits: Habit[],
  sessions: FocusSession[]
) {
  const map = new Map<string, CommandMenuItem>();

  tasks.slice(0, ITEM_LIMIT).forEach((task) => {
    map.set(`todo ${task.title}`, { type: 'todo', data: task });
  });

  habits.slice(0, ITEM_LIMIT).forEach((habit) => {
    map.set(`habit ${habit.title}`, { type: 'habit', data: habit });
  });

  sessions.slice(0, ITEM_LIMIT).forEach((session) => {
    map.set(`session ${session.task || 'Focus session'}`, {
      type: 'session',
      data: session,
    });
  });

  return map;
}
