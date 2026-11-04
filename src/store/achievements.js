/**
 * ---------------------------------------------------------------------------
 * ACHIEVEMENT SUMMARY
 *
 * A pure selector that turns the device mirrors into the motivational summary
 * the Achievements screen renders. It lives in `store/` (not in the screen) so
 * every number can be unit-tested without mounting a component.
 *
 * WHY THIS IS CLIENT-SIDE
 *
 * `GET /achievements` currently answers with `'badges': [], 'nextGoal': None`
 * (see Backend/routes/player.py), so the screen had nothing to show. Building
 * the summary from the local stores fixes that with no backend or migration
 * work, and - more importantly - it makes the screen correct OFFLINE, which
 * every other progress screen in the app already is.
 *
 * It also fixes two numbers that were actively demotivating:
 *   - `streak` is never incremented anywhere in the backend, so the API
 *     reported 0 forever;
 *   - `lessons_completed` only increments on *mission claims*
 *     (services/progress_service.py), so a learner who finished thirty
 *     sub-lessons still read 0.
 * Both are computed here from real recorded activity instead.
 *
 * DESIGN RULE: every figure below is derived from something the learner
 * actually did. Where the app genuinely cannot know something, the field is
 * omitted rather than invented.
 * ---------------------------------------------------------------------------
 */
import { getChallengeCycle, toDateKey } from '@/data/challenges/challengeCatalog';
import { findSubLessonById, getCountryForModule } from '@/data/lessons/catalog';
import { isNodeComplete } from '@/data/lessons/nodeProgress';
import { clampScore, starsForScore } from '@/services/scoring';
import {
  computeMetrics,
  loadChallengeState,
  resolveChallengeProgress,
} from '@/store/challenge-progress';
import {
  loadClaimedMissions,
  loadLessonProgress,
  loadModuleQuizResults,
  loadPracticeScores,
  loadSpeakingScores,
} from '@/store/lesson-progress';

/** Days shown in the consistency strip - matches MAX_TRACKED_DAYS in the store. */
export const CONSISTENCY_DAYS = 21;

/** A "so close" milestone worth surfacing as the next goal. */
const NEAR_MISS_THRESHOLD = 40;

/**
 * How many finished sub-lessons are needed before comparing a single result to
 * the learner's average. Below this the "average" is really just one or two
 * scores, so a delta would be noise dressed up as insight.
 */
const MIN_COMPARISON_SAMPLES = 4;

/*
 * ---------------------------------------------------------------------------
 * READING THE MIRRORS
 * ------------------------------------------------------------------------- */

/**
 * The score for one sub-lesson, resolved exactly the way `sublesson.jsx` resolves
 * it before syncing, so this screen and the Profile screen can never disagree.
 *
 * Why this matters: the raw practice record is only the PRACTICE-STAGE average,
 * and it is 0 for a speaking sub-lesson. `continueFromSpeaking` in sublesson.jsx
 * deliberately writes the pronunciation result to `speaking-scores` and NOT back
 * into the practice record, so reading `record.score` alone rendered 0% for a
 * lesson the server had genuinely scored.
 *
 * The number the server stores as `best_score` (and therefore what Profile's
 * Recent Activity reads back) is the UNWEIGHTED MEAN of the parts that exist:
 * the quiz, plus the pronunciation result ONLY when the sub-lesson actually had
 * a speaking stage.
 *
 * Note this is deliberately NOT the 0.6/0.4 weighted blend used by
 * `lesson-result.jsx` and the server's TOPIC results. Those are topic-level
 * figures; weighting a single sub-lesson would penalise every learner for the
 * quiz-only lessons they have not reached yet.
 */
function resolveScore({ record, speech }) {
  const quizScore = clampScore(record?.quizScore ?? record?.score ?? 0);
  const speakingScore = clampScore(speech?.score ?? record?.speakingScore ?? 0);

  const parts = [quizScore];
  if (speakingScore > 0) parts.push(speakingScore);

  return {
    score: clampScore(Math.round(parts.reduce((total, value) => total + value, 0) / parts.length)),
    quizScore,
    speakingScore,
  };
}

