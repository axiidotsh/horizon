'use client';

import { useSetAtom } from 'jotai';
import { editingTaskAtom } from '../atoms/task-dialogs';
import { useDeleteTask } from './mutations/use-delete-task';
import { useToggleTask } from './mutations/use-toggle-task';
import type { Task } from './types';

export function useTaskActions() {
  const setEditingTask = useSetAtom(editingTaskAtom);
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  function handleToggle(
    taskId: string,
    options?: Parameters<typeof toggleTask.mutate>[1]
  ) {
    toggleTask.mutate({ param: { id: taskId } }, options);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
  }

  function handleDelete(
    task: Task,
    options?: Parameters<typeof deleteTask.mutate>[1]
  ) {
    deleteTask.mutate({ param: { id: task.id } }, options);
  }

  return {
    handleToggle,
    handleEdit,
    handleDelete,
    isToggling: toggleTask.isPending,
    isDeleting: deleteTask.isPending,
  };
}
