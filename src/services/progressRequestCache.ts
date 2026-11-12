/**
 * Short-lived, shared cache for `GET /progress`.
 *
 * Home, Journey, Challenge, Mission, Achievements, the lesson-progress hook and
 * the sync pull all ask for `/progress` when they gain focus, so moving between
 * screens used to cost one full round-trip (and one merge) per screen — and
 * several at once while the Render server was waking up.
 *
 *   - Concurrent callers share one in-flight request.
 *   - A successful answer is reused for `PROGRESS_CACHE_TTL_MS`.
 *   - Any write (non-GET request) or a change of learner drops the cache, so
 *     a screen never shows progress older than the learner's last action.
 *   - Failures are never cached: the next caller retries.
 */

export const PROGRESS_CACHE_TTL_MS = 30_000;

type Entry = {
  scope: string | null;
  value?: unknown;
  storedAt?: number;
  inFlight?: Promise<unknown>;
};

let entry: Entry | null = null;
/** Bumped on every invalidation so a request started before it is not cached. */
let generation = 0;

export function isProgressRead(path: string, options: RequestInit = {}): boolean {
  const method = (options.method ?? 'GET').toUpperCase();
  return method === 'GET' && path.split('?')[0] === '/progress';
}

export function invalidateProgressCache(): void {
  entry = null;
  generation += 1;
}

export function cachedProgressRequest<T>(
  scope: string | null,
  load: () => Promise<T>,
  now: () => number = Date.now
): Promise<T> {
  if (entry && entry.scope === scope) {
    if (entry.inFlight) return entry.inFlight as Promise<T>;
    if (entry.storedAt !== undefined && now() - entry.storedAt < PROGRESS_CACHE_TTL_MS) {
      return Promise.resolve(entry.value as T);
    }
  }

  const startedAt = generation;
  const current: Entry = { scope };
  const request = load().then(
    (value) => {
      if (entry === current && generation === startedAt) {
        current.value = value;
        current.storedAt = now();
        current.inFlight = undefined;
      }
      return value;
    },
    (error) => {
      if (entry === current) entry = null;
      throw error;
    }
  );

  current.inFlight = request;
  entry = current;
  return request;
}
