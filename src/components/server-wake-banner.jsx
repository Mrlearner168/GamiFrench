/**
 * Shows the backend cold start on the auth screens.
 *
 *   waking  -> "Waking up the server…" with a running timer and progress bar
 *   failed  -> a short explanation and a "Try again" button
 *   idle / ready -> nothing
 *
 * The progress bar is an estimate (a cold start usually takes ~50s); it slows
 * down near the end instead of lying about being finished.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { useServerStatus, wakeServer } from '@/services/serverWarmup';

const TYPICAL_WAKE_SECONDS = 50;

function useElapsedSeconds(startedAt) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return startedAt ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;
}

export function ServerWakeBanner() {
  const { phase, startedAt } = useServerStatus();
  const seconds = useElapsedSeconds(phase === 'waking' ? startedAt : null);

  if (phase === 'waking') {
    // Linear up to ~85%, then creeps toward 95% if the wake-up runs long.
    const ratio = seconds / TYPICAL_WAKE_SECONDS;
    const progress = ratio < 1 ? ratio * 0.85 : 0.85 + 0.1 * (1 - 1 / ratio);

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        exiting={FadeOut.duration(250)}
        style={[styles.banner, styles.waking]}
        accessibilityRole="progressbar"
        accessibilityLabel={`Waking up the server, ${seconds} seconds`}
        accessibilityLiveRegion="polite"
      >
        <View style={styles.row}>
          <ActivityIndicator size="small" color="#1476D4" />
          <Text style={styles.title}>Waking up the server… {seconds}s</Text>
        </View>
        <Text style={styles.body}>
          It naps when nobody is using it, so the first start can take up to a minute. You can keep
          typing; we will sign you in as soon as it is ready.
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </Animated.View>
    );
  }

  if (phase === 'offline') {
    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        exiting={FadeOut.duration(250)}
        style={[styles.banner, styles.offline]}
        accessibilityRole="alert"
      >
        <Text style={[styles.title, styles.offlineTitle]}>📴 You&apos;re offline</Text>
        <Text style={styles.body}>
          Signing in needs the internet once. After that, lessons and quizzes you have opened work
          offline and sync later.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.retry, styles.offlineRetry, pressed && styles.pressed]}
          onPress={() => wakeServer({ force: true })}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </Animated.View>
    );
  }

  if (phase === 'failed') {
    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        exiting={FadeOut.duration(250)}
        style={[styles.banner, styles.failed]}
        accessibilityRole="alert"
      >
        <Text style={[styles.title, styles.failedTitle]}>The server is taking too long</Text>
        <Text style={styles.body}>Check your internet connection, then try again.</Text>
        <Pressable
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
          onPress={() => wakeServer({ force: true })}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
  },
  waking: {
    backgroundColor: '#EEF5FD',
    borderColor: '#C7DDF5',
  },
  failed: {
    backgroundColor: '#FEF3F2',
    borderColor: '#FBD0CB',
  },
  offline: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  offlineTitle: {
    color: '#92400E',
  },
  offlineRetry: {
    backgroundColor: '#B45309',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#0F4C8A',
    fontSize: 15,
    fontWeight: '800',
  },
  failedTitle: {
    color: '#B42318',
  },
  body: {
    color: '#475467',
    fontSize: 13,
    lineHeight: 19,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5E6F8',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#1476D4',
  },
  retry: {
    alignSelf: 'flex-start',
    backgroundColor: '#B42318',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
