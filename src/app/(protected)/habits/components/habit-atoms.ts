import { atom } from 'jotai';

export type SortOption = 'streak' | 'title' | 'status';
export type FilterOption = 'all' | 'completed' | 'pending';

export const sortByAtom = atom<SortOption>('streak');
export const searchQueryAtom = atom('');
export const statusFilterAtom = atom<FilterOption>('all');
