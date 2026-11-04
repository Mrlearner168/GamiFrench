/** Personalized topic ordering, difficulty, remediation, node gates. */
import { NODE_PASS_PERCENTAGE, PASSING_PERCENTAGE, starsForScore } from '@/services/scoring';
import { getTopicProgress } from '@/store/lesson-progress';

export type StartupAssessment = {
  moduleKey: string;
  takenAt: string;
  percentage: number;
  topicMastery: Record<string, { score: number; weakness: boolean; stars: number }>;
  /** Taken offline and not graded yet (replaced when the answers sync). */
  pending?: boolean;
};
export type RankedTopic = {
  topicKey: string;
  title: string;
  type: string;
  icon: string;
  description: string;
  subLessons: Array<{ id: string; title: string; description: string }>;
  reason: 'weakness' | 'resume' | 'next' | 'fallback';
  mastery?: { score: number; weakness: boolean; stars: number } | null;
  progress: { completed: string[]; count: number; total: number };
  blocked: boolean;
};
export type DifficultyBand = 'easy' | 'normal' | 'hard';
export type NodeReadiness = { ready: boolean; reason: string | null; startupTaken: boolean; finalPassed: boolean };
export type NodeGate = { unlocked: boolean; reason: string | null; topicsComplete: boolean; quizPassed: boolean };

export const REMEDIATION_THRESHOLD = 50;
export const MODULE_QUIZ_PASS_THRESHOLD = NODE_PASS_PERCENTAGE;

export function hasStartupAssessment(s: Record<string, StartupAssessment | undefined>, k: string): boolean {
  return Boolean(s?.[k]?.takenAt);
}
export function getStartupAssessment(s: Record<string, StartupAssessment | undefined>, k: string): StartupAssessment | null {
  return s?.[k] ?? null;
}
export function computeRecommendedDifficulty(a: number | null): DifficultyBand {
  const v = a == null ? null : clampScore(a);
  if (v === null) return 'normal';
  if (v >= 80) return 'hard';
  if (v >= 60) return 'normal';
  return 'easy';
}
function clampScore(x: number): number { return Math.max(0, Math.min(100, Math.round(x))); }

export function buildTopicRanking({
  topics, country, lessonProgress, startupAssessment, lastPlayedTopic,
}: {
  topics: Array<{ id: string; title: string; type: string; icon: string; description: string; subLessons: Array<{ id: string; title: string; description: string }> }>;
  country: string;
  lessonProgress: Record<string, Record<string, string[]>>;
  startupAssessment?: StartupAssessment | null;
  lastPlayedTopic?: { topicId?: string; subLessonIndex?: string | number } | null;
}): RankedTopic[] {
  const topicSet = new Set(topics.map((t) => t.id));
  const completed = new Set<string>();
  const progMap = new Map<string, { completed: string[]; count: number; total: number }>();
  for (const t of topics) {
    const p = getTopicProgress(lessonProgress, country, t);
    progMap.set(t.id, p);
    if (p.total > 0 && p.count >= p.total) completed.add(t.id);
  }
  const eligible = new Set<string>();
  let allPrev = true;
  for (const t of topics) {
    if (!allPrev) break;
    eligible.add(t.id);
    if (!completed.has(t.id)) allPrev = false;
  }
  const weak = new Map<string, { score: number; weakness: boolean; stars: number }>();
  if (startupAssessment?.topicMastery) {
    for (const [tk, m] of Object.entries(startupAssessment.topicMastery)) {
      if (topicSet.has(tk)) weak.set(tk, m);
    }
  }
  const entries: RankedTopic[] = topics.map((t) => {
    const p = progMap.get(t.id) ?? { completed: [], count: 0, total: t.subLessons?.length ?? 0 };
    const m = weak.get(t.id) ?? null;
    const blocked = !eligible.has(t.id);
    let reason: RankedTopic['reason'] = 'fallback';
    if (blocked) reason = 'fallback';
    else if (m?.weakness) reason = 'weakness';
    else if (lastPlayedTopic?.topicId === t.id && p.total > 0 && p.count < p.total) reason = 'resume';
    else if (p.total > 0 && p.count < p.total) reason = 'next';
    return { topicKey: t.id, title: t.title, type: t.type, icon: t.icon, description: t.description,
      subLessons: t.subLessons ?? [], reason, mastery: m, progress: p, blocked };
  });
  const ro: Record<RankedTopic['reason'], number> = { weakness: 0, resume: 1, next: 2, fallback: 3 };
  entries.sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
    const ra = ro[a.reason], rb = ro[b.reason];
    if (ra !== rb) return ra - rb;
    if (a.reason === 'weakness' && b.reason === 'weakness') {
      const sa = a.mastery?.score ?? 100, sb = b.mastery?.score ?? 100;
      if (sa !== sb) return sa - sb;
    }
    if (a.reason === 'resume') return -1;
    if (b.reason === 'resume') return 1;
    return 0;
  });
  return entries;
}
export function getNextTopics(ranked: RankedTopic[]): RankedTopic[] {
  return ranked.filter((t) => !t.blocked && t.progress.total > 0 && t.progress.count < t.progress.total);
}
/** The single topic the learner should open next, or null when the module is done. */
export function getRecommendedTopic(ranked: RankedTopic[]): RankedTopic | null {
  return getNextTopics(ranked)[0] ?? null;
}

