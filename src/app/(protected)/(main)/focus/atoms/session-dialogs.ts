import { atom } from 'jotai';
import type { FocusSession } from '../hooks/types';

export const showCancelDialogAtom = atom(false);
export const showEndEarlyDialogAtom = atom(false);
export const showDiscardDialogAtom = atom(false);

export const editingSessionAtom = atom<FocusSession | null>(null);
export const deletingSessionAtom = atom<FocusSession | null>(null);
export const createCustomSessionAtom = atom(false);
