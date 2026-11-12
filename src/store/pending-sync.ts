import { readJson, writeJson } from '@/store/local-store';

/*
 * Offline queue for everything the backend owns.
 *
 * Two rules keep one learner's queued work out of another learner's account:
 *   1. the queue itself is namespaced per learner (`gamifrench.<userId>.pending-sync`),
 *   2. every operation is stamped with the `userId` that created it, and
 *      `flushPendingSync` refuses to replay an operation that belongs to
 *      somebody else. Without this, a batch queued offline by one account was
 *      sent with the next account's token - which is how completed sub-lessons
 *      and XP could appear on a brand-new account.
 */
const GUEST_SCOPE = 'guest';
let syncScope: string | null = null;

const queueKey = () => `gamifrench.${syncScope ?? GUEST_SCOPE}.pending-sync`;

/*
 * Point the queue at one learner. AuthProvider calls it whenever the session
 * changes; the cached operations belong to the previous account and are dropped.
 */
export function setPendingSyncScope(userId: string | null) {
  const next = userId ? String(userId) : null;
  if (next === syncScope) return;

  syncScope = next;
  cachedOperations = null;
  cachedSpeakingAttempts = null;

  console.log(`[Sync] Pending queue scope set to ${next ?? GUEST_SCOPE}.`);
}

function currentOwner() {
  return syncScope ?? GUEST_SCOPE;
}

type ContentProgressOperation = {
  kind: 'content-progress';
  userId: string;
  contentKey: string;
  contentType: 'sublesson';
  moduleKey?: string;
  lessonId?: string;
  sectionId?: string;
  completionStatus?: string;
  completionPercentage?: number;
  timeSpentSeconds?: number;
  /*
   * Quiz answers keyed by question id (a sentence builder answer is a word
   * list). The server grades them; they are the only thing that pays XP.
   */
  answers?: SublessonAnswers;
  /** The device's own grade of `answers`, used only to keep the best queued attempt. */
  localScore?: number;
  /** Device-graded pronunciation score: reported, never paid (see the server docs). */
  speakingScore?: number;
  /**
   * Legacy: queues written before server grading hold only a device score.
   * They are still replayed so the activity reaches the server, which records
   * it but pays nothing for it.
   */
  score?: number;
};

export type SublessonAnswers = Record<string, string | string[]>;

/* Rank of a queued sub-lesson attempt: graded answers always beat a legacy score. */
const contentAttemptRank = (operation: ContentProgressOperation) => (
  operation.answers ? 1000 + (operation.localScore ?? 0) : operation.score ?? 0
);

export type TopicBreakdownRow = {
  contentKey: string;
  quizScore: number;
  speakingScore: number;
  overall: number;
};

export type TopicResultOperation = {
  kind: 'topic-result';
  userId: string;
  topicKey: string;
  moduleKey?: string;
  quizScore: number;
  speakingScore: number;
  subLessonsTotal: number;
  subLessonsCompleted: number;
  speakingAttempts?: number;
  timeSpentSeconds?: number;
  breakdown: TopicBreakdownRow[];
};

type AssessmentAttemptOperation = {
  kind: 'assessment-attempt';
  userId: string;
  assessmentKey: string;
  answers: Record<string, string>;
  idempotencyKey: string;
};

type MissionClaimOperation = {
  kind: 'mission-claim';
  userId: string;
  missionId: number;
  stars: number;
  rewards?: { xp?: number; coins?: number };
};

type ChallengeClaimOperation = {
  kind: 'challenge-claim';
  userId: string;
  challengeId: string;
  periodKey: string;
};

type PendingOperation =
  | ContentProgressOperation
  | AssessmentAttemptOperation
  | MissionClaimOperation
  | TopicResultOperation
  | ChallengeClaimOperation;
type RequestSender = (path: string, options: RequestInit) => Promise<unknown>;

let cachedOperations: PendingOperation[] | null = null;

