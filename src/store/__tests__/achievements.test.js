/**
 * The motivational summary.
 *
 * The Achievements screen used to render four number tiles and an EMPTY badge
 * list, because `GET /achievements` answers with `'badges': [], 'nextGoal': None`.
 * The summary is now built on the client from the device mirrors, which also
 * makes it work offline.
 *
 * These tests pin the two things that make that a fair upgrade rather than just
 * prettier numbers:
 *
 *   1. HONESTY - a figure is only reported when the learner actually did the
 *      thing. Nothing invents a mastery score or claims a streak that the local
 *      history does not record.
 *   2. NEAR-MISS MOTIVATION - the "closest to unlocking" goal is genuinely the
 *      closest one, and a reachable goal always outranks a hopeless one.
 */

jest.mock('@/store/challenge-progress', () => ({
  loadChallengeState: jest.fn(),
  computeMetrics: jest.fn(),
  resolveChallengeProgress: jest.fn(),
}));

jest.mock('@/store/lesson-progress', () => ({
  loadLessonProgress: jest.fn(),
  loadPracticeScores: jest.fn(),
  loadSpeakingScores: jest.fn(),
  loadClaimedMissions: jest.fn(),
  loadModuleQuizResults: jest.fn(async () => ({})),
}));

jest.mock('@/data/lessons/nodeProgress', () => ({
  isNodeComplete: jest.fn(() => false),
}));

jest.mock('@/data/lessons/catalog', () => ({
  findSubLessonById: jest.fn(() => ({
    module: { id: 'module-1' },
    lesson: { id: 'l1', title: 'Alphabet & Vowels', icon: '🔤' },
    subLesson: { title: 'Les voyelles' },
  })),
  getCountryForModule: jest.fn(() => 'Canada'),
}));

jest.mock('@/data/challenges/challengeCatalog', () => ({
  getChallengeCycle: jest.fn(() => ({
    dateKey: '2026-09-25',
    weekKey: '2026-W39',
    dailyChallenges: [],
    weeklyChallenge: null,
  })),
  toDateKey: jest.fn((date) =>
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
  ),
}));

import { computeMetrics, loadChallengeState } from '@/store/challenge-progress';
import {
  loadClaimedMissions,
  loadLessonProgress,
  loadPracticeScores,
  loadSpeakingScores,
} from '@/store/lesson-progress';
import { CONSISTENCY_DAYS, buildAchievementSummary } from '@/store/achievements';

const TODAY = new Date(2026, 8, 25); // 25 Sep 2026, local time.

/**
 * Minimal stand-in for the real `computeMetrics`, so these tests exercise the
 * summary's own logic rather than the store's aggregation.
 */
function metricsFrom(bucket) {
  const subLessons = Array.isArray(bucket?.subLessons) ? bucket.subLessons : [];
  const missions = Array.isArray(bucket?.missionClaims) ? bucket.missionClaims : [];

  return {
    subLessons: subLessons.length,
    missions: missions.length,
    missionClaims: missions.length,
    xp: subLessons.reduce((total, e) => total + (Number(e.xp) || 0), 0),
    activeToday: subLessons.length + missions.length > 0 ? 1 : 0,
    speakingRounds: subLessons.filter((e) => (Number(e.speakingScore) || 0) >= 70).length,
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  loadChallengeState.mockResolvedValue({
    days: {},
    weeks: {},
    history: { dailyStreak: 0, longestDailyStreak: 0, daysCleared: 0 },
  });
  loadLessonProgress.mockResolvedValue({});
  loadPracticeScores.mockResolvedValue({});
  loadSpeakingScores.mockResolvedValue({});
  loadClaimedMissions.mockResolvedValue([]);

  computeMetrics.mockImplementation((bucket) => metricsFrom(bucket));
});

const build = () => buildAchievementSummary({ today: TODAY });

describe('a brand-new learner', () => {
  it('never claims a streak it has not got', async () => {
    const { streak, headline } = await build();

    expect(streak).toBe(0);
    expect(headline.title).toBe('Your journey starts here');
  });

  it('reports mastery as unmeasured rather than a misleading 0%', async () => {
    const { mastery } = await build();

    // null lets the screen say "Not measured yet" instead of showing 0%.
    expect(mastery.quiz).toBeNull();
    expect(mastery.speaking).toBeNull();
  });

  it('leaves every badge locked but still lists them', async () => {
    const { badges, earnedBadgeCount } = await build();

    expect(badges.length).toBeGreaterThan(0);
    expect(earnedBadgeCount).toBe(0);
    expect(badges.every((badge) => badge.status === 'locked')).toBe(true);
  });
});

