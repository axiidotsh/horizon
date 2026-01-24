import { atom } from 'jotai';

export type SortOption = 'dueDate' | 'priority' | 'title' | 'completed';

export const sortByAtom = atom<SortOption>('dueDate');
export const searchQueryAtom = atom('');
export const selectedTagsAtom = atom<string[]>([]);
export const selectedProjectsAtom = atom<string[]>([]);
