// Base URL is resolved from EXPO_PUBLIC_API_URL, otherwise production Render.
// serverWarmup imports URL from here; the cycle is safe because each module
// only uses the other inside functions, never while loading.
import { isDeviceOffline, markServerAwake, wakeServer } from '@/services/serverWarmup';

const PRODUCTION_API_URL = 'https://gami-backend-6pc9.onrender.com/api/v1';

const getDefaultApiUrl = (): string => {
  // Production backend on Render. Never fall back to localhost in a
  // production bundle: on a physical phone localhost is the phone itself.
  return PRODUCTION_API_URL;
};

function readEnvUrl(): string | undefined {
  try {
    const fromExpo = (process as any)?.env?.EXPO_PUBLIC_API_URL;
    if (typeof fromExpo === 'string' && fromExpo.trim()) return fromExpo.trim();
    const fromGeneric = (process as any)?.env?.API_URL;
    if (typeof fromGeneric === 'string' && fromGeneric.trim()) return fromGeneric.trim();
  } catch {
    // process is undefined in some runtimes — fall through to production URL.
  }
  return undefined;
}

function normalizeApiUrl(raw: string): string {
  let url = (raw || '').trim().replace(/\/+$/, '');
  // Allow EXPO_PUBLIC_API_URL to be set to just the host
  // (https://gami-backend-6pc9.onrender.com) — append /api/v1 automatically.
  if (!/\/api\/v1$/.test(url)) {
    if (/\/api$/.test(url)) {
      url = `${url}/v1`;
    } else {
      url = `${url}/api/v1`;
    }
  }
  return url;
}

const configuredApiUrl = readEnvUrl() ?? getDefaultApiUrl();

export const URL = normalizeApiUrl(configuredApiUrl || getDefaultApiUrl());

// Log target server on startup
console.log(`[ApiClient] Base API URL set to: ${URL}`);

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/*
 * True only when the request never reached the server: the connection failed or
 * the 15s timeout fired, so no HTTP status was received.
 *
 * A 4xx/5xx is a real answer from the backend and must NOT be treated as
 * "offline". Screens fall back to the data stored on this device when they are
 * offline, and that fallback is what used to make a brand-new account look like
 * it had already finished sub-lessons whenever the server answered 500.
 */
/**
 * Turns a backend failure into a message a learner can act on. Server-side
 * failures (5xx) never show raw server text; 4xx answers keep the backend's
 * message because those are written for the user (e.g. "Email already taken").
 *
 * 502/503/504 from Render while the service boots *also* keep the generic
 * "waking up" copy — except when the backend actually answered with one of
 * the known explicit codes, in which case we surface the backend's text
 * verbatim. Without this carve-out, a real ``MIGRATIONS_REQUIRED`` 503 from
 * the Flask app surfaces as "the server is waking up", which is wrong and
 * makes the missing migrations invisible to anyone debugging the deploy.
 */
const HONEST_BACKEND_CODES: ReadonlySet<string> = new Set([
  'MIGRATIONS_REQUIRED',
  'DATABASE_UNAVAILABLE',
]);

export function friendlyErrorMessage(
  status?: number,
  serverMessage?: string,
  errorCode?: string,
): string {
  if (status === undefined) {
    return 'Cannot reach the GamiFrench server. Check your internet connection and try again.';
  }
  if (errorCode && HONEST_BACKEND_CODES.has(errorCode)) {
    return serverMessage || 'The server reported an error. Please contact support if this keeps happening.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'The server is waking up. Please wait a few seconds and try again.';
  }
  if (status >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }
  if (status === 401) return serverMessage || 'Your session has ended. Please sign in again.';
  if (status === 403) return serverMessage || 'You do not have access to this. Try signing in again.';
  if (status === 404) return serverMessage || 'We could not find what you were looking for. Try refreshing.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  return serverMessage || 'That request could not be completed. Please check your input and try again.';
}

export function isOfflineError(error: unknown): boolean {
  return error instanceof ApiError && error.status === undefined;
}

/** Render answers these while the service is still booting after a sleep. */
const WAKING_STATUSES = new Set([502, 503, 504]);

/** True for a failure that looks like the server is asleep / starting up. */
export function isColdStartError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === undefined || WAKING_STATUSES.has(error.status))
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    // console.warn('[ApiClient] Backend returned error status', {
    //   status: response.status,
    //   code: body.error?.code,
    //   message: body.error?.message ?? body.message,
    // });
    const friendly = friendlyErrorMessage(
      response.status,
      body.error?.message ?? body.message,
      body.error?.code,
    );
    console.warn(friendly);
    throw new ApiError(
      // body.error?.message ?? body.message ?? 'The server could not complete that request.',
      friendly,
      response.status,
      body.error?.code,
      body.error?.details,
    );
  }
  return (body.data ?? body) as T;
}

/**
 * Send a request. When the server turns out to be asleep (no answer, or a
 * 502/503/504 from Render while it boots), wait for it to wake up and retry
 * once. Only reads (GET) are retried automatically: a write may already have
 * been applied, and the screens that write have their own retry/sync queue.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  try {
    return await sendRequest<T>(path, options, accessToken);
  } catch (error) {
    const method = (options.method ?? 'GET').toUpperCase();
    // Offline: fail fast so the screen can use its offline copy right away.
    if (method !== 'GET' || !isColdStartError(error) || isDeviceOffline()) throw error;
    console.log(`[ApiClient] 💤 server looks asleep, waking it before retrying ${path}`);
    if (!(await wakeServer({ force: true }))) throw error;
    return sendRequest<T>(path, options, accessToken);
  }
}

async function sendRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const method = options.method ?? 'GET';
  const fullUrl = `${URL}${path}`;
  const startTime = Date.now();

  console.log(`[ApiClient] 🚀 OUTGOING ${method} ${path}`, {
    fullUrl,
    hasAuthToken: Boolean(accessToken),
  });

  const controller = new AbortController();
  // Render free tier sleeps when idle — first request can take 20-50s
  // while the service wakes up. Keep timeout generous so login doesn't
  // fail with a false "offline" right after a cold start.
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });

    const duration = Date.now() - startTime;
    console.log(`[ApiClient] ✅ INCOMING ${response.status} ${method} ${path} (${duration}ms)`);
    if (!WAKING_STATUSES.has(response.status)) {
      markServerAwake();
    }

    return await parseResponse<T>(response);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`[ApiClient] ❌ FAILED ${method} ${path} (${duration}ms)`, {
      url: fullUrl,
      status: error instanceof ApiError ? error.status : undefined,
      error,
    });

    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      // console.warn(`[ApiClient] ⏱️ TIMEOUT (30s limit reached) ${method} ${path}`);
      console.warn('The server is taking longer than usual. Please try again.');
      throw new ApiError('The server took too long to answer. Please try again.');
    }
    throw new ApiError('Cannot reach the GamiFrench server. Check your internet connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
}