async function readOperations(): Promise<PendingOperation[]> {
  if (cachedOperations) return cachedOperations;

  const stored = await readJson<PendingOperation[]>(queueKey(), []);
  cachedOperations = Array.isArray(stored) ? stored : [];

  return cachedOperations;
}

async function saveOperations(operations: PendingOperation[]) {
  cachedOperations = operations;
  await writeJson(queueKey(), operations);
}

/*
 * "New work was queued" listeners. The sync engine uses this to refresh the
 * badge count and send the work soon, instead of waiting for a reconnect (which
 * never fires when the phone stayed online but the server was asleep) or the
 * 5-minute timer. Only the enqueue functions notify: a flush rewriting the
 * queue must not, or a failing server would trigger sync after sync.
 */
const queueListeners = new Set<() => void>();

export function subscribeQueueChanges(listener: () => void): () => void {
  queueListeners.add(listener);
  return () => {
    queueListeners.delete(listener);
  };
}

function notifyQueued() {
  queueListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.log('[Sync] queue listener threw', error);
    }
  });
}

export async function enqueueContentProgress(operation: Omit<ContentProgressOperation, 'kind' | 'userId'>) {
  const operations = [...await readOperations()];
  const existingIndex = operations.findIndex((item) => (
    item.kind === 'content-progress'
    && item.contentType === operation.contentType
    && item.contentKey === operation.contentKey
  ));
  const nextOperation: ContentProgressOperation = {
    kind: 'content-progress',
    userId: currentOwner(),
    ...operation,
  };

  if (existingIndex >= 0) {
    /*
     * One pending row per sub-lesson. The server pays the best graded attempt
     * ever, so only the better of the two needs to be sent.
     */
    const existing = operations[existingIndex] as ContentProgressOperation;
    if (contentAttemptRank(nextOperation) >= contentAttemptRank(existing)) {
      operations[existingIndex] = nextOperation;
    }
  } else {
    operations.push(nextOperation);
  }

  await saveOperations(operations);
  notifyQueued();
}

export async function enqueueAssessmentAttempt(operation: Omit<AssessmentAttemptOperation, 'kind' | 'userId'>) {
  const operations = await readOperations();
  if (operations.some((item) => item.kind === 'assessment-attempt' && item.idempotencyKey === operation.idempotencyKey)) {
    return;
  }
  await saveOperations([...operations, { kind: 'assessment-attempt', userId: currentOwner(), ...operation }]);
  notifyQueued();
}

export async function enqueueMissionClaim(operation: Omit<MissionClaimOperation, 'kind' | 'userId'>) {
  const operations = await readOperations();
  if (operations.some((item) => item.kind === 'mission-claim' && item.missionId === operation.missionId)) {
    return;
  }
  await saveOperations([...operations, { kind: 'mission-claim', userId: currentOwner(), ...operation }]);
  notifyQueued();
}

/** Queue a challenge reward collected offline (paid by the server on sync). */
export async function enqueueChallengeClaim(operation: Omit<ChallengeClaimOperation, 'kind' | 'userId'>) {
  const operations = await readOperations();
  if (
    operations.some(
      (item) =>
        item.kind === 'challenge-claim' &&
        item.challengeId === operation.challengeId &&
        item.periodKey === operation.periodKey
    )
  ) {
    return;
  }
  await saveOperations([...operations, { kind: 'challenge-claim', userId: currentOwner(), ...operation }]);
  notifyQueued();
}

/*
 * Queue an end-of-topic result for later sync. One pending row per topic:
 * retries merge by keeping the best accuracy values, mirroring the server's
 * own replay semantics so an offline retry can never submit a worse result
 * than one already queued.
 */