/** Every recorded attempt, flattened out of the country/topic/sub-lesson tree. */
function flattenAttempts(tree, speakingTree) {
  const attempts = [];

  Object.entries(tree ?? {}).forEach(([country, topics]) => {
    Object.entries(topics ?? {}).forEach(([topicId, subLessons]) => {
      Object.entries(subLessons ?? {}).forEach(([subLessonId, entry]) => {
        const speech = speakingTree?.[country]?.[topicId]?.[subLessonId];
        const { score, quizScore, speakingScore } = resolveScore({ record: entry, speech });

        attempts.push({
          country,
          topicId,
          subLessonId,
          score,
          quizScore,
          speakingScore,
          updatedAt: entry?.updatedAt ?? speech?.updatedAt ?? null,
        });
      });
    });
  });

  /*
   * A speaking-only sub-lesson can have a pronunciation record and NO practice
   * record at all (the practice stage is the speaking exercise there, so it is
   * never written to `practice-scores`). Those sub-lessons are still finished,
   * so they must appear - otherwise Recent Wins silently omits exactly the
   * lessons the learner earned the hardest.
   */
  Object.entries(speakingTree ?? {}).forEach(([country, topics]) => {
    Object.entries(topics ?? {}).forEach(([topicId, subLessons]) => {
      Object.entries(subLessons ?? {}).forEach(([subLessonId, speech]) => {
        if (tree?.[country]?.[topicId]?.[subLessonId]) return;

        const { score, quizScore, speakingScore } = resolveScore({ record: null, speech });

        attempts.push({
          country,
          topicId,
          subLessonId,
          score,
          quizScore,
          speakingScore,
          updatedAt: speech?.updatedAt ?? null,
        });
      });
    });
  });

  return attempts;
}

/** Stable `country|topic|subLesson` keys for everything finished on the device. */
function completedKeys(progress) {
  const keys = new Set();

  Object.entries(progress ?? {}).forEach(([country, topics]) => {
    Object.entries(topics ?? {}).forEach(([topicId, subLessonIds]) => {
      (Array.isArray(subLessonIds) ? subLessonIds : []).forEach((subLessonId) => {
        if (subLessonId) keys.add(`${country}|${topicId}|${subLessonId}`);
      });
    });
  });

  return keys;
}

/** Average of the values that were actually recorded (a 0 means "not tracked"). */
function averageOf(values) {
  const recorded = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!recorded.length) return null;

  return Math.round(recorded.reduce((total, value) => total + value, 0) / recorded.length);
}

/** Local midnight `n` days back, as a day key the store also uses. */
function dayKeyOffset(daysAgo, today = new Date()) {
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
  return toDateKey(target);
}

/* ---------------------------------------------------------------------------
 * MILESTONE BADGES
 *
 * Lifetime recognition for real milestones. Deliberately NOT currency: the seed
 * schema has `xp_reward` / `coin_reward` columns, but paying them would create
 * an XP-farming vector (replay a cheap badge repeatedly) for no gain in
 * motivation. A badge here is a trophy, not a payment.
 *
 * `progress` and `target` describe how close the learner is, which is what
 * turns the list into a set of near-miss goals rather than a wall of locks.
 * ------------------------------------------------------------------------- */
export const MILESTONE_BADGES = [
  {
    key: 'first-steps',
    icon: '🌱',
    title: 'First Steps',
    description: 'Finish your first sub-lesson.',
    target: 1,
    metric: (facts) => facts.completedSubLessons,
  },
  {
    key: 'ten-sub-lessons',
    icon: '📗',
    title: 'Getting Serious',
    description: 'Finish ten sub-lessons.',
    target: 10,
    metric: (facts) => facts.completedSubLessons,
  },
  {
    key: 'fifty-sub-lessons',
    icon: '📚',
    title: 'Bookworm',
    description: 'Finish fifty sub-lessons.',
    target: 50,
    metric: (facts) => facts.completedSubLessons,
  },
  {
    key: 'first-mission',
    icon: '🎖️',
    title: 'First Payday',
    description: 'Collect the reward of your first mission.',
    target: 1,
    metric: (facts) => facts.claimedMissions,
  },
  {
    key: 'ten-missions',
    icon: '🏅',
    title: 'Mission Runner',
    description: 'Collect ten mission rewards.',
    target: 10,
    metric: (facts) => facts.claimedMissions,
  },
  {
    key: 'three-day-streak',
    icon: '🔥',
    title: 'Warming Up',
    description: 'Practise three days in a row.',
    target: 3,
    metric: (facts) => Math.max(facts.streak, facts.longestStreak),
  },
  {
    key: 'seven-day-streak',
    icon: '⚡',
    title: 'Unstoppable',
    description: 'Practise seven days in a row.',
    target: 7,
    metric: (facts) => Math.max(facts.streak, facts.longestStreak),
  },
  {
    key: 'first-three-stars',
    icon: '⭐',
    title: 'Perfectionist',
    description: 'Earn three stars on a sub-lesson (90% or better).',
    target: 1,
    metric: (facts) => facts.threeStarSubLessons,
  },
  {
    key: 'ten-three-stars',
    icon: '💎',
    title: 'Diamond Mind',
    description: 'Earn three stars on ten sub-lessons.',
    target: 10,
    metric: (facts) => facts.threeStarSubLessons,
  },
  {
    key: 'first-country',
    icon: '🌍',
    title: 'Passport',
    description: 'Complete a whole country on the journey map.',
    target: 1,
    metric: (facts) => facts.completedCountries,
  },
  {
    key: 'first-perfect-quiz',
    icon: '💯',
    title: 'Sans Faute',
    description: 'Reach 90% or better on a sub-lesson.',
    target: 1,
    metric: (facts) => facts.perfectScores,
  },
  {
    key: 'confident-speaker',
    icon: '🎤',
    title: 'Confident Speaker',
    description: 'Pass five speaking checks with 70% or better.',
    target: 5,
    metric: (facts) => facts.speakingRounds,
  },
];

