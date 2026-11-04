/*
|--------------------------------------------------------------------------
| CHALLENGE CATALOG (daily + weekly quests)
|--------------------------------------------------------------------------
| Every day the player is assigned a balanced set of three daily
| challenges (one WARM-UP, one CORE, one STRETCH) plus one weekly goal.
|
| The assignment is derived from the calendar date with a seeded random
| generator, so:
|   1. everybody sees the same challenges on the same day, and
|   2. the set changes automatically when the local day rolls over
|      (see getNextDailyReset / the countdown hook).
|
| A challenge never stores its own state. It only declares:
|   - `metric`   : which tracked value feeds the progress bar, or
|   - `evaluate` : a custom function for combo challenges.
| `target` is the value the metric has to reach to clear the challenge.
|
| Metrics are produced by src/store/challenge-progress.js from real
| gameplay events (sub-lesson completions, quiz/speaking scores and
| mission claims), so a challenge cannot be cleared by tapping a button.
|--------------------------------------------------------------------------
*/

export const CHALLENGE_TIERS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
};

export const CHALLENGE_BANDS = {
  WARMUP: 'warmup',
  CORE: 'core',
  STRETCH: 'stretch',
  /* Used by the module daily challenge (moduleDailyChallenge.js) only —
     never part of the DAILY_BANDS draw below. */
  SPOTLIGHT: 'spotlight',
};

/*
 * Order of the daily bands. One challenge of each band is picked every day,
 * which keeps the daily set fast to clear but still rewarding to finish.
 */
const DAILY_BANDS = [
  CHALLENGE_BANDS.WARMUP,
  CHALLENGE_BANDS.CORE,
  CHALLENGE_BANDS.STRETCH,
];

const BAND_LABELS = {
  [CHALLENGE_BANDS.WARMUP]: 'Warm-up',
  [CHALLENGE_BANDS.CORE]: 'Core',
  [CHALLENGE_BANDS.STRETCH]: 'Stretch',
  [CHALLENGE_BANDS.SPOTLIGHT]: 'Spotlight',
};

export const getChallengeBandLabel = (band) => BAND_LABELS[band] ?? 'Quest';

/* Where a challenge sends the player when they tap "Start". */
const CTA = {
  SUBLESSON: 'sublesson',
  LESSON: 'lesson',
  MISSION: 'mission',
  JOURNEY: 'journey',
  /* The learner's weakest topic (see data/challenges/weakTopics.js). */
  WEAK_TOPIC: 'weak-topic',
};

/*
|--------------------------------------------------------------------------
| REWARDS
|--------------------------------------------------------------------------
| Challenge rewards are REAL: the server pays them into the learner's XP and
| coins (POST /challenges/claim) and records every claim for the research
| dashboard. They are deliberately small next to learning itself - a
| sub-lesson pays up to 30 XP and a mission 50 XP - so challenges steer what
| to practise without becoming the main source of XP. A full day (three
| challenges, the chest and the spotlight) is worth 55 XP.
|
| The server reads these numbers from Backend/services/gamification_catalog.json,
| generated from this file (see src/data/__tests__/gamification-catalog.test.js).
|--------------------------------------------------------------------------
*/
export const BAND_REWARDS = {
  [CHALLENGE_BANDS.WARMUP]: { xp: 5, coins: 3 },
  [CHALLENGE_BANDS.CORE]: { xp: 10, coins: 5 },
  [CHALLENGE_BANDS.STRETCH]: { xp: 15, coins: 8 },
  [CHALLENGE_BANDS.SPOTLIGHT]: { xp: 15, coins: 5 },
};
export const WEEKLY_REWARDS = { xp: 40, coins: 20 };
export const DAILY_CHEST_REWARDS = { xp: 10, coins: 5 };
export const WEEKLY_CHEST_REWARDS = { xp: 20, coins: 10 };

/*
|--------------------------------------------------------------------------
| DAILY POOL
|--------------------------------------------------------------------------
| Every challenge is about learning French, and only learning counts:
|   - a sub-lesson counts once it is PASSED (50%+), never a failed attempt;
|   - review counts when it reaches 80% (mastery), not for replaying;
|   - "weak spot" challenges reward lifting a lesson you scored under 80%
|     to 80%+ - the same mark missions and the next stop need.
|--------------------------------------------------------------------------
*/
const daily = (band, fields) => ({
  tier: CHALLENGE_TIERS.DAILY,
  difficulty: band,
  rewards: BAND_REWARDS[band],
  ...fields,
});

