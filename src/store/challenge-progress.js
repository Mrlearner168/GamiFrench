import { storageGet, storageSet } from '@/store/storage';

import {
  CHALLENGE_TIERS,
  dailyChallengeChest,
  getDateFromKey,
  getWeekKey,
  toDateKey,
  weeklyChallengeChest,
} from '@/data/challenges/challengeCatalog';
import { isOfflineError } from '@/services/apiClient';
import { NODE_PASS_PERCENTAGE, PASSING_PERCENTAGE } from '@/services/scoring';
import { enqueueChallengeClaim } from '@/store/pending-sync';

/*
|--------------------------------------------------------------------------
| CHALLENGE PROGRESS STORE
|--------------------------------------------------------------------------
| The daily challenges in src/data/challenges/challengeCatalog.js declare
| *what* has to be done. This store keeps track of *how far along* the
| player is, from real gameplay events:
|
|   - recordSubLessonCompletion() -> called by the sub-lesson screen when a
|     sub-lesson is finished (overall score, quiz accuracy, speaking).
|   - recordMissionClaim()        -> called by the mission screen when the
|     mission rewards are collected.
|
| Everything is persisted on-device (same pattern as the lesson
| progress store) so challenges survive offline launches and app restarts.
|
| Rewards are paid by the server (POST /challenges/claim) into the learner's
| real XP and coins, and every claim is recorded there. The `vault` below only
| totals what this device collected, for the challenge screen.
|--------------------------------------------------------------------------
*/

const CHALLENGES_SUFFIX = 'challenges';

/* Mastery mark shared with missions and the next-stop gate. */
const MASTERY_PERCENTAGE = NODE_PASS_PERCENTAGE;

/*
 * The challenge store is device storage too, so it is namespaced by learner for
 * the same reason as the lesson-progress store: a shared phone must never feed
 * one account the challenges another account already cleared.
 */
const GUEST_SCOPE = 'guest';
let challengeScope = null;

const challengesKey = () => `gamifrench.${challengeScope ?? GUEST_SCOPE}.${CHALLENGES_SUFFIX}`;

/*
 * Point the store at one learner. AuthProvider calls it whenever the session
 * changes; the cached state belongs to the previous account and is dropped.
 */
export function setChallengeScope(userId) {
  const next = userId ? String(userId) : null;
  if (next === challengeScope) return;

  challengeScope = next;
  cachedState = null;

  console.log(`[Challenges] Scope set to ${next ?? GUEST_SCOPE}.`);
}

/*
 * How much history is kept on the device: three weeks is plenty for the
 * metrics used by the catalog and keeps the stored payload small.
 */
const MAX_TRACKED_DAYS = 21;
const MAX_TRACKED_WEEKS = 8;
let cachedState = null;

function createEmptyState() {
  return {
    version: 1,
    /* Per-day buckets: { '2026-09-22': { subLessons: [], missionClaims: [] } } */
    days: {},
    /* Per-week buckets (same shape) keyed by ISO week. */
    weeks: {},
    /* Collected rewards: { days: { '2026-09-22': ['daily-chest'] }, weeks: {} } */
    claims: { days: {}, weeks: {} },
    /* Challenge rewards collected (paid by the server, see claimChallengeReward). */
    vault: { xp: 0, coins: 0 },
    /* Daily challenge streak bookkeeping. */
    history: {
      dailyStreak: 0,
      longestDailyStreak: 0,
      lastClearedDay: null,
      daysCleared: 0,
    },
  };
}

function normalizeState(stored) {
  const empty = createEmptyState();

  if (!stored || typeof stored !== 'object') return empty;

  return {
    ...empty,
    ...stored,
    days: stored.days ?? {},
    weeks: stored.weeks ?? {},
    claims: {
      days: stored.claims?.days ?? {},
      weeks: stored.claims?.weeks ?? {},
    },
    vault: {
      xp: Number(stored.vault?.xp) || 0,
      coins: Number(stored.vault?.coins) || 0,
    },
    history: { ...empty.history, ...(stored.history ?? {}) },
  };
}

