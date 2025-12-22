import { useRef, useCallback } from 'react';

/**
 * Hook to throttle typing indicator events
 * Ensures we don't spam the server with typing events
 */
export const useTypingThrottle = (callback: () => void, delay: number = 3000) => {
  const lastSentRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledCallback = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSent = now - lastSentRef.current;

    if (timeSinceLastSent >= delay) {
      // Enough time has passed, send immediately
      callback();
      lastSentRef.current = now;
    } else {
      // Too soon, schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback();
        lastSentRef.current = Date.now();
        timeoutRef.current = null;
      }, delay - timeSinceLastSent);
    }
  }, [callback, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { throttledCallback, cancel };
};
