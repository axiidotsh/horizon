import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type SortOption =
  | 'dueDate'
  | 'priority'
  | 'title'
  | 'completed'
  | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export type TaskView = 'list' | 'kanban';

export const sortByAtom = atom<SortOption>('dueDate');
export const sortOrderAtom = atom<SortOrder>('asc');
export const searchQueryAtom = atom('');
export const selectedTagsAtom = atom<string[]>([]);
export const selectedProjectsAtom = atom<string[]>([]);
export const taskViewAtom = atomWithStorage<TaskView>('task-view', 'list');