/* Keep only the newest keys of a bucket map (ISO keys sort chronologically). */
function pruneBucket(bucket, keep) {
  const kept = Object.keys(bucket ?? {})
    .sort()
    .reverse()
    .slice(0, keep);

  return kept.reduce((accumulator, key) => {
    accumulator[key] = bucket[key];
    return accumulator;
  }, {});
}

function pruneState(state) {
  return {
    ...state,
    days: pruneBucket(state.days, MAX_TRACKED_DAYS),
    weeks: pruneBucket(state.weeks, MAX_TRACKED_WEEKS),
    claims: {
      days: pruneBucket(state.claims?.days, MAX_TRACKED_DAYS),
      weeks: pruneBucket(state.claims?.weeks, MAX_TRACKED_WEEKS),
    },
    spotlights: pruneBucket(state.spotlights, MAX_TRACKED_DAYS),
  };
}

export async function loadChallengeState() {
  if (cachedState) return cachedState;

  try {
    const stored = await storageGet(challengesKey());
    cachedState = normalizeState(stored ? JSON.parse(stored) : null);
  } catch (error) {
    console.log('[Challenges] Failed to read stored challenges, starting fresh.', error);
    cachedState = createEmptyState();
  }

  return cachedState;
}

export async function saveChallengeState(nextState) {
  cachedState = pruneState(normalizeState(nextState));

  try {
    await storageSet(challengesKey(), JSON.stringify(cachedState));
  } catch (error) {
    console.log('[Challenges] Failed to persist challenges.', error);
  }

  return cachedState;
}

/*
|--------------------------------------------------------------------------
| BUCKET HELPERS
|--------------------------------------------------------------------------
|
| Both the daily and the weekly activity live in a bucket:
|   { subLessons: [...], missionClaims: [...], updatedAt }
|
| The week bucket is filled in parallel with the day bucket, so the weekly
| challenge counts a sub-lesson once even when it is replayed every day.
|--------------------------------------------------------------------------
*/

function emptyBucket() {
  return { subLessons: [], missionClaims: [], updatedAt: null };
}

/*
 * Merge two records of the same lesson (first attempt plus a replay): keep
 * the best numbers, so a replay can never lower a challenge already earned.
 */
function mergeSubLessonEntry(existing, next) {
  return {
    ...existing,
    score: Math.max(Number(existing.score) || 0, Number(next.score) || 0),
    quizScore: Math.max(
      Number(existing.quizScore) || 0,
      Number(next.quizScore) || 0
    ),
    speakingScore: Math.max(
      Number(existing.speakingScore) || 0,
      Number(next.speakingScore) || 0
    ),
    stars: Math.max(Number(existing.stars) || 0, Number(next.stars) || 0),
    xp: Math.max(Number(existing.xp) || 0, Number(next.xp) || 0),
    replay: Boolean(existing.replay) && Boolean(next.replay),
    improved: Boolean(existing.improved) || Boolean(next.improved),
    at: next.at ?? existing.at,
  };
}

function upsertSubLesson(bucket, entry) {
  const current = bucket ?? emptyBucket();
  const subLessons = Array.isArray(current.subLessons) ? current.subLessons : [];
  const index = subLessons.findIndex((item) => item.id === entry.id);

  const nextSubLessons =
    index >= 0
      ? [
          ...subLessons.slice(0, index),
          mergeSubLessonEntry(subLessons[index], entry),
          ...subLessons.slice(index + 1),
        ]
      : [...subLessons, entry];

  return {
    subLessons: nextSubLessons,
    missionClaims: Array.isArray(current.missionClaims)
      ? current.missionClaims
      : [],
    updatedAt: entry.at,
  };
}

function upsertMissionClaim(bucket, entry) {
  const current = bucket ?? emptyBucket();
  const missionClaims = Array.isArray(current.missionClaims)
    ? current.missionClaims
    : [];

  // A mission can only count once per day (and once per week).
  if (missionClaims.some((item) => item.missionId === entry.missionId)) {
    return { ...current, updatedAt: entry.at };
  }

  return {
    subLessons: Array.isArray(current.subLessons) ? current.subLessons : [],
    missionClaims: [...missionClaims, entry],
    updatedAt: entry.at,
  };
}

/*
|--------------------------------------------------------------------------
| EVENT RECORDING
|--------------------------------------------------------------------------
*/

