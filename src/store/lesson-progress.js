import { storageGet, storageSet } from '@/store/storage';

import { findSubLessonById, getCountryForModule } from '@/data/lessons/catalog';
import {
  getMissionKeyFromNumber,
  MISSION_PASS_PERCENTAGE,
} from '@/data/lessons/missionCatalog';

/*
 * ---------------------------------------------------------------------------
 * DEVICE STORAGE
 *
 * Everything in this module is persisted on-device (SecureStore on native, localStorage on web), and every key is
 * namespaced by learner: `gamifrench.<userId>.<suffix>`.
 *
 * The device is shared (a family phone, a test build, the web preview), so an
 * unnamespaced key would hand one account the completions of the account that
 * used it before - which is exactly what made a fresh account look like it had
 * already finished sub-lessons. Before a session is known the `guest`
 * namespace is used, and `setLessonProgressScope()` drops the in-memory caches
 * whenever the signed-in learner changes.
 * ---------------------------------------------------------------------------
 */
const GUEST_SCOPE = 'guest';
let progressScope = null;

const scopedKey = (suffix) => `gamifrench.${progressScope ?? GUEST_SCOPE}.${suffix}`;

let cachedProgress = {};
let cachedPracticeScores = {};
let cachedSpeakingScores = null;
let cachedClaimedMissions = null;
/*
 * Best score per sub-lesson id ({ 'm1-l1-alphabet': 85 }). Mission objectives
 * need MISSION_PASS_PERCENTAGE, so "completed" (50%+) alone is not enough.
 * Filled from finished sub-lessons on this device and from the server's
 * `bestScore`, and read synchronously by getObjectiveCompletion.
 */
let cachedBestScores = {};

/*
 * Point this store at one learner. AuthProvider calls it whenever the session
 * changes, and it must run before any screen reads: the cached objects belong
 * to the previous account, so they are dropped before a read can serve them.
 */
export function setLessonProgressScope(userId) {
  const next = userId ? String(userId) : null;
  if (next === progressScope) return;

  progressScope = next;

  cachedProgress = {};
  cachedPracticeScores = {};
  cachedSpeakingScores = null;
  cachedClaimedMissions = null;
  cachedModuleQuizResults = null;
  cachedBestScores = {};
  bestScoresLoaded = false;

  console.log(`[Store] Lesson progress scope set to ${next ?? GUEST_SCOPE}.`);
}

export async function loadPracticeScores() {
  if (Object.keys(cachedPracticeScores).length) return cachedPracticeScores;
  const stored = await storageGet(scopedKey('practice-scores'));
  cachedPracticeScores = stored ? JSON.parse(stored) : {};
  
  console.log('[Store] Practice scores loaded:', cachedPracticeScores);
  return cachedPracticeScores;
}

export async function loadLessonProgress() {
  await loadBestScores();
  if (Object.keys(cachedProgress).length) return cachedProgress;
  const stored = await storageGet(scopedKey('lesson-progress'));
  cachedProgress = stored ? JSON.parse(stored) : {};
  
  console.log('[Store] Lesson progress loaded:', cachedProgress);
  return cachedProgress;
}

/* ---------------------------------------------------------------------------
 * BEST SCORES (mission objectives need 80%)
 * ------------------------------------------------------------------------- */

let bestScoresLoaded = false;

async function loadBestScores() {
  if (bestScoresLoaded) return cachedBestScores;
  try {
    const stored = await storageGet(scopedKey('sublesson-best'));
    cachedBestScores = { ...(stored ? JSON.parse(stored) : {}), ...cachedBestScores };
  } catch (error) {
    console.log('[Store] Could not read best scores:', error);
  }
  bestScoresLoaded = true;
  return cachedBestScores;
}

function persistBestScores() {
  storageSet(scopedKey('sublesson-best'), JSON.stringify(cachedBestScores)).catch(
    (error) => console.log('[Store] Could not save best scores:', error)
  );
}