/* Resolve the badge catalog against what the learner has actually done. */
function evaluateBadges(facts) {
  return MILESTONE_BADGES.map((badge) => {
    const progress = Math.max(0, Number(badge.metric(facts)) || 0);
    const earned = progress >= badge.target;

    return {
      key: badge.key,
      icon: badge.icon,
      title: badge.title,
      description: badge.description,
      progress: Math.min(progress, badge.target),
      target: badge.target,
      status: earned ? 'earned' : progress > 0 ? 'in-progress' : 'locked',
    };
  });
}

/* ---------------------------------------------------------------------------
 * CONSISTENCY STRIP
 *
 * One cell per day for the last `CONSISTENCY_DAYS` days, oldest first. Intensity
 * is the number of sub-lessons finished that day, so the strip doubles as a
 * "how much have I been showing up" visual.
 *
 * This is deliberately a HEAT STRIP rather than a streak counter on its own:
 * consistency is what actually predicts continued practice, and a visible run of
 * missed days is more motivating to protect than an abstract number.
 * ------------------------------------------------------------------------- */
function buildConsistency(state, today = new Date()) {
  const cells = [];

  for (let offset = CONSISTENCY_DAYS - 1; offset >= 0; offset -= 1) {
    const dateKey = dayKeyOffset(offset, today);
    const metrics = computeMetrics(state?.days?.[dateKey]);

    cells.push({
      dateKey,
      subLessons: metrics.subLessons,
      missions: metrics.missionClaims,
      active: metrics.subLessons > 0 || metrics.missionClaims > 0,
      isToday: offset === 0,
    });
  }

  return {
    days: cells,
    activeDays: cells.filter((cell) => cell.active).length,
    totalDays: cells.length,
  };
}

/* ---------------------------------------------------------------------------
 * WEEKLY MOMENTUM
 *
 * XP earned over the last seven days, taken from the day buckets. A delta is far
 * more motivating than a lifetime total: 240 XP "this week" says the learner is
 * doing well, where a static 4,000 XP says only that they started long ago.
 * ------------------------------------------------------------------------- */
function buildWeekMomentum(state, today = new Date()) {
  let xp = 0;
  let subLessons = 0;

  for (let offset = 0; offset < 7; offset += 1) {
    const metrics = computeMetrics(state?.days?.[dayKeyOffset(offset, today)]);
    xp += metrics.xp;
    subLessons += metrics.subLessons;
  }

  return { xp, subLessons, days: 7 };
}

/* ---------------------------------------------------------------------------
 * PERFORMANCE
 *
 * A raw score says how well one sub-lesson went; it does not say whether that
 * was GOOD FOR THIS LEARNER. An 78% might be excellent for someone averaging
 * 60% and disappointing for someone averaging 95%, and the learner cannot tell
 * which from the number alone.
 *
 * So each recent win is shown twice: the score itself, and how it compares to
 * the learner's own average across everything they have finished. That makes
 * the same number motivating or humbling in the way it actually deserves.
 * ------------------------------------------------------------------------- */
function buildPerformance(completed) {
  const scores = completed.map((attempt) => attempt.score).filter(Number.isFinite);

  if (!scores.length) {
    return { average: null, sampleSize: 0, best: null, comparable: false };
  }

  const average = Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);

  return {
    average,
    sampleSize: scores.length,
    best: Math.max(...scores),
    comparable: scores.length >= MIN_COMPARISON_SAMPLES,
  };
}

