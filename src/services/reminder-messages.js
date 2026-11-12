/*
 * Daily reminder wording + planning, kept free of native modules so it can be
 * unit-tested. The notification side lives in services/dailyReminder.js.
 *
 * `{name}` is replaced with the learner's first name (or "friend").
 */

export const REMINDER_MESSAGES = [
  {
    title: '🔥 Your streak is on fire — don’t let it fizzle!',
    body: '{name}, 5 minutes of French keeps the flame alive. Allez, on y va! 🇫🇷',
  },
  {
    title: '🇫🇷 Psst… Paris is calling!',
    body: 'Your next mission is waiting, {name}. Tap in and level up your French today.',
  },
  {
    title: '⚡ Quick win alert!',
    body: 'One sub-lesson = fresh XP, coins and bragging rights. Ready, {name}?',
  },
  {
    title: '🏆 Today’s challenges just dropped!',
    body: 'Clear them before midnight for bonus XP and shiny coins 🪙',
  },
  {
    title: '🧠 Your brain called — it wants French!',
    body: 'Just 5 minutes a day makes French stick. Let’s make today count, {name}!',
  },
  {
    title: '🗺️ Your passport is getting dusty…',
    body: 'Canada, Morocco, Ivory Coast… où allons-nous aujourd’hui? ✈️',
  },
  {
    title: '❤️ Hearts full. Coins ready. Let’s go!',
    body: 'Everything’s set for a perfect run, {name}. Show that quiz who’s boss! 💪',
  },
  {
    title: '🎯 Small steps, BIG French',
    body: 'Every lesson pushes you closer to your next level. Keep climbing! 📈',
  },
  {
    title: '🌟 Bonjour, superstar!',
    body: 'Your daily French boost is ready. Tap to keep your progress glowing ✨',
  },
  {
    title: '🚀 Level-up time, {name}!',
    body: 'You’re closer to the next level than you think. One lesson could do it!',
  },
];

/* Sent on the last planned day: the learner has not opened the app for a while. */
export const COMEBACK_MESSAGE = {
  title: '😢 We miss you, {name}!',
  body: 'Your French adventure is waiting right where you left it. Come back for one quick lesson 💙',
};

/* Times the learner can pick in Settings. */
export const REMINDER_TIMES = [
  { id: 'morning', label: 'Morning', hour: 8, minute: 0 },
  { id: 'noon', label: 'Lunch', hour: 12, minute: 30 },
  { id: 'afternoon', label: 'Afternoon', hour: 16, minute: 0 },
  { id: 'evening', label: 'Evening', hour: 19, minute: 0 },
  { id: 'night', label: 'Night', hour: 21, minute: 0 },
];

export const DEFAULT_REMINDER_TIME_ID = 'evening';

/*
 * How many days ahead are scheduled. Every app visit plans them again, so an
 * active learner always gets fresh, rotating messages; a learner who stops
 * opening the app keeps getting reminders for two weeks, ending on the
 * "we miss you" message, instead of being nagged forever.
 */
export const REMINDER_DAYS_AHEAD = 14;

export function reminderTime(timeId) {
  return REMINDER_TIMES.find((time) => time.id === timeId)
    ?? REMINDER_TIMES.find((time) => time.id === DEFAULT_REMINDER_TIME_ID);
}

function fillName(text, name) {
  const firstName = String(name ?? '').trim().split(/\s+/)[0] || 'friend';
  return text.replaceAll('{name}', firstName);
}

/* Day number since 1970 in local time, so the message changes every calendar day. */
function localDayNumber(date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

/**
 * The reminders to schedule from `now`: one per day at the chosen time.
 *
 * - Today is skipped once the time has passed, or when the learner already
 *   practised today (no point nagging someone who just studied).
 * - Messages rotate by calendar day; the last planned day gets the comeback
 *   message.
 *
 * Returns `[{ date, title, body }]`, earliest first.
 */
export function planReminders({
  now = new Date(),
  timeId = DEFAULT_REMINDER_TIME_ID,
  practicedToday = false,
  name = '',
  days = REMINDER_DAYS_AHEAD,
} = {}) {
  const { hour, minute } = reminderTime(timeId);
  const plan = [];

  for (let offset = 0; plan.length < days && offset <= days; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute, 0, 0);
    if (offset === 0 && (practicedToday || date <= now)) continue;
    plan.push(date);
  }

  return plan.map((date, index) => {
    const isLast = index === plan.length - 1 && plan.length >= days;
    const message = isLast
      ? COMEBACK_MESSAGE
      : REMINDER_MESSAGES[localDayNumber(date) % REMINDER_MESSAGES.length];
    return {
      date,
      title: fillName(message.title, name),
      body: fillName(message.body, name),
    };
  });
}
