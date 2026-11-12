/**
 * Device mirror of the backend `GET /profile` payload.
 *
 * The profile screen is the one summary view that had no offline story at all:
 * it asked the server for everything and rendered an error screen when the
 * device could not reach it. This module gives it two independent sources of
 * truth, in priority order:
 *
 *   1. CACHE    - the last payload the server actually returned, stored on the
 *                 device. This is still *server* truth, just older.
 *   2. DEVICE   - a payload rebuilt from the mirrors the rest of the offline
 *                 flow already maintains (lesson progress, practice scores,
 *                 claimed missions, the challenge ledger).
 *
 * Both are namespaced per learner (`gamifrench.<userId>.profile-cache`) for the
 * same reason `lesson-progress.js` namespaces its keys: a shared device must
 * never show one account the numbers of the account that used it before.
 * AuthProvider calls `setProfileCacheScope()` during render so the scope always
 * matches the session before a screen can read.
 *
 * The rebuilt payload deliberately mirrors `Backend/routes/player.py`
 * field for field, so `profile.jsx` renders one shape whether it came from the
 * network, the cache, or the device.
 */
import { findSubLessonById } from '@/data/lessons/catalog';
import { missionCatalog } from '@/data/lessons/missionCatalog';
import { SUBLESSON_XP_PER_STAR, starsForScore } from '@/services/scoring';
import { StartupAssessment } from '@/services/recommendations';
import { getChallengeVault, loadChallengeState } from '@/store/challenge-progress';
import {
  loadClaimedMissions,
  loadLessonProgress,
  loadPracticeScores,
} from '@/store/lesson-progress';
import { readJson, writeJson } from '@/store/local-store';
import type { UserProfile } from '@/types/auth';

/** Must match `Backend/services/xp_service.py`. */
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 850, 1300, 1850, 2500, 3250, 4100];

/** How many recently finished sub-lessons the profile lists (matches the API). */
const RECENT_ACTIVITY_LIMIT = 3;

const GUEST_SCOPE = 'guest';
let profileScope: string | null = null;

const cacheKey = () => `gamifrench.${profileScope ?? GUEST_SCOPE}.profile-cache`;

/** Startup assessment results per module, stored separately from the profile cache. */
const startupKey = () => `gamifrench.${profileScope ?? GUEST_SCOPE}.startup-assessments`;

export type RecentActivityItem = {
  contentKey: string;
  moduleKey?: string;
  bestScore: number;
  stars: number;
  completedAt: string | null;
};

/** The `/profile` payload. Fields are optional so an older cache still renders. */
export type ProfilePayload = {
  user?: Record<string, unknown>;
  progress?: Record<string, unknown>;
  learning?: Record<string, unknown>;
  content?: Record<string, unknown>;
  recentActivity?: RecentActivityItem[];
};

/** The cached `/profile` payload: the server's own answer plus when we got it. */
export type CachedProfile = {
  savedAt: string;
  payload: ProfilePayload;
};

/**
 * Point the cache at one learner. AuthProvider calls this whenever the session
 * changes; the previous account's key is simply never read again.
 */
export function setProfileCacheScope(userId: string | null): void {
  const next = userId ? String(userId) : null;
  if (next === profileScope) return;

  profileScope = next;
  console.log(`[ProfileCache] Scope set to ${next ?? GUEST_SCOPE}.`);
}

/** Persist the payload the server just returned so it can be read back offline. */
export async function saveProfileCache(payload: ProfilePayload): Promise<void> {
  if (!payload || typeof payload !== 'object') return;

  const entry: CachedProfile = { savedAt: new Date().toISOString(), payload };
  await writeJson(cacheKey(), entry);
}

/** The last server payload for this learner, or null when there is none. */
export async function readProfileCache(): Promise<CachedProfile | null> {
  const stored = await readJson<CachedProfile | null>(cacheKey(), null);

  if (!stored || typeof stored !== 'object' || !stored.payload) return null;

  return stored;
}

/* ---------------------------------------------------------------------------
 * STARTUP ASSESSMENT CACHE
 * ------------------------------------------------------------------------- */

/** Persist the startup diagnostic result for a module. */
export async function saveStartupAssessment(
  assessment: StartupAssessment
): Promise<void> {
  if (!assessment || !assessment.moduleKey) return;

  const stored = (await readJson<Record<string, StartupAssessment>>(
    startupKey(),
    {}
  )) ?? {};

  stored[assessment.moduleKey] = assessment;
  await writeJson(startupKey(), stored);
}

/** Read the startup assessment for a module, or null when none exists. */
export async function getStartupAssessment(
  moduleKey: string
): Promise<StartupAssessment | null> {
  const stored = (await readJson<Record<string, StartupAssessment>>(
    startupKey(),
    {}
  )) ?? {};

  return stored[moduleKey] ?? null;
}

/**
 * Every stored startup assessment, keyed by module id, in one read.
 * Screens that need several modules use this instead of calling
 * `getStartupAssessment` per module (one SecureStore read each).
 */
