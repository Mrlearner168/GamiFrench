/**
 * Pure-function tests for the personalization engine (recommendations.ts).
 */
import {
  buildTopicRanking,
  getNextTopics,
  computeRecommendedDifficulty,
  getRemediationTopics,
  getRecommendedTopic,
  getReasonCopy,
  describeStartupInsight,
  checkNodeReadiness,
  isModuleQuizPassed,
  checkNodeGate,
  hasStartupAssessment,
  getStartupAssessment,
  isPassingScore,
  REMEDIATION_THRESHOLD,
  MODULE_QUIZ_PASS_THRESHOLD,
} from '@/services/recommendations';
import { getCountryTopics, getDefaultModuleId } from '@/data/lessons/catalog';

const CANADA = 'Canada';
const CANADA_MODULE = getDefaultModuleId(CANADA);

function emptyProgress() {
  return { [CANADA]: {} };
}

function allCompleted(topics: any[]) {
  const progress: any = { [CANADA]: {} };
  for (const t of topics) {
    progress[CANADA][t.id] = (t.subLessons ?? []).map((s: any) => s.id);
  }
  return progress;
}

function makeStartup(moduleKey: string, mastery: any, percentage = 50) {
  return { moduleKey, takenAt: new Date().toISOString(), percentage, topicMastery: mastery };
}

// ---------------------------------------------------------------------------
// computeRecommendedDifficulty
// ---------------------------------------------------------------------------

describe('computeRecommendedDifficulty', () => {
  it('returns normal when no assessment score is provided', () => {
    expect(computeRecommendedDifficulty(null)).toBe('normal');
  });

  it('returns easy for scores below 60', () => {
    expect(computeRecommendedDifficulty(0)).toBe('easy');
    expect(computeRecommendedDifficulty(30)).toBe('easy');
    expect(computeRecommendedDifficulty(59)).toBe('easy');
  });

  it('returns normal for scores between 60 and 79', () => {
    expect(computeRecommendedDifficulty(60)).toBe('normal');
    expect(computeRecommendedDifficulty(70)).toBe('normal');
    expect(computeRecommendedDifficulty(79)).toBe('normal');
  });

  it('returns hard for scores 80 and above', () => {
    expect(computeRecommendedDifficulty(80)).toBe('hard');
    expect(computeRecommendedDifficulty(95)).toBe('hard');
    expect(computeRecommendedDifficulty(100)).toBe('hard');
  });

  it('clamps out-of-range values', () => {
    expect(computeRecommendedDifficulty(-10)).toBe('easy');
    expect(computeRecommendedDifficulty(150)).toBe('hard');
  });
});

// ---------------------------------------------------------------------------
// hasStartupAssessment / getStartupAssessment
// ---------------------------------------------------------------------------