describe('badges reward real work', () => {
  /**
   * One finished sub-lesson.
   *
   * `quizScore` defaults to `score` because that is what the app really stores:
   * for a quiz-bearing lesson `saveSubLessonResultStats` writes the quiz
   * percentage alongside the practice average, and the two are close. Pass an
   * explicit `quizScore: 0` to model a lesson whose quiz was genuinely failed.
   */
  function withSubLesson({ score = 90, quizScore = score, speakingScore = 0 } = {}) {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          'm1-l1-alphabet': { score, quizScore, speakingScore, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['m1-l1-alphabet'] } });
  }

  it('ignores an attempt that was never completed', async () => {
    // The score mirror records the attempt; lesson progress records completion.
    loadPracticeScores.mockResolvedValue({
      Canada: { 'l1-alphabet': { 'm1-l1-alphabet': { score: 95 } } },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': [] } });

    const { badges, earnedBadgeCount } = await build();

    expect(earnedBadgeCount).toBe(0);
    expect(badges.find((b) => b.key === 'first-steps').status).toBe('locked');
  });

  it('earns First Steps on the first completed sub-lesson', async () => {
    withSubLesson({ score: 60 });

    const { earnedBadgeCount } = await build();

    expect(earnedBadgeCount).toBeGreaterThan(0);
  });

  it('rates stars with the shared 90/75/50 bands', async () => {
    withSubLesson({ score: 95 });

    const { badges } = await build();

    // 95% is three stars, so Perfectionist is earned and Diamond Mind is not.
    expect(badges.find((b) => b.key === 'first-three-stars').status).toBe('earned');
    expect(badges.find((b) => b.key === 'ten-three-stars').status).toBe('in-progress');
  });

  it('only counts a speaking check that actually passed', async () => {
    withSubLesson({ score: 90, speakingScore: 40 });

    const { badges } = await build();

    expect(badges.find((b) => b.key === 'confident-speaker').progress).toBe(0);
  });

  it('marks a partial milestone as in-progress, not locked', async () => {
    withSubLesson({ score: 90 });
    loadClaimedMissions.mockResolvedValue(['mission-1']);

    const { badges } = await build();

    expect(badges.find((b) => b.key === 'ten-missions').status).toBe('in-progress');
  });
});

describe('one streak everywhere', () => {
  it('uses the server streak when it is available', async () => {
    loadChallengeState.mockResolvedValue({
      days: {},
      history: { dailyStreak: 9, longestDailyStreak: 9, daysCleared: 9 },
    });

    const { headline } = await buildAchievementSummary({
      today: TODAY,
      serverStreak: { streak: 2, longestStreak: 6 },
    });

    expect(headline.title).toBe('2-day streak');
    expect(headline.detail).toContain('best 6 days');
  });

  it('falls back to the device streak offline', async () => {
    loadChallengeState.mockResolvedValue({
      days: {},
      history: { dailyStreak: 3, longestDailyStreak: 3, daysCleared: 3 },
    });

    const { headline } = await buildAchievementSummary({ today: TODAY, serverStreak: null });

    expect(headline.title).toBe('3-day streak');
  });
});

describe('the streak headline', () => {
  it('leads with the streak because it is the strongest signal', async () => {
    loadChallengeState.mockResolvedValue({
      days: { '2026-09-25': { subLessons: [{ id: 'a', score: 90, xp: 30 }] } },
      history: { dailyStreak: 4, longestDailyStreak: 9, daysCleared: 9 },
    });

    const { headline } = await build();

    expect(headline.title).toBe('4-day streak');
    expect(headline.detail).toContain('best 9 days');
    expect(headline.detail).toContain('today is done');
  });

  it('nudges to practise when today is still untouched', async () => {
    loadChallengeState.mockResolvedValue({
      days: {},
      history: { dailyStreak: 3, longestDailyStreak: 3, daysCleared: 3 },
    });

    const { headline } = await build();

    expect(headline.detail).toContain('practise today');
  });

  it('falls back to weekly XP when the streak is gone', async () => {
    loadChallengeState.mockResolvedValue({
      days: {
        '2026-09-24': { subLessons: [{ id: 'a', score: 90, xp: 30 }] },
        '2026-09-23': { subLessons: [{ id: 'b', score: 90, xp: 30 }] },
      },
      history: { dailyStreak: 0, longestDailyStreak: 5, daysCleared: 5 },
    });

    const { headline, week } = await build();

    expect(week.xp).toBe(60);
    expect(headline.title).toBe('60 XP this week');
  });

  it('welcomes back a learner whose streak lapsed', async () => {
    loadChallengeState.mockResolvedValue({
      days: {},
      history: { dailyStreak: 0, longestDailyStreak: 6, daysCleared: 6 },
    });

    const { headline } = await build();

    expect(headline.title).toBe('Welcome back');
    expect(headline.detail).toContain('6 days');
  });
});

