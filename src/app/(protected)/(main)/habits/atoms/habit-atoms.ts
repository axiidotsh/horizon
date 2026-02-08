import { atom } from 'jotai';

export type SortOption = 'currentStreak' | 'bestStreak' | 'title' | 'createdAt';
export type SortOrder = 'asc' | 'desc';
export type FilterOption = 'all' | 'completed' | 'pending';

export const sortByAtom = atom<SortOption>('title');
export const sortOrderAtom = atom<SortOrder>('asc');
export const searchQueryAtom = atom('');
export const statusFilterAtom = atom<FilterOption>('all');