/* Learner-facing copy. Keep the raw reason/band values out of the UI. */
export type ReasonCopy = { icon: string; label: string; hint: string };
export const REASON_COPY: Record<Exclude<RankedTopic['reason'], 'fallback'>, ReasonCopy> = {
  weakness: { icon: '🎯', label: 'Recommended for you', hint: 'Your placement check shows this is worth strengthening.' },
  resume: { icon: '↩️', label: 'Pick up where you left off', hint: 'You were working on this last time.' },
  next: { icon: '⭐', label: 'Up next', hint: 'The next step on your path.' },
};
export function getReasonCopy(reason: RankedTopic['reason'] | null | undefined): ReasonCopy | null {
  return reason && reason !== 'fallback' ? REASON_COPY[reason] : null;
}
export const DIFFICULTY_COPY: Record<DifficultyBand, { label: string; description: string }> = {
  easy: { label: 'Gentle pace', description: 'We will build the foundations step by step.' },
  normal: { label: 'Steady pace', description: 'You have a good base. Keep the rhythm going.' },
  hard: { label: 'Fast track', description: 'You already know a lot. Aim for perfect scores.' },
};

export type StartupInsight = {
  percentage: number;
  difficulty: DifficultyBand;
  icon: string;
  title: string;
  message: string;
  /** Topics scored below the remediation threshold, only when they stand out from the rest. */
  focusTopicKeys: string[];
};
/** Turns a startup assessment into a short, encouraging summary for the learner. */
export function describeStartupInsight(s: StartupAssessment | null, topicKeys: string[] = []): StartupInsight | null {
  if (!s?.takenAt) return null;
  const percentage = clampScore(Number(s.percentage) || 0);
  const difficulty = computeRecommendedDifficulty(percentage);
  const icon = difficulty === 'hard' ? '🚀' : difficulty === 'normal' ? '🧭' : '🌱';
  const title = difficulty === 'hard' ? 'Great head start!' : difficulty === 'normal' ? 'Solid foundation' : 'Let’s build it together';
  const weak = getRemediationTopics(s, topicKeys).map((w) => w.topicKey);
  // When every topic shares the same score the list says nothing new, so hide it.
  const focusTopicKeys = weak.length > 0 && weak.length < topicKeys.length ? weak : [];
  return {
    percentage, difficulty, icon, title, focusTopicKeys,
    message: `You scored ${percentage}% on the placement check. ${DIFFICULTY_COPY[difficulty].description}`,
  };
}



export function getRemediationTopics(s: StartupAssessment | null, keys: string[]): Array<{ topicKey: string; score: number; stars: number }> {
  if (!s?.topicMastery) return [];
  return keys.map((k) => { const m = s.topicMastery[k]; return m ? { topicKey: k, score: m.score, stars: m.stars } : null; })
    .filter((i): i is { topicKey: string; score: number; stars: number } => i !== null && i.score < REMEDIATION_THRESHOLD)
    .sort((a, b) => a.score - b.score);
}
export function checkNodeReadiness({ moduleKey, previousModuleCompleted, startupAssessments, moduleQuizResults }: {
  moduleKey: string; previousModuleCompleted: boolean;
  startupAssessments: Record<string, StartupAssessment | undefined>;
  moduleQuizResults: Record<string, { percentage: number }>;
}): NodeReadiness {
  const startupTaken = hasStartupAssessment(startupAssessments, moduleKey);
  const finalPassed = isModuleQuizPassed(moduleQuizResults, moduleKey);
  let ready = false, reason: string | null = null;
  if (startupTaken) ready = true;
  else if (previousModuleCompleted) ready = true;
  else { ready = false; reason = 'Take the startup assessment before starting lessons in this module.'; }
  return { ready, reason, startupTaken, finalPassed };
}
export function isModuleQuizPassed(r: Record<string, { percentage: number } | undefined>, k: string, threshold: number = MODULE_QUIZ_PASS_THRESHOLD): boolean {
  const rec = r?.[k];
  return Boolean(rec && Number(rec.percentage) >= threshold);
}
export function checkNodeGate({ moduleKey, lessonProgress, country, topics, moduleQuizResults }: {
  moduleKey: string; lessonProgress: Record<string, Record<string, string[]>>; country: string;
  topics: Array<{ id: string; subLessons: Array<{ id: string }> }>;
  moduleQuizResults: Record<string, { percentage: number } | undefined>;
}): NodeGate {
  let topicsComplete = true;
  for (const t of topics) {
    const p = getTopicProgress(lessonProgress, country, t);
    if (p.total === 0 || p.count < p.total) { topicsComplete = false; break; }
  }
  const quizPassed = isModuleQuizPassed(moduleQuizResults, moduleKey);
  const unlocked = topicsComplete && quizPassed;
  let reason: string | null = null;
  if (!topicsComplete) reason = 'Finish every topic in this module before taking the final assessment.';
  else if (!quizPassed) reason = 'Pass the final module assessment to unlock the next node.';
  return { unlocked, reason, topicsComplete, quizPassed };
}
export { starsForScore };
export function isPassingScore(score: number): boolean { return clampScore(score) >= PASSING_PERCENTAGE; }
