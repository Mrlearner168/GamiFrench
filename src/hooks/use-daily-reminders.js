import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  isReminderSupported,
  refreshDailyReminders,
  setUpDailyReminders,
} from '@/services/dailyReminder';

if (isReminderSupported) {
  // Show a reminder even when it arrives while the app is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function openFromNotification(response) {
  const url = response?.notification?.request?.content?.data?.url;
  if (typeof url === 'string' && url.startsWith('/')) router.push(url);
}

/**
 * Root layout: tapping a reminder while the app is running opens the screen it
 * points to (the map). A tap that LAUNCHES the app needs nothing extra: the
 * start screen already sends a signed-in learner to the map, and navigating
 * from here before the router has mounted would throw.
 */
export function useReminderTaps() {
  useEffect(() => {
    if (!isReminderSupported) return undefined;

    const subscription = Notifications.addNotificationResponseReceivedListener(openFromNotification);
    return () => subscription.remove();
  }, []);
}

/**
 * Game layout (signed in): ask once whether reminders may be shown, then plan
 * the next two weeks again on every visit and whenever the learner leaves the
 * app, so a lesson finished today cancels today's nudge.
 */
export function useDailyReminders(session) {
  const userId = session?.user?.id ?? null;
  const name = session?.user?.displayName ?? '';

  useEffect(() => {
    if (!isReminderSupported || !userId) return undefined;

    setUpDailyReminders({ name }).catch((error) =>
      console.log('[Reminders] setup failed', error),
    );

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' || state === 'background') {
        refreshDailyReminders({ name }).catch((error) =>
          console.log('[Reminders] refresh failed', error),
        );
      }
    });
    return () => subscription.remove();
  }, [userId, name]);
}
