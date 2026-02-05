import {
  commandMenuOpenAtom,
  commandSearchValueAtom,
  selectedItemAtom,
} from '@/atoms/command-menu-atoms';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';

export function useCommandState() {
  const [open, setOpen] = useAtom(commandMenuOpenAtom);
  const [searchValue, setSearchValue] = useAtom(commandSearchValueAtom);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);

  const reset = useCallback(() => {
    setOpen(false);
    setSearchValue('');
    setSelectedValue('');
    setSelectedItem(null);
  }, [setSelectedItem, setOpen, setSearchValue]);

  return {
    state: {
      open,
      searchValue,
      selectedValue,
      selectedItem,
    },
    actions: {
      setOpen,
      setSearchValue,
      setSelectedValue,
      setSelectedItem,
      reset,
    },
  };
}
