/**
 * The map stop (node) unlock chain.
 *
 * A stop on the journey map only turns green when the whole module behind it is
 * finished, and the stop AFTER it stays locked until then. Two bugs used to
 * break that for every country after the first one:
 *
 *   1. the map decided "finished" from missions alone, so a player who had
 *      cleared every lesson of a country was still stuck on that stop;
 *   2. a mission objective targets ONE sub-lesson, but it was scored against
 *      the whole topic, so an objective stayed unfinished until every sibling
 *      sub-lesson was done.
 *
 * These tests pin the fixed behaviour on module-2 (Morocco), the second stop.
 *
 * On top of the content, a stop needs its final quiz at 80% or more
 * (NODE_PASS_PERCENTAGE); below that the learner retries and the next stop
 * stays locked.
 */

import {
  findSubLessonById,
  getCountryTopics,
  getDefaultModuleId,
} from '@/data/lessons/catalog';
import { missionCatalog } from '@/data/lessons/missionCatalog';
import {
  areModuleMissionsComplete,
  isMissionComplete,
  isModuleContentComplete,
  isNodeComplete,
} from '@/data/lessons/nodeProgress';
import { NODE_PASS_PERCENTAGE } from '@/services/scoring';
import { noteSubLessonAttemptScore } from '@/store/lesson-progress';

const MOROCCO = 'Morocco';
const MOROCCO_MODULE = 'module-2';
const IVORY_COAST = 'Ivory Coast';
const CANADA = 'Canada';

/** Every sub-lesson of a country marked as completed, grouped by topic. */
function allLessonsCompleted(country, moduleId) {
  const progress = { [country]: {} };

  for (const topic of getCountryTopics(country, moduleId)) {
    progress[country][topic.id] = (topic.subLessons ?? []).map((sub) => sub.id);
  }

  return progress;
}

/** Only the given target sub-lessons are completed; nothing else. */
function onlySubLessonsCompleted(country, targetIds) {
  const progress = { [country]: {} };

  for (const targetId of targetIds) {
    const { lesson } = findSubLessonById(targetId);
    if (!lesson) continue;
    progress[country][lesson.id] = [
      ...(progress[country][lesson.id] ?? []),
      targetId,
    ];
  }

  return progress;
}

/** Final-quiz results with the given module passed at `percentage`. */
const quizAt = (moduleId, percentage = NODE_PASS_PERCENTAGE) => ({
  [moduleId]: { percentage },
});
const PASSED_MOROCCO = quizAt(MOROCCO_MODULE);
const PASSED_CANADA = quizAt('module-1');

const missionsOf = (moduleId) =>
  missionCatalog.filter((mission) => mission.moduleId === moduleId);

describe('map node completion', () => {
  it('does not mark a node complete before any work is done', () => {
    expect(isNodeComplete(MOROCCO, {}, [])).toBe(false);
  });

  it('completes a node from its claimed missions alone', () => {
    const moduleMissions = missionsOf(MOROCCO_MODULE);

    expect(moduleMissions.length).toBeGreaterThan(0);
    expect(
      isNodeComplete(MOROCCO, {}, moduleMissions.map((m) => m.id), PASSED_MOROCCO)
    ).toBe(true);
  });

  it('still needs every mission: claiming only the first one is not enough', () => {
    const moduleMissions = missionsOf(MOROCCO_MODULE);

    expect(isNodeComplete(MOROCCO, {}, [moduleMissions[0].id])).toBe(false);
  });

  it('completes a node once every lesson of the country is done, missions unclaimed', () => {
    // This is the regression: finishing the content must move the traveller on
    // even when the rewards were never collected.
    const progress = allLessonsCompleted(MOROCCO, MOROCCO_MODULE);

    expect(isModuleContentComplete(MOROCCO_MODULE, progress, MOROCCO)).toBe(
      true
    );
    expect(isNodeComplete(MOROCCO, progress, [], PASSED_MOROCCO)).toBe(true);
  });

  it('keeps a node open until the final quiz reaches 80%', () => {
    const progress = allLessonsCompleted(MOROCCO, MOROCCO_MODULE);

    // Lessons done but no final quiz yet.
    expect(isNodeComplete(MOROCCO, progress, [])).toBe(false);
    // 79% is not enough: the learner retries.
    expect(
      isNodeComplete(MOROCCO, progress, [], quizAt(MOROCCO_MODULE, NODE_PASS_PERCENTAGE - 1))
    ).toBe(false);
    expect(isNodeComplete(MOROCCO, progress, [], quizAt(MOROCCO_MODULE, 100))).toBe(true);
  });

  it('a passed final quiz alone keeps the node done (survives a reinstall)', () => {
    // After a reinstall the device may hold lower server-graded lesson scores
    // than before; the server-recorded final-quiz pass still proves the stop
    // was finished (the quiz is only offered once its lessons are done).
    expect(isNodeComplete(MOROCCO, {}, [], quizAt(MOROCCO_MODULE, 100))).toBe(true);
  });

  it('a final quiz below the pass mark does not complete the node', () => {
    expect(isNodeComplete(MOROCCO, {}, [], quizAt(MOROCCO_MODULE, 79))).toBe(false);
  });

  it('does not complete a node from a partial country', () => {
    const progress = allLessonsCompleted(MOROCCO, MOROCCO_MODULE);
    const [firstTopic] = getCountryTopics(MOROCCO, MOROCCO_MODULE);

    // Wipe every topic except the first one.
    for (const topic of getCountryTopics(MOROCCO, MOROCCO_MODULE)) {
      if (topic.id === firstTopic.id) continue;
      progress[MOROCCO][topic.id] = [];
    }

    expect(isNodeComplete(MOROCCO, progress, [])).toBe(false);
  });

  it('keeps progress under the right country instead of lumping it into Canada', () => {
    const progress = allLessonsCompleted(MOROCCO, MOROCCO_MODULE);

    // The bug: every sub-lesson was read back from progress['Canada'].
    expect(progress.Canada).toBeUndefined();
    expect(isNodeComplete(MOROCCO, progress, [], PASSED_MOROCCO)).toBe(true);
  });
});

