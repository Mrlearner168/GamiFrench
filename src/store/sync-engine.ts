/**
 * Central sync engine.
 *
 * It owns the three things the offline-first flow needs:
 *   1. PUSH  - replay the pending-sync queue (sub-lesson content, topic
 *              results, assessment attempts, mission claims, deferred
 *              speaking attempts) once an authenticated session exists.
 *   2. PULL  - fetch `GET /progress` and merge the server's state into the
 *              device mirrors so a fresh install or a second device converges.
 *   3. STATUS - expose `{ syncing, online, pendingCount, lastSyncedAt }` so the
 *              UI can show an honest offline / synced indicator.
 *
 * The engine never imports the auth layer: the provider configures it with the
 * authenticated request function and a pull handler, which keeps this module
 * free of circular dependencies.
 */
import {
  flushPendingSync,
  pendingCount,
  pendingSpeakingAttempts,
  removePendingSpeakingAttempt,
  subscribeQueueChanges,
} from '@/store/pending-sync';
import type { PendingSpeakingAttempt } from '@/store/pending-sync';

export type SyncReason =
  | 'startup'
  | 'session'
  | 'reconnect'
  | 'foreground'
  | 'interval'
  | 'queued'
  | 'manual';

export type SyncStatus = {
  syncing: boolean;
  online: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
};

export type SyncResult = {
  reason: SyncReason;
  pushed: number;
  pulled: boolean;
  speakingUpgraded: number;
};

export type RequestSender = (path: string, options: RequestInit) => Promise<unknown>;
type PullHandler = () => Promise<void>;
type SpeakingUpgradeHandler = (attempt: PendingSpeakingAttempt) => Promise<void>;

type EngineConfig = {
  send: RequestSender;
  pull?: PullHandler;
  /** Client-side handler for deferred clips: re-transcribe then submit. */
  upgradeSpeakingAttempt?: SpeakingUpgradeHandler;
};

let config: EngineConfig | null = null;

let status: SyncStatus = {
  syncing: false,
  online: true,
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

const statusListeners = new Set<(status: SyncStatus) => void>();

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      console.log('[SyncEngine] status listener threw', error);
    }
  });
}

/** Latest status without subscribing. */
export function getSyncStatus(): SyncStatus {
  return status;
}

/** Subscribe to status changes. Returns an unsubscribe function. */
export function subscribeSyncStatus(listener: (status: SyncStatus) => void): () => void {
  statusListeners.add(listener);
  listener(status);
  return () => {
    statusListeners.delete(listener);
  };
}

/** Tell the engine whether the device is online (driven by connectivity.ts). */
export function setSyncOnline(online: boolean) {
  if (status.online === online) return;
  setStatus({ online });
}

/**
 * Wire the engine to the authenticated request function and the two handlers
 * that only the app layer can supply (reading progress, re-grading clips).
 */
export function configureSyncEngine(next: EngineConfig) {
  config = next;
}

/** Drop the configuration on sign-out so the queue is never flushed cross-account. */
export function resetSyncEngine() {
  config = null;
  cancelQueuedSync();
  setStatus({ syncing: false, pendingCount: 0 });
}

/** Refresh the queued-operation count shown in the UI. */
export async function refreshPendingCount(): Promise<number> {
  const count = await pendingCount();
  setStatus({ pendingCount: count });
  return count;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Sync failed.';
}

let running: Promise<SyncResult> | null = null;

async function doSync(reason: SyncReason): Promise<SyncResult> {
  const local = config;
  const result: SyncResult = { reason, pushed: 0, pulled: false, speakingUpgraded: 0 };

  if (!local) return result;

  setStatus({ syncing: true, lastError: null });

  try {
    // Push first so locally earned progress is on the server before we read it
    // back. This ordering is what makes the two progress pictures converge.
    result.pushed = await flushPendingSync(local.send);
    // Update the badge now: the pull below can still fail (server asleep).
    setStatus({ pendingCount: await pendingCount() });

    // Upgrade any deferred speaking attempts now that the network is back.
    if (local.upgradeSpeakingAttempt) {
      const attempts = await pendingSpeakingAttempts();
      for (const attempt of attempts) {
        try {
          await local.upgradeSpeakingAttempt(attempt);
          await removePendingSpeakingAttempt(attempt.idempotencyKey);
          result.speakingUpgraded += 1;
        } catch (error) {
          // Leave the attempt queued; a later sync will retry it.
          console.log('[SyncEngine] speaking upgrade deferred', error);
        }
      }
    }

    // Pull the authoritative state back down and merge it locally.
    if (local.pull) {
      await local.pull();
      result.pulled = true;
    }

    setStatus({
      syncing: false,
      lastSyncedAt: new Date().toISOString(),
      pendingCount: await pendingCount(),
    });
  } catch (error) {
    setStatus({
      syncing: false,
      lastError: errorMessage(error),
      pendingCount: await pendingCount().catch(() => status.pendingCount),
    });
    console.log('[SyncEngine] sync failed', reason, error);
  }

  return result;
}

/**
 * Run a full push+pull cycle. Concurrent calls share the same in-flight run so
 * a reconnect burst cannot stampede the backend.
 */
export function runSync(reason: SyncReason = 'manual'): Promise<SyncResult> {
  if (running) return running;

  running = doSync(reason).finally(() => {
    running = null;
  });

  return running;
}

/* ---------------------------------------------------------------------------
 * SEND QUEUED WORK SOON
 *
 * A save that fails while the phone is still online (typically the Render
 * server asleep) is queued, but no reconnect event will ever fire for it. So
 * when new work is queued the badge count is refreshed at once and a sync is
 * scheduled shortly after, retried with growing gaps while the server wakes
 * up (it can take 30s+). After the last retry the usual triggers (foreground,
 * reconnect, 5-minute timer, Sync button) take over.
 * ------------------------------------------------------------------------- */
export const QUEUED_SYNC_DELAYS_MS = [3_000, 15_000, 45_000];

let queuedTimer: ReturnType<typeof setTimeout> | null = null;

function cancelQueuedSync() {
  if (queuedTimer) clearTimeout(queuedTimer);
  queuedTimer = null;
}

function scheduleQueuedSync(attempt = 0) {
  cancelQueuedSync();
  if (attempt >= QUEUED_SYNC_DELAYS_MS.length) return;

  queuedTimer = setTimeout(async () => {
    queuedTimer = null;
    // Signed out, or truly offline: the reconnect trigger will handle it.
    if (!config || !status.online) return;

    await runSync('queued');

    // Still something waiting (server not awake yet): try again a bit later.
    if (config && status.pendingCount > 0 && !queuedTimer) {
      scheduleQueuedSync(attempt + 1);
    }
  }, QUEUED_SYNC_DELAYS_MS[attempt]);
}

subscribeQueueChanges(() => {
  refreshPendingCount().catch(() => {});
  scheduleQueuedSync(0);
});