export const dailyChallengeTemplates = [
  /* ---------------------------- WARM-UPS ---------------------------- */
  daily(CHALLENGE_BANDS.WARMUP, {
    id: 'daily-warmup-sprint',
    category: 'Warm-up',
    icon: '🎯',
    title: 'Warm-up Sprint',
    description: 'Pass one sub-lesson (50% or more) to start the day in French.',
    tip: 'Keep it short, but finish it with a passing score.',
    metric: 'subLessons',
    target: 1,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.WARMUP, {
    id: 'daily-streak-keeper',
    category: 'Habit',
    icon: '🔥',
    title: 'Streak Keeper',
    description: 'Pass one sub-lesson today so your streak stays alive.',
    tip: 'One passed lesson a day is how vocabulary sticks.',
    metric: 'activeToday',
    target: 1,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.WARMUP, {
    id: 'daily-voice-check',
    category: 'Speaking',
    icon: '🗣️',
    title: 'Voice Check',
    description: 'Say a lesson’s phrases with 70% pronunciation accuracy or better.',
    tip: 'Listen once, then speak slowly — accuracy beats speed.',
    metric: 'speakingRounds',
    target: 1,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.WARMUP, {
    id: 'daily-quick-win',
    category: 'Accuracy',
    icon: '⚡',
    title: 'Quick Win',
    description: 'Master a sub-lesson: score 80% or more.',
    tip: 'Read the lesson cards before the quiz to lock in the answers.',
    metric: 'bestScore',
    target: 80,
    cta: CTA.SUBLESSON,
  }),

  /* ------------------------------ CORE ------------------------------ */
  daily(CHALLENGE_BANDS.CORE, {
    id: 'daily-weak-spot',
    category: 'Weak spot',
    icon: '🩹',
    title: 'Fix a Weak Spot',
    description: 'Take a sub-lesson you scored under 80% and reach 80% or more.',
    tip: 'Start opens your weakest topic. Review its cards first.',
    metric: 'improved',
    target: 1,
    cta: CTA.WEAK_TOPIC,
  }),
  daily(CHALLENGE_BANDS.CORE, {
    id: 'daily-new-ground',
    category: 'New words',
    icon: '🌱',
    title: 'New Ground',
    description: 'Pass a sub-lesson you have never finished before.',
    tip: 'New vocabulary sticks best when you use it the same day.',
    metric: 'newLessons',
    target: 1,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.CORE, {
    id: 'daily-double-down',
    category: 'Practice',
    icon: '🧩',
    title: 'Double Down',
    description: 'Pass two sub-lessons today.',
    tip: 'Two short sessions beat one long one.',
    metric: 'subLessons',
    target: 2,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.CORE, {
    id: 'daily-quiz-sniper',
    category: 'Quiz',
    icon: '🧠',
    title: 'Quiz Sniper',
    description: 'Average 85% or better across the quizzes you take today.',
    tip: 'Sentence Builder questions are worth double points.',
    metric: 'quizAccuracy',
    target: 85,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.CORE, {
    id: 'daily-voice-training',
    category: 'Speaking',
    icon: '🎙️',
    title: 'Voice Training',
    description: 'Pronounce two lessons’ phrases with 70%+ accuracy.',
    tip: 'Shadow the audio once, then record yourself.',
    metric: 'speakingRounds',
    target: 2,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.CORE, {
    id: 'daily-memory-refresh',
    category: 'Review',
    icon: '🔁',
    title: 'Memory Refresh',
    description: 'Review a sub-lesson you already finished and score 80% or more.',
    tip: 'Reviewing yesterday’s words is what moves them to long-term memory.',
    metric: 'replays',
    target: 1,
    cta: CTA.LESSON,
  }),
  daily(CHALLENGE_BANDS.CORE, {
    id: 'daily-mission-collector',
    category: 'Mission',
    icon: '🏅',
    title: 'Mission Collector',
    description: 'Complete a mission: every objective at 80% or more.',
    tip: 'Open the journey map and finish the mission you are on.',
    metric: 'missionClaims',
    target: 1,
    cta: CTA.MISSION,
  }),

  /* ----------------------------- STRETCH ---------------------------- */
  daily(CHALLENGE_BANDS.STRETCH, {
    id: 'daily-weak-spot-duo',
    category: 'Weak spot',
    icon: '💪',
    title: 'Weak Spot Duo',
    description: 'Lift two sub-lessons from under 80% to 80% or more.',
    tip: 'Your weakest topics are where each point of practice counts most.',
    metric: 'improved',
    target: 2,
    cta: CTA.WEAK_TOPIC,
  }),
  daily(CHALLENGE_BANDS.STRETCH, {
    id: 'daily-precision-pair',
    category: 'Accuracy',
    icon: '🎖️',
    title: 'Precision Pair',
    description: 'Score 90% or better on two sub-lessons.',
    tip: 'Read every card aloud before the quiz.',
    metric: 'perfectScores',
    target: 2,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.STRETCH, {
    id: 'daily-topic-trio',
    category: 'Range',
    icon: '🗺️',
    title: 'Topic Trio',
    description: 'Pass sub-lessons in three different topics today.',
    tip: 'Mix one new topic with two you already know.',
    metric: 'topics',
    target: 3,
    cta: CTA.LESSON,
  }),
  daily(CHALLENGE_BANDS.STRETCH, {
    id: 'daily-marathon',
    category: 'Practice',
    icon: '🚀',
    title: 'Marathon',
    description: 'Pass four sub-lessons in one day.',
    tip: 'Short breaks between lessons keep your accuracy high.',
    metric: 'subLessons',
    target: 4,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.STRETCH, {
    id: 'daily-flawless-run',
    category: 'Accuracy',
    icon: '💯',
    title: 'Flawless Run',
    description: 'Score 95% or better on any sub-lesson.',
    tip: 'Slow down on Sentence Builder questions.',
    metric: 'bestScore',
    target: 95,
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.STRETCH, {
    id: 'daily-triple-threat',
    category: 'Combo',
    icon: '🎭',
    title: 'Triple Threat',
    description: 'Pass two sub-lessons and pronounce one at 70%+.',
    tip: 'A lesson that includes speaking counts for both steps.',
    target: 3,
    evaluate: (metrics) =>
      Math.min(metrics.subLessons, 2) + Math.min(metrics.speakingRounds, 1),
    cta: CTA.SUBLESSON,
  }),
  daily(CHALLENGE_BANDS.STRETCH, {
    id: 'daily-steady-hand',
    category: 'Combo',
    icon: '🧭',
    title: 'Steady Hand',
    description: 'Three sub-lessons at 85% or better.',
    tip: 'Consistency is what really pushes your level up.',
    target: 3,
    evaluate: (metrics) => Math.min(metrics.highScores, 3),
    cta: CTA.SUBLESSON,
  }),
];

/*
|--------------------------------------------------------------------------
| WEEKLY POOL
|--------------------------------------------------------------------------
| Longer objectives picked once per ISO week (Monday -> Sunday).
|--------------------------------------------------------------------------
*/
const weekly = (fields) => ({
  tier: CHALLENGE_TIERS.WEEKLY,
  category: 'Weekly goal',
  rewards: WEEKLY_REWARDS,
  ...fields,
});

export const weeklyChallengeTemplates = [
  weekly({
    id: 'weekly-five-lessons',
    icon: '📅',
    title: 'Weekly Five',
    description: 'Pass five sub-lessons before the week ends.',
    metric: 'subLessons',
    target: 5,
    cta: CTA.SUBLESSON,
  }),
  weekly({
    id: 'weekly-weak-spots',
    icon: '🩹',
    title: 'Weak Spots, Fixed',
    description: 'Lift three sub-lessons from under 80% to 80% or more.',
    metric: 'improved',
    target: 3,
    cta: CTA.WEAK_TOPIC,
  }),
  weekly({
    id: 'weekly-perfectionist',
    icon: '🏆',
    title: 'Perfectionist Week',
    description: 'Score 90% or better on four sub-lessons.',
    metric: 'perfectScores',
    target: 4,
    cta: CTA.SUBLESSON,
  }),
  weekly({
    id: 'weekly-new-words',
    icon: '🌱',
    title: 'New Words Week',
    description: 'Pass three sub-lessons you have never finished before.',
    metric: 'newLessons',
    target: 3,
    cta: CTA.SUBLESSON,
  }),
  weekly({
    id: 'weekly-confident-speaker',
    icon: '🎤',
    title: 'Confident Speaker',
    description: 'Pronounce three lessons’ phrases with 70%+ accuracy.',
    metric: 'speakingRounds',
    target: 3,
    cta: CTA.SUBLESSON,
  }),
  weekly({
    id: 'weekly-mission-hunter',
    icon: '🎖️',
    title: 'Mission Hunter',
    description: 'Complete two missions (every objective at 80%+).',
    metric: 'missionClaims',
    target: 2,
    cta: CTA.MISSION,
  }),
];

/*
|--------------------------------------------------------------------------
| BONUS CHESTS
|--------------------------------------------------------------------------
| Unlocked by clearing the whole assigned set (daily) / the weekly goal.
|--------------------------------------------------------------------------
*/
export const dailyChallengeChest = {
  id: 'daily-chest',
  tier: CHALLENGE_TIERS.DAILY,
  category: 'Bonus',
  icon: '🎁',
  title: 'Daily Chest',
  description: 'Clear all three daily challenges to open it.',
  rewards: DAILY_CHEST_REWARDS,
};

export const weeklyChallengeChest = {
  id: 'weekly-chest',
  tier: CHALLENGE_TIERS.WEEKLY,
  category: 'Bonus',
  icon: '🗝️',
  title: 'Weekly Chest',
  description: 'Finish the weekly goal to open it.',
  rewards: WEEKLY_CHEST_REWARDS,
};

export const challengeCatalog = [
  ...dailyChallengeTemplates,
  ...weeklyChallengeTemplates,
];

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

/* Local calendar day key, e.g. 2026-09-22. Days roll over at local midnight. */
export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateFromKey(dateKey) {
  const [year, month, day] = String(dateKey ?? '')
    .split('-')
    .map((value) => Number.parseInt(value, 10));

  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
}

/* Next local midnight: the moment the daily challenges are reassigned. */
export function getNextDailyReset(date = new Date()) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    0,
    0,
    0,
    0
  );
}

/* ISO week key, e.g. 2026-W39 (weeks start on Monday). */
export function getWeekKey(date = new Date()) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = (target.getDay() + 6) % 7; // Monday = 0
  target.setDate(target.getDate() - dayIndex + 3); // Thursday of this week

  const isoYear = target.getFullYear();
  const firstThursday = new Date(isoYear, 0, 4);
  const firstDayIndex = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayIndex + 3);

  const week =
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

/* Next Monday at 00:00: the moment the weekly challenge is reassigned. */
export function getNextWeeklyReset(date = new Date()) {
  const dayIndex = (date.getDay() + 6) % 7; // Monday = 0
  const daysUntilMonday = 7 - dayIndex;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + daysUntilMonday,
    0,
    0,
    0,
    0
  );
}

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/* Human label for a day key: "Tuesday, 22 September". */
export function formatDateLabel(dateKey) {
  const date = getDateFromKey(dateKey);
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} ${
    MONTH_NAMES[date.getMonth()]
  }`;
}

/* Sunday of the current ISO week, used for "ends Sunday" hints. */
export function getWeekEndLabel(date = new Date()) {
  const dayIndex = (date.getDay() + 6) % 7; // Monday = 0
  const sunday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - dayIndex + 6
  );

  return `${WEEKDAY_NAMES[sunday.getDay()]} ${sunday.getDate()} ${
    MONTH_NAMES[sunday.getMonth()]
  }`;
}

/*
|--------------------------------------------------------------------------
| SEEDED SELECTION
|--------------------------------------------------------------------------
| Deterministic per day/week so the assignment is stable for everybody and
| always changes when the calendar moves on.
|--------------------------------------------------------------------------
*/

/* FNV-1a hash: turns a day/week key into a 32 bit seed. */
export function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/* Small xorshift32 generator: the same seed always yields the same sequence. */
export function createSeededRandom(seed) {
  let state = seed >>> 0 || 0x9e3779b9;

  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;

    return state / 4294967296;
  };
}

function pickFrom(pool, random) {
  if (!pool.length) return null;
  return pool[Math.floor(random() * pool.length)] ?? pool[0];
}

/*
 * The three challenges assigned to a given day (one per band).
 *
 * The day key is the seed, so the set is stable while the day lasts and
 * rotates automatically at local midnight.
 */
/*
|--------------------------------------------------------------------------
| SELECTION
|--------------------------------------------------------------------------
*/
export function getDailyChallenges(date = new Date()) {
  const dateKey = toDateKey(date);
  const random = createSeededRandom(hashString(`daily::${dateKey}`));

  return DAILY_BANDS.map((band) =>
    pickFrom(
      dailyChallengeTemplates.filter((item) => item.difficulty === band),
      random
    )
  ).filter(Boolean);
}

/* The weekly goal assigned to a given ISO week (rotates every Monday). */
export function getWeeklyChallenge(date = new Date()) {
  const weekKey = getWeekKey(date);
  const random = createSeededRandom(hashString(`weekly::${weekKey}`));

  return pickFrom(weeklyChallengeTemplates, random);
}

/*
 * Everything the challenge screen (and the home card) needs for a date:
 * the three dailies, the weekly goal and the two keys that drive progress.
 */
export function getChallengeCycle(date = new Date()) {
  return {
    dateKey: toDateKey(date),
    weekKey: getWeekKey(date),
    dailyChallenges: getDailyChallenges(date),
    weeklyChallenge: getWeeklyChallenge(date),
  };
}
