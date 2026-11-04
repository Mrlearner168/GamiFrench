import { ApiError, apiRequest, isColdStartError } from '@/services/apiClient';
import { isDeviceOffline, wakeServer } from '@/services/serverWarmup';
import type { AuthCredentials, AuthSession, RegistrationInput } from '@/types/auth';

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

export const SERVER_ASLEEP_MESSAGE =
  'The server is still waking up. Please wait a moment and try again.';
export const OFFLINE_SIGN_IN_MESSAGE =
  "You're offline. Connect to the internet to sign in — once signed in, lessons keep working offline.";

const wakeFailureMessage = () => (isDeviceOffline() ? OFFLINE_SIGN_IN_MESSAGE : SERVER_ASLEEP_MESSAGE);

/*
 * Sign-in, sign-up and refresh wait for the server to be awake first (see
 * serverWarmup), so a sleeping Render instance means a longer spinner instead
 * of a failed login. If the post still hits a cold server, it is retried once
 * after another wake-up: none of these calls changes anything on a failure.
 */
async function authRequest<T>(path: string, options: RequestInit) {
  try {
    if (!(await wakeServer())) throw new AuthServiceError(wakeFailureMessage());
    try {
      return await apiRequest<T>(path, options);
    } catch (error) {
      if (!isColdStartError(error)) throw error;
      if (!(await wakeServer({ force: true }))) throw new AuthServiceError(wakeFailureMessage());
      return await apiRequest<T>(path, options);
    }
  } catch (error) {
    console.log('[AuthService] request failed', {
      path,
      status: error instanceof ApiError ? error.status : undefined,
      error,
    });
    if (error instanceof AuthServiceError) throw error;
    if (error instanceof ApiError) throw new AuthServiceError(error.message, error.status);
    throw new AuthServiceError('Check your connection and try again.');
  }
}

export const authService = {
  login(credentials: AuthCredentials) {
    return authRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register(input: RegistrationInput) {
    return authRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  refresh(refreshToken: string) {
    return authRequest<AuthSession>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
