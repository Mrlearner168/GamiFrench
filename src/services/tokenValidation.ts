/**
 * Fast, injection-safe session validation for the gated screens.
 *
 * The app already gates navigation on `session` being present, but a stored
 * session is only a claim: the access token can be expired, truncated, or
 * hand-edited inside the device keychain. This module validates it in two
 * stages so a gated screen (see `app/(game)/welcome.jsx`) can reject an
 * unauthorized visitor before any learner data is rendered.
 *
 * Stage 1 - `validateSessionLocally()`: synchronous, offline, sub-millisecond.
 *   Structural check of the compact JWT (three base64url segments, no stray
 *   characters), a dependency-free base64url decode of the payload, then the
 *   claim checks the backend also enforces: `type === 'access'`, a non-empty
 *   `sub`, and an `exp` still in the future. It never touches the network, so
 *   it can gate the first render of a screen without delaying the UI. It is a
 *   pre-filter only - the signature cannot be verified on the device, which is
 *   exactly what stage 2 is for.
 *
 * Stage 2 - `confirmSessionWithServer()`: one `GET /auth/me` through the
 *   existing `authenticatedRequest`, i.e. through the shared refresh-on-401
 *   path in `store/auth-context.tsx`. The route is guarded by `require_auth`,
 *   which verifies the HS256 signature server-side and loads the user with
 *   SQLAlchemy `db.session.get(User, sub)` - a bound parameter, never string
 *   interpolation.
 *
 * SQL-injection notes (this is why the module is shaped this way):
 *   - The request path is the compile-time constant `/auth/me`. No user input is
 *     ever concatenated into a URL, query string, or request body.
 *   - The token travels only as an opaque `Authorization: Bearer` header value,
 *     never as a path/parameter, so it can never reach a query builder.
 *   - Stage 1 rejects any token that is not pure base64url before it can be
 *     forwarded. Quotes, whitespace, CR/LF (header splitting), `;`, `--` and
 *     `/*` are therefore impossible to smuggle into a later request, and the
 *     header value cannot be terminated early.
 */
import { ApiError, isOfflineError } from './apiClient';
import type { AuthSession, UserProfile } from '@/types/auth';

/** The only endpoint used for validation: a constant, with no interpolated data. */
export const SESSION_PROBE_PATH = '/auth/me';

/**
 * A compact JWS: three base64url segments. The signature segment may be empty
 * (alg=none), which is why it is `*` rather than `+` - judging the algorithm is
 * the server's job, not the client's.
 */
export const ACCESS_TOKEN_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

/** Upper bound on a token we are willing to parse; guards against a DoS payload. */
const MAX_TOKEN_LENGTH = 4096;

const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Clock skew tolerated on `exp`, in seconds. */
export const DEFAULT_LEEWAY_SECONDS = 5;

export type LocalTokenFailure =
  | 'missing-token'
  | 'malformed-token'
  | 'oversized-token'
  | 'not-an-access-token'
  | 'missing-subject'
  | 'expired';

export type LocalTokenCheck =
  | { valid: true; subject: string; expiresAt: number }
  | { valid: false; reason: LocalTokenFailure; detail?: string };

export type AccessTokenClaims = {
  sub: string;
  type: string;
  exp: number;
  role?: string;
};

/**
 * Outcome of the authoritative check.
 *
 * `offline` is deliberately a soft failure: this app is offline-first (see
 * `isOfflineError` in apiClient and the local stores in `store/`), so a device
 * that cannot reach the server keeps the locally validated session instead of
 * being kicked out of its own journey.
 */
export type ServerTokenCheck =
  | { ok: true; user: UserProfile | null; identityMatches: boolean }
  | { ok: false; reason: 'offline' }
  | { ok: false; reason: 'unauthorized'; status?: number; message?: string }
  | { ok: false; reason: 'identity-mismatch'; status?: number; message?: string }
  | { ok: false; reason: 'server-error'; status?: number; message?: string };

/** True when a token is safe to put in an `Authorization` header at all. */
export function isWellFormedToken(token: unknown): token is string {
  return (
    typeof token === 'string' &&
    token.length > 0 &&
    token.length <= MAX_TOKEN_LENGTH &&
    ACCESS_TOKEN_SHAPE.test(token)
  );
}

function base64UrlValue(char: string): number {
  return BASE64URL_ALPHABET.indexOf(char);
}

/** UTF-8 decode of raw bytes, without depending on Buffer/atob/TextDecoder. */
function decodeUtf8(bytes: number[]): string {
  let out = '';
  let i = 0;

  while (i < bytes.length) {
    const byte = bytes[i];
    let codePoint: number;
    let continuationBytes: number;

    if (byte < 0x80) {
      codePoint = byte;
      continuationBytes = 0;
    } else if ((byte & 0xe0) === 0xc0) {
      codePoint = byte & 0x1f;
      continuationBytes = 1;
    } else if ((byte & 0xf0) === 0xe0) {
      codePoint = byte & 0x0f;
      continuationBytes = 2;
    } else if ((byte & 0xf8) === 0xf0) {
      codePoint = byte & 0x07;
      continuationBytes = 3;
    } else {
      return '';
    }

    i += 1;
    if (i + continuationBytes > bytes.length) return '';

    for (let j = 0; j < continuationBytes; j += 1) {
      const next = bytes[i + j];
      if ((next & 0xc0) !== 0x80) return '';
      codePoint = (codePoint << 6) | (next & 0x3f);
    }

    i += continuationBytes;
    out += String.fromCodePoint(codePoint);
  }

  return out;
}

