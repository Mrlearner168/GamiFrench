import { useCallback, useEffect, useState } from 'react';

import {
  getNextDailyReset,
  getNextWeeklyReset,
} from '@/data/challenges/challengeCatalog';

/*
|--------------------------------------------------------------------------
| CHALLENGE TIMERS
|--------------------------------------------------------------------------
| Countdown helpers for the daily/weekly challenge reset. The timers tick
| once per second and, because the target date is recomputed on every tick,
| they roll over to the next period by themselves at midnight / Monday.
|--------------------------------------------------------------------------
*/

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

/* "07:42:11" — always the same width so the layout never jumps. */
export function formatCountdown(msRemaining) {
  const totalSeconds = Math.max(0, Math.floor((Number(msRemaining) || 0) / SECOND_MS));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

/* "7h 42m", "42m 10s" — compact label for tighter cards. */
export function formatCountdownShort(msRemaining) {
  const value = Math.max(0, Number(msRemaining) || 0);
  const hours = Math.floor(value / HOUR_MS);
  const minutes = Math.floor((value % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((value % MINUTE_MS) / SECOND_MS);

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`;

  return `${seconds}s`;
}

/*
 * Generic one-second countdown.
 *
 * `resolveTarget` is called on every tick and has to be referentially stable
 * (use useCallback in the caller) so the interval is not recreated.
 */
export function useChallengeTimer(resolveTarget) {
  const getRemaining = useCallback(
    () => Math.max(0, resolveTarget().getTime() - Date.now()),
    [resolveTarget]
  );

  const [msRemaining, setMsRemaining] = useState(getRemaining);

  useEffect(() => {
    const tick = () => setMsRemaining(getRemaining());

    tick();
    const interval = setInterval(tick, SECOND_MS);

    return () => clearInterval(interval);
  }, [getRemaining]);

  return {
    msRemaining,
    text: formatCountdown(msRemaining),
    shortText: formatCountdownShort(msRemaining),
  };
}

/* Time left until the daily challenges are reassigned (local midnight). */
export function useDailyResetTimer() {
  return useChallengeTimer(
    useCallback(() => getNextDailyReset(), [])
  );
}

/* Time left until the weekly challenge is reassigned (next Monday 00:00). */
export function useWeeklyResetTimer() {
  return useChallengeTimer(
    useCallback(() => getNextWeeklyReset(), [])
  );
}
