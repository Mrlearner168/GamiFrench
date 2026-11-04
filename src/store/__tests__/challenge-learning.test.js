/*
 * Challenges reward learning French:
 *   - only passed lessons count, review counts at mastery (80%),
 *   - lifting a lesson from under 80% to 80%+ is a "weak spot" fix,
 *   - rewards are paid by the server, queued offline, and a refusal is shown.
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

const mockEnqueue = jest.fn(async () => {});
jest.mock('@/store/pending-sync', () => ({
  enqueueChallengeClaim: (...args) => mockEnqueue(...args),
}));

import { getWeakTopics } from '@/data/challenges/weakTopics';
import { ApiError } from '@/services/apiClient';
import {
  claimChallengeReward,
  computeMetrics,
  isRewardClaimed,
  loadChallengeState,
  setChallengeScope,
} from '@/store/challenge-progress';

const entry = (fields) => ({ id: 'x', topicId: 't', country: 'Canada', score: 60, ...fields });

describe('challenge metrics', () => {
  it('count only passed lessons, mastery reviews, fixes and new lessons', () => {
    const metrics = computeMetrics({
      subLessons: [
        entry({ id: 'a', score: 30 }), // failed: never counts
        entry({ id: 'b', score: 60, replay: true }), // review below mastery
        entry({ id: 'c', score: 85, replay: true, improved: true }),
        entry({ id: 'd', score: 70 }), // first pass
      ],
      missionClaims: [],
    });

    expect(metrics.subLessons).toBe(3);
    expect(metrics.replays).toBe(1);
    expect(metrics.improved).toBe(1);
    expect(metrics.newLessons).toBe(1);
  });
});

describe('weak topics', () => {
  it('lists tried-but-unmastered and placement-flagged topics, weakest first', () => {
    const scores = { 'm1-l1-alphabet': 60, 'm1-l2-vowels': 90, 'm1-l3-greetings': 95, 'm1-l4-how-are-you': 85 };
    const weak = getWeakTopics({
      unlockedModuleIds: ['module-1'],
      startupByModule: {
        'module-1': { topicMastery: { 'm1-topic-3': { score: 20, weakness: true } } },
      },
      bestScoreOf: (id) => scores[id] ?? null,
    });

    expect(weak.map((item) => item.topic.id)).toEqual(['m1-topic-3', 'm1-topic-1']);
    expect(weak[1].subLessonIndex).toBe(0); // the alphabet lesson at 60%
    // Greetings is mastered (95% and 85%) so it is not weak.
    expect(weak.find((item) => item.topic.id === 'm1-topic-2')).toBeUndefined();
  });
});

describe('collecting a challenge', () => {
  const item = { id: 'daily-weak-spot', rewards: { xp: 10, coins: 5 } };

  beforeEach(() => {
    mockMemory.clear();
    mockEnqueue.mockClear();
    setChallengeScope(`learner-${Math.random()}`);
  });

  it('is paid with the amounts the server returns', async () => {
    const send = jest.fn(async () => ({ claim: { xpAwarded: 10, coinsAwarded: 5 } }));

    const result = await claimChallengeReward(item, { scope: 'days', scopeKey: '2026-11-04', send });

    expect(send).toHaveBeenCalledWith('/challenges/claim', expect.objectContaining({ method: 'POST' }));
    expect(result).toMatchObject({ claimed: true, pending: false, rewards: { xp: 10, coins: 5 } });
    expect(isRewardClaimed(await loadChallengeState(), 'days', '2026-11-04', item.id)).toBe(true);
  });

  it('is queued when offline and still marked collected', async () => {
    const send = jest.fn(async () => {
      throw new ApiError('offline');
    });

    const result = await claimChallengeReward(item, { scope: 'days', scopeKey: '2026-11-04', send });

    expect(result).toMatchObject({ claimed: true, pending: true });
    expect(mockEnqueue).toHaveBeenCalledWith({ challengeId: item.id, periodKey: '2026-11-04' });
  });

  it('is not marked collected when the server refuses it', async () => {
    const send = jest.fn(async () => {
      throw new ApiError('Finish a lesson first', 409, 'NO_LEARNING_ACTIVITY');
    });

    const result = await claimChallengeReward(item, { scope: 'days', scopeKey: '2026-11-04', send });

    expect(result).toMatchObject({ claimed: false, code: 'NO_LEARNING_ACTIVITY' });
    expect(isRewardClaimed(await loadChallengeState(), 'days', '2026-11-04', item.id)).toBe(false);
  });
});
