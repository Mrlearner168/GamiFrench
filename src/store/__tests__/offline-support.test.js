/*
 * Offline support:
 *   - quizzes are saved on the device (without personal data) and prefetched;
 *   - with no connection the app fails fast instead of "waking" the server;
 *   - results graded after a sync come back to the device.
 */
const mockMemory = new Map();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => (mockMemory.has(key) ? mockMemory.get(key) : null)),
  setItemAsync: jest.fn(async (key, value) => {
    mockMemory.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key) => {
    mockMemory.delete(key);
  }),
}));

let mockOnline = true;
jest.mock('@/services/connectivity', () => ({
  isOnlineSync: () => mockOnline,
  subscribeToReconnect: () => () => {},
}));

import { ApiError, apiRequest } from '@/services/apiClient';
import { resetServerWarmupForTests, wakeServer } from '@/services/serverWarmup';
import {
  allAssessmentKeys,
  prefetchAssessments,
  readCachedAssessment,
  saveCachedAssessment,
} from '@/store/assessment-cache';
import { applyServerAssessments } from '@/store/assessment-sync';
import { loadModuleQuizResults } from '@/store/lesson-progress';
import { getStartupAssessment, saveStartupAssessment } from '@/store/profile-cache';

const quiz = { id: 'module-1', questions: [{ id: 'q1', question: 'Bonjour ?' }], hearts: { hearts: 3 } };

beforeEach(() => {
  mockMemory.clear();
  mockOnline = true;
  resetServerWarmupForTests();
  global.fetch = jest.fn();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('offline quizzes', () => {
  it('keeps the questions but drops the per-learner hearts', async () => {
    await saveCachedAssessment('module-1', quiz);

    const cached = await readCachedAssessment('module-1');
    expect(cached.questions).toEqual(quiz.questions);
    expect(cached.hearts).toBeUndefined();
    expect(await readCachedAssessment('module-2')).toBeNull();
  });

  it('prefetches every placement check and final once a day', async () => {
    const send = jest.fn(async () => quiz);

    expect(await prefetchAssessments(send)).toBe(20);
    expect(send).toHaveBeenCalledTimes(allAssessmentKeys().length);
    expect(await prefetchAssessments(send)).toBe(0); // fresh copies: no refetch
  });

  it('stops prefetching as soon as the connection is gone', async () => {
    const send = jest.fn(async () => {
      throw new ApiError('offline');
    });

    expect(await prefetchAssessments(send)).toBe(0);
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe('no connection', () => {
  it('does not try to wake the server', async () => {
    mockOnline = false;

    await expect(wakeServer()).resolves.toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fails a read at once so the screen can use its offline copy', async () => {
    mockOnline = false;
    global.fetch.mockRejectedValue(new TypeError('Network request failed'));

    await expect(apiRequest('/progress')).rejects.toMatchObject({ status: undefined });
    expect(global.fetch).toHaveBeenCalledTimes(1); // no /health wake-up loop
  });
});

describe('results graded after a sync', () => {
  it('unlock the stop and replace a provisional placement result', async () => {
    await saveStartupAssessment({
      moduleKey: 'module-1', takenAt: '2026-11-04T10:00:00Z', percentage: 0, topicMastery: {}, pending: true,
    });

    await applyServerAssessments({ 'module-1': 85, 'placement-module-1': 40 });

    expect((await loadModuleQuizResults())['module-1'].percentage).toBe(85);
    const placement = await getStartupAssessment('module-1');
    expect(placement.pending).toBeUndefined();
    expect(placement.percentage).toBe(40);
    expect(placement.takenAt).toBe('2026-11-04T10:00:00Z');
    expect(Object.values(placement.topicMastery).every((topic) => topic.weakness)).toBe(true);
  });

  it('never overwrites a placement result graded on this device', async () => {
    const graded = {
      moduleKey: 'module-2', takenAt: 'x', percentage: 90,
      topicMastery: { 'm2-topic-1': { score: 90, weakness: false, stars: 3 } },
    };
    await saveStartupAssessment(graded);

    await applyServerAssessments({ 'placement-module-2': 90 });

    expect(await getStartupAssessment('module-2')).toEqual(graded);
  });
});
