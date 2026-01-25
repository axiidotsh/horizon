import { useInfiniteRecentSessions } from '@/app/(protected)/(main)/focus/hooks/queries/use-infinite-recent-sessions';
import type { FocusSession } from '@/app/(protected)/(main)/focus/hooks/types';
import { useInfiniteHabits } from '@/app/(protected)/(main)/habits/hooks/queries/use-infinite-habits';
import type { Habit } from '@/app/(protected)/(main)/habits/hooks/types';
import { useInfiniteTasks } from '@/app/(protected)/(main)/tasks/hooks/queries/use-infinite-tasks';
import { useProjects } from '@/app/(protected)/(main)/tasks/hooks/queries/use-projects';
import type { Project, Task } from '@/app/(protected)/(main)/tasks/hooks/types';
import type { CommandMenuItem } from '@/hooks/command-menu/types';
import { useMemo } from 'react';

const ITEM_LIMIT = 10;

export function useCommandItems() {
  const { tasks } = useInfiniteTasks({ limit: ITEM_LIMIT });
  const { data: projects = [] } = useProjects();
  const { habits } = useInfiniteHabits({ limit: ITEM_LIMIT, days: 7 });
  const { sessions: recentSessions } = useInfiniteRecentSessions({
    limit: ITEM_LIMIT,
  });

  return useMemo(
    () => ({
      todos: tasks
        .slice(0, ITEM_LIMIT)
        .map((task) => ({ type: 'todo' as const, data: task })),
      projects: projects
        .slice(0, ITEM_LIMIT)
        .map((project) => ({ type: 'project' as const, data: project })),
      habits: habits
        .slice(0, ITEM_LIMIT)
        .map((habit) => ({ type: 'habit' as const, data: habit })),
      sessions: recentSessions.map((session) => ({
        type: 'session' as const,
        data: session,
      })),
      itemsMap: createItemsMap(tasks, projects, habits, recentSessions),
    }),
    [tasks, projects, habits, recentSessions]
  );
}

function createItemsMap(
  tasks: Task[],
  projects: Project[],
  habits: Habit[],
  sessions: FocusSession[]
) {
  const map = new Map<string, CommandMenuItem>();

  tasks.slice(0, ITEM_LIMIT).forEach((task) => {
    map.set(`todo ${task.title}`, { type: 'todo', data: task });
  });

  projects.slice(0, ITEM_LIMIT).forEach((project) => {
    map.set(`project ${project.name}`, { type: 'project', data: project });
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
