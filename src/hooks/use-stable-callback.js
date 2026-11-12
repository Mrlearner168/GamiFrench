import { useCallback, useInsertionEffect, useRef } from 'react';

/**
 * A function whose identity never changes but which always runs the latest
 * version of `fn` (the "latest ref" pattern).
 *
 * Use it for event handlers passed to memoised children: the child keeps the
 * same prop between renders, so a state change elsewhere on the screen no
 * longer re-renders it. Only call the result from events, timers or effects,
 * never during render.
 */
export function useStableCallback(fn) {
  const latest = useRef(fn);

  // Runs before layout effects and any event, so a handler never sees an old `fn`.
  useInsertionEffect(() => {
    latest.current = fn;
  });

  return useCallback((...args) => latest.current(...args), []);
}
