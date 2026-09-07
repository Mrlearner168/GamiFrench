import * as SecureStore from 'expo-secure-store';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { ApiError, apiRequest } from '@/services/apiClient';
import { authService } from '@/services/authService';
import type { AuthCredentials, AuthSession, RegistrationInput } from '@/types/auth';

const SESSION_KEY = 'gamifrench.session';

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (input: RegistrationInput) => Promise<void>;
  signOut: () => Promise<void>;
  authenticatedRequest: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession() {
  try {
    const value = await SecureStore.getItemAsync(SESSION_KEY);
    console.log('[Auth] stored session read', { hasValue: Boolean(value) });
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch (error) {
    console.error('[Auth] failed to read stored session', error);
    return null;
  }
}

async function writeSession(session: AuthSession | null) {
  try {
    if (session) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
    console.log('[Auth] stored session written', { hasSession: Boolean(session) });
  } catch (error) {
    console.error('[Auth] failed to write stored session', error);
    // Secure storage can be unavailable in web preview; the session remains in memory.
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthProvider] loading stored session');
    readSession().then((storedSession) => {
      setSession(storedSession);
      setIsLoading(false);
      console.log('[AuthProvider] session hydration complete', {
        hasSession: Boolean(storedSession),
      });
    });
  }, []);

  const signIn = async (credentials: AuthCredentials) => {
    console.log('[AuthProvider] signIn started');
    try {
      const nextSession = await authService.login(credentials);
      await writeSession(nextSession);
      setSession(nextSession);
      console.log('[AuthProvider] signIn complete');
    } catch (error) {
      console.error('[AuthProvider] signIn failed', error);
      throw error;
    }
  };

  const signUp = async (input: RegistrationInput) => {
    console.log('[AuthProvider] signUp started');
    try {
      const nextSession = await authService.register(input);
      await writeSession(nextSession);
      setSession(nextSession);
      console.log('[AuthProvider] signUp complete');
    } catch (error) {
      console.error('[AuthProvider] signUp failed', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[AuthProvider] signOut started');
    await writeSession(null);
    setSession(null);
    console.log('[AuthProvider] signOut complete');
  };

  const authenticatedRequest = async <T,>(path: string, options: RequestInit = {}) => {
    if (!session) throw new ApiError('Authentication is required.', 401, 'UNAUTHORIZED');
    try {
      return await apiRequest<T>(path, options, session.accessToken);
    } catch (error) {
      console.error('[AuthProvider] authenticated request failed', {
        path,
        status: error instanceof ApiError ? error.status : undefined,
        error,
      });
      if (!(error instanceof ApiError) || error.status !== 401 || !session.refreshToken) throw error;
      try {
        const nextSession = await authService.refresh(session.refreshToken);
        await writeSession(nextSession);
        setSession(nextSession);
        return await apiRequest<T>(path, options, nextSession.accessToken);
      } catch (refreshError) {
        console.error('[AuthProvider] token refresh failed', refreshError);
        await signOut();
        throw refreshError;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signUp, signOut, authenticatedRequest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
