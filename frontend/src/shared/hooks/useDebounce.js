import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay.
 * @param {T} value - The value to debounce
 * @param {number} delay - Delay in ms
 * @returns {T} Debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