/*
 * Called once per finished sub-lesson by the sub-lesson screen.
 *
 * `replay` marks a lesson that was already completed before today, which is
 * exactly what the "Memory Refresh" challenge counts.
 */
export async function recordSubLessonCompletion({
  country,
  moduleId,
  topicId,
  subLessonId,
  score = 0,
  quizScore = null,
  speakingScore = null,
  stars = 0,
  xp = 0,
  replay = false,
  improved = false,
  date = new Date(),
} = {}) {
  if (!subLessonId) return loadChallengeState();

  const state = await loadChallengeState();
  const dateKey = toDateKey(date);
  const weekKey = getWeekKey(date);

  const entry = {
    id: subLessonId,
    country: country ?? null,
    moduleId: moduleId ?? null,
    topicId: topicId ?? null,
    score: Number(score) || 0,
    quizScore: Number.isFinite(Number(quizScore)) ? Number(quizScore) : null,
    speakingScore: Number.isFinite(Number(speakingScore))
      ? Number(speakingScore)
      : null,
    stars: Number(stars) || 0,
    xp: Number(xp) || 0,
    replay: Boolean(replay),
    improved: Boolean(improved),
    at: date.toISOString(),
  };

  return saveChallengeState({
    ...state,
    days: {
      ...state.days,
      [dateKey]: upsertSubLesson(state.days[dateKey], entry),
    },
    weeks: {
      ...state.weeks,
      [weekKey]: upsertSubLesson(state.weeks[weekKey], entry),
    },
  });
}

/* Called once per collected mission reward by the mission screen. */
export async function recordMissionClaim({
  missionId,
  xp = 0,
  coins = 0,
  country = null,
  date = new Date(),
} = {}) {
  if (missionId === undefined || missionId === null) {
    return loadChallengeState();
  }

  const state = await loadChallengeState();
  const dateKey = toDateKey(date);
  const weekKey = getWeekKey(date);

  const entry = {
    missionId,
    xp: Number(xp) || 0,
    coins: Number(coins) || 0,
    country: country ?? null,
    at: date.toISOString(),
  };

  return saveChallengeState({
    ...state,
    days: {
      ...state.days,
      [dateKey]: upsertMissionClaim(state.days[dateKey], entry),
    },
    weeks: {
      ...state.weeks,
      [weekKey]: upsertMissionClaim(state.weeks[weekKey], entry),
    },
  });
}

/*
|--------------------------------------------------------------------------
| METRICS
|--------------------------------------------------------------------------
| Every metric the challenge catalog can ask for is derived here, straight
| from the recorded gameplay events.
|--------------------------------------------------------------------------
*/
export function computeMetrics(bucket, { streak = 0 } = {}) {
  // Only PASSED sub-lessons (50%+) count towards any challenge. The sub-lesson
  // screen only records passes today; the filter keeps that rule in one place.
  const subLessons = (Array.isArray(bucket?.subLessons) ? bucket.subLessons : []).filter(
    (entry) => (Number(entry?.score) || 0) >= PASSING_PERCENTAGE
  );
  const missions = Array.isArray(bucket?.missionClaims)
    ? bucket.missionClaims
    : [];

  const scores = subLessons.map((entry) => Number(entry.score) || 0);
  const quizScores = subLessons
    .map((entry) => Number(entry.quizScore))
    .filter((value) => Number.isFinite(value));
  const speakingScores = subLessons
    .map((entry) => Number(entry.speakingScore))
    .filter((value) => Number.isFinite(value));

  const topics = new Set(subLessons.map((entry) => entry.topicId).filter(Boolean));
  const countries = new Set(
    subLessons.map((entry) => entry.country).filter(Boolean)
  );

  const xpFromLessons = subLessons.reduce(
    (total, entry) => total + (Number(entry.xp) || 0),
    0
  );
  const xpFromMissions = missions.reduce(
    (total, entry) => total + (Number(entry.xp) || 0),
    0
  );

  const average = (values) =>
    values.length
      ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
      : 0;

  return {
    subLessons: subLessons.length,
    perfectScores: scores.filter((value) => value >= 90).length,
    highScores: scores.filter((value) => value >= 85).length,
    bestScore: scores.length ? Math.max(...scores) : 0,
    quizAccuracy: average(quizScores),
    speakingRounds: speakingScores.filter((value) => value >= 70).length,
    topics: topics.size,
    countries: countries.size,
    missionClaims: missions.length,
    xp: xpFromLessons + xpFromMissions,
    // Review counts when it reaches mastery, not for replaying an easy lesson.
    replays: subLessons.filter(
      (entry) => entry.replay && (Number(entry.score) || 0) >= MASTERY_PERCENTAGE
    ).length,
    // A lesson lifted from under 80% to 80%+ ("weak spot" challenges).
    improved: subLessons.filter((entry) => entry.improved).length,
    // Passed for the first time ever.
    newLessons: subLessons.filter((entry) => !entry.replay).length,
    activeToday: subLessons.length > 0 || missions.length > 0 ? 1 : 0,
    streak,
  };
}