describe('hasStartupAssessment / getStartupAssessment', () => {
  it('returns false / null when no assessment exists', () => {
    const store: Record<string, any> = {};
    expect(hasStartupAssessment(store, 'module-1')).toBe(false);
    expect(getStartupAssessment(store, 'module-1')).toBeNull();
  });


// ---------------------------------------------------------------------------
// isPassingScore / isModuleQuizPassed
// ---------------------------------------------------------------------------

describe('isPassingScore / isModuleQuizPassed', () => {
  it('isPassingScore uses the sub-lesson pass mark (50%)', () => {
    expect(isPassingScore(0)).toBe(false);
    expect(isPassingScore(49)).toBe(false);
    expect(isPassingScore(50)).toBe(true);
    expect(isPassingScore(100)).toBe(true);
  });

  it('a final quiz needs 80% to finish a map stop', () => {
    expect(MODULE_QUIZ_PASS_THRESHOLD).toBe(80);
  });

  it('isModuleQuizPassed returns false when no result exists', () => {
    expect(isModuleQuizPassed({}, 'module-1')).toBe(false);
  });

  it('isModuleQuizPassed returns true when score meets threshold', () => {
    const results = { 'module-1': { percentage: MODULE_QUIZ_PASS_THRESHOLD } };
    expect(isModuleQuizPassed(results, 'module-1')).toBe(true);
  });

  it('isModuleQuizPassed returns false when score is below threshold', () => {
    const results = { 'module-1': { percentage: MODULE_QUIZ_PASS_THRESHOLD - 1 } };
    expect(isModuleQuizPassed(results, 'module-1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkNodeReadiness
// ---------------------------------------------------------------------------

describe('checkNodeReadiness', () => {
  it('is ready when startup assessment has been taken', () => {
    const assessments = { 'module-1': makeStartup('module-1', {}, 60) };
    const r = checkNodeReadiness({
      moduleKey: 'module-1',
      previousModuleCompleted: false,
      startupAssessments: assessments,
      moduleQuizResults: {},
    });
    expect(r.ready).toBe(true);
    expect(r.startupTaken).toBe(true);
  });

  it('is ready when previous module is completed (even without startup)', () => {
    const r = checkNodeReadiness({
      moduleKey: 'module-1',
      previousModuleCompleted: true,
      startupAssessments: {},
      moduleQuizResults: {},
    });
    expect(r.ready).toBe(true);
    expect(r.startupTaken).toBe(false);
  });

  it('is NOT ready when neither startup taken nor previous completed', () => {
    const r = checkNodeReadiness({
      moduleKey: 'module-1',
      previousModuleCompleted: false,
      startupAssessments: {},
      moduleQuizResults: {},
    });
    expect(r.ready).toBe(false);
    expect(r.reason).toContain('startup assessment');
  });

  it('reports finalPassed based on module quiz results', () => {
    const assessments = { 'module-1': makeStartup('module-1', {}, 60) };
    const results = { 'module-1': { percentage: MODULE_QUIZ_PASS_THRESHOLD } };
    const r = checkNodeReadiness({
      moduleKey: 'module-1',
      previousModuleCompleted: false,
      startupAssessments: assessments,
      moduleQuizResults: results,
    });
    expect(r.finalPassed).toBe(true);
  });
});
  it('returns true / assessment when one exists', () => {
    const assessment = makeStartup('module-1', {}, 70);
    const store = { 'module-1': assessment };
    expect(hasStartupAssessment(store, 'module-1')).toBe(true);
    expect(getStartupAssessment(store, 'module-1')).toEqual(assessment);
  });

  it('handles stale/missing module keys gracefully', () => {
    const store = { 'module-1': makeStartup('module-1', {}, 70) };
    expect(hasStartupAssessment(store, 'module-999')).toBe(false);
    expect(getStartupAssessment(store, 'module-999')).toBeNull();
  });

  it('returns false when takenAt is missing (incomplete assessment)', () => {
    const store = { 'module-1': { moduleKey: 'module-1', percentage: 50, topicMastery: {} } };
    expect(hasStartupAssessment(store, 'module-1')).toBe(false);
  });

// ---------------------------------------------------------------------------
// checkNodeGate
// ---------------------------------------------------------------------------

describe('checkNodeGate', () => {
  const topics = getCountryTopics(CANADA, CANADA_MODULE);

  it('is locked when not all topics are completed', () => {
    const gate = checkNodeGate({
      moduleKey: CANADA_MODULE,
      lessonProgress: emptyProgress(),
      country: CANADA,
      topics,
      moduleQuizResults: {},
    });
    expect(gate.unlocked).toBe(false);
    expect(gate.topicsComplete).toBe(false);
    expect(gate.reason).toContain('topic');
  });

  it('is locked when topics complete but quiz not passed', () => {
    const progress = allCompleted(topics);
    const gate = checkNodeGate({
      moduleKey: CANADA_MODULE,
      lessonProgress: progress,
      country: CANADA,
      topics,
      moduleQuizResults: {},
    });
    expect(gate.unlocked).toBe(false);
    expect(gate.topicsComplete).toBe(true);
    expect(gate.quizPassed).toBe(false);
    expect(gate.reason).toContain('assessment');
  });

  it('is unlocked when all topics complete AND quiz passed', () => {
    const progress = allCompleted(topics);
    const results = { [CANADA_MODULE]: { percentage: MODULE_QUIZ_PASS_THRESHOLD } };
    const gate = checkNodeGate({
      moduleKey: CANADA_MODULE,
      lessonProgress: progress,
      country: CANADA,
      topics,
      moduleQuizResults: results,
    });
    expect(gate.unlocked).toBe(true);
    expect(gate.topicsComplete).toBe(true);
    expect(gate.quizPassed).toBe(true);
    expect(gate.reason).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getRemediationTopics
// ---------------------------------------------------------------------------

describe('getRemediationTopics', () => {
  it('returns empty array when no startup assessment', () => {
    expect(getRemediationTopics(null, ['topic-a', 'topic-b'])).toEqual([]);
  });

  it('filters out topics at or above the remediation threshold', () => {
    const assessment = makeStartup(CANADA_MODULE, {
      'topic-a': { score: 30, weakness: true, stars: 1 },
      'topic-b': { score: 60, weakness: false, stars: 2 },
      'topic-c': { score: 40, weakness: true, stars: 1 },
    });
    const result = getRemediationTopics(assessment, ['topic-a', 'topic-b', 'topic-c']);
    expect(result).toHaveLength(2);
    expect(result.map((r: any) => r.topicKey)).toEqual(['topic-a', 'topic-c']);
  });

  it('sorts by score ascending (weakest first)', () => {
    const assessment = makeStartup(CANADA_MODULE, {
      'topic-a': { score: 40, weakness: true, stars: 1 },
      'topic-b': { score: 20, weakness: true, stars: 0 },
    });
    const result = getRemediationTopics(assessment, ['topic-a', 'topic-b']);
    expect(result[0].topicKey).toBe('topic-b');
    expect(result[1].topicKey).toBe('topic-a');
  });

  it('excludes topics not in the provided keys list', () => {
    const assessment = makeStartup(CANADA_MODULE, {
      'topic-a': { score: 30, weakness: true, stars: 1 },
      'topic-x': { score: 20, weakness: true, stars: 0 },
    });
    const result = getRemediationTopics(assessment, ['topic-a']);
    expect(result).toHaveLength(1);
    expect(result[0].topicKey).toBe('topic-a');
  });

  it('excludes topics with no mastery data', () => {
    const assessment = makeStartup(CANADA_MODULE, {
      'topic-a': { score: 30, weakness: true, stars: 1 },
    });
    const result = getRemediationTopics(assessment, ['topic-a', 'topic-missing']);
    expect(result).toHaveLength(1);
  });

  it('uses REMEDIATION_THRESHOLD of 50', () => {
    expect(REMEDIATION_THRESHOLD).toBe(50);
    const assessment = makeStartup(CANADA_MODULE, {
      'topic-a': { score: 49, weakness: true, stars: 1 },
      'topic-b': { score: 50, weakness: false, stars: 2 },
    });
    const result = getRemediationTopics(assessment, ['topic-a', 'topic-b']);
    expect(result).toHaveLength(1);
    expect(result[0].topicKey).toBe('topic-a');
  });
});

// ---------------------------------------------------------------------------
// buildTopicRanking
// ---------------------------------------------------------------------------

describe('buildTopicRanking', () => {
  const topics = getCountryTopics(CANADA, CANADA_MODULE);

  it('returns all topics in the input', () => {
    const ranked = buildTopicRanking({
      topics,
      country: CANADA,
      lessonProgress: emptyProgress(),
    });
    expect(ranked).toHaveLength(topics.length);
  });

  it('marks later topics as blocked when first is incomplete', () => {
    const ranked = buildTopicRanking({
      topics,
      country: CANADA,
      lessonProgress: emptyProgress(),
    });
    const blockedCount = ranked.filter((r: any) => r.blocked).length;
    expect(blockedCount).toBeGreaterThan(0);
  });

  it('unblocks all topics when all previous are completed', () => {
    const progress = allCompleted(topics);
    const ranked = buildTopicRanking({
      topics,
      country: CANADA,
      lessonProgress: progress,
    });
    expect(ranked.every((r: any) => !r.blocked)).toBe(true);
  });

  it('handles empty topics array', () => {
    const ranked = buildTopicRanking({
      topics: [],
      country: CANADA,
      lessonProgress: emptyProgress(),
    });
    expect(ranked).toEqual([]);
  });

  it('handles null startup assessment gracefully', () => {
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: emptyProgress(),
      startupAssessment: null,
    });
    expect(ranked).toHaveLength(1);
  });

  it('handles null lastPlayedTopic gracefully', () => {
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: emptyProgress(),
      lastPlayedTopic: null,
    });
    expect(ranked).toHaveLength(1);
  });

  it('includes mastery data from startup assessment', () => {
    const firstId = topics[0].id;
    const assessment = makeStartup(CANADA_MODULE, {
      [firstId]: { score: 45, weakness: true, stars: 1 },
    });

    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: emptyProgress(),
      startupAssessment: assessment,
    });

    expect(ranked[0].mastery).toEqual({ score: 45, weakness: true, stars: 1 });
  });

  it('sets mastery to null when no startup assessment', () => {
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: emptyProgress(),
    });
    expect(ranked[0].mastery).toBeNull();
  });

  it('includes progress data for each topic', () => {
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: emptyProgress(),
    });
    expect(ranked[0].progress).toBeDefined();
    expect(typeof ranked[0].progress.count).toBe('number');
    expect(typeof ranked[0].progress.total).toBe('number');
    expect(Array.isArray(ranked[0].progress.completed)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getNextTopics
// ---------------------------------------------------------------------------

describe('getNextTopics', () => {
  const topics = getCountryTopics(CANADA, CANADA_MODULE);

  it('returns only unblocked, incomplete topics', () => {
    const ranked = buildTopicRanking({
      topics,
      country: CANADA,
      lessonProgress: emptyProgress(),
    });
    const next = getNextTopics(ranked);
    for (const t of next) {
      expect(t.blocked).toBe(false);
      expect(t.progress.total).toBeGreaterThan(0);
      expect(t.progress.count).toBeLessThan(t.progress.total);
    }
  });

  it('returns empty array when all topics are completed', () => {
    const progress = allCompleted(topics);
    const ranked = buildTopicRanking({
      topics,
      country: CANADA,
      lessonProgress: progress,
    });
    const next = getNextTopics(ranked);
    expect(next).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(getNextTopics([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Stale data handling
// ---------------------------------------------------------------------------

describe('stale data handling', () => {
  const topics = getCountryTopics(CANADA, CANADA_MODULE);

  it('falls back gracefully when lessonProgress is null', () => {
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: null as any,
    });
    expect(ranked).toHaveLength(1);
    expect(ranked[0].progress.count).toBe(0);
  });

  it('falls back gracefully when lessonProgress is undefined', () => {
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: undefined as any,
    });
    expect(ranked).toHaveLength(1);
  });

  it('handles startup assessment with missing topicMastery', () => {
    const assessment = { moduleKey: CANADA_MODULE, takenAt: new Date().toISOString(), percentage: 50 } as any;
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: emptyProgress(),
      startupAssessment: assessment,
    });
    expect(ranked).toHaveLength(1);
    expect(ranked[0].mastery).toBeNull();
  });

  it('handles startup assessment with empty topicMastery', () => {
    const assessment = makeStartup(CANADA_MODULE, {});
    const ranked = buildTopicRanking({
      topics: [topics[0]],
      country: CANADA,
      lessonProgress: emptyProgress(),
      startupAssessment: assessment,
    });
    expect(ranked).toHaveLength(1);
    expect(ranked[0].mastery).toBeNull();
  });
});
});
describe('learner-facing copy', () => {
  const topics = getCountryTopics(CANADA, CANADA_MODULE) as any[];
  const keys = topics.map((t) => t.id);
  const assessment = (score: number, overrides: Record<string, number> = {}) => ({
    moduleKey: CANADA_MODULE,
    takenAt: '2026-01-01T00:00:00.000Z',
    percentage: score,
    topicMastery: Object.fromEntries(keys.map((k) => {
      const s = overrides[k] ?? score;
      return [k, { score: s, weakness: s < REMEDIATION_THRESHOLD, stars: 0 }];
    })),
  });

  it('never exposes the fallback reason', () => {
    expect(getReasonCopy('fallback')).toBeNull();
    expect(getReasonCopy(null)).toBeNull();
    expect(getReasonCopy('resume')?.label).toBe('Pick up where you left off');
  });

  it('recommends the first incomplete eligible topic', () => {
    const ranked = buildTopicRanking({ topics, country: CANADA, lessonProgress: emptyProgress() });
    expect(getRecommendedTopic(ranked)?.topicKey).toBe(topics[0].id);
    const done = buildTopicRanking({ topics, country: CANADA, lessonProgress: allCompleted(topics) });
    expect(getRecommendedTopic(done)).toBeNull();
  });

  it('describes the startup score with the matching pace', () => {
    expect(describeStartupInsight(null)).toBeNull();
    expect(describeStartupInsight(assessment(85), keys)?.difficulty).toBe('hard');
    expect(describeStartupInsight(assessment(30), keys)?.difficulty).toBe('easy');
    expect(describeStartupInsight(assessment(30), keys)?.message).toContain('30%');
  });

  it('only lists focus topics when they stand out', () => {
    expect(describeStartupInsight(assessment(30), keys)?.focusTopicKeys).toEqual([]);
    const mixed = describeStartupInsight(assessment(70, { [keys[1]]: 20 }), keys);
    expect(mixed?.focusTopicKeys).toEqual([keys[1]]);
  });
});
