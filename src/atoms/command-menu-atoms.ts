import type { CommandMenuItem } from '@/components/command-menu/types';
import { atom } from 'jotai';

export const selectedItemAtom = atom<CommandMenuItem | null>(null);