export async function getAllStartupAssessments(): Promise<Record<string, StartupAssessment>> {
  return (await readJson<Record<string, StartupAssessment>>(startupKey(), {})) ?? {};
}

/** Whether a startup diagnostic has been taken for a module. */
export async function hasStartupAssessment(moduleKey: string): Promise<boolean> {
  const assessment = await getStartupAssessment(moduleKey);
  return Boolean(assessment?.takenAt);
}

/* ---------------------------------------------------------------------------
 * LEVELS
 *
 * The server derives the level band from XP, so recomputing it the same way
 * here is what lets the device-built payload show a correct level bar.
 * ------------------------------------------------------------------------- */
function levelTrack(xp: number) {
  const total = Math.max(0, Math.round(Number(xp) || 0));

  let level = 1;
  for (let index = 0; index < LEVEL_THRESHOLDS.length; index += 1) {
    if (total < LEVEL_THRESHOLDS[index]) break;
    level = index + 1;
  }

  const levelStartXp = LEVEL_THRESHOLDS[level - 1];
  const isMaxLevel = level >= LEVEL_THRESHOLDS.length;
  const nextLevelXp = isMaxLevel ? levelStartXp + 1000 : LEVEL_THRESHOLDS[level];

  return {
    level,
    levelStartXp,
    nextLevelXp,
    isMaxLevel,
    xpToNextLevel: Math.max(nextLevelXp - total, 0),
    levelProgress: isMaxLevel
      ? 1
      : Math.round(((total - levelStartXp) / (nextLevelXp - levelStartXp)) * 10000) / 10000,
  };
}

/* ---------------------------------------------------------------------------
 * SETTINGS PREFERENCES
 *
 * `GET /settings` is a handful of read-only rows that only change on the
 * server, so the last answer is cached per learner for the same reason the
 * profile payload is.
 * ------------------------------------------------------------------------- */
export type Preference = {
  key: string;
  title: string;
  description: string;
  value: string;
};

const settingsKey = () => `gamifrench.${profileScope ?? GUEST_SCOPE}.settings-cache`;

/** Remember the preferences the server returned. */
export async function saveSettingsCache(preferences: Preference[]): Promise<void> {
  if (!Array.isArray(preferences)) return;
  await writeJson(settingsKey(), preferences);
}

/** The last known preferences, or an empty list when nothing is cached yet. */
export async function readSettingsCache(): Promise<Preference[]> {
  const stored = await readJson<Preference[]>(settingsKey(), []);
  return Array.isArray(stored) ? stored : [];
}

/* ---------------------------------------------------------------------------
 * DEVICE -> PROFILE
 *
 * Flattens the mirrors into the `/profile` shape. Everything here is derived
 * from data the device already owns, so no network call is involved.
 * ------------------------------------------------------------------------- */
type PracticeScoreEntry = { score?: number; updatedAt?: string | null };
type PracticeScoreTree = Record<string, Record<string, Record<string, PracticeScoreEntry>>>;
type LessonProgressTree = Record<string, Record<string, string[]>>;

type FlatAttempt = {
  country: string;
  topicId: string;
  subLessonId: string;
  score: number;
  stars: number;
  updatedAt: string | null;
};

const attemptKey = (country: string, topicId: string, subLessonId: string) =>
  `${country}|${topicId}|${subLessonId}`;

/** Every recorded attempt, flattened out of the country/topic/sub-lesson tree. */
function flattenPracticeScores(tree: unknown): FlatAttempt[] {
  const attempts: FlatAttempt[] = [];

  Object.entries((tree ?? {}) as PracticeScoreTree).forEach(([country, topics]) => {
    Object.entries(topics ?? {}).forEach(([topicId, subLessons]) => {
      Object.entries(subLessons ?? {}).forEach(([subLessonId, entry]) => {
        const score = Number(entry?.score) || 0;

        attempts.push({
          country,
          topicId,
          subLessonId,
          score,
          stars: starsForScore(score),
          updatedAt: entry?.updatedAt ?? null,
        });
      });
    });
  });

  return attempts;
}

/** Stable `country|topic|subLesson` keys for everything finished on this device. */
function completedKeys(progress: unknown): Set<string> {
  const keys = new Set<string>();

  Object.entries((progress ?? {}) as LessonProgressTree).forEach(([country, topics]) => {
    Object.entries(topics ?? {}).forEach(([topicId, subLessonIds]) => {
      (Array.isArray(subLessonIds) ? subLessonIds : []).forEach((subLessonId) => {
        if (subLessonId) keys.add(attemptKey(country, topicId, subLessonId));
      });
    });
  });

  return keys;
}

