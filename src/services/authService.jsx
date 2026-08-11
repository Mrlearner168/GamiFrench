import { ApiError, apiRequest } from '@/services/apiClient';

export class AuthServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AuthServiceError';
    this.status = status;
  }
}

async function authRequest(path, options) {
  try {
    return await apiRequest(path, options);
  } catch (error) {
    if (error instanceof AuthServiceError) throw error;
    if (error instanceof ApiError) throw new AuthServiceError(error.message, error.status);
    throw new AuthServiceError('Check your connection and try again.');
  }
}

export const authService = {
  login(credentials) {
    return authRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register(input) {
    return authRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  refresh(refreshToken) {
    return authRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