export async function enqueueTopicResult(operation: Omit<TopicResultOperation, 'kind' | 'userId'>) {
  const operations = [...await readOperations()];
  const existingIndex = operations.findIndex((item) => (
    item.kind === 'topic-result' && item.topicKey === operation.topicKey
  ));
  const nextOperation: TopicResultOperation = {
    kind: 'topic-result',
    userId: currentOwner(),
    ...operation,
  };

  if (existingIndex >= 0) {
    const existing = operations[existingIndex] as TopicResultOperation;
    operations[existingIndex] = {
      ...nextOperation,
      quizScore: Math.max(existing.quizScore, operation.quizScore),
      speakingScore: Math.max(existing.speakingScore, operation.speakingScore),
      subLessonsCompleted: Math.max(existing.subLessonsCompleted, operation.subLessonsCompleted),
      subLessonsTotal: Math.max(existing.subLessonsTotal, operation.subLessonsTotal),
      speakingAttempts: Math.max(existing.speakingAttempts ?? 0, operation.speakingAttempts ?? 0),
      timeSpentSeconds: Math.max(existing.timeSpentSeconds ?? 0, operation.timeSpentSeconds ?? 0),
    };
  } else {
    operations.push(nextOperation);
  }

  await saveOperations(operations);
  notifyQueued();
}

export async function flushPendingSync(send: RequestSender) {
  const operations = await readOperations();
  const remaining: PendingOperation[] = [];
  const foreign: PendingOperation[] = [];
  let synchronized = 0;

  for (const operation of operations) {
    /*
     * Defence in depth on top of the per-learner queue key: an operation that
     * was stamped for another account is dropped instead of replayed with the
     * signed-in account's token. Operations without a stamp are still sent, so
     * a queue written by an older build is not silently lost.
     */
    if (operation.userId && syncScope && operation.userId !== syncScope) {
      foreign.push(operation);
      continue;
    }

    try {
      if (operation.kind === 'content-progress') {
        await send('/progress/content', {
          method: 'PUT',
          body: JSON.stringify({
            contentKey: operation.contentKey,
            contentType: operation.contentType,
            moduleKey: operation.moduleKey,
            lessonId: operation.lessonId,
            sectionId: operation.sectionId,
            completionStatus: operation.completionStatus,
            completionPercentage: operation.completionPercentage,
            timeSpentSeconds: operation.timeSpentSeconds,
            ...(operation.answers
              ? { answers: operation.answers }
              : { score: operation.score }),
            speakingScore: operation.speakingScore,
          }),
        });
      } else if (operation.kind === 'topic-result') {
        await send('/progress/topics', {
          method: 'PUT',
          body: JSON.stringify({
            topicKey: operation.topicKey,
            moduleKey: operation.moduleKey,
            quizScore: operation.quizScore,
            speakingScore: operation.speakingScore,
            subLessonsTotal: operation.subLessonsTotal,
            subLessonsCompleted: operation.subLessonsCompleted,
            speakingAttempts: operation.speakingAttempts ?? 0,
            timeSpentSeconds: operation.timeSpentSeconds ?? 0,
            breakdown: operation.breakdown ?? [],
          }),
        });
      } else if (operation.kind === 'assessment-attempt') {
        await send(`/assessments/${encodeURIComponent(operation.assessmentKey)}/attempts`, {
          method: 'POST',
          body: JSON.stringify({
            answers: operation.answers,
            idempotencyKey: operation.idempotencyKey,
          }),
        });
      } else if (operation.kind === 'challenge-claim') {
        await send('/challenges/claim', {
          method: 'POST',
          body: JSON.stringify({
            challengeId: operation.challengeId,
            periodKey: operation.periodKey,
          }),
        });
      } else {
        await send('/missions/claim', {
          method: 'POST',
          body: JSON.stringify({
            missionId: operation.missionId,
            rewards: operation.rewards ?? {},
            stars: operation.stars,
          }),
        });
      }
      synchronized += 1;
    } catch (error) {
      // A definite refusal (e.g. 409 MISSION_NOT_COMPLETE, 422 invalid) will
      // never succeed on a retry, so it is dropped instead of blocking the
      // queue forever. Connection problems, 401 (token refresh), 408, 429 and
      // 5xx stay queued for the next flush. So does 404: the server answers it
      // only when the endpoint itself is missing (an older deploy, e.g. before
      // /challenges/claim existed), and the work must survive until it ships.
      const status = (error as { status?: number })?.status;
      const refused =
        typeof status === 'number' &&
        status >= 400 &&
        status < 500 &&
        ![401, 404, 408, 429].includes(status);
      if (refused) {
        // console.warn(`[Sync] Server refused a queued ${operation.kind} (${status}); dropping it.`);
        console.warn('Some offline progress could not be saved. Replaying that activity will record it again.');
      } else {
        remaining.push(operation);
      }
    }
  }

  await saveOperations(remaining);

  if (foreign.length) {
    // console.warn(
    //   `[Sync] Dropped ${foreign.length} queued operation(s) that belong to another learner.`
    // );
    console.warn('Saved progress from a different account on this device was skipped.');
  }

  return synchronized;
}

