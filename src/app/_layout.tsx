import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { AppState, useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/store/auth-context';
import { SyncProvider } from '@/store/sync-context';
import { subscribeToReconnect } from '@/services/connectivity';
import { wakeServer } from '@/services/serverWarmup';
import { preloadSounds } from '@/services/sound';
import { warmUpVoice } from '@/services/voice';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  console.log('[RootLayout] render', { colorScheme });

  // Pre-create audio players only — no sound plays here. The audio gate
  // opens in AuthProvider after a successful login / restored session
  // (unlockAudio), which is what actually starts music + enables SFX.
  useEffect(() => {
    preloadSounds();
    // Warm the text-to-speech engine once (silently) while the learner is
    // still on login / home, so stops and lessons speak instantly later.
    warmUpVoice();
  }, []);

  // Cold start: the backend sleeps when idle. Start waking it the moment the
  // app opens (and whenever it returns to the foreground) so it is usually
  // awake by the time the learner signs in or opens a lesson.
  useEffect(() => {
    wakeServer();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') wakeServer();
    });
    // Back online after being offline: wake the server again.
    const unsubscribeReconnect = subscribeToReconnect(() => wakeServer({ force: true }));
    return () => {
      subscription.remove();
      unsubscribeReconnect();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SyncProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: '#F5F7FA' },
                }}
              />
            </ThemeProvider>
          </SyncProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}