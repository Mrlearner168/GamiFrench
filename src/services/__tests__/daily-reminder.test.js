/*
 * Scheduling side of the daily reminders, against a fake notification store
 * that behaves like the real one: scheduling with an existing identifier
 * replaces it.
 */
import { REMINDER_DAYS_AHEAD } from '@/services/reminder-messages';
import {
  cancelDailyReminders,
  refreshDailyReminders,
  setRemindersEnabled,
} from '@/services/dailyReminder';


// jest.mock calls below are hoisted above these imports by Jest.
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

const mockScheduled = new Map();
const mockPermission = { granted: true };
jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ ...mockPermission, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ ...mockPermission })),
  scheduleNotificationAsync: jest.fn(async ({ identifier, content, trigger }) => {
    // Yield like the native bridge does, so overlapping refreshes interleave.
    await Promise.resolve();
    mockScheduled.set(identifier, { identifier, content, trigger });
    return identifier;
  }),
  getAllScheduledNotificationsAsync: jest.fn(async () => [...mockScheduled.values()]),
  cancelScheduledNotificationAsync: jest.fn(async (id) => {
    mockScheduled.delete(id);
  }),
}));

const mockPrefs = new Map();
jest.mock('@/store/local-store', () => ({
  readJson: jest.fn(async (key, fallback) => (mockPrefs.has(key) ? mockPrefs.get(key) : fallback)),
  writeJson: jest.fn(async (key, value) => {
    mockPrefs.set(key, value);
  }),
}));

let mockTodaySubLessons = [];
jest.mock('@/store/challenge-progress', () => ({
  loadChallengeState: jest.fn(async () => {
    const { toDateKey } = jest.requireActual('@/data/challenges/challengeCatalog');
    return { days: { [toDateKey(new Date())]: { subLessons: mockTodaySubLessons } } };
  }),
}));

const reminderDays = () =>
  [...mockScheduled.values()].map((request) => request.identifier).sort();

beforeEach(() => {
  mockScheduled.clear();
  mockPrefs.clear();
  mockPermission.granted = true;
  mockTodaySubLessons = [];
  // 10:00 so today's 19:00 slot is still ahead.
  jest.useFakeTimers({ now: new Date(2026, 10, 5, 10, 0), doNotFake: ['nextTick', 'setImmediate'] });
});

afterEach(() => {
  jest.useRealTimers();
});

it('schedules one reminder per day for two weeks', async () => {
  await refreshDailyReminders({ name: 'Ana' });

  expect(mockScheduled.size).toBe(REMINDER_DAYS_AHEAD);
  expect(reminderDays()[0]).toBe('daily-reminder-2026-11-05');
});

it('never doubles up when refreshes overlap or repeat', async () => {
  await Promise.all([
    refreshDailyReminders({ name: 'Ana' }),
    refreshDailyReminders({ name: 'Ana' }),
    refreshDailyReminders({ name: 'Ana' }),
  ]);
  await refreshDailyReminders({ name: 'Ana' });

  expect(mockScheduled.size).toBe(REMINDER_DAYS_AHEAD);
  expect(new Set(reminderDays()).size).toBe(REMINDER_DAYS_AHEAD);
});

it("drops today's reminder once the learner has practised", async () => {
  await refreshDailyReminders({ name: 'Ana' });
  expect(mockScheduled.has('daily-reminder-2026-11-05')).toBe(true);

  mockTodaySubLessons = [{ id: 'm1-l1-alphabet' }];
  await refreshDailyReminders({ name: 'Ana' });

  expect(mockScheduled.has('daily-reminder-2026-11-05')).toBe(false);
  expect(mockScheduled.has('daily-reminder-2026-11-06')).toBe(true);
});

it('turning reminders off removes them, turning on brings them back', async () => {
  await refreshDailyReminders({ name: 'Ana' });

  await setRemindersEnabled(false, { name: 'Ana' });
  expect(mockScheduled.size).toBe(0);

  await setRemindersEnabled(true, { name: 'Ana' });
  expect(mockScheduled.size).toBe(REMINDER_DAYS_AHEAD);
});

it('schedules nothing without notification permission', async () => {
  mockPermission.granted = false;
  await refreshDailyReminders({ name: 'Ana' });
  expect(mockScheduled.size).toBe(0);
});

it('sign-out cancels every reminder, even one queued just before', async () => {
  const refresh = refreshDailyReminders({ name: 'Ana' });
  const cancel = cancelDailyReminders();
  await Promise.all([refresh, cancel]);

  expect(mockScheduled.size).toBe(0);
});
