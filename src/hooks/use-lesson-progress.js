import { useEffect, useState } from 'react';

import { applyServerProgress, loadLessonProgress } from '@/store/lesson-progress';

/**
 * Lesson progress for a screen, shown as fast as possible.
 *
 *   1. The copy stored on this device is read first (a few milliseconds), so
 *      the screen can render - and unlock what the learner already finished -
 *      right away.
 *   2. `GET /progress` runs at the same time. When it answers (which can take
 *      30s+ while the Render server wakes up) its completions are merged into
 *      the device copy and the screen updates.
 *
 * The device copy is namespaced per learner and the merge only ever adds
 * completions, so showing it first can never show another account's progress
 * or hide something the server knows about once it answers.
 *
 * `ready` turns true as soon as the first of the two answers arrives; screens
 * use it to avoid flashing "locked" before anything is known.
 */
export function useLessonProgress(authenticatedRequest) {
  const [progress, setProgress] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let serverApplied = false;

    loadLessonProgress()
      .then((local) => {
        // Never let the (older) device read overwrite the merged server answer.
        if (!mounted || serverApplied) return;
        setProgress({ ...(local ?? {}) });
        setReady(true);
      })
      .catch((error) => {
        console.log('[LessonProgress] could not read device progress', error);
        if (mounted) setReady(true);
      });

    authenticatedRequest('/progress')
      .then(async (serverProgress) => {
        await applyServerProgress(serverProgress);
        const merged = await loadLessonProgress();
        if (!mounted) return;
        serverApplied = true;
        setProgress({ ...(merged ?? {}) });
        setReady(true);
      })
      .catch((error) => {
        // Offline or server asleep: the device copy shown above stays.
        console.log('[LessonProgress] server progress unavailable', error);
        if (mounted) setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [authenticatedRequest]);

  return { progress, setProgress, ready };
}
