import { useEffect, useState } from "react";

/**
 * Debounces a value over a given delay (ms)
 * @param value The input value to debounce
 * @param delay Debounce delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
