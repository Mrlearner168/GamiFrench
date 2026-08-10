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
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
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
  } catch {
    // Secure storage can be unavailable in web preview; the session remains in memory.
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    readSession().then((storedSession) => {
      setSession(storedSession);
      setIsLoading(false);
    });
  }, []);

  const signIn = async (credentials: AuthCredentials) => {
    const nextSession = await authService.login(credentials);
    await writeSession(nextSession);
    setSession(nextSession);
  };

  const signUp = async (input: RegistrationInput) => {
    const nextSession = await authService.register(input);
    await writeSession(nextSession);
    setSession(nextSession);
  };

  const signOut = async () => {
    await writeSession(null);
    setSession(null);
  };

  const authenticatedRequest = async <T,>(path: string, options: RequestInit = {}) => {
    if (!session) throw new ApiError('Authentication is required.', 401, 'UNAUTHORIZED');
    try {
      return await apiRequest<T>(path, options, session.accessToken);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401 || !session.refreshToken) throw error;
      try {
        const nextSession = await authService.refresh(session.refreshToken);
        await writeSession(nextSession);
        setSession(nextSession);
        return await apiRequest<T>(path, options, nextSession.accessToken);
      } catch (refreshError) {
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
