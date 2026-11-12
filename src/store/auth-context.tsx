import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { ApiError, apiRequest } from '@/services/apiClient';
import { authService } from '@/services/authService';
import {
  cachedProgressRequest,
  invalidateProgressCache,
  isProgressRead,
} from '@/services/progressRequestCache';
import { decodeAccessTokenClaims } from '@/services/tokenValidation';
import { cancelDailyReminders } from '@/services/dailyReminder';
import { lockAudio, unlockAudio } from '@/services/sound';
import { setChallengeScope } from '@/store/challenge-progress';
import { setLessonProgressScope } from '@/store/lesson-progress';
import { setPendingSyncScope } from '@/store/pending-sync';
import { setProfileCacheScope } from '@/store/profile-cache';
import { storageDelete, storageGet, storageSet } from '@/store/storage';
import type { AuthCredentials, AuthSession, RegistrationInput } from '@/types/auth';

const SESSION_KEY = 'gamifrench.session';

/**
 * Refresh the access token this long before it expires, so a request never
 * goes out with a token that dies in flight (and so a learner coming back
 * after a break gets a fresh token before the first screen asks for data).
 */
const REFRESH_MARGIN_SECONDS = 60;

/** True when the access token is expired, unreadable, or about to expire. */
export function accessTokenNeedsRefresh(accessToken: string | undefined, now = Date.now()) {
  const claims = decodeAccessTokenClaims(accessToken);
  if (!claims) return true;
  return claims.exp - REFRESH_MARGIN_SECONDS <= Math.floor(now / 1000);
}