/* ---------------------------------------------------------------------------
 * DEFERRED SPEAKING ATTEMPTS
 *
 * When the device is offline AND no on-device recognizer can produce a
 * transcript for the target language, the speaking check cannot be graded on
 * the spot. Instead of throwing the attempt away (which kills engagement), the
 * clip is stored here and re-transcribed + scored on the next sync, then
 * submitted as a normal content-progress update.
 *
 * This queue is kept apart from the HTTP operation queue above because its
 * entries are processed on the client (they need the transcription engine)
 * before an HTTP call is made.
 * ------------------------------------------------------------------------- */
export type PendingSpeakingAttempt = {
  kind: 'speaking-attempt';
  userId: string;
  contentKey: string;
  moduleKey?: string;
  targetPhrase: string;
  audioFileUri: string;
  localScore: number;
  idempotencyKey: string;
  createdAt: string;
};

let cachedSpeakingAttempts: PendingSpeakingAttempt[] | null = null;

const speakingQueueKey = () =>
  `gamifrench.${syncScope ?? GUEST_SCOPE}.speaking-attempts`;

export async function pendingSpeakingAttempts(): Promise<PendingSpeakingAttempt[]> {
  if (cachedSpeakingAttempts) return cachedSpeakingAttempts;

  const stored = await readJson<PendingSpeakingAttempt[]>(speakingQueueKey(), []);
  cachedSpeakingAttempts = Array.isArray(stored) ? stored : [];

  return cachedSpeakingAttempts;
}

export async function enqueueSpeakingAttempt(
  operation: Omit<PendingSpeakingAttempt, 'kind' | 'userId'>
): Promise<void> {
  const attempts = [...(await pendingSpeakingAttempts())];

  if (attempts.some((item) => item.idempotencyKey === operation.idempotencyKey)) {
    return;
  }

  attempts.push({ kind: 'speaking-attempt', userId: currentOwner(), ...operation });
  cachedSpeakingAttempts = attempts;
  await writeJson(speakingQueueKey(), attempts);
  notifyQueued();
}

export async function removePendingSpeakingAttempt(idempotencyKey: string): Promise<void> {
  const attempts = (await pendingSpeakingAttempts()).filter(
    (item) => item.idempotencyKey !== idempotencyKey
  );

  cachedSpeakingAttempts = attempts;
  await writeJson(speakingQueueKey(), attempts);
}

export async function pendingSpeakingAttemptCount(): Promise<number> {
  return (await pendingSpeakingAttempts()).length;
}

/** Total queued work (HTTP operations + deferred clips) shown in the UI. */
export async function pendingCount(): Promise<number> {
  const [operations, attempts] = await Promise.all([
    readOperations(),
    pendingSpeakingAttempts(),
  ]);

  return operations.length + attempts.length;
}
