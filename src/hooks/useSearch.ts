'use client';

import { useState, useEffect, useMemo } from 'react';

// 📚 LEARN: Debouncing prevents excessive function calls during rapid input.
// Without debouncing, searching would trigger on every keystroke, causing UI jank.
// We wait until the user stops typing for 300ms before actually filtering.

export function useSearch<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items;
    return items.filter((item) => filterFn(item, debouncedQuery.toLowerCase()));
  }, [items, debouncedQuery, filterFn]);

  return { query, setQuery, filteredItems, isSearching: query !== debouncedQuery };
}
