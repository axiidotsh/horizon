import { atom } from 'jotai';
import type { FocusSession } from '../hooks/types';

export const cancelingSessionAtom = atom<FocusSession | null>(null);
export const endingEarlySessionAtom = atom<FocusSession | null>(null);
export const discardingSessionAtom = atom<FocusSession | null>(null);

export const editingSessionAtom = atom<FocusSession | null>(null);
export const deletingSessionAtom = atom<FocusSession | null>(null);
export const createCustomSessionAtom = atom(false);
export const customDurationSettingsDialogAtom = atom(false);

export const showSessionsDialogAtom = atom(false);