/* Raw metric value of one challenge (custom combos use `evaluate`). */
function resolveMetricValue(challenge, metrics) {
  if (typeof challenge?.evaluate === 'function') {
    const custom = Number(challenge.evaluate(metrics));
    return Number.isFinite(custom) ? Math.max(0, Math.round(custom)) : 0;
  }

  const value = Number(metrics?.[challenge?.metric]);
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

/*
 * Progress of a single challenge: { value, target, percent, completed, metrics }.
 * `value` is clamped for the bar, `rawValue` keeps the real number.
 */
export function resolveChallengeProgress(
  state,
  challenge,
  { dateKey, weekKey, streak = 0 } = {}
) {
  const isWeekly = challenge?.tier === CHALLENGE_TIERS.WEEKLY;
  const bucket = isWeekly ? state?.weeks?.[weekKey] : state?.days?.[dateKey];
  const metrics = computeMetrics(bucket, { streak });
  const rawValue = resolveMetricValue(challenge, metrics);
  const target = Math.max(1, Number(challenge?.target) || 1);
  const value = Math.min(target, rawValue);

  return {
    value,
    rawValue,
    target,
    percent: Math.round((value / target) * 100),
    completed: rawValue >= target,
    metrics,
  };
}

export function isRewardClaimed(state, scope, scopeKey, rewardId) {
  const claimScope = state?.claims?.[scope] ?? {};

  return Array.isArray(claimScope[scopeKey])
    ? claimScope[scopeKey].includes(rewardId)
    : false;
}

export function getChallengeVault(state) {
  return {
    xp: Number(state?.vault?.xp) || 0,
    coins: Number(state?.vault?.coins) || 0,
  };
}

/*
 * Collect the rewards of a cleared challenge (or chest) exactly once.
 *
 * `scope` is 'days' for daily rewards and 'weeks' for weekly rewards, while
 * `scopeKey` is the day key / week key the reward belongs to.
 *
 * The SERVER pays the reward (POST /challenges/claim): it takes the amount
 * from its own catalog, checks the learner studied in that period, caps the
 * claims per day/week and records the claim for the research dashboard.
 * `send` is the authenticated request function. Offline, the claim is queued
 * and paid on the next sync. A refusal from the server is returned as
 * `{ claimed: false, error }` and nothing is marked as collected.
 */
export async function claimChallengeReward(item, { scope, scopeKey, send } = {}) {
  if (!item?.id || !scope || !scopeKey) {
    return { claimed: false, rewards: { xp: 0, coins: 0 } };
  }

  const state = await loadChallengeState();

  if (isRewardClaimed(state, scope, scopeKey, item.id)) {
    return {
      claimed: false,
      alreadyClaimed: true,
      rewards: { xp: 0, coins: 0 },
      vault: getChallengeVault(state),
    };
  }

  let rewards = {
    xp: Number(item.rewards?.xp) || 0,
    coins: Number(item.rewards?.coins) || 0,
  };
  let pending = false;

  if (typeof send === 'function') {
    try {
      const result = await send('/challenges/claim', {
        method: 'POST',
        body: JSON.stringify({ challengeId: item.id, periodKey: scopeKey }),
      });
      // The server's amounts win over the catalog copy on the device.
      rewards = {
        xp: Number(result?.claim?.xpAwarded) || 0,
        coins: Number(result?.claim?.coinsAwarded) || 0,
      };
    } catch (error) {
      if (!isOfflineError(error)) {
        return {
          claimed: false,
          rewards: { xp: 0, coins: 0 },
          error: error?.message || 'The reward could not be collected. Please try again.',
          code: error?.code ?? null,
        };
      }
      await enqueueChallengeClaim({ challengeId: item.id, periodKey: scopeKey });
      pending = true;
    }
  }

  const nextState = await markRewardClaimed(state, scope, scopeKey, item.id, rewards);

  console.log(
    `[Challenges] Collected ${item.id}: +${rewards.xp} XP, +${rewards.coins} coins${pending ? ' (queued)' : ''}.`
  );

  return {
    claimed: true,
    pending,
    rewards,
    vault: getChallengeVault(nextState),
  };
}

function markRewardClaimed(state, scope, scopeKey, rewardId, rewards = { xp: 0, coins: 0 }) {
  const claimScope = state.claims?.[scope] ?? {};
  if ((claimScope[scopeKey] ?? []).includes(rewardId)) return Promise.resolve(state);

  return saveChallengeState({
    ...state,
    claims: {
      ...state.claims,
      [scope]: {
        ...claimScope,
        [scopeKey]: [...(claimScope[scopeKey] ?? []), rewardId],
      },
    },
    vault: {
      xp: (Number(state.vault?.xp) || 0) + (Number(rewards.xp) || 0),
      coins: (Number(state.vault?.coins) || 0) + (Number(rewards.coins) || 0),
    },
  });
}

/*
 * Fold the server's claims (GET /challenges/claims) into the device state, so
 * a reward collected on another device shows as collected here too.
 */
export async function mergeServerChallengeClaims(claims) {
  let state = await loadChallengeState();
  for (const claim of Array.isArray(claims) ? claims : []) {
    if (!claim?.challengeId || !claim?.periodKey) continue;
    const scope = claim.period === 'week' ? 'weeks' : 'days';
    if (isRewardClaimed(state, scope, claim.periodKey, claim.challengeId)) continue;
    state = await markRewardClaimed(state, scope, claim.periodKey, claim.challengeId, {
      xp: claim.xpAwarded,
      coins: claim.coinsAwarded,
    });
  }
  return state;
}

/*
 * The spotlight topic is pinned per day, so fixing a weak topic does not swap
 * the spotlight for another topic halfway through the day.
 */
export function getPinnedSpotlightTopic(state, dateKey) {
  return state?.spotlights?.[dateKey] ?? null;
}

export async function pinSpotlightTopic(dateKey, topicId) {
  if (!dateKey || !topicId) return loadChallengeState();
  const state = await loadChallengeState();
  if (state.spotlights?.[dateKey]) return state;
  return saveChallengeState({
    ...state,
    spotlights: { ...(state.spotlights ?? {}), [dateKey]: topicId },
  });
}

/*
|--------------------------------------------------------------------------
| DAILY CHALLENGE STREAK
|--------------------------------------------------------------------------
| The streak counts the consecutive days on which the whole assigned set
| was cleared. It is refreshed by the challenge screen every time it loads.
|--------------------------------------------------------------------------
*/
export async function syncDailyCompletion({ dateKey, allCleared } = {}) {
  if (!dateKey) return loadChallengeState();

  const state = await loadChallengeState();
  const history = { ...state.history };
  // Calendar arithmetic, not "minus 24h": on the day after a daylight-saving
  // change, local midnight minus 24h lands two calendar days back.
  const today = getDateFromKey(dateKey);
  const yesterdayKey = toDateKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  );

  /* Day cleared for the first time: extend (or start) the streak. */
  if (allCleared && history.lastClearedDay !== dateKey) {
    const continuesStreak = history.lastClearedDay === yesterdayKey;

    history.dailyStreak = continuesStreak
      ? (Number(history.dailyStreak) || 0) + 1
      : 1;
    history.lastClearedDay = dateKey;
    history.daysCleared = (Number(history.daysCleared) || 0) + 1;
    history.longestDailyStreak = Math.max(
      Number(history.longestDailyStreak) || 0,
      history.dailyStreak
    );

    console.log(
      `[Challenges] Daily set cleared (${dateKey}). Streak: ${history.dailyStreak}.`
    );

    return saveChallengeState({ ...state, history });
  }

  /* A whole day was skipped: the streak restarts at the next cleared day. */
  const streakBroken =
    !allCleared &&
    Boolean(history.lastClearedDay) &&
    history.lastClearedDay !== dateKey &&
    history.lastClearedDay !== yesterdayKey;

  if (streakBroken) {
    history.dailyStreak = 0;
    return saveChallengeState({ ...state, history });
  }

  return state;
}

