/*
|--------------------------------------------------------------------------
| MODULE DAILY CHALLENGE (spotlight with extra points)
|--------------------------------------------------------------------------
| A separate daily challenge generator for the challenge screen. Every day
| it deterministically picks ONE topic from the modules the player has
| already unlocked (see moduleGate.js) and turns it into a bonus challenge:
|
|   - the pick is seeded with the date, so it is stable for the whole day
|     and rotates automatically at midnight,
|   - only unlocked module topics can be selected (the course gate also
|     applies here), so the bonus always revisits content the player can
|     actually open,
|   - it pays EXTRA points on top of the regular daily set: its rewards sit
|     clearly above the warm-up/core/stretch pool,
|   - progress is topic-specific: finishing any sub-lesson of the
|     spotlighted topic today (score >= 50%) clears it.
|
| The challenge follows the same conventions as challengeCatalog.js: it
| never stores its own state — progress is computed from the gameplay
| events recorded by src/store/challenge-progress.js.
|--------------------------------------------------------------------------
*/

import { NODE_PASS_PERCENTAGE, PASSING_PERCENTAGE } from '@/services/scoring';
import {
  BAND_REWARDS,
  CHALLENGE_BANDS,
  CHALLENGE_TIERS,
  createSeededRandom,
  hashString,
  toDateKey,
} from '@/data/challenges/challengeCatalog';
import {
  getCountryForModule,
  lessonCatalog,
} from '@/data/lessons/catalog';

/* Same size as a stretch challenge (see BAND_REWARDS). */
export const MODULE_DAILY_REWARDS = { ...BAND_REWARDS[CHALLENGE_BANDS.SPOTLIGHT] };

/*
 * Score a spotlight sub-lesson needs: a weak-topic spotlight asks for mastery
 * (80%), a review spotlight for a pass (50%).
 */
const SPOTLIGHT_PASS_SCORE = PASSING_PERCENTAGE;
const WEAK_SPOTLIGHT_PASS_SCORE = NODE_PASS_PERCENTAGE;

/*
 * The daily module challenge for a given day, picked from the unlocked
 * modules only. Returns null when no module is available (never in practice,
 * module-1 is always unlocked).
 */
export function getDailyModuleChallenge(
  date = new Date(),
  unlockedModuleIds = [],
  { weakTopics = [], pinnedTopicId = null } = {}
) {
  const dateKey = toDateKey(date);

  const modules = (Array.isArray(unlockedModuleIds) ? unlockedModuleIds : [])
    .map((moduleId) =>
      lessonCatalog.find((module) => module.id === moduleId)
    )
    .filter(Boolean);

  /* Build the topic pool from every unlocked module. */
  const pool = [];

  modules.forEach((module) => {
    const country = getCountryForModule(module.id);

    (module.lessons ?? []).forEach((topic) => {
      pool.push({
        moduleId: module.id,
        moduleTitle: module.title?.trim() ?? module.id,
        flag: module.flag ?? '🇫🇷',
        country,
        topic,
      });
    });
  });

  if (!pool.length) return null;

  /*
   * Weak topics first: when the learner has any, the spotlight is one of the
   * three weakest (seeded by the date, so it varies day to day). Once picked,
   * the topic is pinned for the whole day (`pinnedTopicId`), so fixing it
   * does not swap the spotlight for another topic mid-day.
   */
  const weakById = new Map((weakTopics ?? []).map((weak) => [weak.topic.id, weak]));
  const random = createSeededRandom(hashString(`module-daily::${dateKey}`));

  let pick = pinnedTopicId ? pool.find((entry) => entry.topic.id === pinnedTopicId) : null;
  if (!pick) {
    const weakPool = (weakTopics ?? [])
      .slice(0, 3)
      .map((weak) => pool.find((entry) => entry.topic.id === weak.topic.id))
      .filter(Boolean);
    const source = weakPool.length ? weakPool : pool;
    pick = source[Math.floor(random() * source.length)] ?? source[0];
  }

  const weak = weakById.get(pick.topic.id) ?? null;
  const isWeak = Boolean(weak);
  const passScore = isWeak ? WEAK_SPOTLIGHT_PASS_SCORE : SPOTLIGHT_PASS_SCORE;
  const startIndex = isWeak ? weak.subLessonIndex ?? 0 : 0;

  const subLessons = Array.isArray(pick.topic.subLessons)
    ? pick.topic.subLessons
    : [];

  return {
    id: `module-daily-${dateKey}`,
    tier: CHALLENGE_TIERS.DAILY,
    difficulty: CHALLENGE_BANDS.SPOTLIGHT,
    category: isWeak ? 'Weak Spot Spotlight' : 'Module Spotlight',
    icon: pick.topic.icon ?? '📚',

    title: pick.topic.title,
    description: isWeak
      ? `Your weakest topic right now is "${pick.topic.title}". Score ${passScore}% or more on one of its sub-lessons to turn it into a strength.`
      : `Today's spotlight reviews "${pick.topic.title}" from ${pick.moduleTitle}. Pass any sub-lesson of this topic (${passScore}%+) to keep it fresh.`,

    tip: `${pick.flag} ${pick.moduleTitle} • any sub-lesson of the topic counts`,
    passScore,
    isWeakSpot: isWeak,

    metric: 'subLessons',
    target: 1,
    rewards: { ...MODULE_DAILY_REWARDS },

    /* Same CTA type as the regular pool — deep-links into real content. */
    cta: 'sublesson',

    /* Where this exact challenge sends the player. */
    moduleId: pick.moduleId,
    country: pick.country,
    topicId: pick.topic.id,
    topicTitle: pick.topic.title,
    subLessonIndex: subLessons.length ? startIndex : null,
    moduleTitle: pick.moduleTitle,
    flag: pick.flag,

    directRoute: {
      pathname: '/sublesson',
      params: {
        country: pick.country,
        module: pick.moduleId,
        topicId: pick.topic.id,
        subLessonIndex: String(startIndex),
      },
    },
  };
}

/*
 * Topic-specific progress for the spotlight: the challenge clears when at
 * least one sub-lesson OF the spotlighted topic was finished today with a
 * passing score. Replays count, so reviewing old topics still pays.
 */
export function resolveModuleChallengeProgress(
  state,
  challenge,
  { dateKey } = {}
) {
  const bucket = state?.days?.[dateKey];
  const entries = Array.isArray(bucket?.subLessons) ? bucket.subLessons : [];

  const target = Math.max(1, Number(challenge?.target) || 1);
  const matching = entries.filter(
    (entry) =>
      entry?.topicId === challenge?.topicId &&
      (Number(entry.score) || 0) >= (Number(challenge?.passScore) || SPOTLIGHT_PASS_SCORE)
  );

  const rawValue = matching.length;
  const value = Math.min(target, rawValue);

  return {
    value,
    rawValue,
    target,
    percent: Math.round((value / target) * 100),
    completed: rawValue >= target,
    metrics: null,
  };
}
