/**
 * Offline copies of the placement checks and final quizzes.
 *
 * The questions come from the server (which keeps the answer keys), so a quiz
 * could not even open without a connection. Every assessment fetched online is
 * stored here, and `prefetchAssessments()` downloads them all in the
 * background, so a learner who goes offline can still take any quiz. The
 * answers are queued and graded by the server on the next sync (see
 * result.jsx and pending-sync.ts).
 *
 * The copies hold no personal data (questions only; the per-learner `hearts`
 * field is dropped), so one shared copy per assessment key is enough.
 */
import { readJson, writeJson } from '@/store/local-store';

const MODULE_COUNT = 10;
/** Re-download at most once a day; the questions rarely change. */
const REFRESH_MS = 24 * 60 * 60 * 1000;
const INDEX_KEY = 'gamifrench.assessment-cache.index';

const entryKey = (assessmentKey: string) => `gamifrench.assessment-cache.${assessmentKey}`;

type Assessment = { questions?: unknown[]; hearts?: unknown; [key: string]: unknown };
type RequestSender = (path: string, options?: RequestInit) => Promise<unknown>;

/** Every quiz the app can open: the placement check and final of each module. */
export function allAssessmentKeys(): string[] {
  return Array.from({ length: MODULE_COUNT }, (_, index) => [
    `placement-module-${index + 1}`,
    `module-${index + 1}`,
  ]).flat();
}

/** Store a freshly fetched assessment (questions only). */
export async function saveCachedAssessment(assessmentKey: string, assessment: Assessment) {
  if (!assessmentKey || !Array.isArray(assessment?.questions) || !assessment.questions.length) return;
  const { hearts: _hearts, ...questionsOnly } = assessment;
  await writeJson(entryKey(assessmentKey), questionsOnly);
  const index = await readJson<Record<string, number>>(INDEX_KEY, {});
  await writeJson(INDEX_KEY, { ...index, [assessmentKey]: Date.now() });
}

/** The stored copy, or null when this quiz was never downloaded. */
export async function readCachedAssessment(assessmentKey: string): Promise<Assessment | null> {
  const stored = await readJson<Assessment | null>(entryKey(assessmentKey), null);
  return stored && Array.isArray(stored.questions) && stored.questions.length ? stored : null;
}

let prefetching: Promise<number> | null = null;

/**
 * Download every quiz that is missing or older than a day. Runs in the
 * background (the sync provider calls it after sign-in and on reconnect);
 * failures are skipped, never thrown. Resolves with how many were saved.
 */
export function prefetchAssessments(send: RequestSender): Promise<number> {
  if (prefetching) return prefetching;

  prefetching = (async () => {
    let saved = 0;
    const index = await readJson<Record<string, number>>(INDEX_KEY, {});
    for (const key of allAssessmentKeys()) {
      if (Date.now() - (index[key] ?? 0) < REFRESH_MS) continue;
      try {
        const assessment = (await send(`/assessments/${encodeURIComponent(key)}`)) as Assessment;
        await saveCachedAssessment(key, assessment);
        saved += 1;
      } catch (error) {
        // Offline, or a final blocked at 0 hearts (409): try again later.
        const status = (error as { status?: number })?.status;
        if (status === undefined) break; // no connection: stop for now
      }
    }
    if (saved) console.log(`[AssessmentCache] Saved ${saved} quiz(zes) for offline use.`);
    return saved;
  })().finally(() => {
    prefetching = null;
  });

  return prefetching;
}
