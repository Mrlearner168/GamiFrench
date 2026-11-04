/**
 * The offline profile.
 *
 * `profile.jsx` used to be the only summary screen with no offline story: it
 * asked the server for everything and showed an error screen when the device
 * could not reach it. These tests pin the two behaviours that fixed it:
 *
 *   1. the rebuilt payload uses the SAME rules the server uses, so the numbers
 *      a learner sees offline match the ones they see once they reconnect
 *      (stars per score, 10 XP per star, the XP level thresholds);
 *   2. a cached server payload always wins over a rebuilt one, because it is
 *      genuinely server truth rather than an estimate from device mirrors.
 */

jest.mock('@/store/local-store', () => ({
  readJson: jest.fn(),
  writeJson: jest.fn(),
}));

jest.mock('@/store/lesson-progress', () => ({
  loadLessonProgress: jest.fn(),
  loadPracticeScores: jest.fn(),
  loadClaimedMissions: jest.fn(),
}));

jest.mock('@/store/challenge-progress', () => ({
  loadChallengeState: jest.fn(),
  getChallengeVault: jest.fn((state) => state?.vault ?? { xp: 0, coins: 0 }),
}));

jest.mock('@/data/lessons/catalog', () => ({
  findSubLessonById: jest.fn(() => ({ module: { id: 'module-1' }, lesson: { id: 'l1' } })),
}));

import { missionCatalog } from '@/data/lessons/missionCatalog';
import { loadChallengeState } from '@/store/challenge-progress';
import {
  loadClaimedMissions,
  loadLessonProgress,
  loadPracticeScores,
} from '@/store/lesson-progress';
import { readJson, writeJson } from '@/store/local-store';
import {
  buildOfflineProfile,
  readProfileCache,
  saveProfileCache,
  setProfileCacheScope,
} from '@/store/profile-cache';

const SESSION_USER = {
  id: 'user-1',
  firstName: 'Amelie',
  lastName: 'Dubois',
  email: 'amelie@example.com',
  frenchLevel: 'intermediate',
  gender: 'female',
  onboardingComplete: true,
};

