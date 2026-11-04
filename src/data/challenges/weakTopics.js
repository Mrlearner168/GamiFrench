/*
|--------------------------------------------------------------------------
| WEAK TOPICS
|--------------------------------------------------------------------------
| The topics a learner most needs to practise, weakest first. Challenges use
| them so that practice goes where it helps most:
|
|   - the daily spotlight picks a weak topic when there is one,
|   - "Fix a Weak Spot" challenges open the weakest topic directly.
|
| A topic is weak when, among the modules the learner has unlocked,
|   1. one of its sub-lessons has a best score under 80% (tried, not
|      mastered yet), or
|   2. the placement check flagged it (score under 50%) and it is not
|      mastered yet.
|
| "Mastered" uses the 80% mark that missions and the next stop need.
|--------------------------------------------------------------------------
*/
import { lessonCatalog, getCountryForModule } from '@/data/lessons/catalog';
import { NODE_PASS_PERCENTAGE } from '@/services/scoring';
import { getSubLessonBestScore } from '@/store/lesson-progress';

/**
 * @param {object}   options
 * @param {string[]} options.unlockedModuleIds  modules the learner can open
 * @param {object}   options.startupByModule    { 'module-1': StartupAssessment }
 * @param {(id: string) => number|null} [options.bestScoreOf]  injectable for tests
 * @returns {Array<{ moduleId, country, topic, score, subLessonIndex, reason }>}
 */
export function getWeakTopics({
  unlockedModuleIds = [],
  startupByModule = {},
  bestScoreOf = getSubLessonBestScore,
} = {}) {
  const weak = [];

  for (const moduleId of unlockedModuleIds) {
    const module = lessonCatalog.find((item) => item.id === moduleId);
    if (!module) continue;

    const mastery = startupByModule?.[moduleId]?.topicMastery ?? {};

    for (const topic of module.lessons ?? []) {
      const subLessons = Array.isArray(topic.subLessons) ? topic.subLessons : [];
      if (!subLessons.length) continue;

      const scores = subLessons.map((subLesson) => bestScoreOf(subLesson.id));
      const allMastered = scores.every(
        (score) => score !== null && score >= NODE_PASS_PERCENTAGE
      );
      if (allMastered) continue;

      // First sub-lesson that still needs work: the one "Start" opens.
      const firstUnmastered = scores.findIndex(
        (score) => score === null || score < NODE_PASS_PERCENTAGE
      );

      const tried = scores.filter((score) => score !== null && score < NODE_PASS_PERCENTAGE);
      const placement = mastery[topic.id];

      let score = null;
      let reason = null;
      if (tried.length) {
        score = Math.min(...tried);
        reason = 'low-score';
      } else if (placement?.weakness) {
        score = Number(placement.score) || 0;
        reason = 'placement';
      }
      if (reason === null) continue;

      // Point "Start" at the weakest tried sub-lesson when there is one.
      const weakestIndex = tried.length
        ? scores.findIndex((value) => value === score)
        : firstUnmastered;

      weak.push({
        moduleId,
        country: getCountryForModule(moduleId),
        topic,
        score,
        subLessonIndex: Math.max(0, weakestIndex),
        reason,
      });
    }
  }

  return weak.sort((a, b) => a.score - b.score);
}

/** Route that opens a weak topic at the sub-lesson that needs work. */
export function weakTopicRoute(weakTopic) {
  if (!weakTopic) return null;
  return {
    pathname: '/sublesson',
    params: {
      country: weakTopic.country,
      module: weakTopic.moduleId,
      topicId: weakTopic.topic.id,
      subLessonIndex: String(weakTopic.subLessonIndex ?? 0),
    },
  };
}
