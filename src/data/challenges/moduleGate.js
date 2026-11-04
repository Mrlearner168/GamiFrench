/*
|--------------------------------------------------------------------------
| MODULE GATE (challenge progression lock)
|--------------------------------------------------------------------------
| The challenge screen must never send the player into content of a module
| they have not reached yet in the course.
|
| Rules of the gate:
|   1. module-1 is always unlocked.
|   2. A module unlocks once the PREVIOUS module's final quiz was passed
|      (score >= 80%). That quiz is only offered after every topic of the
|      module is finished, so the pass also proves the content was done, and
|      it is stored on the server, so it survives a reinstall. This is the same
|      rule the map uses for a finished stop (data/lessons/nodeProgress.js).
|
| Everything is derived from the same progress data the lesson screens use,
| so the challenges can never jump ahead of the course map.
|--------------------------------------------------------------------------
*/

import {
  getCountryForModule,
  getCountryTopics,
  lessonCatalog,
} from '@/data/lessons/catalog';
import { NODE_PASS_PERCENTAGE } from '@/services/scoring';
import { getTopicProgress } from '@/store/lesson-progress';

/* Minimum module-quiz percentage that counts as "passed". */
export const MODULE_QUIZ_PASS_THRESHOLD = NODE_PASS_PERCENTAGE;

const normalizeId = (value) => (Array.isArray(value) ? value[0] : value);

/* Whether the final quiz of a module has been passed (local record). */
export function isModuleQuizPassed(
  quizResults,
  moduleId,
  threshold = MODULE_QUIZ_PASS_THRESHOLD
) {
  const resolvedModuleId = normalizeId(moduleId);
  if (!resolvedModuleId) return false;

  const record = quizResults?.[resolvedModuleId];
  return (Number(record?.percentage) || 0) >= threshold;
}

/*
 * Topic completion of one module: how many of its topics are fully done and
 * whether the whole module is finished.
 */
export function getModuleTopicCompletion(moduleId, lessonProgress) {
  const resolvedModuleId = normalizeId(moduleId);
  const country = getCountryForModule(resolvedModuleId);
  const topics = getCountryTopics(country, resolvedModuleId) ?? [];

  const completedTopics = topics.filter((topic) => {
    const topicProgress = getTopicProgress(lessonProgress, country, topic);
    return topicProgress.total > 0 && topicProgress.count >= topicProgress.total;
  }).length;

  return {
    moduleId: resolvedModuleId,
    country,
    totalTopics: topics.length,
    completedTopics,
    allComplete: topics.length > 0 && completedTopics === topics.length,
  };
}

/*
 * The modules whose content challenges are allowed to open, in order.
 * The walk stops at the first module whose prerequisite is not finished.
 */
export function getUnlockedModuleIds({
  lessonProgress = null,
  quizResults = null,
} = {}) {
  const unlocked = [];

  for (let index = 0; index < lessonCatalog.length; index += 1) {
    const moduleId = lessonCatalog[index].id;

    if (index === 0) {
      unlocked.push(moduleId);
      continue;
    }

    const previous = lessonCatalog[index - 1];

    if (isModuleQuizPassed(quizResults, previous.id)) {
      unlocked.push(moduleId);
      continue;
    }

    break;
  }

  return unlocked;
}


/*
 * Everything the challenge screen needs to gate its "Start" buttons:
 *   - unlockedModuleIds : modules the challenges may open
 *   - gateRoute         : where a locked route is redirected to
 *   - isTargetAllowed   : whether the current learning target is reachable
 *   - lockMessage       : why a locked module cannot be opened yet
 *   - gateStatus        : progress inside the module that blocks the gate
 */
export function buildChallengeGate({
  lessonProgress = null,
  quizResults = null,
  requestedModuleId = null,
} = {}) {
  const unlockedModuleIds = getUnlockedModuleIds({ lessonProgress, quizResults });
  const highestUnlockedModuleId =
    unlockedModuleIds[unlockedModuleIds.length - 1] ?? lessonCatalog[0].id;

  const highestIndex = lessonCatalog.findIndex(
    (module) => module.id === highestUnlockedModuleId
  );
  const highestModule = lessonCatalog[highestIndex] ?? lessonCatalog[0];
  const nextModule = lessonCatalog[highestIndex + 1] ?? null;

  const gateRoute = {
    pathname: '/lesson',
    params: {
      country: getCountryForModule(highestUnlockedModuleId),
      module: highestUnlockedModuleId,
    },
  };

  const resolvedRequestedModuleId = normalizeId(requestedModuleId);
  const isTargetAllowed =
    !resolvedRequestedModuleId ||
    unlockedModuleIds.includes(resolvedRequestedModuleId);

  const gateStatus = getModuleTopicCompletion(
    highestUnlockedModuleId,
    lessonProgress
  );
  const quizPassed = isModuleQuizPassed(quizResults, highestUnlockedModuleId);

  let lockMessage = null;
  if (!isTargetAllowed) {
    const blockingCountry = nextModule
      ? getCountryForModule(nextModule.id)
      : null;

    lockMessage =
      resolvedRequestedModuleId === nextModule?.id
        ? `${blockingCountry} challenges stay locked — finish every topic of "${highestModule.title.trim()}" and pass its module quiz (${MODULE_QUIZ_PASS_THRESHOLD}%+) first.`
        : `That module is still locked — finish "${highestModule.title.trim()}" (all topics + module quiz) to move forward in Challenges.`;
  }

  const remainingTopics = Math.max(
    0,
    gateStatus.totalTopics - gateStatus.completedTopics
  );

  let nextUnlockHint = null;
  if (nextModule) {
    const nextLabel = `${getCountryForModule(nextModule.id)} (${nextModule.title.trim()})`;

    if (remainingTopics > 0 && quizPassed) {
      nextUnlockHint = `Next up: ${nextLabel}. Clear ${remainingTopics} more topic${
        remainingTopics === 1 ? '' : 's'
      } to unlock it.`;
    } else if (remainingTopics > 0) {
      nextUnlockHint = `Next up: ${nextLabel}. Clear ${remainingTopics} more topic${
        remainingTopics === 1 ? '' : 's'
      } and pass the module quiz (${MODULE_QUIZ_PASS_THRESHOLD}%+) to unlock it.`;
    } else {
      nextUnlockHint = `Next up: ${nextLabel}. Pass the module quiz (${MODULE_QUIZ_PASS_THRESHOLD}%+) to unlock it.`;
    }
  }

  return {
    unlockedModuleIds,
    highestUnlockedModuleId,
    gateRoute,
    isTargetAllowed,
    lockMessage,
    nextUnlockHint,
    gateStatus: {
      ...gateStatus,
      quizPassed,
    },
  };
}

/*
 * The gatekeeper for routes: a challenge "Start" route that points into a
 * locked module is rewritten to the gate route, together with a message the
 * screen can show the player.
 */
export function clampRouteToGate(route, gate) {
  if (!route || !gate) {
    return { route, locked: false, message: null };
  }

  const requestedModuleId = normalizeId(route?.params?.module);

  if (
    !requestedModuleId ||
    (Array.isArray(gate.unlockedModuleIds)
      ? gate.unlockedModuleIds
      : []
    ).includes(requestedModuleId)
  ) {
    return { route, locked: false, message: null };
  }

  return {
    route: gate.gateRoute,
    locked: true,
    message:
      gate.lockMessage ??
      'That module is still locked — finish the current module first.',
  };
}