/** One finished sub-lesson at `score`, recorded as attempted at `updatedAt`. */
function withSubLesson({ score, updatedAt = '2026-09-20T10:00:00.000Z' }) {
  loadPracticeScores.mockResolvedValue({
    Canada: { 'l1-alphabet': { 'm1-l1-alphabet': { score, updatedAt } } },
  });
  loadLessonProgress.mockResolvedValue({
    Canada: { 'l1-alphabet': ['m1-l1-alphabet'] },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setProfileCacheScope(null);

  loadLessonProgress.mockResolvedValue({});
  loadPracticeScores.mockResolvedValue({});
  loadClaimedMissions.mockResolvedValue([]);
  loadChallengeState.mockResolvedValue({
    vault: { xp: 0, coins: 0 },
    history: { dailyStreak: 0, longestDailyStreak: 0 },
  });
  readJson.mockResolvedValue(null);
  writeJson.mockResolvedValue(undefined);
});

describe('profile cache scoping', () => {
  it('stores the payload under the signed-in learner', async () => {
    setProfileCacheScope('user-1');
    await saveProfileCache({ progress: { xp: 10 } });

    expect(writeJson).toHaveBeenCalledWith(
      'gamifrench.user-1.profile-cache',
      expect.objectContaining({ payload: { progress: { xp: 10 } } })
    );
  });

  it('keeps two learners apart on a shared device', async () => {
    setProfileCacheScope('user-1');
    await saveProfileCache({ progress: { xp: 10 } });

    setProfileCacheScope('user-2');
    await saveProfileCache({ progress: { xp: 99 } });

    expect(writeJson.mock.calls[0][0]).toBe('gamifrench.user-1.profile-cache');
    expect(writeJson.mock.calls[1][0]).toBe('gamifrench.user-2.profile-cache');
  });

  it('reads back nothing when this learner has never synced', async () => {
    readJson.mockResolvedValue(null);
    expect(await readProfileCache()).toBeNull();
  });

  it('ignores a corrupt cache entry instead of rendering garbage', async () => {
    readJson.mockResolvedValue({ savedAt: 'nope' });
    expect(await readProfileCache()).toBeNull();
  });
});

describe('the device-built profile matches the server rules', () => {
  it('rates stars with the shared 90/75/50 bands', async () => {
    withSubLesson({ score: 95 });

    const { content } = await buildOfflineProfile(SESSION_USER);

    // 95% is three stars, and the server pays 10 XP for each one.
    expect(content.starsEarned).toBe(3);
    expect(content.completed).toBe(1);
  });

  it('pays 10 XP per star for a finished sub-lesson', async () => {
    withSubLesson({ score: 95 });

    const { progress } = await buildOfflineProfile(SESSION_USER);

    expect(progress.xp).toBe(30);
  });

  it('ignores an attempt that was never completed', async () => {
    // A 40% attempt sits in the score mirror but not in lesson progress, which
    // is the store that records completion (>= 50%).
    loadPracticeScores.mockResolvedValue({
      Canada: { 'l1-alphabet': { 'm1-l1-alphabet': { score: 40 } } },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': [] } });

    const { content, progress } = await buildOfflineProfile(SESSION_USER);

    expect(content.completed).toBe(0);
    expect(content.starsEarned).toBe(0);
    expect(progress.xp).toBe(0);
  });

  it('derives the level band from XP using the server thresholds', async () => {
    withSubLesson({ score: 95 });

    const { progress } = await buildOfflineProfile(SESSION_USER);

    // 30 XP is inside the level 1 band (0 -> 100).
    expect(progress.level).toBe(1);
    expect(progress.levelStartXp).toBe(0);
    expect(progress.nextLevelXp).toBe(100);
    expect(progress.levelProgress).toBeCloseTo(0.3, 4);
    expect(progress.isMaxLevel).toBe(false);
  });

  it('adds claimed mission rewards on top of sub-lesson XP', async () => {
    withSubLesson({ score: 100 });
    const mission = missionCatalog[0];
    loadClaimedMissions.mockResolvedValue([mission.id]);

    const { progress } = await buildOfflineProfile(SESSION_USER);

    expect(progress.xp).toBe(30 + mission.rewards.xp);
  });

  it('counts a topic with finished sub-lessons as one lesson', async () => {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          'm1-l1-alphabet': { score: 90 },
          'm1-l1-numbers': { score: 80 },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({
      Canada: { 'l1-alphabet': ['m1-l1-alphabet', 'm1-l1-numbers'] },
    });

    const { progress, content } = await buildOfflineProfile(SESSION_USER);

    expect(content.completed).toBe(2);
    expect(progress.lessonsCompleted).toBe(1);
  });

  it('reports the three most recent sub-lessons as activity', async () => {
    const ids = ['m1-l1-a', 'm1-l1-b', 'm1-l1-c', 'm1-l1-d'];
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': Object.fromEntries(
          ids.map((id, index) => [
            id,
            { score: 80, updatedAt: `2026-09-2${index}T10:00:00.000Z` },
          ])
        ),
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ids } });

    const { recentActivity } = await buildOfflineProfile(SESSION_USER);

    // Capped like the API, newest first.
    expect(recentActivity).toHaveLength(3);
    expect(recentActivity[0].contentKey).toBe('m1-l1-d');
  });

  it('takes the learner identity from the signed-in session', async () => {
    const { user } = await buildOfflineProfile(SESSION_USER);

    expect(user.email).toBe('amelie@example.com');
    expect(user.displayName).toBe('Amelie Dubois');
    expect(user.gender).toBe('female');
  });

  it('keeps server-only fields from the previous payload', async () => {
    const { user, learning } = await buildOfflineProfile(SESSION_USER, {
      user: { memberSince: '2026-01-15T08:00:00Z' },
      learning: { learningGoal: 'travel', dailyTargetMinutes: 25 },
    });

    // The device cannot know when the account was created.
    expect(user.memberSince).toBe('2026-01-15T08:00:00Z');
    expect(learning.learningGoal).toBe('travel');
    expect(learning.dailyTargetMinutes).toBe(25);
  });

  it('produces a renderable payload for a brand-new learner with no data', async () => {
    const payload = await buildOfflineProfile(null);

    expect(payload.user.displayName).toBe('Traveler');
    expect(payload.progress.xp).toBe(0);
    expect(payload.content.completionRate).toBe(0);
    expect(payload.recentActivity).toEqual([]);
  });
});