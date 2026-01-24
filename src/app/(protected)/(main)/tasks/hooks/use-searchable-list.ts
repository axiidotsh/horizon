'use client';

import { useState } from 'react';

export function useSearchableList<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean
) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery.trim()
    ? items.filter((item) => filterFn(item, searchQuery))
    : items;

  function reset() {
    setSearchQuery('');
  }

  return { searchQuery, setSearchQuery, filteredItems, reset };
}