describe('node isolation between countries', () => {
  it('does not let one country unlock the next one', () => {
    // Finishing Morocco must not complete Ivory Coast.
    const progress = allLessonsCompleted(MOROCCO, MOROCCO_MODULE);

    expect(isNodeComplete(IVORY_COAST, progress, [])).toBe(false);
    expect(isNodeComplete(CANADA, progress, [])).toBe(false);
  });

  it('accepts either a country name or a module id', () => {
    const progress = allLessonsCompleted(MOROCCO, MOROCCO_MODULE);

    expect(getDefaultModuleId(MOROCCO)).toBe(MOROCCO_MODULE);
    expect(isNodeComplete(MOROCCO_MODULE, progress, [], PASSED_MOROCCO)).toBe(true);
  });

  it('leaves an untouched node incomplete even when an earlier one is done', () => {
    const progress = allLessonsCompleted(CANADA, getDefaultModuleId(CANADA));

    expect(isNodeComplete(CANADA, progress, [], PASSED_CANADA)).toBe(true);
    expect(isNodeComplete(MOROCCO, progress, [], PASSED_CANADA)).toBe(false);
  });
});

describe('mission completion', () => {
  it('scores an objective on its own sub-lesson, not the whole topic', () => {
    const mission = missionsOf(MOROCCO_MODULE).find(
      (m) => m.objectives?.length >= 2
    );
    const [first, second] = mission.objectives;

    // Only the FIRST objective is done. Its sibling sub-lesson lives in the
    // same topic and is NOT complete, which under the old topic-wide check
    // made this objective look unfinished.
    expect(
      isMissionComplete(
        mission,
        onlySubLessonsCompleted(MOROCCO, [first.targetId]),
        MOROCCO,
        []
      )
    ).toBe(false);

    // Both done but one only at 70%: missions need 80% on every objective.
    noteSubLessonAttemptScore(first.targetId, 85);
    noteSubLessonAttemptScore(second.targetId, 70);
    expect(
      isMissionComplete(
        mission,
        onlySubLessonsCompleted(MOROCCO, [first.targetId, second.targetId]),
        MOROCCO,
        []
      )
    ).toBe(false);

    // Both objective targets done at 80%+ -> mission complete.
    noteSubLessonAttemptScore(second.targetId, 90);
    expect(
      isMissionComplete(
        mission,
        onlySubLessonsCompleted(MOROCCO, [
          first.targetId,
          second.targetId,
        ]),
        MOROCCO,
        []
      )
    ).toBe(true);
  });

  it('treats a claimed mission as complete with no lesson progress at all', () => {
    const mission = missionCatalog[0];

    expect(isMissionComplete(mission, {}, CANADA, [mission.id])).toBe(true);
  });

  it('reports module missions complete only when all of them are', () => {
    const moduleMissions = missionsOf(MOROCCO_MODULE);

    expect(
      areModuleMissionsComplete(
        MOROCCO_MODULE,
        {},
        MOROCCO,
        moduleMissions.map((m) => m.id)
      )
    ).toBe(true);

    expect(areModuleMissionsComplete(MOROCCO_MODULE, {}, MOROCCO, [])).toBe(
      false
    );
  });
});