describe('weekly momentum', () => {
  it('only counts the last seven days', async () => {
    loadChallengeState.mockResolvedValue({
      days: {
        '2026-09-25': { subLessons: [{ id: 'a', score: 90, xp: 10 }] },
        // 18 Sep is eight days back: outside the window.
        '2026-09-18': { subLessons: [{ id: 'old', score: 90, xp: 999 }] },
      },
      history: { dailyStreak: 0, longestDailyStreak: 0 },
    });

    const { week } = await build();

    expect(week.xp).toBe(10);
  });
});

describe('the consistency strip', () => {
  it('covers a fixed window ending today', async () => {
    const { consistency } = await build();

    expect(consistency.days).toHaveLength(CONSISTENCY_DAYS);
    expect(consistency.days.at(-1).dateKey).toBe('2026-09-25');
    expect(consistency.days.at(-1).isToday).toBe(true);
  });

  it('counts a day as active from either lessons or a mission claim', async () => {
    loadChallengeState.mockResolvedValue({
      days: {
        '2026-09-25': { subLessons: [{ id: 'a', score: 90, xp: 10 }] },
        '2026-09-24': { missionClaims: [{ missionId: 1, xp: 50, coins: 10 }] },
      },
      history: { dailyStreak: 0, longestDailyStreak: 0 },
    });

    const { consistency } = await build();

    expect(consistency.activeDays).toBe(2);
  });
});

describe('mastery', () => {
  it('averages quiz and speaking separately so each is actionable', async () => {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 90, quizScore: 90, speakingScore: 40, updatedAt: '2026-09-24T10:00:00.000Z' },
          b: { score: 90, quizScore: 70, speakingScore: 80, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a', 'b'] } });

    const { mastery } = await build();

    expect(mastery.quiz).toBe(80);
    expect(mastery.speaking).toBe(60);
  });

  it('ignores an unrecorded score instead of dragging the average to zero', async () => {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 90, quizScore: 80, speakingScore: 0, updatedAt: '2026-09-24T10:00:00.000Z' },
          b: { score: 90, quizScore: 0, speakingScore: 0, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a', 'b'] } });

    const { mastery } = await build();

    // `b` has no speaking result, so it must not count as 0%.
    expect(mastery.speaking).toBeNull();
    expect(mastery.quiz).toBe(80);
  });
});

describe('the nearest goal (near-miss motivation)', () => {
  /** A learner with a partial milestone but nothing else in reach. */
  function nineOfTen() {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': Object.fromEntries(
          Array.from({ length: 9 }, (_, index) => [
            `s${index}`,
            { score: 90, updatedAt: '2026-09-24T10:00:00.000Z' },
          ])
        ),
      },
    });
    loadLessonProgress.mockResolvedValue({
      Canada: {
        'l1-alphabet': Array.from({ length: 9 }, (_, index) => `s${index}`),
      },
    });
  }

  it('surfaces a partial milestone instead of nothing', async () => {
    nineOfTen();

    const { nearest } = await build();

    expect(nearest).not.toBeNull();
    expect(nearest.title).toBe('Getting Serious');
    expect(nearest.progress).toBe(9);
    expect(nearest.target).toBe(10);
    expect(nearest.remaining).toBe(1);
  });

  it('picks the genuinely closest goal', async () => {
    nineOfTen();
    loadClaimedMissions.mockResolvedValue(['mission-1']);

    const { nearest } = await build();

    // 9/10 (90%) beats 1/10 (10%), even though both are the same kind of badge.
    expect(nearest.key).toBe('ten-sub-lessons');
  });

  it('never offers a badge the learner has not started', async () => {
    // 3 three-star sub-lessons. Several milestones sit at 3/10 while the
    // streak badges sit at 0/3 and 0/7.
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 95, updatedAt: '2026-09-24T10:00:00.000Z' },
          b: { score: 95, updatedAt: '2026-09-24T10:00:00.000Z' },
          c: { score: 95, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a', 'b', 'c'] } });

    const { nearest, badges } = await build();

    // A locked badge (0 progress) must never be chosen as the next goal.
    const lockedKeys = badges
      .filter((badge) => badge.status === 'locked')
      .map((badge) => badge.key);

    expect(lockedKeys.length).toBeGreaterThan(0);
    expect(lockedKeys).not.toContain(nearest.key);
    expect(nearest.progress).toBeGreaterThan(0);
  });

  it('never suggests a locked badge as a goal', async () => {
    const { nearest } = await build();

    // With no progress at all there is nothing in reach.
    expect(nearest).toBeNull();
  });

  it('does not offer an already-cleared badge', async () => {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 95, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a'] } });

    const { nearest, badges } = await build();

    const earnedKeys = badges.filter((b) => b.status === 'earned').map((b) => b.key);
    expect(earnedKeys).toContain('first-three-stars');

    // "First Steps" and "Perfectionist" are earned, so they are not goals.
    expect(nearest?.key).not.toBe('first-steps');
    expect(nearest?.key).not.toBe('first-three-stars');
  });
});