/* ---------------------------------------------------------------------------
 * HEADLINE
 *
 * One honest sentence about momentum. Streak-first when there is one (it is the
 * strongest retention signal in the app and the learner can protect it), then
 * weekly XP, then a nudge for a learner returning after a break.
 *
 * Every branch describes something the learner did or can still do - there is
 * no branch that renders a bare lifetime total.
 * ------------------------------------------------------------------------- */
function buildHeadline({ streak, longestStreak, week, activeToday }) {
  if (streak > 0) {
    const best = longestStreak > streak ? ` · best ${longestStreak} days` : '';
    const today = activeToday ? ' · today is done 🎉' : ' · practise today to keep it';

    return {
      icon: '🔥',
      title: `${streak}-day streak`,
      detail: `${best}${today}`,
      tone: 'positive',
    };
  }

  if (week.xp > 0) {
    return {
      icon: '⚡',
      title: `${week.xp} XP this week`,
      detail: `${week.subLessons} sub-lesson${week.subLessons === 1 ? '' : 's'} · start a streak today`,
      tone: 'positive',
    };
  }

  if (longestStreak > 0) {
    return {
      icon: '🌱',
      title: 'Welcome back',
      detail: `Your best run was ${longestStreak} days. Finish one activity to start a new one.`,
      tone: 'neutral',
    };
  }

  return {
    icon: '🚀',
    title: 'Your journey starts here',
    detail: 'Finish one sub-lesson to earn your first badge.',
    tone: 'neutral',
  };
}

/* ---------------------------------------------------------------------------
 * NEAREST GOAL
 *
 * The highest-percentage unearned item: the closest thing to a win the learner
 * can actually reach. Near-miss goals ("one more sub-lesson to unlock
 * Perfectionist") are the most motivating thing on the screen, so they take the
 * hero slot.
 *
 * Badge milestones compete with challenge milestones and whichever is closer
 * wins. Anything past NEAR_MISS_THRESHOLD is preferred over anything below it,
 * so a genuinely reachable goal always outranks a nominally higher but hopeless
 * one.
 * ------------------------------------------------------------------------- */
function buildNearestGoal({ badges, challenges, state, dateKey, weekKey, streak }) {
  const candidates = [];

  badges
    .filter((badge) => badge.status === 'in-progress')
    .forEach((badge) => {
      candidates.push({
        kind: 'badge',
        key: badge.key,
        icon: badge.icon,
        title: badge.title,
        description: badge.description,
        progress: badge.progress,
        target: badge.target,
        percent: Math.round((badge.progress / badge.target) * 100),
      });
    });

  challenges.filter(Boolean).forEach((challenge) => {
    const resolved = resolveChallengeProgress(state, challenge, {
      dateKey,
      weekKey,
      streak,
    });

    if (resolved.completed || resolved.percent <= 0) return;

    candidates.push({
      kind: 'challenge',
      key: challenge.id,
      icon: challenge.icon,
      title: challenge.title,
      description: challenge.description,
      cta: challenge.cta,
      tier: challenge.tier,
      progress: resolved.value,
      target: resolved.target,
      percent: resolved.percent,
    });
  });

  const nearest = candidates.sort((left, right) => {
    const leftClose = left.percent >= NEAR_MISS_THRESHOLD ? 1 : 0;
    const rightClose = right.percent >= NEAR_MISS_THRESHOLD ? 1 : 0;
    if (leftClose !== rightClose) return rightClose - leftClose;

    return right.percent - left.percent;
  })[0];

  if (!nearest) return null;

  return {
    ...nearest,
    remaining: Math.max(nearest.target - nearest.progress, 0),
  };
}

/* Countries whose whole module is finished, i.e. a completed journey node. */
function completedCountryCount(progress, claimedMissions, quizResults) {
  const countries = new Set(
    Object.entries(progress ?? {}).map(([country]) => country).filter(Boolean)
  );

  let finished = 0;
  countries.forEach((country) => {
    if (isNodeComplete(country, progress, claimedMissions, quizResults)) finished += 1;
  });

  return finished;
}

/* ---------------------------------------------------------------------------
 * SUMMARY
 * ------------------------------------------------------------------------- */

/**
 * Everything the Achievements screen renders, computed from the device.
 *
 * No network call, which is what makes the screen work offline - the same
 * guarantee the other progress screens give.
 */
