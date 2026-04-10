import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay (default 300ms).
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 400);
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