/** Raise the remembered best scores; returns true when something changed. */
function raiseBestScores(entries) {
  let changed = false;
  for (const [subLessonId, score] of entries) {
    const value = Math.round(Number(score));
    if (!subLessonId || !Number.isFinite(value)) continue;
    if (value > (cachedBestScores[subLessonId] ?? -1)) {
      cachedBestScores = { ...cachedBestScores, [subLessonId]: value };
      changed = true;
    }
  }
  if (changed) persistBestScores();
  return changed;
}

/** Take the server's best scores (the `/progress` content list). */
export function noteServerBestScores(content) {
  raiseBestScores(
    (content ?? [])
      .filter((item) => item?.contentType === 'sublesson' || item?.contentKey)
      .map((item) => [item.contentKey, item.bestScore])
  );
}

/** Record the score of any attempt (failed ones too) as a best-score candidate. */
export function noteSubLessonAttemptScore(subLessonId, score) {
  raiseBestScores([[subLessonId, score]]);
}

/** Best score this learner reached on a sub-lesson, or null if unknown. */
export function getSubLessonBestScore(subLessonId) {
  const value = cachedBestScores[subLessonId];
  return Number.isFinite(value) ? value : null;
}

export async function completeSubLesson(country, topicId, subLessonId, scorePercentage = 100) {
  console.log(`[Store] Attempting to complete sub-lesson: ${subLessonId} (Topic: ${topicId}, Country: ${country}, Score: ${scorePercentage}%)`);

  const progress = await loadLessonProgress();
  // Every attempt can raise the best score, even one below the pass mark.
  raiseBestScores([[subLessonId, scorePercentage]]);
  
  // Guard clause: Do not mark as completed if the score is below 50%
  if (scorePercentage < 50) {
    console.log(`[Store] ❌ Sub-lesson ${subLessonId} NOT completed. Score (${scorePercentage}%) is below 50%.`);
    return progress; 
  }

  const countryProgress = progress[country] || {};
  const topicProgress = countryProgress[topicId] || [];
  
  if (!topicProgress.includes(subLessonId)) {
    topicProgress.push(subLessonId);
    console.log(`[Store] ✅ Sub-lesson ${subLessonId} successfully added to completed list.`);
  } else {
    console.log(`[Store] ℹ️ Sub-lesson ${subLessonId} was already completed. Skipping array update.`);
  }
  
  cachedProgress = { ...progress, [country]: { ...countryProgress, [topicId]: topicProgress } };
  await storageSet(scopedKey('lesson-progress'), JSON.stringify(cachedProgress));
  
  console.log('[Store] Updated Lesson Progress saved to device storage:', JSON.stringify(cachedProgress));
  
  return cachedProgress;
}

