import { useEffect, useState } from "react";

/**
 * useDebounce
 * @param value any value yang mau di-debounce
 */
export function useDebounce(value) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 700);

    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
}
