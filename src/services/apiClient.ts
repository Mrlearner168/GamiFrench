import { Platform } from 'react-native';

const getDefaultApiUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }

  return 'http://localhost:5000/api/v1';
};

const configuredApiUrl = (
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.API_URL ??
  getDefaultApiUrl()
)?.trim();

export const URL = (configuredApiUrl || getDefaultApiUrl()).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      body.error?.message ?? body.message ?? 'The server could not complete that request.',
      response.status,
      body.error?.code,
    );
  }
  return (body.data ?? body) as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(`${URL}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
    return await parseResponse<T>(response);
  } catch (error) {
    console.error('[ApiClient] request failed', {
      url: `${URL}${path}`,
      method: options.method ?? 'GET',
      status: error instanceof ApiError ? error.status : undefined,
      error,
    });
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('The request timed out. Check your connection and try again.');
    }
    throw new ApiError(`Cannot reach the GamiFrench server at ${URL}. Start Flask and verify URL.`);
  } finally {
    clearTimeout(timeout);
  }
}