describe('recent wins', () => {
  it('lists the newest finished sub-lessons, capped at three', async () => {
    const ids = ['a', 'b', 'c', 'd'];
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': Object.fromEntries(
          ids.map((id, index) => [
            id,
            { score: 90, updatedAt: `2026-09-2${index + 1}T10:00:00.000Z` },
          ])
        ),
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ids } });

    const { recentWins } = await build();

    expect(recentWins).toHaveLength(3);
    expect(recentWins[0].contentKey).toBe('d');
  });

  it('shows nothing when the learner has not finished anything', async () => {
    const { recentWins } = await build();

    expect(recentWins).toEqual([]);
  });
});

describe('the score reference', () => {
  it('averages quiz and pronunciation the same way sublesson.jsx does', async () => {
    loadSpeakingScores.mockResolvedValue({});

    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: {
            score: 100,
            quizScore: 100,
            speakingScore: 50,
            updatedAt: '2026-09-24T10:00:00.000Z',
          },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a'] } });

    const { recentWins } = await build();

    // Mean of the two parts: (100 + 50) / 2 = 75, NOT the raw practice 100.
    expect(recentWins[0].score).toBe(75);
  });

  it('does not dilute a quiz-only sub-lesson with a zero speaking score', async () => {
    // A lesson with no speaking stage must score as the quiz alone, otherwise
    // every early lesson would be graded against a part that does not exist yet.
    loadSpeakingScores.mockResolvedValue({});
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 95, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a'] } });

    const { recentWins } = await build();

    expect(recentWins[0].score).toBe(95);
  });

  /*
   * THE BUG THIS FIXES.
   *
   * For a speaking sub-lesson the practice stage IS the speaking exercise, so
   * its score is written to `speaking-scores` and never to `practice-scores`.
   * Reading the practice record alone rendered 0% for a lesson the server had
   * actually scored, while the Profile screen (reading the server's best_score)
   * showed a real number.
   */
  it('scores a speaking sub-lesson instead of showing 0%', async () => {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: {
            // No practice record at all for this one.
            score: 0,
            updatedAt: '2026-09-24T10:00:00.000Z',
          },
        },
      },
    });
    loadSpeakingScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 88, attempts: 2, passed: true, updatedAt: '2026-09-24T11:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a'] } });

    const { recentWins } = await build();

    // Mean of the quiz (0, no questions) and pronunciation (88) = 44.
    expect(recentWins[0].score).toBe(44);
    expect(recentWins[0].score).not.toBe(0);
  });

  it('includes a speaking-only sub-lesson that has no practice record', async () => {
    loadPracticeScores.mockResolvedValue({});
    loadSpeakingScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          spoken: { score: 90, attempts: 1, passed: true, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['spoken'] } });

    const { recentWins } = await build();

    expect(recentWins).toHaveLength(1);
    expect(recentWins[0].contentKey).toBe('spoken');
  });

  it('never double-counts a sub-lesson that has both records', async () => {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 80, quizScore: 80, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadSpeakingScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 80, attempts: 1, passed: true, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a'] } });

    const { recentWins } = await build();

    expect(recentWins).toHaveLength(1);
  });

  it('keeps stars consistent with the displayed score', async () => {
    loadSpeakingScores.mockResolvedValue({});
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 100, quizScore: 100, speakingScore: 50, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a'] } });

    const { recentWins } = await build();

    // 75% is two stars, so the stars can never contradict the percentage.
    expect(recentWins[0].score).toBe(75);
    expect(recentWins[0].stars).toBe(2);
  });
});