/*
|--------------------------------------------------------------------------
| OVERVIEW BUILDERS
|--------------------------------------------------------------------------
| The challenge screen and the home card both render these, so the numbers
| on both screens can never disagree.
|--------------------------------------------------------------------------
*/

function sumCollectableRewards(items) {
  return items.reduce(
    (total, item) => ({
      xp: total.xp + (Number(item.rewards?.xp) || 0),
      coins: total.coins + (Number(item.rewards?.coins) || 0),
    }),
    { xp: 0, coins: 0 }
  );
}

/*
 * Today's dashboard: the three assigned challenges with their live progress,
 * the daily chest, the streak and the bonus vault.
 */
export function buildDailyOverview(state, cycle, { streak = 0 } = {}) {
  const dateKey = cycle?.dateKey;
  const weekKey = cycle?.weekKey;

  const challenges = (cycle?.dailyChallenges ?? []).map((challenge) => ({
    ...challenge,
    progress: resolveChallengeProgress(state, challenge, {
      dateKey,
      weekKey,
      streak,
    }),
    claimed: isRewardClaimed(state, 'days', dateKey, challenge.id),
  }));

  const total = challenges.length;
  const completed = challenges.filter(
    (challenge) => challenge.progress.completed
  ).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const allCleared = total > 0 && completed === total;

  const chestProgress = {
    value: completed,
    rawValue: completed,
    target: total || 1,
    percent,
    completed: allCleared,
    metrics: null,
  };

  const chest = {
    ...dailyChallengeChest,
    progress: chestProgress,
    claimed: isRewardClaimed(state, 'days', dateKey, dailyChallengeChest.id),
  };

  const collectable = [...challenges, chest].filter(
    (item) => item.progress?.completed && !item.claimed
  );

  const history = state?.history ?? {};

  return {
    dateKey,
    weekKey,
    challenges,
    completed,
    total,
    percent,
    allCleared,
    chest,
    collectableCount: collectable.length,
    pendingRewards: sumCollectableRewards(collectable),
    streak: Number(history.dailyStreak) || 0,
    longestStreak: Number(history.longestDailyStreak) || 0,
    daysCleared: Number(history.daysCleared) || 0,
    vault: getChallengeVault(state),
  };
}

