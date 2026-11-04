/**
 * The sync engine is the heart of "upload when the internet comes back":
 * push first, upgrade deferred clips, then pull. These tests pin that order and
 * the retry behaviour.
 */
jest.mock('@/store/pending-sync', () => ({
  flushPendingSync: jest.fn(),
  pendingCount: jest.fn(),
  pendingSpeakingAttempts: jest.fn(),
  removePendingSpeakingAttempt: jest.fn(),
  // The engine subscribes once at import; keep the listener to fire it by hand.
  subscribeQueueChanges: jest.fn((listener) => {
    global.__queueListener = listener;
    return () => {};
  }),
}));

import {
  flushPendingSync,
  pendingCount,
  pendingSpeakingAttempts,
  removePendingSpeakingAttempt,
} from '@/store/pending-sync';
import {
  configureSyncEngine,
  getSyncStatus,
  QUEUED_SYNC_DELAYS_MS,
  resetSyncEngine,
  runSync,
} from '@/store/sync-engine';

beforeEach(() => {
  jest.clearAllMocks();
  resetSyncEngine();
  pendingCount.mockResolvedValue(0);
  pendingSpeakingAttempts.mockResolvedValue([]);
});

it('pushes local progress before pulling the server state', async () => {
  const order = [];
  flushPendingSync.mockImplementation(async () => {
    order.push('push');
    return 2;
  });
  const pull = jest.fn(async () => {
    order.push('pull');
  });

  configureSyncEngine({ send: jest.fn(), pull });
  const result = await runSync('manual');

  expect(order).toEqual(['push', 'pull']);
  expect(result.pushed).toBe(2);
  expect(result.pulled).toBe(true);
});

it('upgrades deferred speaking attempts and removes them on success', async () => {
  flushPendingSync.mockResolvedValue(0);
  pendingSpeakingAttempts.mockResolvedValue([{ idempotencyKey: 'k1' }]);
  const upgradeSpeakingAttempt = jest.fn(async () => {});

  configureSyncEngine({ send: jest.fn(), upgradeSpeakingAttempt });
  const result = await runSync('reconnect');

  expect(upgradeSpeakingAttempt).toHaveBeenCalledTimes(1);
  expect(removePendingSpeakingAttempt).toHaveBeenCalledWith('k1');
  expect(result.speakingUpgraded).toBe(1);
});

it('keeps a deferred attempt queued when the upgrade still fails', async () => {
  flushPendingSync.mockResolvedValue(0);
  pendingSpeakingAttempts.mockResolvedValue([{ idempotencyKey: 'k2' }]);
  const upgradeSpeakingAttempt = jest.fn(async () => {
    throw new Error('still no transcript');
  });

  configureSyncEngine({ send: jest.fn(), upgradeSpeakingAttempt });
  await runSync('interval');

  expect(removePendingSpeakingAttempt).not.toHaveBeenCalled();
});

it('coalesces concurrent runs into a single cycle', async () => {
  let release;
  flushPendingSync.mockImplementation(
    () => new Promise((resolve) => {
      release = resolve;
    })
  );

  configureSyncEngine({ send: jest.fn() });

  const first = runSync('manual');
  const second = runSync('manual');

  expect(second).toBe(first);

  release(0);
  await first;

  expect(flushPendingSync).toHaveBeenCalledTimes(1);
});

it('does nothing until it is configured with a session', async () => {
  const result = await runSync('startup');

  expect(result.pushed).toBe(0);
  expect(flushPendingSync).not.toHaveBeenCalled();
});

describe('work queued while the phone stays online', () => {
  const queueSomething = () => global.__queueListener();
  // Let the awaited promises inside a timer callback settle.
  const settle = async () => {
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    resetSyncEngine();
    jest.useRealTimers();
  });

  it('updates the badge count as soon as something is queued', async () => {
    pendingCount.mockResolvedValue(3);
    configureSyncEngine({ send: jest.fn() });

    queueSomething();
    await settle();

    expect(getSyncStatus().pendingCount).toBe(3);
    expect(flushPendingSync).not.toHaveBeenCalled();
  });

  it('sends the queue shortly after, without waiting for a reconnect', async () => {
    flushPendingSync.mockResolvedValue(1);
    configureSyncEngine({ send: jest.fn() });

    queueSomething();
    jest.advanceTimersByTime(QUEUED_SYNC_DELAYS_MS[0]);
    await settle();

    expect(flushPendingSync).toHaveBeenCalledTimes(1);
  });

  it('retries while the server is still waking up, then stops', async () => {
    flushPendingSync.mockResolvedValue(0);
    pendingCount.mockResolvedValue(1); // never drains
    configureSyncEngine({ send: jest.fn() });

    queueSomething();
    for (const delay of QUEUED_SYNC_DELAYS_MS) {
      jest.advanceTimersByTime(delay);
      await settle();
    }
    jest.advanceTimersByTime(10 * 60 * 1000);
    await settle();

    expect(flushPendingSync).toHaveBeenCalledTimes(QUEUED_SYNC_DELAYS_MS.length);
  });

  it('does not retry once the queue is empty', async () => {
    flushPendingSync.mockResolvedValue(1);
    pendingCount.mockResolvedValue(0);
    configureSyncEngine({ send: jest.fn() });

    queueSomething();
    jest.advanceTimersByTime(QUEUED_SYNC_DELAYS_MS[0]);
    await settle();
    jest.advanceTimersByTime(10 * 60 * 1000);
    await settle();

    expect(flushPendingSync).toHaveBeenCalledTimes(1);
  });

  it('never sends after sign-out', async () => {
    configureSyncEngine({ send: jest.fn() });

    queueSomething();
    resetSyncEngine();
    jest.advanceTimersByTime(60 * 1000);
    await settle();

    expect(flushPendingSync).not.toHaveBeenCalled();
  });
});
