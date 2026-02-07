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

  function handleToggle(taskId: string) {
    toggleTask.mutate({ param: { id: taskId } });
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
  }

  function handleDelete(task: Task) {
    deleteTask.mutate({ param: { id: task.id } });
  }

  return {
    handleToggle,
    handleEdit,
    handleDelete,
    isToggling: toggleTask.isPending,
  };
}
