import { Slot, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SyncBadge } from '@/components/sync-badge';
import { useDailyReminders } from '@/hooks/use-daily-reminders';
import { useAuth } from '@/store/auth-context';

export default function GameLayout() {
  const { session, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  // Daily improvement reminders: asked once, then re-planned on every visit.
  useDailyReminders(session);

  useEffect(() => {
    console.log('[GameLayout] auth state', {
      isLoading,
      hasSession: Boolean(session),
    });

    // If loading is finished and there is NO session, kick them to login
    if (isLoading || session) return;

    const redirectTimer = setTimeout(() => {
      console.log('[GameLayout] redirecting to login');
      router.replace('/(auth)/login');
    }, 0);

    return () => {
      console.log('[GameLayout] cancelling login redirect');
      clearTimeout(redirectTimer);
    };
  }, [session, isLoading]);

  console.log('[GameLayout] rendering Slot', { isLoading, hasSession: Boolean(session) });

  return (
    <View style={styles.container}>
      <Slot />

      {/*
       * Floating offline / sync indicator. `pointerEvents="none"` keeps it from
       * stealing taps from the screen underneath.
       */}
      {session ? (
        <View
          pointerEvents="none"
          style={[styles.badge, { top: insets.top + 6 }]}
        >
          <SyncBadge />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  badge: { position: 'absolute', right: 12, zIndex: 20 },
});