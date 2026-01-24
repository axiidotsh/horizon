'use client';

import { useSetAtom } from 'jotai';
import { deletingTaskAtom, editingTaskAtom } from '../atoms/task-dialogs';
import { useToggleTask } from './mutations/use-toggle-task';
import type { Task } from './types';

export function useTaskActions() {
  const setEditingTask = useSetAtom(editingTaskAtom);
  const setDeletingTask = useSetAtom(deletingTaskAtom);
  const toggleTask = useToggleTask();

  function handleToggle(taskId: string) {
    toggleTask.mutate({ param: { id: taskId } });
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
  }

  function handleDelete(task: Task) {
    setDeletingTask(task);
  }

  return {
    handleToggle,
    handleEdit,
    handleDelete,
    isToggling: toggleTask.isPending,
  };
}
