/**
 * Cold-start handling for the Render + Neon backend.
 *
 * Render's free tier puts the API to sleep after ~15 idle minutes and Neon
 * suspends the database too, so the first request after a pause can take
 * 30-60 seconds. Instead of letting that first request time out, the app:
 *
 *   1. starts waking the server as soon as it opens (and when it comes back
 *      to the foreground), while the learner is still typing their password;
 *   2. makes sign-in / sign-up wait for the server to be awake before posting;
 *   3. shows the wake-up progress on the auth screens (useServerStatus).
 *
 * "Awake" means `/health` answered 200: that endpoint touches the database,
 * so both Render and Neon are up once it succeeds.
 */
import { useSyncExternalStore } from 'react';

import { URL } from '@/services/apiClient';
import { isOnlineSync } from '@/services/connectivity';

export type ServerPhase = 'idle' | 'waking' | 'ready' | 'failed' | 'offline';

export type ServerStatus = {
  phase: ServerPhase;
  /** When the current wake-up started (ms epoch), null when not waking. */
  startedAt: number | null;
};

/** Give up after this long; the learner can retry from the banner. */
export const WAKE_BUDGET_MS = 90_000;
/** The server counts as warm for this long after a success. */
const WARM_FOR_MS = 10 * 60_000;
const PING_TIMEOUT_MS = 12_000;
const RETRY_DELAY_MS = 2_500;

let status: ServerStatus = { phase: 'idle', startedAt: null };
let lastReadyAt = 0;
let inflight: Promise<boolean> | null = null;
const listeners = new Set<() => void>();

function setStatus(next: ServerStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function pingHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    const response = await fetch(`${URL}/health`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * True when the DEVICE has no connection (not merely a sleeping server). A
 * sleeping Render instance still accepts connections, so waiting for it makes
 * sense; with no network at all, waiting would only freeze the screen.
 */
export function isDeviceOffline(): boolean {
  if (!isOnlineSync()) return true;
  const nav = (globalThis as { navigator?: { onLine?: boolean } }).navigator;
  return nav?.onLine === false;
}

/** True when the server answered recently, so no wake-up is needed. */
export function isServerWarm(): boolean {
  return status.phase === 'ready' && Date.now() - lastReadyAt < WARM_FOR_MS;
}

/** Record that a real request just succeeded (the server is clearly awake). */
export function markServerAwake() {
  lastReadyAt = Date.now();
  if (status.phase !== 'ready') setStatus({ phase: 'ready', startedAt: null });
}

/**
 * Wake the server and resolve true once it is ready (false after the budget).
 * Concurrent callers share one wake-up; a warm server resolves immediately.
 */
export function wakeServer({ force = false }: { force?: boolean } = {}): Promise<boolean> {
  if (!force && isServerWarm()) return Promise.resolve(true);
  if (isDeviceOffline()) {
    setStatus({ phase: 'offline', startedAt: null });
    return Promise.resolve(false);
  }
  if (inflight) return inflight;

  const startedAt = Date.now();
  inflight = (async () => {
    // Only show "waking" if the first ping is slow: a warm server answers in
    // well under a second and the learner should never see the banner then.
    const showTimer = setTimeout(() => {
      if (inflight) setStatus({ phase: 'waking', startedAt });
    }, 1_200);

    try {
      while (Date.now() - startedAt < WAKE_BUDGET_MS) {
        // The connection dropped while waiting: stop instead of spinning.
        if (isDeviceOffline()) {
          setStatus({ phase: 'offline', startedAt: null });
          return false;
        }
        if (await pingHealth()) {
          markServerAwake();
          return true;
        }
        await sleep(RETRY_DELAY_MS);
      }
      setStatus({ phase: 'failed', startedAt: null });
      return false;
    } finally {
      clearTimeout(showTimer);
      inflight = null;
    }
  })();

  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getStatus = () => status;

/** Re-renders whenever the wake-up phase changes. */
export function useServerStatus(): ServerStatus {
  return useSyncExternalStore(subscribe, getStatus, getStatus);
}

/** Test helper: forget everything. */
export function resetServerWarmupForTests() {
  status = { phase: 'idle', startedAt: null };
  lastReadyAt = 0;
  inflight = null;
}
