/**
 * Daily improvement reminders (local notifications, no server).
 *
 * - The learner turns them on/off and picks a time in Settings; the choice is
 *   stored on this device.
 * - Every app visit plans the next REMINDER_DAYS_AHEAD days again with
 *   rotating, personalised messages (services/reminder-messages.js), skipping
 *   today once the learner has already practised.
 * - Signing out cancels them, so the next account starts clean.
 *
 * Every reminder has a fixed id per day (`daily-reminder-YYYY-MM-DD`), so
 * planning again REPLACES that day's reminder instead of adding a second one,
 * and all changes run one after another. Together this keeps it at one
 * reminder a day even when refreshes overlap (launch + "app active") or the
 * phone pauses the app halfway through one (refresh on going to background).
 *
 * Not available on web (expo-notifications only schedules on Android / iOS).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { toDateKey } from '@/data/challenges/challengeCatalog';
import {
  DEFAULT_REMINDER_TIME_ID,
  planReminders,
} from '@/services/reminder-messages';
import { loadChallengeState } from '@/store/challenge-progress';
import { readJson, writeJson } from '@/store/local-store';

const PREFS_KEY = 'gamifrench.daily-reminder';
export const REMINDER_CHANNEL_ID = 'daily-reminder';
const REMINDER_KIND = 'daily-reminder';
const reminderId = (date) => `${REMINDER_KIND}-${toDateKey(date)}`;

/* Runs reminder changes strictly one after another. */
let queue = Promise.resolve();
function serialized(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

export const isReminderSupported = Platform.OS === 'android' || Platform.OS === 'ios';

const DEFAULT_PREFS = {
  enabled: true,
  timeId: DEFAULT_REMINDER_TIME_ID,
  // Set once the learner has been asked, so the system prompt shows only once.
  asked: false,
};

export async function loadReminderPrefs() {
  const stored = await readJson(PREFS_KEY, null);
  return { ...DEFAULT_PREFS, ...(stored ?? {}) };
}

async function saveReminderPrefs(prefs) {
  await writeJson(PREFS_KEY, prefs);
  return prefs;
}

/* Android needs the channel before the permission prompt can appear. */
async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Daily reminders',
    description: 'A daily nudge to keep your French improving.',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 150, 250],
    lightColor: '#208AEF',
  });
}

function isAllowed(settings) {
  return Boolean(
    settings?.granted
      || settings?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
  );
}

export async function hasReminderPermission() {
  if (!isReminderSupported) return false;
  return isAllowed(await Notifications.getPermissionsAsync());
}

/** Ask the system for permission (shows the prompt at most once per install). */
export async function requestReminderPermission() {
  if (!isReminderSupported) return false;
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (isAllowed(current)) return true;
  if (current.canAskAgain === false) return false;
  return isAllowed(await Notifications.requestPermissionsAsync());
}

async function scheduledReminderIds() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled
    .filter((request) => request.content?.data?.kind === REMINDER_KIND)
    .map((request) => request.identifier);
}

async function cancelIds(ids) {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

/** Remove every reminder this module scheduled (other notifications are kept). */
export function cancelDailyReminders() {
  if (!isReminderSupported) return Promise.resolve();
  return serialized(async () => cancelIds(await scheduledReminderIds()));
}

async function practicedToday() {
  try {
    const state = await loadChallengeState();
    return (state?.days?.[toDateKey(new Date())]?.subLessons?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Plan the reminders again from now. Does nothing (beyond clearing old ones)
 * when they are turned off or notifications are not allowed.
 * Returns how many were scheduled.
 */
export function refreshDailyReminders({ name } = {}) {
  if (!isReminderSupported) return Promise.resolve(0);
  return serialized(() => planAndSchedule({ name }));
}

async function planAndSchedule({ name }) {
  const prefs = await loadReminderPrefs();
  const existing = await scheduledReminderIds();

  if (!prefs.enabled || !(await hasReminderPermission())) {
    await cancelIds(existing);
    return 0;
  }

  await ensureChannel();
  const plan = planReminders({
    now: new Date(),
    timeId: prefs.timeId,
    practicedToday: await practicedToday(),
    name,
  });

  // Schedule first (same id = replace), then drop days no longer planned,
  // e.g. today after a lesson. An interruption never leaves zero or doubles.
  const planned = new Set();
  for (const reminder of plan) {
    const identifier = reminderId(reminder.date);
    planned.add(identifier);
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: 'default',
        color: '#208AEF',
        data: { kind: REMINDER_KIND, url: '/home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  }
  await cancelIds(existing.filter((id) => !planned.has(id)));

  return plan.length;
}

/**
 * First visit after signing in: ask once whether reminders may be shown.
 * Later visits only re-plan them.
 */
export async function setUpDailyReminders({ name } = {}) {
  if (!isReminderSupported) return 0;

  const prefs = await loadReminderPrefs();
  if (prefs.enabled && !prefs.asked) {
    await saveReminderPrefs({ ...prefs, asked: true });
    await requestReminderPermission();
  }
  return refreshDailyReminders({ name });
}

/** Settings: turn reminders on/off. Returns `{ enabled, permission }`. */
export async function setRemindersEnabled(enabled, { name } = {}) {
  const prefs = await saveReminderPrefs({ ...(await loadReminderPrefs()), enabled, asked: true });
  const permission = enabled ? await requestReminderPermission() : await hasReminderPermission();
  await refreshDailyReminders({ name });
  return { enabled: prefs.enabled, permission };
}

/** Settings: pick the reminder time, then re-plan. */
export async function setReminderTime(timeId, { name } = {}) {
  await saveReminderPrefs({ ...(await loadReminderPrefs()), timeId });
  return refreshDailyReminders({ name });
}
