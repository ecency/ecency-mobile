import { useEffect, useState } from 'react';

/**
 * Single shared interval that ticks once per minute.
 * Multiple hook consumers share the same timer — avoids N intervals
 * for N PostCards (or any other relative-time display).
 */

let _tick = 0;
const _listeners: Set<(t: number) => void> = new Set();
let _interval: ReturnType<typeof setInterval> | null = null;

function _ensureInterval() {
  if (_interval) return;
  _interval = setInterval(() => {
    _tick += 1;
    _listeners.forEach((fn) => fn(_tick));
  }, 60_000);
}

function _subscribe(fn: (t: number) => void) {
  _listeners.add(fn);
  _ensureInterval();
  return () => {
    _listeners.delete(fn);
    if (_listeners.size === 0 && _interval) {
      clearInterval(_interval);
      _interval = null;
    }
  };
}

/**
 * Returns an incrementing number that changes every 60 s.
 * Use it as a dependency to refresh relative-time strings.
 */
export function useMinuteTicker(): number {
  const [tick, setTick] = useState(_tick);
  useEffect(() => _subscribe(setTick), []);
  return tick;
}
