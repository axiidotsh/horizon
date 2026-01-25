import { atom } from 'jotai';

export type SortOption = 'currentStreak' | 'bestStreak' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type FilterOption = 'all' | 'completed' | 'pending';

export const sortByAtom = atom<SortOption>('currentStreak');
export const sortOrderAtom = atom<SortOrder>('desc');
export const searchQueryAtom = atom('');
export const statusFilterAtom = atom<FilterOption>('all');
