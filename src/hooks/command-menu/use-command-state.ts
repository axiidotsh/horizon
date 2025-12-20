import { selectedItemAtom } from '@/atoms/command-menu-atoms';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';

export function useCommandState() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);

  const reset = useCallback(() => {
    setOpen(false);
    setSearchValue('');
    setSelectedValue('');
    setSelectedItem(null);
  }, [setSelectedItem]);

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
