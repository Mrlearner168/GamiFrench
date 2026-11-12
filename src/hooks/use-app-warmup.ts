import { useEffect, useState } from 'react';

import { useServerStatus } from '@/services/serverWarmup';
import { isVoiceWarm, warmUpVoice } from '@/services/voice';
import { useAuth } from '@/store/auth-context';
import { loadLessonProgress, loadModuleQuizResults } from '@/store/lesson-progress';

export type WarmupStepState = 'active' | 'done' | 'warning';

export type WarmupStep = {
  key: string;
  label: string;
  state: WarmupStepState;
};

/*
 * Long enough that the loader does not flash, short enough not to be felt.
 * Nothing slow holds the learner on it (see `ready` below).
 */
export const MIN_VISIBLE_MS = 400;
/** The text-to-speech engine can hang on some phones; lessons still work without it. */
export const VOICE_BUDGET_MS = 5_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Warms the app's state on first open and reports each step for the loader.
 *
 * Blocking steps (fast, all on the device):
 *   - restore the saved login,
 *   - read this learner's saved progress into memory, so the first screens
 *     open with it already loaded.
 *
 * The French voice keeps warming in the background (capped at
 * VOICE_BUDGET_MS) but never holds the loader: Home does not need it, and
 * text-to-speech can take seconds or hang on some phones.
 *
 * The server is shown but never waited for: a sleeping Render instance can
 * take a minute, and the app works offline-first meanwhile.
 */
export function useAppWarmup(): { steps: WarmupStep[]; ready: boolean } {
  const { session, isLoading } = useAuth();
  const server = useServerStatus();

  const [minTimeDone, setMinTimeDone] = useState(false);
  const [voiceDone, setVoiceDone] = useState(isVoiceWarm);
  const [progressDone, setProgressDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.race([warmUpVoice(), sleep(VOICE_BUDGET_MS)]).finally(() => {
      if (alive) setVoiceDone(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // The learner's storage scope is set once the session is known.
    if (isLoading || !session) return undefined;

    let alive = true;
    Promise.all([loadLessonProgress(), loadModuleQuizResults()])
      .catch((error) => console.log('[Warmup] could not read saved progress', error))
      .finally(() => {
        if (alive) setProgressDone(true);
      });
    return () => {
      alive = false;
    };
  }, [isLoading, session]);

  const signedIn = !isLoading && Boolean(session);

  const steps: WarmupStep[] = [
    {
      key: 'session',
      label: isLoading ? 'Restoring your session' : signedIn ? 'Session restored' : 'Ready to sign in',
      state: isLoading ? 'active' : 'done',
    },
    {
      key: 'voice',
      label: voiceDone ? 'French voice ready' : 'Preparing the French voice',
      state: voiceDone ? 'done' : 'active',
    },
  ];

  if (signedIn) {
    steps.push({
      key: 'progress',
      label: progressDone ? 'Your progress is loaded' : 'Loading your progress',
      state: progressDone ? 'done' : 'active',
    });
  }

  steps.push(serverStep(server.phase));

  const ready = minTimeDone && !isLoading && (!signedIn || progressDone);

  return { steps, ready };
}

function serverStep(phase: ReturnType<typeof useServerStatus>['phase']): WarmupStep {
  switch (phase) {
    case 'ready':
      return { key: 'server', label: 'Server connected', state: 'done' };
    case 'offline':
      return { key: 'server', label: 'Offline: progress saves on this phone', state: 'warning' };
    case 'failed':
      return { key: 'server', label: 'Server busy: it keeps trying in the background', state: 'warning' };
    default:
      return { key: 'server', label: 'Waking up the server (continues in the background)', state: 'active' };
  }
}