export async function buildAchievementSummary({ today = new Date(), serverStreak = null } = {}) {
  const [state, progress, practiceScores, speakingScores, claimedMissions, quizResults] =
    await Promise.all([
      loadChallengeState(),
      loadLessonProgress(),
      loadPracticeScores(),
      loadSpeakingScores(),
      loadClaimedMissions(),
      loadModuleQuizResults(),
    ]);

  const attempts = flattenAttempts(practiceScores, speakingScores);
  const done = completedKeys(progress);
  const completed = attempts.filter((attempt) =>
    done.has(`${attempt.country}|${attempt.topicId}|${attempt.subLessonId}`)
  );

  /*
   * The server now keeps the real learning streak (any graded lesson or quiz
   * counts), so it wins whenever we have it; the device's challenge history is
   * the offline fallback. That keeps Home, Profile and this screen on one
   * number.
   */
  const localStreak = Number(state?.history?.dailyStreak) || 0;
  const localLongest = Number(state?.history?.longestDailyStreak) || localStreak;
  const hasServerStreak = Number.isFinite(Number(serverStreak?.streak));
  const streak = hasServerStreak ? Number(serverStreak.streak) : localStreak;
  const longestStreak = Math.max(
    streak,
    hasServerStreak ? Number(serverStreak.longestStreak) || 0 : localLongest,
  );
  const cycle = getChallengeCycle(today);

  const facts = {
    completedSubLessons: completed.length,
    claimedMissions: (Array.isArray(claimedMissions) ? claimedMissions : []).length,
    streak,
    longestStreak,
    threeStarSubLessons: completed.filter((attempt) => starsForScore(attempt.score) === 3)
      .length,
    perfectScores: completed.filter((attempt) => attempt.score >= 90).length,
    speakingRounds: completed.filter((attempt) => attempt.speakingScore >= 70).length,
    completedCountries: completedCountryCount(progress, claimedMissions, quizResults),
  };

  const badges = evaluateBadges(facts);
  const week = buildWeekMomentum(state, today);
  const consistency = buildConsistency(state, today);
  const todayMetrics = computeMetrics(state?.days?.[cycle.dateKey]);

  /*
   * Mastery is reported as `null` when nothing was ever recorded, so the screen
   * can say "not measured yet" instead of rendering a misleading 0%.
   */
  const mastery = {
    quiz: averageOf(completed.map((attempt) => attempt.quizScore)),
    speaking: averageOf(completed.map((attempt) => attempt.speakingScore)),
  };

  /* Today's assigned set: concrete short-term targets, shown beside the badges. */
  const dailyChallenges = (cycle.dailyChallenges ?? []).map((challenge) => ({
    ...challenge,
    progress: resolveChallengeProgress(state, challenge, {
      dateKey: cycle.dateKey,
      weekKey: cycle.weekKey,
      streak,
    }),
  }));

  const nearest = buildNearestGoal({
    badges,
    challenges: [...dailyChallenges, cycle.weeklyChallenge],
    state,
    dateKey: cycle.dateKey,
    weekKey: cycle.weekKey,
    streak,
  });

  const performance = buildPerformance(completed);

  const recentWins = completed
    .filter((attempt) => Boolean(attempt.updatedAt))
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
    .slice(0, 3)
    .map((attempt) => {
      const found = findSubLessonById(attempt.subLessonId);

      /*
       * The delta is signed against the learner's own average and is only
       * meaningful once there are enough finished sub-lessons to average. Below
       * that it stays `null` and the screen shows the plain score alone.
       */
      const delta =
        performance.comparable && performance.average !== null
          ? attempt.score - performance.average
          : null;

      return {
        contentKey: attempt.subLessonId,
        title: found?.subLesson?.title ?? attempt.subLessonId,
        context: [
          getCountryForModule(found?.module?.id),
          found?.lesson?.title,
        ]
          .filter(Boolean)
          .join(' • '),
        icon: found?.lesson?.icon ?? '📘',
        score: attempt.score,
        stars: starsForScore(attempt.score),
        /** Signed points vs. the learner's average, or null when not comparable. */
        delta,
        isPersonalBest: attempt.score === performance.best && performance.sampleSize > 1,
        completedAt: attempt.updatedAt,
      };
    });

  return {
    headline: buildHeadline({
      streak,
      longestStreak,
      week,
      activeToday: todayMetrics.activeToday > 0,
    }),
    streak,
    longestStreak,
    week,
    consistency,
    mastery,
    performance,
    badges,
    earnedBadgeCount: badges.filter((badge) => badge.status === 'earned').length,
    dailyChallenges,
    nearest,
    recentWins,
  };
}