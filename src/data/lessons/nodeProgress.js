/**
 * ---------------------------------------------------------------------------
 * NODE (MAP STOP) COMPLETION
 *
 * A stop on the journey map belongs to one country, which maps to exactly one
 * module. A stop counts as finished once its final quiz is passed with
 * NODE_PASS_PERCENTAGE (see isNodeComplete). The quiz is offered when the
 * stop's content is done, EITHER
 *
 *   1. every mission of that module is finished, or
 *   2. every topic of that module is fully completed,
 *
 * AND the module's final quiz was passed with NODE_PASS_PERCENTAGE (80%) or
 * more. Below that the learner retries the quiz; the next stop stays locked.
 *
 * Rule 2 matters because a mission objective points at ONE sub-lesson, while a
 * topic can hold several. Before this module existed the map only looked at
 * missions, so a player who finished every lesson of a country could still be
 * stuck on that stop. The two rules are additive: clearing the content of a
 * module always moves the traveller forward, even when its missions were never
 * explicitly collected.
 *
 * The module gate used by the Challenges screen has the same "content first"
 * idea (see data/challenges/moduleGate.js), so the map and the gate now agree
 * on what "finished" means.
 * ---------------------------------------------------------------------------
 */

import {
  getCountryForModule,
  getCountryTopics,
  getDefaultModuleId,
} from '@/data/lessons/catalog';
import { isModuleQuizPassed } from '@/data/challenges/moduleGate';
import { missionCatalog } from '@/data/lessons/missionCatalog';
import {
  getObjectiveCompletion,
  getTopicProgress,
  isMissionClaimed,
} from '@/store/lesson-progress';

/**
 * A mission is finished when its rewards were collected, or when every one of
 * its objectives points at a sub-lesson the player has completed.
 */
export function isMissionComplete(mission, progress, country, claimedMissions) {
  if (!mission) return false;

  if (isMissionClaimed(mission.id, claimedMissions)) return true;

  const objectives = mission.objectives ?? [];
  if (!objectives.length) return false;

  return objectives.every((objective) =>
    getObjectiveCompletion(progress, country, objective.targetId).completed
  );
}

/**
 * Every mission of a module is finished.
 */
export function areModuleMissionsComplete(
  moduleId,
  progress,
  country,
  claimedMissions
) {
  const moduleMissions = missionCatalog.filter(
    (mission) => mission.moduleId === moduleId
  );

  if (!moduleMissions.length) return false;

  return moduleMissions.every((mission) =>
    isMissionComplete(mission, progress, country, claimedMissions)
  );
}

/**
 * Every topic of a module is fully completed (all of its sub-lessons done).
 */
export function isModuleContentComplete(moduleId, progress, country) {
  const topics = getCountryTopics(country, moduleId) ?? [];
  if (!topics.length) return false;

  return topics.every((topic) => {
    const topicProgress = getTopicProgress(progress, country, topic);
    return topicProgress.total > 0 && topicProgress.count >= topicProgress.total;
  });
}

/**
 * Is the map stop for this country finished?
 *
 * Accepts either the country name or the module id, so callers that already
 * hold a node title do not have to translate it first.
 */
export function isNodeComplete(
  countryOrModuleId,
  progress,
  claimedMissions = [],
  quizResults = null
) {
  // Callers hold either a node title ("Morocco") or a module id ("module-2").
  // Both the progress mirror and the catalog are keyed by country name, so
  // everything is normalised through the country.
  const country = String(countryOrModuleId ?? '').startsWith('module-')
    ? getCountryForModule(countryOrModuleId)
    : countryOrModuleId;

  const moduleId = getDefaultModuleId(country);

  /*
   * A passed final quiz locks the stop as done for good. The final quiz is
   * only offered once the stop's lessons are finished, so the pass already
   * proves the content was done - and it is graded and stored on the server.
   *
   * The content check alone is NOT stable: mission objectives need 80% per
   * sub-lesson, and the phone's own score for a sub-lesson can differ from the
   * server's grade (e.g. 82% on the phone, 77% on the server). After a
   * reinstall only the server's scores come back, which used to turn a
   * finished stop back into the current one.
   */
  return isModuleQuizPassed(quizResults, moduleId);
}

/**
 * Every lesson (or mission) of the stop is done. The final quiz is the only
 * thing left between this and a completed stop.
 */
export function isNodeContentComplete(country, progress, claimedMissions = []) {
  const moduleId = getDefaultModuleId(country);

  return (
    areModuleMissionsComplete(moduleId, progress, country, claimedMissions) ||
    isModuleContentComplete(moduleId, progress, country)
  );
}