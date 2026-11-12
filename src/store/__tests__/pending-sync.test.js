/*
 * The offline queue for sub-lesson progress carries the learner's quiz
 * answers, not a score: the server grades them, so a replayed attempt is paid
 * exactly what it earned. Queues written by older builds (score only) are still
 * replayed so the activity is not lost, but the server pays nothing for them.
 */
const mockStore = new Map();

jest.mock('@/store/local-store', () => ({
  readJson: jest.fn(async (key, fallback) => (mockStore.has(key) ? mockStore.get(key) : fallback)),
  writeJson: jest.fn(async (key, value) => {
    mockStore.set(key, value);
  }),
}));

import {
  enqueueChallengeClaim,
  enqueueContentProgress,
  flushPendingSync,
  pendingCount,
  setPendingSyncScope,
} from '@/store/pending-sync';

let scope = 0;

beforeEach(() => {
  mockStore.clear();
  // A fresh scope drops the module's in-memory cache between tests.
  scope += 1;
  setPendingSyncScope(`learner-${scope}`);
});

const sentBodies = async () => {
  const send = jest.fn().mockResolvedValue({});
  await flushPendingSync(send);
  return send.mock.calls.map(([path, options]) => ({ path, body: JSON.parse(options.body) }));
};

const attempt = (answers, localScore) => ({
  contentKey: 'm1-l1-alphabet',
  contentType: 'sublesson',
  moduleKey: 'module-1',
  answers,
  localScore,
});

describe('queued sub-lesson attempts', () => {
  it('replay the answers for the server to grade, never a score', async () => {
    await enqueueContentProgress({
      ...attempt({ q1: 'ah', q2: ['Bonjour', 'mon', 'ami'] }, 60),
      speakingScore: 90,
    });

    const [call] = await sentBodies();

    expect(call.path).toBe('/progress/content');
    expect(call.body.answers).toEqual({ q1: 'ah', q2: ['Bonjour', 'mon', 'ami'] });
    expect(call.body.speakingScore).toBe(90);
    expect(call.body).not.toHaveProperty('score');
    expect(call.body).not.toHaveProperty('localScore');
  });

  it('keep only the best attempt per sub-lesson', async () => {
    await enqueueContentProgress(attempt({ q1: 'ah' }, 80));
    await enqueueContentProgress(attempt({ q1: 'ee' }, 40));

    const calls = await sentBodies();

    expect(calls).toHaveLength(1);
    expect(calls[0].body.answers).toEqual({ q1: 'ah' });
  });

  it('let a better attempt replace a worse one', async () => {
    await enqueueContentProgress(attempt({ q1: 'ee' }, 40));
    await enqueueContentProgress(attempt({ q1: 'ah' }, 80));

    const calls = await sentBodies();

    expect(calls).toHaveLength(1);
    expect(calls[0].body.answers).toEqual({ q1: 'ah' });
  });

  it('let graded answers replace a legacy score-only entry', async () => {
    // What an older build left in the queue.
    mockStore.set(`gamifrench.learner-${scope}.pending-sync`, [
      {
        kind: 'content-progress',
        userId: `learner-${scope}`,
        contentKey: 'm1-l1-alphabet',
        contentType: 'sublesson',
        moduleKey: 'module-1',
        score: 100,
      },
    ]);

    await enqueueContentProgress(attempt({ q1: 'ah' }, 20));

    const calls = await sentBodies();

    expect(calls).toHaveLength(1);
    expect(calls[0].body.answers).toEqual({ q1: 'ah' });
    expect(calls[0].body).not.toHaveProperty('score');
  });

  it('still replay a legacy score-only entry so the activity is not lost', async () => {
    mockStore.set(`gamifrench.learner-${scope}.pending-sync`, [
      {
        kind: 'content-progress',
        userId: `learner-${scope}`,
        contentKey: 'm1-l2-vowels',
        contentType: 'sublesson',
        moduleKey: 'module-1',
        score: 75,
      },
    ]);

    const [call] = await sentBodies();

    expect(call.body.contentKey).toBe('m1-l2-vowels');
    expect(call.body.score).toBe(75);
    expect(call.body).not.toHaveProperty('answers');
  });
});

describe('queued challenge claims', () => {
  const failWith = (status) =>
    jest.fn().mockRejectedValue(Object.assign(new Error('refused'), { status }));

  it('stay queued while the server has no /challenges/claim yet (404)', async () => {
    await enqueueChallengeClaim({ challengeId: 'daily-quick-win', periodKey: '2026-11-05' });

    await flushPendingSync(failWith(404));
    expect(await pendingCount()).toBe(1);

    const send = jest.fn().mockResolvedValue({});
    expect(await flushPendingSync(send)).toBe(1);
    expect(send).toHaveBeenCalledWith('/challenges/claim', expect.objectContaining({ method: 'POST' }));
    expect(await pendingCount()).toBe(0);
  });

  it('are dropped on a final refusal (409)', async () => {
    await enqueueChallengeClaim({ challengeId: 'daily-quick-win', periodKey: '2026-11-05' });

    await flushPendingSync(failWith(409));
    expect(await pendingCount()).toBe(0);
  });
});
