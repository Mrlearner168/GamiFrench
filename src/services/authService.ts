import { ApiError, apiRequest } from '@/services/apiClient';
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

async function authRequest<T>(path: string, options: RequestInit) {
  try {
    return await apiRequest<T>(path, options);
  } catch (error) {
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
