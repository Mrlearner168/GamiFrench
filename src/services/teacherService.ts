import { apiRequest } from '@/services/apiClient';


/**
 * Teacher-lifecycle operations that reach beyond ``authService``.
 *
 * ``apiRequest`` already wraps the network call with the project-wide
 * cold-start and authentication handling, so this module just describes the
 * shape of each call.
 */

export type ApiRequestOptions = {
  signal?: AbortSignal;
  /** Skip the cold-start retry path entirely for callers that have
   * already decided to surface the error verbatim. Defaults to false. */
  skipColdStartRetry?: boolean;
};

export const teacherService = {
  /**
   * Replace the signed-in teacher's shareable code with a fresh one.
   *
   * The backend writes the new code, inserts a ``teacher.code_regenerated``
   * audit row in the same transaction, and returns the new value so the
   * learner-app can update ``session.user.teacherCode`` without forcing a
   * sign-out.
   *
   * Throws ``AuthServiceError`` if the caller is not signed in as a teacher
   * or if the server turn up before the request completed.
   */
  async regenerateMyCode(): Promise<string> {
    const data = await apiRequest<{ teacherCode: string }>(
      '/teachers/me/code',
      { method: 'POST' },
    );
    if (typeof data?.teacherCode !== 'string' || data.teacherCode.length === 0) {
      throw new Error('Server returned an empty teacher code.');
    }
    return data.teacherCode;
  },
};
