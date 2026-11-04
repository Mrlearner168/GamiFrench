/**
 * App-wide sync provider.
 *
 * It is the bridge between three otherwise independent pieces:
 *   - `connectivity.ts` (is the device online?),
 *   - `sync-engine.ts` (push / pull / status),
 *   - the auth layer (an authenticated request function).
 *
 * Responsibilities:
 *   - start the connectivity monitor once,
 *   - configure the engine with the authenticated request function, the
 *     `GET /progress` pull handler, and the deferred-speaking upgrade handler,
 *   - replay the queue on reconnect / foreground / a slow timer.
 */
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { scorePronunciation } from '@/services/pronunciation';
import { transcribeClip } from '@/services/transcription';
import {
  startConnectivityMonitor,
  subscribeToReconnect,
  useNetworkStatus,
} from '@/services/connectivity';
import { useAuth } from '@/store/auth-context';
import { prefetchAssessments } from '@/store/assessment-cache';
import { applyServerAssessments } from '@/store/assessment-sync';
import { applyServerProgress } from '@/store/lesson-progress';
import {
  configureSyncEngine,
  getSyncStatus,
  refreshPendingCount,
  resetSyncEngine,
  runSync,
  setSyncOnline,
  subscribeSyncStatus,
} from '@/store/sync-engine';
import type { SyncStatus } from '@/store/sync-engine';

type SyncContextValue = SyncStatus & {
  /** Trigger a push+pull cycle on demand (used by the badge / settings). */
  syncNow: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue | null>(null);

/** How often the safety-net sync runs while the app is open. */
const INTERVAL_MS = 5 * 60 * 1000;

export function SyncProvider({ children }: PropsWithChildren) {
  const { session, authenticatedRequest } = useAuth();
  const network = useNetworkStatus();
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());

  useEffect(() => subscribeSyncStatus(setStatus), []);
  useEffect(() => startConnectivityMonitor(), []);

  // Keep the engine's online flag in step with the platform.
  useEffect(() => {
    setSyncOnline(network.online);
  }, [network.online]);

  /*
   * Configure (or tear down) the engine as the session changes. `send` is the
   * authenticated request; `pull` merges `GET /progress` into the device
   * mirrors; `upgradeSpeakingAttempt` re-grades a deferred clip now that we are
   * online and submits it as ordinary content progress.
   */
  useEffect(() => {
    if (!session) {
      resetSyncEngine();
      return;
    }

    configureSyncEngine({
      send: (path, options) => authenticatedRequest(path, options),
      pull: async () => {
        const progress = (await authenticatedRequest('/progress')) as {
          assessments?: Record<string, number>;
        };
        await applyServerProgress(progress);
        // Quizzes taken offline are graded on sync: bring their results back.
        await applyServerAssessments(progress?.assessments);
      },
      upgradeSpeakingAttempt: async (attempt) => {
        const transcription = await transcribeClip({
          audioUri: attempt.audioFileUri,
          targetPhrase: attempt.targetPhrase,
        });

        if (!transcription.text) {
          throw new Error('Clip still has no transcript; will retry later.');
        }

        const scored = scorePronunciation(attempt.targetPhrase, transcription.text);

        /*
         * Pronunciation is graded on the device, so the server records the
         * activity but never pays stars or XP for it: the sub-lesson's reward
         * comes from its server-graded quiz answers alone.
         */
        await authenticatedRequest('/progress/content', {
          method: 'PUT',
          body: JSON.stringify({
            contentKey: attempt.contentKey,
            contentType: 'sublesson',
            moduleKey: attempt.moduleKey,
            speakingScore: scored.score,
          }),
        });
      },
    });

    runSync('session');
  }, [session, authenticatedRequest]);

  /*
   * Offline quizzes: while online and signed in, download every placement
   * check and final quiz (at most once a day each) so they open offline too.
   */
  useEffect(() => {
    if (!session || !network.online) return;
    prefetchAssessments((path, options) => authenticatedRequest(path, options)).catch(() => {});
  }, [session, network.online, authenticatedRequest]);

  // Keep the visible queued count fresh whenever the account changes.
  useEffect(() => {
    refreshPendingCount();
  }, [session]);

  // Replay the queue the moment connectivity returns.
  useEffect(() => subscribeToReconnect(() => {
    runSync('reconnect');
  }), []);

  // ...and whenever the app is brought back to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') runSync('foreground');
    });
    return () => subscription.remove();
  }, []);

  // Slow safety net so a missed event still converges.
  useEffect(() => {
    const timer = setInterval(() => runSync('interval'), INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const value: SyncContextValue = {
    ...status,
    online: status.online && network.online,
    syncNow: async () => {
      await runSync('manual');
    },
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const value = useContext(SyncContext);
  if (!value) throw new Error('useSync must be used inside SyncProvider');
  return value;
}
