import {
  COMEBACK_MESSAGE,
  REMINDER_DAYS_AHEAD,
  REMINDER_MESSAGES,
  planReminders,
  reminderTime,
} from '@/services/reminder-messages';

// Thursday 5 Nov 2026, 10:00 local time.
const MORNING = new Date(2026, 10, 5, 10, 0);
const LATE_NIGHT = new Date(2026, 10, 5, 22, 0);

describe('planReminders', () => {
  it('plans one reminder a day at the chosen time, starting today', () => {
    const plan = planReminders({ now: MORNING, timeId: 'evening', name: 'Johanna Reyes' });

    expect(plan).toHaveLength(REMINDER_DAYS_AHEAD);
    expect(plan[0].date).toEqual(new Date(2026, 10, 5, 19, 0));
    expect(plan[1].date).toEqual(new Date(2026, 10, 6, 19, 0));
    plan.forEach((reminder) => {
      expect(reminder.date.getHours()).toBe(19);
      expect(reminder.date.getMinutes()).toBe(0);
    });
  });

  it('skips today once the time has passed', () => {
    const plan = planReminders({ now: LATE_NIGHT, timeId: 'evening' });
    expect(plan[0].date).toEqual(new Date(2026, 10, 6, 19, 0));
    expect(plan).toHaveLength(REMINDER_DAYS_AHEAD);
  });

  it('skips today when the learner already practised', () => {
    const plan = planReminders({ now: MORNING, timeId: 'evening', practicedToday: true });
    expect(plan[0].date).toEqual(new Date(2026, 10, 6, 19, 0));
  });

  it('fills in the first name and never leaves a placeholder', () => {
    const plan = planReminders({ now: MORNING, name: 'Johanna Reyes' });
    plan.forEach((reminder) => {
      expect(`${reminder.title} ${reminder.body}`).not.toContain('{name}');
    });
    expect(plan.some((reminder) => /Johanna/.test(`${reminder.title} ${reminder.body}`))).toBe(true);
    expect(plan.some((reminder) => /Reyes/.test(`${reminder.title} ${reminder.body}`))).toBe(false);
  });

  it('uses "friend" when there is no name', () => {
    const plan = planReminders({ now: MORNING, name: '' });
    expect(plan.some((reminder) => /friend/.test(`${reminder.title} ${reminder.body}`))).toBe(true);
  });

  it('rotates messages day by day and ends with the comeback message', () => {
    const plan = planReminders({ now: MORNING, name: 'Ana' });
    const everyday = plan.slice(0, -1).map((reminder) => reminder.title);

    // Consecutive days never repeat the same message.
    everyday.forEach((title, index) => {
      if (index > 0) expect(title).not.toBe(everyday[index - 1]);
    });
    // The first 10 days use all 10 messages once.
    expect(new Set(everyday.slice(0, REMINDER_MESSAGES.length)).size).toBe(REMINDER_MESSAGES.length);

    expect(plan[plan.length - 1].title).toBe(COMEBACK_MESSAGE.title.replace('{name}', 'Ana'));
  });

  it('falls back to the evening time for an unknown time id', () => {
    expect(reminderTime('teatime')).toMatchObject({ id: 'evening', hour: 19, minute: 0 });
  });
});