/* The weekly goal with its progress and chest. */
export function buildWeeklyOverview(state, cycle, { streak = 0 } = {}) {
  const weekKey = cycle?.weekKey;
  const challenge = cycle?.weeklyChallenge;

  const progress = challenge
    ? resolveChallengeProgress(state, challenge, {
        dateKey: cycle?.dateKey,
        weekKey,
        streak,
      })
    : null;

  const claimed = challenge
    ? isRewardClaimed(state, 'weeks', weekKey, challenge.id)
    : false;

  const chest = {
    ...weeklyChallengeChest,
    progress: {
      value: progress?.value ?? 0,
      rawValue: progress?.rawValue ?? 0,
      target: progress?.target ?? 1,
      percent: progress?.percent ?? 0,
      completed: Boolean(progress?.completed),
      metrics: null,
    },
    claimed: isRewardClaimed(state, 'weeks', weekKey, weeklyChallengeChest.id),
  };

  const collectable = [
    ...(progress?.completed && !claimed && challenge ? [challenge] : []),
    ...(chest.progress.completed && !chest.claimed ? [chest] : []),
  ];

  return {
    weekKey,
    challenge,
    progress,
    claimed,
    chest,
    collectableCount: collectable.length,
    pendingRewards: sumCollectableRewards(collectable),
  };
}
