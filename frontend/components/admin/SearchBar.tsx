'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    (value: string) => {
      const timer = setTimeout(() => {
        onSearch(value);
      }, debounceMs);
      return () => clearTimeout(timer);
    },
    [onSearch, debounceMs],
  );

  useEffect(() => {
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, debouncedSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm w-full focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}
