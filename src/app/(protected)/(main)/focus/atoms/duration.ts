import { settingsAtom } from '@/atoms/settings-atoms';
import { atom } from 'jotai';

export const selectedMinutesAtom = atom(
  (get) => get(settingsAtom).defaultFocusDuration,
  (get, set, update: number) => {
    set(settingsAtom, { ...get(settingsAtom), defaultFocusDuration: update });
  }
);

export const customMinutesAtom = atom('');
export const isCustomDurationAtom = atom(false);