export async function saveSubLessonPracticeScore(
  country,
  topicId,
  subLessonId,
  score,
  itemScores = [],
  stats = {}
) {
  console.log(`[Store] Saving practice score for ${subLessonId}: ${score}`);
  await loadPracticeScores();

  const countryScores = cachedPracticeScores[country] || {};
  const topicScores = countryScores[topicId] || {};
  const previous = topicScores[subLessonId] || {};
  cachedPracticeScores = {
    ...cachedPracticeScores,
    [country]: {
      ...countryScores,
      [topicId]: {
        ...topicScores,
        [subLessonId]: {
          ...previous,
          score: Math.max(Number(previous.score) || 0, Number(score) || 0),
          // An empty breakdown means "nothing new to report", not "erase the
          // best run", so a quiz-only sync can never wipe the stored items.
          itemScores: itemScores.length
            ? itemScores
            : (previous.itemScores ?? []),
          // Optional statistics from the speaking check + quiz split, kept so
          // the end-of-topic result screen can rebuild the numbers offline.
          quizScore: Math.max(Number(previous.quizScore) || 0, Number(stats.quizScore) || 0),
          speakingScore: Math.max(Number(previous.speakingScore) || 0, Number(stats.speakingScore) || 0),
          speakingAttempts: Math.max(Number(previous.speakingAttempts) || 0, Number(stats.speakingAttempts) || 0),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  await storageSet(
    scopedKey('practice-scores'),
    JSON.stringify(cachedPracticeScores)
  );
  
  console.log('[Store] Practice scores saved to device storage.');
  return cachedPracticeScores;
}

/*
 * Merge the quiz / pronunciation statistics of a sub-lesson without touching
 * the practice stage's own best score or its item breakdown.
 *
 * The end-of-topic result screen rebuilds its numbers from these fields, so they
 * stay best-ever: replaying a sub-lesson and scoring worse must not drag the
 * reported quiz or speaking average down.
 */
export async function saveSubLessonResultStats(
  country,
  topicId,
  subLessonId,
  stats = {}
) {
  await loadPracticeScores();

  const countryScores = cachedPracticeScores[country] || {};
  const topicScores = countryScores[topicId] || {};
  const previous = topicScores[subLessonId] || {};
  const best = (current, next) =>
    Math.max(Number(current) || 0, Number(next) || 0);

  cachedPracticeScores = {
    ...cachedPracticeScores,
    [country]: {
      ...countryScores,
      [topicId]: {
        ...topicScores,
        [subLessonId]: {
          ...previous,
          quizScore: best(previous.quizScore, stats.quizScore),
          speakingScore: best(previous.speakingScore, stats.speakingScore),
          speakingAttempts: best(
            previous.speakingAttempts,
            stats.speakingAttempts
          ),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  await storageSet(
    scopedKey('practice-scores'),
    JSON.stringify(cachedPracticeScores)
  );

  console.log('[Store] Sub-lesson result statistics saved to device storage.');
  return cachedPracticeScores;
}

/* ---------------------------------------------------------------------------
 * SPEAKING (PRONUNCIATION) SCORES
 *
 * One record per sub-lesson: the best pronunciation score the learner
 * reached in the speech check, how many attempts it took and when it was
 * last updated. The end-of-topic result screen and the backend topic-result
 * payload both read from here.
 * ------------------------------------------------------------------------- */
export async function loadSpeakingScores() {
  if (cachedSpeakingScores) return cachedSpeakingScores;

  try {
    const stored = await storageGet(scopedKey('speaking-scores'));
    cachedSpeakingScores = stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.log('[Store] Failed to read speaking scores, starting empty.', error);
    cachedSpeakingScores = {};
  }

  return cachedSpeakingScores;
}

/*
 * Record one completed pronunciation attempt. The best score never decreases
 * (a worse retry cannot lower a stored best) while attempts accumulate into a
 * lifetime total for the topic statistics.
 */
export async function saveSubLessonSpeakingScore(
  country,
  topicId,
  subLessonId,
  { score = 0, attempts = 0, passed = false } = {}
) {
  await loadSpeakingScores();

  const countryScores = cachedSpeakingScores[country] || {};
  const topicScores = countryScores[topicId] || {};
  const previous = topicScores[subLessonId] || {};
  const bestScore = Math.max(Number(previous.score) || 0, Number(score) || 0);

  cachedSpeakingScores = {
    ...cachedSpeakingScores,
    [country]: {
      ...countryScores,
      [topicId]: {
        ...topicScores,
        [subLessonId]: {
          score: bestScore,
          attempts: (Number(previous.attempts) || 0) + Math.max(0, Number(attempts) || 0),
          passed: Boolean(previous.passed) || Boolean(passed) || bestScore >= 70,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  try {
    await storageSet(
      scopedKey('speaking-scores'),
      JSON.stringify(cachedSpeakingScores)
    );
  } catch (error) {
    console.log('[Store] Failed to persist speaking score.', error);
  }

  console.log(`[Store] Speaking score saved for ${subLessonId}: ${bestScore}%`);
  return cachedSpeakingScores;
}

/* Best speaking record for one sub-lesson, or null when never attempted. */
export function getSubLessonSpeakingScore(speakingScores, country, topicId, subLessonId) {
  return speakingScores?.[country]?.[topicId]?.[subLessonId] ?? null;
}

export function getSubLessonPracticeScore(
  practiceScores,
  country,
  topicId,
  subLessonId
) {
  return practiceScores?.[country]?.[topicId]?.[subLessonId] ?? null;
}

export function getTopicProgress(progress, country, lesson) {
  const topicId = lesson?.id;
  const completed = Array.isArray(progress?.[country]?.[topicId]) ? progress[country][topicId] : [];
  const subLessons = Array.isArray(lesson?.subLessons) ? lesson.subLessons : [];

  return { completed, count: completed.length, total: subLessons.length };
}

export function isSubLessonLocked(progress, country, lesson, subLessonIndex = 0) {
  const subLessons = Array.isArray(lesson?.subLessons) ? lesson.subLessons : [];
  if (!subLessons.length) return false;

  const index = Number.parseInt(subLessonIndex, 10);
  if (Number.isNaN(index) || index <= 0) return false;

  const firstSubLesson = subLessons[0];
  if (!firstSubLesson?.id) return false;

  const completed = Array.isArray(progress?.[country]?.[lesson?.id])
    ? progress[country][lesson.id]
    : [];

  return !completed.includes(firstSubLesson.id);
}

export function lessonProgressFromServer(content, country = 'Canada') {
  const progress = {};
  noteServerBestScores(content);

  for (const item of content ?? []) {
    if (item?.contentType !== 'sublesson' || !item?.completed) continue;

    const result = findSubLessonById(item.contentKey);
    const topicId = result?.lesson?.id;
    if (!topicId) continue;

    const countryProgress = progress[country] ?? {};
    const completed = countryProgress[topicId] ?? [];
    if (completed.includes(item.contentKey)) continue;

    progress[country] = {
      ...countryProgress,
      [topicId]: [...completed, item.contentKey],
    };
  }

  return progress;
}
/* ---------------------------------------------------------------------------
 * PERCENTAGE HELPERS
 *
 * Journey and mission percentages are computed from the actual progress data:
 *   1. Lesson sub-lessons  -> the smallest completion unit (progress store).
 *   2. Missions            -> objectives resolved against the lesson catalog.
 *   3. Overall points      -> reward XP earned vs. the stage's total XP.
 * ------------------------------------------------------------------------- */

/*
 * Whether one specific sub-lesson has been completed.
 *
 * Unlike getTopicProgress (topic level), this checks the exact sub-lesson id,
 * so mission objectives only count once their own target sub-lesson is done.
 */
export function isSubLessonCompleted(progress, country, lesson, subLessonId) {
  if (!lesson?.id || !subLessonId) return false;

  const completed = Array.isArray(progress?.[country]?.[lesson.id])
    ? progress[country][lesson.id]
    : [];

  return completed.includes(subLessonId);
}

/*
 * Resolve a mission objective's targetId and check that exact sub-lesson.
 *
 * An objective is `completed` only when its sub-lesson is done AND its best
 * score reached MISSION_PASS_PERCENTAGE (80%), the mark the server checks
 * before paying the mission. `done` is the plain 50% completion, so screens
 * can say "done, but needs 80% for the mission".
 */
export function getObjectiveCompletion(progress, country, targetId) {
  const result = findSubLessonById(targetId);

  if (!result) {
    return { found: false, completed: false, done: false, bestScore: null, result: null };
  }

  const done = isSubLessonCompleted(progress, country, result.lesson, result.subLesson.id);
  const bestScore = getSubLessonBestScore(result.subLesson.id);

  return {
    found: true,
    done,
    bestScore,
    completed: done && (bestScore ?? 0) >= MISSION_PASS_PERCENTAGE,
    result,
  };
}

/*
 * Mission progress as { completed, total, percent }.
 *
 * A claimed mission is always 100% complete, even when sub-lesson
 * progress has not been synchronized to the device yet.
 */
export function getMissionProgress(
  mission,
  progress,
  country,
  claimed = false
) {
  const objectives = mission?.objectives ?? [];
  const total = objectives.length;

  const completed = claimed
    ? total
    : objectives.reduce(
        (count, objective) =>
          getObjectiveCompletion(progress, country, objective.targetId)
            .completed
            ? count + 1
            : count,
        0
      );

  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/*
 * Stage (journey) progress, blended from the stage's real data:
 *
 *   - sub-lessonPercent : completed sub-lessons / all sub-lessons in the module.
 *   - missionPercent    : completed missions / all missions in the stage.
 *   - overallPercent    : average of both, shown as the journey percentage.
 *   - earnedPoints      : reward XP collected vs. the stage's total reward XP.
 */
export function getStageProgress(
  stageModule,
  missions,
  progress,
  country,
  claimedMissions = []
) {
  const lessons = stageModule?.lessons ?? [];

  const totalSubLessons = lessons.reduce(
    (count, lesson) => count + (lesson.subLessons?.length ?? 0),
    0
  );

  const completedSubLessons = lessons.reduce(
    (count, lesson) =>
      count +
      (lesson.subLessons ?? []).filter((subLesson) =>
        isSubLessonCompleted(progress, country, lesson, subLesson.id)
      ).length,
    0
  );

  const subLessonPercent =
    totalSubLessons > 0
      ? Math.round((completedSubLessons / totalSubLessons) * 100)
      : 0;

  const totalMissions = missions.length;

  const completedMissions = missions.reduce((count, mission) => {
    const isDone =
      getMissionProgress(
        mission,
        progress,
        country,
        isMissionClaimed(mission.id, claimedMissions)
      ).percent === 100;

    return isDone ? count + 1 : count;
  }, 0);

  const missionPercent =
    totalMissions > 0
      ? Math.round((completedMissions / totalMissions) * 100)
      : 0;

  const totalPoints = missions.reduce(
    (total, mission) => total + (mission.rewards?.xp ?? 0),
    0
  );

  const earnedPoints = missions.reduce((total, mission) => {
    const isDone =
      getMissionProgress(
        mission,
        progress,
        country,
        isMissionClaimed(mission.id, claimedMissions)
      ).percent === 100;

    return isDone ? total + (mission.rewards?.xp ?? 0) : total;
  }, 0);

  return {
    completedSubLessons,
    totalSubLessons,
    subLessonPercent,
    completedMissions,
    totalMissions,
    missionPercent,
    earnedPoints,
    totalPoints,
    overallPercent: Math.round((subLessonPercent + missionPercent) / 2),
  };
}

/* ---------------------------------------------------------------------------
 * MISSION REWARD CLAIMS
 *
 * The backend owns mission claims (POST /missions/claim). These helpers mirror
 * the claims locally so the UI keeps showing "Collected" when the device is
 * offline or when a progress fetch fails.
 * ------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
 * MISSION REWARD CLAIMS
 *
 * The backend owns mission claims (POST /missions/claim). These helpers mirror
 * the claims locally so the UI keeps showing "Collected" when the device is
 * offline or when a progress fetch fails.
 * ------------------------------------------------------------------------- */

export async function loadClaimedMissions() {
  if (cachedClaimedMissions) return cachedClaimedMissions;

  try {
    const stored = await storageGet(scopedKey('claimed-missions'));
    const parsed = stored ? JSON.parse(stored) : [];
    cachedClaimedMissions = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('[Store] Failed to read claimed missions, starting empty.', error);
    cachedClaimedMissions = [];
  }

  console.log('[Store] Claimed missions loaded:', cachedClaimedMissions);
  return cachedClaimedMissions;
}

export async function saveClaimedMission(missionId) {
  const claimed = await loadClaimedMissions();

  if (!missionId || claimed.includes(missionId)) {
    console.log(`[Store] Mission ${missionId} was already claimed locally.`);
    return claimed;
  }

  cachedClaimedMissions = [...claimed, missionId];

  try {
    await storageSet(
      scopedKey('claimed-missions'),
      JSON.stringify(cachedClaimedMissions)
    );
    console.log('[Store] Claimed mission stored locally:', missionId);
  } catch (error) {
    console.log('[Store] Failed to persist claimed mission locally.', error);
  }

  return cachedClaimedMissions;
}

/*
 * Map the `/progress` payload into the mission ids used by the frontend.
 *
 * The API returns mission rows as `{ lessonId: 3, completed: true, ... }`,
 * while the mission catalog uses "mission-3" keys.
 */
export function claimedMissionsFromServer(lessons) {
  if (!Array.isArray(lessons)) return [];

  return lessons
    .filter((item) => item?.completed)
    .map((item) => getMissionKeyFromNumber(item?.lessonId ?? item?.missionId))
    .filter(Boolean);
}

export function isMissionClaimed(missionId, claimedMissions) {
  return Array.isArray(claimedMissions) && claimedMissions.includes(missionId);
}

/*
 * Combine several claim lists (server + local storage) into one unique list.
 */
export function mergeClaimedMissions(...collections) {
  const merged = new Set();

  collections.forEach((collection) => {
    (Array.isArray(collection) ? collection : []).forEach((missionId) => {
      if (missionId) merged.add(missionId);
    });
  });

  return [...merged];
}

export async function saveLastPlayedTopic(country, topicId, subLessonIndex = '0') {
  try {
    const data = JSON.stringify({
      country,
      topicId,
      subLessonIndex: String(subLessonIndex),
      timestamp: new Date().toISOString()
    });
    await storageSet(scopedKey('last-played-topic'), data);
    console.log(`[Store] Last played topic saved: ${country} - ${topicId} (SubLesson: ${subLessonIndex})`);
  } catch (error) {
    console.log('[Store] Failed to save last played topic.', error);
  }
}

export async function loadLastPlayedTopic() {
  try {
    const stored = await storageGet(scopedKey('last-played-topic'));
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.log('[Store] Failed to load last played topic.', error);
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * MODULE QUIZ RESULTS
 *
 * The module gate (src/data/challenges/moduleGate.js) needs to know whether
 * the final quiz of a module was passed. The score lives on the server after
 * a POST /assessments/:key/attempts, so the result screen mirrors a passing
 * attempt locally (best score kept) to keep the gate working offline.
 * ------------------------------------------------------------------------- */
const MODULE_QUIZ_SUFFIX = 'module-quiz-results';
let cachedModuleQuizResults = null;

export async function loadModuleQuizResults() {
  if (cachedModuleQuizResults) return cachedModuleQuizResults;

  try {
    const stored = await storageGet(scopedKey(MODULE_QUIZ_SUFFIX));
    cachedModuleQuizResults = stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.log('[Store] Failed to read module quiz results, starting empty.', error);
    cachedModuleQuizResults = {};
  }

  console.log('[Store] Module quiz results loaded:', cachedModuleQuizResults);
  return cachedModuleQuizResults;
}

/*
 * Record a module quiz attempt. Only the best percentage is kept, so a
 * replay can never lower the gate.
 */
export async function saveModuleQuizResult(moduleId, percentage = 0) {
  if (!moduleId) return loadModuleQuizResults();

  await loadModuleQuizResults();

  const best = Math.max(
    Number(cachedModuleQuizResults?.[moduleId]?.percentage) || 0,
    Number(percentage) || 0
  );

  cachedModuleQuizResults = {
    ...cachedModuleQuizResults,
    [moduleId]: {
      percentage: best,
      updatedAt: new Date().toISOString(),
    },
  };

  try {
    await storageSet(
      scopedKey(MODULE_QUIZ_SUFFIX),
      JSON.stringify(cachedModuleQuizResults)
    );
    console.log(`[Store] Module quiz result saved: ${moduleId} (${best}%).`);
  } catch (error) {
    console.log('[Store] Failed to persist module quiz result.', error);
  }

  return cachedModuleQuizResults;
}

/* ---------------------------------------------------------------------------
 * SERVER -> DEVICE RECONCILIATION
 *
 * The server is authoritative for XP, level and streaks; the device keeps a
 * mirror of *completions* and *best scores* so the app still works offline.
 * When the sync engine pulls `GET /progress`, these helpers fold that payload
 * into the local mirror using the same rules the server applies on the way up:
 *
 *   - a completion is a union (once done, always done),
 *   - a score keeps the best value ever seen.
 *
 * Nothing here ever lowers local progress, so a pull can never erase offline
 * work; the two progress pictures only ever grow toward each other.
 * ------------------------------------------------------------------------- */

/**
 * Union server-completed sub-lessons into the local progress mirror. The
 * country bucket comes from the module the sub-lesson belongs to, which is how
 * a single global pull can populate every country's list.
 */
export async function mergeServerContentIntoLocal(content) {
  const progress = { ...(await loadLessonProgress()) };
  noteServerBestScores(content);
  let changed = false;

  for (const item of content ?? []) {
    if (item?.contentType !== 'sublesson' || !item?.completed) continue;

    const found = findSubLessonById(item.contentKey);
    const topicId = found?.lesson?.id;
    if (!topicId) continue;

    const country = getCountryForModule(found?.module?.id);
    const countryProgress = progress[country] ?? {};
    const completed = Array.isArray(countryProgress[topicId])
      ? [...countryProgress[topicId]]
      : [];

    if (!completed.includes(item.contentKey)) {
      completed.push(item.contentKey);
      progress[country] = { ...countryProgress, [topicId]: completed };
      changed = true;
    }
  }

  if (changed) {
    cachedProgress = progress;
    await storageSet(scopedKey('lesson-progress'), JSON.stringify(progress));
    console.log('[Store] Merged server completions into local progress mirror.');
  }

  return progress;
}

/**
 * Raise local final-quiz results (`module-N`) to the server's best percentage.
 * Best-value-wins, so it can never lower a result earned on this device.
 */
export async function mergeServerModuleQuizResults(assessments) {
  if (!assessments || typeof assessments !== 'object') return loadModuleQuizResults();

  const local = await loadModuleQuizResults();
  const next = { ...local };
  let changed = false;

  for (const [key, value] of Object.entries(assessments)) {
    if (!String(key).startsWith('module-')) continue;
    const percentage = Math.round(Number(value));
    if (!Number.isFinite(percentage)) continue;
    if (percentage > (Number(local?.[key]?.percentage) || 0)) {
      next[key] = { percentage, updatedAt: new Date().toISOString() };
      changed = true;
    }
  }

  if (changed) {
    cachedModuleQuizResults = next;
    try {
      await storageSet(scopedKey(MODULE_QUIZ_SUFFIX), JSON.stringify(next));
      console.log('[Store] Merged server final-quiz results into local mirror.');
    } catch (error) {
      // Still applied in memory for this run; the next pull retries the write.
      console.log('[Store] Failed to persist server final-quiz results.', error);
    }
  }

  return cachedModuleQuizResults;
}

/** Union server mission claims into the local claimed-missions list. */
export async function mergeClaimedMissionsIntoLocal(missionIds) {
  const claimed = await loadClaimedMissions();
  const merged = mergeClaimedMissions(claimed, missionIds);

  if (merged.length !== claimed.length) {
    cachedClaimedMissions = merged;
    await storageSet(scopedKey('claimed-missions'), JSON.stringify(merged));
    console.log('[Store] Merged server mission claims into local mirror.');
  }

  return merged;
}

/**
 * Fold a full `GET /progress` payload into the local mirrors. Safe to call on
 * every sync: it is purely additive and best-value-wins.
 */
export async function applyServerProgress(serverProgress) {
  if (!serverProgress || typeof serverProgress !== 'object') return;

  await mergeServerContentIntoLocal(serverProgress.content);

  /*
   * Final-quiz results are half of what makes a map stop "done" (see
   * data/lessons/nodeProgress.js). They used to come back only through the
   * background sync, so after a reinstall / cleared data the home screen read
   * an empty quiz store and showed finished stops as "in progress" again.
   */
  await mergeServerModuleQuizResults(serverProgress.assessments);

  const serverClaims = claimedMissionsFromServer(serverProgress.lessons);
  if (serverClaims.length) {
    await mergeClaimedMissionsIntoLocal(serverClaims);
  }
}
