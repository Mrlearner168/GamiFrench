/**
 * Full-screen loader shown on first open while the app warms up its state.
 *
 * Same blue as the native splash (#208AEF), so the splash hands over to it
 * without a flash, then each warm-up step ticks off as it finishes.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { WarmupStep } from '@/hooks/use-app-warmup';

const BLUE = '#208AEF';

export function StartupLoader({ steps }: { steps: WarmupStep[] }) {
  // Created once; useState keeps it out of render-time ref access.
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const done = steps.filter((step) => step.state !== 'active').length;
  const progress = steps.length ? done / steps.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulse }] }]}>
          <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
        </Animated.View>

        <Text style={styles.title}>GamiFrench</Text>
        <Text style={styles.subtitle}>Warming up…</Text>

        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityLabel={`Warming up, ${done} of ${steps.length} steps done`}
        >
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>

        <View style={styles.steps}>
          {steps.map((step) => (
            <View key={step.key} style={styles.stepRow}>
              <View style={styles.stepIcon}>
                {step.state === 'active' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.stepMark}>{step.state === 'done' ? '✓' : '!'}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, step.state === 'active' && styles.stepLabelActive]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
  },
  logo: { width: '100%', height: '100%' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 4, marginBottom: 24 },
  track: {
    width: '100%',
    maxWidth: 320,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4, backgroundColor: '#FFFFFF' },
  steps: { width: '100%', maxWidth: 320, marginTop: 24, gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIcon: { width: 22, alignItems: 'center' },
  stepMark: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  stepLabel: { flex: 1, color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  stepLabelActive: { color: '#FFFFFF', fontWeight: '600' },
});