/** The server explicitly rejected the refresh token (not "asleep" or "offline"). */
function isRefreshRejected(error: unknown) {
  const status = (error as { status?: number })?.status;
  return status !== undefined && status >= 400 && status < 500;
}

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (input: RegistrationInput) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Returns a session whose access token is valid, refreshing it first when it
   * has expired. Resolves to the current (possibly stale) session when the
   * server cannot be reached, and to null only when the learner is signed out.
   */
  ensureFreshSession: () => Promise<AuthSession | null>;
  authenticatedRequest: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession() {
  try {
    const value = await storageGet(SESSION_KEY);
    console.log('[Auth] stored session read', { hasValue: Boolean(value) });
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch (error) {
    console.log('[Auth] failed to read stored session', error);
    return null;
  }
}

async function writeSession(session: AuthSession | null) {
  try {
    if (session) {
      await storageSet(SESSION_KEY, JSON.stringify(session));
    } else {
      await storageDelete(SESSION_KEY);
    }
    console.log('[Auth] stored session written', { hasSession: Boolean(session) });
  } catch (error) {
    console.log('[Auth] failed to write stored session', error);
    // Storage can be unavailable (private web modes); the session remains in memory.
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /*
   * The latest session, readable from callbacks without re-creating them.
   * `authenticatedRequest` used to close over `session`, so a request started
   * by a screen rendered before a refresh would refresh *again* with the old,
   * already-rotated refresh token - which the server rejects, signing the
   * learner out.
   */
  const sessionRef = useRef<AuthSession | null>(null);
  /** One refresh at a time: every caller waiting on an expired token shares it. */
  const refreshInFlight = useRef<Promise<AuthSession | null> | null>(null);

  const applySession = useCallback(async (next: AuthSession | null) => {
    sessionRef.current = next;
    setSession(next);
    await writeSession(next);
  }, []);

  /*
   * The device stores (lesson progress, challenges, the offline queue) are
   * namespaced per learner, so their scope has to follow the session.
   *
   * This deliberately runs during render instead of in an effect: React renders
   * a parent before its children, so a screen always reads the store of the
   * learner it is showing. In an effect the child screens would run first and
   * could serve the previous account's completions. React only re-runs this
   * when the learner actually changes.
   */
  const scopeId = session?.user?.id ?? null;

  useMemo(() => {
    invalidateProgressCache();
    setLessonProgressScope(scopeId);
    setChallengeScope(scopeId);
    setPendingSyncScope(scopeId);
    setProfileCacheScope(scopeId);
  }, [scopeId]);

  useEffect(() => {
    console.log('[AuthProvider] loading stored session');
    readSession().then((storedSession) => {
      sessionRef.current = storedSession;
      setSession(storedSession);
      setIsLoading(false);
      console.log('[AuthProvider] session hydration complete', {
        hasSession: Boolean(storedSession),
      });
      // A remembered login counts as logged in: open the audio gate so
      // returning learners get music + SFX without tapping anything.
      if (storedSession) unlockAudio();
    });
  }, []);

  const signIn = async (credentials: AuthCredentials) => {
    console.log('[AuthProvider] signIn started');
    try {
      const nextSession = await authService.login(credentials);
      await applySession(nextSession);
      console.log('[AuthProvider] signIn complete');
      // Only here — after a SUCCESSFUL login — does any sound start.
      await unlockAudio();
    } catch (error) {
      console.log('[AuthProvider] signIn failed', error);
      throw error;
    }
  };

  const signUp = async (input: RegistrationInput) => {
    console.log('[AuthProvider] signUp started');
    try {
      const nextSession = await authService.register(input);
      await applySession(nextSession);
      console.log('[AuthProvider] signUp complete');
      // Same rule as sign-in: audio starts only on success.
      await unlockAudio();
    } catch (error) {
      console.log('[AuthProvider] signUp failed', error);
      throw error;
    }
  };

  const signOut = useCallback(async () => {
    console.log('[AuthProvider] signOut started');

    /*
     * Clearing the session re-runs the scope effect above with `null`, which
     * drops every cached device store so the next learner can never be served
     * the previous one's progress. The stored per-learner data itself is left
     * in place: signing back in restores that learner's own offline progress.
     */
    await applySession(null);
    // Back to silence: stop music, block all SFX until the next login.
    lockAudio();
    // No "keep your streak" nudges for an account that signed out.
    cancelDailyReminders().catch(() => {});
    console.log('[AuthProvider] signOut complete');
  }, [applySession]);

  /**
   * Exchange the refresh token for a new session. Concurrent callers share one
   * request: the server rotates refresh tokens (the old one is revoked on use),
   * so two parallel refreshes with the same token would make the second fail
   * and sign the learner out.
   *
   * Resolves to the new session, or to null when there is nothing to refresh.
   * Signs out only when the server REJECTS the refresh token; a sleeping or
   * unreachable server rethrows so the caller can keep working offline.
   */
  const refreshSession = useCallback((): Promise<AuthSession | null> => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const current = sessionRef.current;
    const refreshToken = current?.refreshToken;
    if (!current || !refreshToken) return Promise.resolve(null);

    const run = (async () => {
      try {
        console.log('[AuthProvider] refreshing access token');
        const next = await authService.refresh(refreshToken);
        // The learner may have signed out (or in as someone else) meanwhile.
        if (sessionRef.current?.refreshToken !== refreshToken) return sessionRef.current;
        // Keep a refresh token even if the server ever stops rotating it.
        const merged: AuthSession = { ...next, refreshToken: next.refreshToken ?? refreshToken };
        await applySession(merged);
        console.log('[AuthProvider] token refresh complete');
        return merged;
      } catch (error) {
        console.log('[AuthProvider] token refresh failed', error);
        if (isRefreshRejected(error) && sessionRef.current?.refreshToken === refreshToken) {
          await signOut();
        }
        throw error;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = run;
    return run;
  }, [applySession, signOut]);

  const ensureFreshSession = useCallback(async (): Promise<AuthSession | null> => {
    const current = sessionRef.current;
    if (!current) return null;
    if (!current.refreshToken || !accessTokenNeedsRefresh(current.accessToken)) return current;
    try {
      return (await refreshSession()) ?? sessionRef.current;
    } catch (error) {
      // Offline / server asleep: keep the stored session, requests retry later.
      return isRefreshRejected(error) ? null : sessionRef.current;
    }
  }, [refreshSession]);

  const sendAuthenticatedRequest = useCallback(async <T,>(path: string, options: RequestInit = {}) => {
    let current = sessionRef.current;
    if (!current) throw new ApiError('Authentication is required.', 401, 'UNAUTHORIZED');

    // Proactive refresh: after the app has been idle the access token (15 min)
    // has usually expired, so get a new one before sending instead of after a 401.
    if (current.refreshToken && accessTokenNeedsRefresh(current.accessToken)) {
      try {
        current = (await refreshSession()) ?? sessionRef.current;
      } catch (error) {
        if (isRefreshRejected(error)) throw error;
        // Server unreachable: send anyway so the caller's offline handling kicks in.
        current = sessionRef.current;
      }
      if (!current) throw new ApiError('Authentication is required.', 401, 'UNAUTHORIZED');
    }

    const sentToken = current.accessToken;
    try {
      return await apiRequest<T>(path, options, sentToken);
    } catch (error) {
      console.log('[AuthProvider] authenticated request failed', {
        path,
        status: error instanceof ApiError ? error.status : undefined,
        error,
      });
      if (!(error instanceof ApiError) || error.status !== 401) throw error;

      // Another request may already have refreshed while this one was in flight.
      const latest = sessionRef.current;
      if (latest && latest.accessToken !== sentToken) {
        return apiRequest<T>(path, options, latest.accessToken);
      }
      if (!latest?.refreshToken) throw error;

      const next = await refreshSession();
      if (!next) throw error;
      return apiRequest<T>(path, options, next.accessToken);
    }
  }, [refreshSession]);

  /*
   * `GET /progress` is shared across screens for a few seconds (see
   * services/progressRequestCache.ts); any write drops that copy so the next
   * read reflects it.
   */
  const authenticatedRequest = useCallback(async <T,>(path: string, options: RequestInit = {}) => {
    if (isProgressRead(path, options)) {
      return cachedProgressRequest<T>(sessionRef.current?.user?.id ?? null, () =>
        sendAuthenticatedRequest<T>(path, options)
      );
    }
    const method = (options.method ?? 'GET').toUpperCase();
    try {
      return await sendAuthenticatedRequest<T>(path, options);
    } finally {
      if (method !== 'GET') invalidateProgressCache();
    }
  }, [sendAuthenticatedRequest]);

  /*
   * Coming back to the app after a break: refresh right away, while the
   * learner looks at the first screen, instead of waiting for a request to fail.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && sessionRef.current) {
        ensureFreshSession().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [ensureFreshSession]);

  /*
   * Flushing the offline queue is owned by the sync engine (see
   * `store/sync-context.tsx`), which also triggers it on reconnect / foreground
   * and pulls the server state back down. AuthProvider only keeps the store
   * scoping in step with the session.
   */

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signUp, signOut, ensureFreshSession, authenticatedRequest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
