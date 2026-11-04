/**
 * Score → reward helpers shared by every screen that shows a result.
 *
 * The bands and the XP value below MUST match the server, which is the source
 * of truth for what a learner is actually paid:
 *
 *   STAR_BANDS              -> Backend/services/assessment_service.py
 *   SUBLESSON_XP_PER_STAR   -> Backend/services/content_progress_service.py
 *
 * Keeping them here means the stars shown for a sub-lesson, a topic and an
 * assessment are always the stars the server stored for the same percentage.
 */

/** Star bands, highest first: 90+ = 3 stars, 75+ = 2, 50+ = 1. */
export const STAR_BANDS = [
  { min: 90, stars: 3 },
  { min: 75, stars: 2 },
  { min: 50, stars: 1 },
];

/** A sub-lesson counts as completed from this percentage up. */
export const PASSING_PERCENTAGE = 50;

/**
 * Score needed on a module's FINAL quiz to finish its map stop and unlock the
 * next one. Below it the learner retries the quiz. Must match the
 * `passingPercentage` in Backend/services/assessment_catalog.py.
 */
export const NODE_PASS_PERCENTAGE = 80;

/**
 * XP the server pays for claiming a mission
 * (Backend/services/xp_service.py REWARD_XP['lesson_completion']).
 */
export const MISSION_XP = 50;

/** XP paid for one star of a sub-lesson (server caps the total at 3 stars). */
export const SUBLESSON_XP_PER_STAR = 10;

/** Clamp a submitted score to a sane 0-100 integer. */
export function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
}

/** Stars for a 0-100 score using the shared bands. */
export function starsForScore(score) {
  const value = clampScore(score);
  const band = STAR_BANDS.find((entry) => value >= entry.min);
  return band ? band.stars : 0;
}

/** XP a sub-lesson is worth at this score, before the server's lifetime cap. */
export function sublessonXpForScore(score) {
  return starsForScore(score) * SUBLESSON_XP_PER_STAR;
}

/** True when a score is enough to complete the sub-lesson. */
export function isPassingScore(score) {
  return clampScore(score) >= PASSING_PERCENTAGE;
}
