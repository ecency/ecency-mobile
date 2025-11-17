import { useState, useRef, useCallback } from 'react';

/**
 * Hook that maintains both React state and a ref, keeping them in sync.
 * Useful for preventing race conditions where you need:
 * - Synchronous access to current value (via getter) for guards/checks
 * - React state updates to trigger re-renders for UI
 *
 * @param initialValue - Initial value for both state and ref
 * @returns Tuple of [state, setState, getCurrentRefValue]
 *
 * @example
 * const [isSending, setIsSending, getIsSendingCurrent] = useStateWithRef(false);
 *
 * // Use getter for synchronous guards
 * if (getIsSendingCurrent()) return;
 *
 * // Use setState to update both state and ref
 * setIsSending(true);
 */
export const useStateWithRef = <T,>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  const ref = useRef<T>(initialValue);

  const setStateWithRef = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      ref.current = next;
      return next;
    });
  }, []);

  const getCurrentRefValue = useCallback(() => ref.current, []);

  return [state, setStateWithRef, getCurrentRefValue] as const;
};

