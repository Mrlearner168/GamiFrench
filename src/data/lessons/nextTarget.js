import {
  findSubLessonById,
  getCountryForModule,
  getCountryTopics,
  getDefaultModuleId,
} from '@/data/lessons/catalog';
import { missionCatalog } from '@/data/lessons/missionCatalog';
import { getTopicProgress, isMissionClaimed } from '@/store/lesson-progress';
import {
  buildTopicRanking,
  getNextTopics,
  computeRecommendedDifficulty,
} from '@/services/recommendations';

/*
|--------------------------------------------------------------------------
| NEXT LEARNING TARGET
|--------------------------------------------------------------------------
| Shared course navigation helper: it answers "where should the player go
| next?" with the same rules the home map uses.
|
| Used by the challenge screen so the "Start" button of a daily challenge
| always deep-links into the real lesson the player is working on.
|--------------------------------------------------------------------------
*/

const FALLBACK_COUNTRY = 'Canada';

/* A mission is finished when every objective's topic is fully completed. */
function isMissionComplete(mission, lessonProgress) {
  const objectives = mission?.objectives ?? [];
  if (!objectives.length) return false;

  const country = getCountryForModule(mission.moduleId);

  return objectives.every((objective) => {
    const result = findSubLessonById(objective.targetId);
    if (!result) return false;

    const topicProgress = getTopicProgress(lessonProgress, country, result.lesson);

    return topicProgress.total > 0 && topicProgress.count >= topicProgress.total;
  });
}

/* The first mission the player has not claimed and not finished yet. */
export function findCurrentMission({ lessonProgress = null, claimedMissions = [] } = {}) {
  if (!missionCatalog.length) return null;

  for (const mission of missionCatalog) {
    if (isMissionClaimed(mission.id, claimedMissions)) continue;
    if (!isMissionComplete(mission, lessonProgress)) return mission;
  }

  return missionCatalog[missionCatalog.length - 1];
}

/*
 * The topic and sub-lesson to open for a country/module.
 * Topics are ranked by the personalization engine:
 *   1. prerequisite gate (blocked topics last),
 *   2. startup-assessment weakness (lowest score first),
 *   3. resume recency (last played topic),
 *   4. sequential fallback (first incomplete topic).
 */
function findTopicTarget({
  country,
  moduleId,
  lessonProgress,
  lastPlayedTopic,
  startupAssessment,
}) {
  const topics = getCountryTopics(country, moduleId) ?? [];
  if (!topics.length) return null;

  // Compute the learner's difficulty band from the startup assessment.
  const difficulty = computeRecommendedDifficulty(
    startupAssessment?.percentage ?? null
  );

  // Rank topics using the personalization engine.
  const ranked = buildTopicRanking({
    topics,
    country,
    lessonProgress,
    startupAssessment,
    lastPlayedTopic,
  });

  // Pick the first eligible, incomplete topic in personalized order.
  const next = getNextTopics(ranked)[0] ?? ranked.find((t) => !t.blocked) ?? ranked[0];
  if (!next) return null;

  const topicProgress = getTopicProgress(lessonProgress, country, next);
  const subLessons = Array.isArray(next.subLessons) ? next.subLessons : [];
  const completed = Array.isArray(topicProgress.completed)
    ? topicProgress.completed
    : [];

  // First incomplete sub-lesson within the chosen topic.
  const subLessonIndex = subLessons.findIndex(
    (subLesson) => !completed.includes(subLesson.id)
  );
  const index = subLessonIndex >= 0 ? subLessonIndex : 0;

  const moduleComplete = ranked.every(
    (t) => t.progress.total > 0 && t.progress.count >= t.progress.total
  );

  return {
    moduleComplete,
    topicId: next.topicKey,
    topicTitle: next.title,
    subLessonId: subLessons[index]?.id ?? null,
    subLessonTitle: subLessons[index]?.title ?? null,
    subLessonIndex: index,
    completedSubLessons: topicProgress.count,
    totalSubLessons: topicProgress.total,
    difficulty,
    topicReason: next.reason,
    topicBlocked: next.blocked,
  };
}

/*
 * The personalized target inside one known module (e.g. the current map
 * node). Returns null when the module has no topics.
 */
export function getModuleLearningTarget({
  country,
  moduleId,
  lessonProgress = null,
  lastPlayedTopic = null,
  startupAssessment = null,
}) {
  return findTopicTarget({
    country,
    moduleId,
    lessonProgress,
    lastPlayedTopic,
    startupAssessment,
  });
}

/* One object with everything a "continue / start" action needs. */
export function getNextLearningTarget({
  lessonProgress = null,
  claimedMissions = [],
  lastPlayedTopic = null,
  startupAssessment = null,
} = {}) {
  const mission = findCurrentMission({ lessonProgress, claimedMissions });
  const country = mission
    ? getCountryForModule(mission.moduleId) || FALLBACK_COUNTRY
    : FALLBACK_COUNTRY;
  const moduleId = mission?.moduleId ?? getDefaultModuleId(country);

  const target = findTopicTarget({
    country,
    moduleId,
    lessonProgress,
    lastPlayedTopic,
    startupAssessment,
  });

  return {
    country,
    moduleId,
    mission,
    missionId: mission?.id ?? null,
    missionTitle: mission?.title ?? null,
    topicId: target?.topicId ?? null,
    topicTitle: target?.topicTitle ?? null,
    subLessonId: target?.subLessonId ?? null,
    subLessonTitle: target?.subLessonTitle ?? null,
    subLessonIndex: target?.subLessonIndex ?? 0,
    completedSubLessons: target?.completedSubLessons ?? 0,
    totalSubLessons: target?.totalSubLessons ?? 0,
    difficulty: target?.difficulty ?? 'normal',
    topicReason: target?.topicReason ?? null,
    topicBlocked: target?.topicBlocked ?? false,
  };
}