describe('performance percentage', () => {
  /** `count` finished sub-lessons, each at `score`. */
  function withScores(count, score) {
    const ids = Array.from({ length: count }, (_, index) => `s${index}`);

    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': Object.fromEntries(
          ids.map((id, index) => [
            id,
            { score, updatedAt: `2026-09-2${index + 1}T10:00:00.000Z` },
          ])
        ),
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ids } });
  }

  it('averages the scores the learner actually finished', async () => {
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 60, updatedAt: '2026-09-21T10:00:00.000Z' },
          b: { score: 80, updatedAt: '2026-09-22T10:00:00.000Z' },
          c: { score: 90, updatedAt: '2026-09-23T10:00:00.000Z' },
          d: { score: 100, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a', 'b', 'c', 'd'] } });

    const { performance } = await build();

    expect(performance.average).toBe(83);
    expect(performance.sampleSize).toBe(4);
    expect(performance.best).toBe(100);
    expect(performance.comparable).toBe(true);
  });

  it('reports nothing to average for a brand-new learner', async () => {
    const { performance } = await build();

    expect(performance.average).toBeNull();
    expect(performance.comparable).toBe(false);
  });

  it('does not compare a result until there are enough samples', async () => {
    // One score is not an average, so a delta against it would be noise.
    withScores(1, 90);

    const { performance, recentWins } = await build();

    expect(performance.comparable).toBe(false);
    expect(recentWins[0].delta).toBeNull();
  });

  it('signs each win against the average of their own work', async () => {
    // Average is 65. Recent wins (newest 3) are d=100, c=60, b=60, so the
    // displayed set contains both an above-average and a below-average result.
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 40, updatedAt: '2026-09-21T10:00:00.000Z' },
          b: { score: 60, updatedAt: '2026-09-22T10:00:00.000Z' },
          c: { score: 60, updatedAt: '2026-09-23T10:00:00.000Z' },
          d: { score: 100, updatedAt: '2026-09-24T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a', 'b', 'c', 'd'] } });

    const { recentWins, performance } = await build();

    expect(performance.average).toBe(65);
    expect(recentWins).toHaveLength(3);

    const best = recentWins.find((win) => win.contentKey === 'd');
    const below = recentWins.find((win) => win.contentKey === 'c');

    expect(best.delta).toBe(35);
    expect(below.delta).toBe(-5);
  });

  it('flags a personal best only once there is history to beat', async () => {
    withScores(1, 90);

    const single = await build();
    // One sample: everything is trivially a "best", so the claim is withheld.
    expect(single.recentWins[0].isPersonalBest).toBe(false);

    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 50, updatedAt: '2026-09-21T10:00:00.000Z' },
          b: { score: 60, updatedAt: '2026-09-22T10:00:00.000Z' },
          c: { score: 100, updatedAt: '2026-09-23T10:00:00.000Z' },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a', 'b', 'c'] } });

    const several = await build();
    const best = several.recentWins.find((win) => win.contentKey === 'c');

    expect(best.isPersonalBest).toBe(true);
  });

  it('never averages in a sub-lesson that was not completed', async () => {
    // A 0% attempt exists in the score mirror but not in lesson progress, so it
    // must not drag the average down.
    loadPracticeScores.mockResolvedValue({
      Canada: {
        'l1-alphabet': {
          a: { score: 90, updatedAt: '2026-09-21T10:00:00.000Z' },
          b: { score: 90, updatedAt: '2026-09-22T10:00:00.000Z' },
          c: { score: 90, updatedAt: '2026-09-23T10:00:00.000Z' },
          d: { score: 90, updatedAt: '2026-09-24T10:00:00.000Z' },
          abandoned: { score: 0 },
        },
      },
    });
    loadLessonProgress.mockResolvedValue({ Canada: { 'l1-alphabet': ['a', 'b', 'c', 'd'] } });

    const { performance } = await build();

    expect(performance.average).toBe(90);
    expect(performance.sampleSize).toBe(4);
  });
});