/** Best-effort local time zone; some engines expose none, hence the guard. */
function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** ISO day (`YYYY-MM-DD`) of the newest attempt, for the "last practice" row. */
function lastActiveDate(attempts: FlatAttempt[]): string | null {
  const newest = attempts
    .map((attempt) => attempt.updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .pop();

  if (!newest) return null;

  const parsed = new Date(newest);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

/**
 * Rebuild the `/profile` payload from this device's mirrors.
 *
 * `previous` is the last server payload when one exists. It is used only for
 * fields the device genuinely cannot know (when the account was created, the
 * learner's stated goal and daily target); every number the app tracks itself
 * is recomputed here, so a lesson finished offline appears immediately instead
 * of waiting for the next successful pull.
 */
export async function buildOfflineProfile(
  sessionUser: UserProfile | null | undefined,
  previous?: ProfilePayload | null
): Promise<ProfilePayload> {
  const [progress, practiceScores, claimedMissions, challengeState] = await Promise.all([
    loadLessonProgress(),
    loadPracticeScores(),
    loadClaimedMissions(),
    loadChallengeState(),
  ]);

  const attempts = flattenPracticeScores(practiceScores);
  const done = completedKeys(progress);
  const completed = attempts.filter((attempt) =>
    done.has(attemptKey(attempt.country, attempt.topicId, attempt.subLessonId))
  );

  /*
   * XP follows the server's own rule: a sub-lesson pays
   * `SUBLESSON_XP_PER_STAR` per star it earned, once. The three sources are
   * disjoint - sub-lesson completions, mission claims and the challenge vault
   * are each written by a different screen - so summing them cannot double
   * count.
   */
  const subLessonXp = completed.reduce(
    (total, attempt) => total + attempt.stars * SUBLESSON_XP_PER_STAR,
    0
  );

  const missionXp = (Array.isArray(claimedMissions) ? claimedMissions : []).reduce(
    (total, missionId) => {
      const mission = missionCatalog.find((item) => item.id === missionId);
      return total + (Number(mission?.rewards?.xp) || 0);
    },
    0
  );

  const vault = getChallengeVault(challengeState);
  const xp = subLessonXp + missionXp + vault.xp;
  const track = levelTrack(xp);

  const starsEarned = completed.reduce((total, attempt) => total + attempt.stars, 0);
  const scores = attempts.map((attempt) => attempt.score);
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    : 0;

  // A topic with at least one finished sub-lesson counts as a lesson touched.
  const lessonsCompleted = new Set(
    completed.map((attempt) => `${attempt.country}|${attempt.topicId}`)
  ).size;

  const recentActivity: RecentActivityItem[] = completed
    .filter((attempt) => Boolean(attempt.updatedAt))
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((attempt) => ({
      contentKey: attempt.subLessonId,
      moduleKey: findSubLessonById(attempt.subLessonId)?.module?.id,
      bestScore: attempt.score,
      stars: attempt.stars,
      completedAt: attempt.updatedAt,
    }));

  const previousUser = previous?.user ?? {};
  const previousLearning = previous?.learning ?? {};

  /*
   * `UserProfile` (types/auth.ts) has no `displayName`, but the login response
   * and `GET /profile` both carry one, and `profile.jsx` prefers it when it is
   * there. It is read off the session defensively so a future type change
   * cannot silently drop the learner's chosen name.
   */
  const sessionDisplayName = (sessionUser as { displayName?: string } | null | undefined)
    ?.displayName;

  const displayName =
    sessionDisplayName ||
    [sessionUser?.firstName, sessionUser?.lastName].filter(Boolean).join(' ');

  return {
    user: {
      displayName: displayName || 'Traveler',
      email: sessionUser?.email ?? previousUser.email ?? '',
      gender: sessionUser?.gender ?? previousUser.gender ?? 'male',
      // Only the server knows when the account was created.
      memberSince: previousUser.memberSince ?? null,
    },
    progress: {
      xp,
      totalXp: xp,
      ...track,
      streak: Number(challengeState?.history?.dailyStreak) || 0,
      longestStreak:
        Number(challengeState?.history?.longestDailyStreak) ||
        Number(challengeState?.history?.dailyStreak) ||
        0,
      lessonsCompleted,
      totalLessonsCompleted: lessonsCompleted,
      // Derived on the server from assessment attempts, which are not mirrored
      // on the device. Reporting 0 keeps the card honest instead of inventing
      // a grade the server never awarded.
      overallAverageGrade20: 0,
      coins: vault.coins,
      hearts: 5,
      lastActiveDate: lastActiveDate(attempts),
    },
    learning: {
      frenchLevel: sessionUser?.frenchLevel ?? previousLearning.frenchLevel ?? 'beginner',
      learningGoal: previousLearning.learningGoal ?? 'general',
      dailyTargetMinutes: Number(previousLearning.dailyTargetMinutes) || 10,
      timezone: previousLearning.timezone ?? deviceTimeZone(),
      onboardingComplete: Boolean(sessionUser?.onboardingComplete),
    },
    content: {
      tracked: attempts.length,
      completed: completed.length,
      completionRate: attempts.length
        ? Math.round((completed.length / attempts.length) * 10000) / 10000
        : 0,
      averageScore,
      bestScore: scores.length ? Math.max(...scores) : 0,
      starsEarned,
    },
    recentActivity,
  };
}