/** base64url -> string. Returns null for any malformed input (never throws). */
function decodeBase64Url(segment: string): string | null {
  const clean = segment.replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of clean) {
    const value = base64UrlValue(char);
    if (value === -1) return null;

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
      // Keep the accumulator inside `bits` so it never overflows into a sign bit.
      buffer &= (1 << bits) - 1;
    }
  }

  return decodeUtf8(bytes);
}

/** Parse the claim set of a compact JWS. Returns null when it is not readable. */
export function decodeAccessTokenClaims(token: unknown): AccessTokenClaims | null {
  if (!isWellFormedToken(token)) return null;

  const payloadSegment = token.split('.')[1];
  if (!payloadSegment) return null;

  const json = decodeBase64Url(payloadSegment);
  if (!json) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    console.log('[TokenValidation] access token payload is not JSON', error);
    return null;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  const claims = parsed as Record<string, unknown>;
  if (typeof claims.sub !== 'string' || claims.sub.length === 0) return null;
  if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) return null;

  return {
    sub: claims.sub,
    type: typeof claims.type === 'string' ? claims.type : '',
    exp: claims.exp,
    role: typeof claims.role === 'string' ? claims.role : undefined,
  };
}

/**
 * Stage 1. Synchronous and offline: decide whether the stored access token is
 * even worth sending to the server.
 */
export function validateAccessToken(
  token: unknown,
  options: { now?: number; leewaySeconds?: number } = {},
): LocalTokenCheck {
  if (typeof token !== 'string' || token.trim().length === 0) {
    return { valid: false, reason: 'missing-token' };
  }
  if (token.length > MAX_TOKEN_LENGTH) {
    return { valid: false, reason: 'oversized-token' };
  }
  if (!ACCESS_TOKEN_SHAPE.test(token)) {
    return { valid: false, reason: 'malformed-token' };
  }

  const claims = decodeAccessTokenClaims(token);
  if (!claims) {
    return { valid: false, reason: 'malformed-token', detail: 'unreadable claim set' };
  }
  if (claims.type !== 'access') {
    return { valid: false, reason: 'not-an-access-token' };
  }

  const nowSeconds = Math.floor((options.now ?? Date.now()) / 1000);
  const leeway = options.leewaySeconds ?? DEFAULT_LEEWAY_SECONDS;

  if (claims.exp + leeway <= nowSeconds) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, subject: claims.sub, expiresAt: claims.exp };
}

/**
 * Stage 1 applied to a stored session: the token must be well formed *and* the
 * cached profile must belong to the same learner, so a half-written or spliced
 * keychain entry cannot pass.
 */
export function validateSessionLocally(
  session: AuthSession | null | undefined,
  options: { now?: number; leewaySeconds?: number } = {},
): LocalTokenCheck {
  if (!session) return { valid: false, reason: 'missing-token' };

  const check = validateAccessToken(session.accessToken, options);
  if (!check.valid) return check;

  const userId = session.user?.id;
  if (typeof userId !== 'string' || userId.length === 0) {
    return { valid: false, reason: 'missing-subject', detail: 'session has no user id' };
  }
  if (userId !== check.subject) {
    // The token and the cached profile describe different learners.
    return { valid: false, reason: 'missing-subject', detail: 'session identity mismatch' };
  }

  return check;
}

/**
 * Stage 2. One authenticated round-trip against the constant path `/auth/me`.
 * `authenticatedRequest` already retries once through the refresh token on a
 * 401 and signs the user out when that fails, so a revoked or forged token can
 * never reach the screen as "valid".
 */
export async function confirmSessionWithServer(
  authenticatedRequest: <T>(path: string, options?: RequestInit) => Promise<T>,
  session: AuthSession | null | undefined,
): Promise<ServerTokenCheck> {
  try {
    const user = await authenticatedRequest<UserProfile>(SESSION_PROBE_PATH);

    const serverId = user?.id;
    const localId = session?.user?.id;
    if (
      typeof serverId === 'string' &&
      serverId.length > 0 &&
      typeof localId === 'string' &&
      localId !== serverId
    ) {
      // console.warn('[TokenValidation] server identity does not match the stored session');
      console.warn('This session belongs to a different account. Please sign in again.');
      return {
        ok: false,
        reason: 'identity-mismatch',
        message: 'This session belongs to a different account.',
      };
    }

    return { ok: true, user: user ?? null, identityMatches: true };
  } catch (error) {
    if (isOfflineError(error)) {
      console.log('[TokenValidation] server unreachable; keeping the local session');
      return { ok: false, reason: 'offline' };
    }

    if (error instanceof ApiError) {
      // console.warn('[TokenValidation] session rejected by the server', {
      //   status: error.status,
      //   code: error.code,
      // });
      console.warn('We could not confirm your session. Please sign in again.');
      if (error.status === 401 || error.status === 403) {
        return { ok: false, reason: 'unauthorized', status: error.status, message: error.message };
      }
      return { ok: false, reason: 'server-error', status: error.status, message: error.message };
    }

    // console.warn('[TokenValidation] unexpected failure while confirming the session', error);
    console.warn('Something went wrong while checking your session. Please try again.');
    return { ok: false, reason: 'server-error' };
  }
}

/** True when the token may be forwarded to the API as a Bearer credential. */
export function canForwardToken(token: unknown): boolean {
  return isWellFormedToken(token);
}
