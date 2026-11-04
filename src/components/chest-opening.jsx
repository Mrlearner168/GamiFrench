/**
 * The Daily / Weekly Chest opening sequence (full screen).
 *
 *   1. the backdrop dims and the chest drops in (spring);
 *   2. the key flies into the chest and it shakes, harder and harder;
 *   3. once the server has paid the reward, the chest bursts: a flash, light
 *      rays spin up behind it, confetti falls and the XP / coins count up.
 *
 * The burst waits for the real claim result, so the numbers shown are the
 * ones the server actually paid. If the claim fails, the chest stays closed
 * and the message explains why (nothing is lost; the learner can retry).
 *
 * `ChestWiggle` is the small idle animation for a chest that is ready to open.
 */
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { ConfettiBurst, CountUp } from '@/components/celebration';

/* Minimum time the shake builds up before the burst, so it always feels earned. */
const SHAKE_MS = 1500;
const RAY_COUNT = 12;

/** Ready-to-open chest: a periodic wiggle plus a gentle bob. */
export function ChestWiggle({ active, children, style }) {
  const tilt = useSharedValue(0);
  const lift = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      tilt.set(withTiming(0));
      lift.set(withTiming(0));
      return;
    }
    tilt.set(
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 90 }),
          withTiming(12, { duration: 90 }),
          withTiming(-8, { duration: 90 }),
          withTiming(8, { duration: 90 }),
          withTiming(0, { duration: 90 }),
          withDelay(1400, withTiming(0, { duration: 1 }))
        ),
        -1
      )
    );
    lift.set(
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      )
    );
  }, [active, tilt, lift]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { rotate: `${tilt.value}deg` }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Light rays that spin slowly behind the opened chest. */
function Rays({ visible }) {
  const spin = useSharedValue(0);
  const grow = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    grow.set(withSpring(1, { damping: 12, stiffness: 90 }));
    spin.set(withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1));
  }, [visible, spin, grow]);

  const animated = useAnimatedStyle(() => ({
    opacity: grow.value * 0.9,
    transform: [{ rotate: `${spin.value}deg` }, { scale: 0.4 + grow.value * 0.6 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.rays, animated]}>
      {Array.from({ length: RAY_COUNT }, (_, index) => (
        <View
          key={index}
          style={[styles.ray, { transform: [{ rotate: `${(360 / RAY_COUNT) * index}deg` }] }]}
        />
      ))}
    </Animated.View>
  );
}

/**
 * @param {object}   props
 * @param {boolean}  props.visible
 * @param {object}   props.chest      the chest item (title, icon, rewards)
 * @param {'opening'|'opened'|'failed'} props.status
 * @param {{xp:number, coins:number}} [props.rewards]  what the server paid
 * @param {boolean}  [props.pending]  paid on the next sync (offline)
 * @param {string}   [props.error]
 * @param {() => void} props.onClose
 */
export function ChestOpening({ visible, chest, status, rewards, pending, error, onClose }) {
  const isWeekly = chest?.tier === 'weekly';
  const drop = useSharedValue(0);
  const shake = useSharedValue(0);
  const keyFly = useSharedValue(0);
  const burst = useSharedValue(0);
  const flash = useSharedValue(0);
  const [shakeDone, setShakeDone] = useState(false);

  // Intro: drop in, key flies into the lock, shaking builds up. The parent
  // remounts this component (new `key`) for every opening, so it starts fresh.
  useEffect(() => {
    if (!visible) return undefined;
    drop.set(withSpring(1, { damping: 11, stiffness: 120 }));
    keyFly.set(withDelay(250, withTiming(1, { duration: 450, easing: Easing.in(Easing.quad) })));
    shake.set(
      withDelay(
        650,
        withSequence(
          ...[4, -4, 6, -6, 9, -9, 12, -12, 14, -14, 0].map((angle) =>
            withTiming(angle, { duration: 75 })
          )
        )
      )
    );
    const timer = setTimeout(() => setShakeDone(true), SHAKE_MS);
    return () => clearTimeout(timer);
  }, [visible, drop, shake, keyFly]);

  const opened = visible && status === 'opened' && shakeDone;

  // Burst once the shake finished AND the server answered.
  useEffect(() => {
    if (!opened) return;
    flash.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 420 })));
    burst.set(withSpring(1, { damping: 7, stiffness: 140 }));
  }, [opened, flash, burst]);

  const chestStyle = useAnimatedStyle(() => ({
    opacity: drop.value,
    transform: [
      { translateY: (1 - drop.value) * -260 },
      { rotate: `${shake.value}deg` },
      { scale: 1 + burst.value * 0.1 },
    ],
  }));
  const keyStyle = useAnimatedStyle(() => ({
    opacity: keyFly.value < 0.95 ? 1 : 0,
    transform: [
      { translateX: (1 - keyFly.value) * 120 },
      { translateY: (1 - keyFly.value) * -140 },
      { rotate: `${(1 - keyFly.value) * -90}deg` },
      { scale: 1 - keyFly.value * 0.4 },
    ],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  if (!chest) return null;

  const failed = status === 'failed';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />

        <View style={styles.stage}>
          <Rays visible={opened} />

          <Animated.Text style={[styles.chest, chestStyle]} accessibilityElementsHidden>
            {opened ? '🎉' : '🎁'}
          </Animated.Text>

          {!opened && !failed ? (
            <Animated.Text style={[styles.key, keyStyle]} accessibilityElementsHidden>
              🗝️
            </Animated.Text>
          ) : null}
        </View>

        <View style={styles.panel} accessibilityLiveRegion="polite">
          {opened ? (
            <>
              <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.title}>
                {chest.title} opened!
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(250).duration(400)} style={styles.subtitle}>
                {pending
                  ? 'Your bonus arrives as soon as you are back online.'
                  : isWeekly
                    ? 'A whole week of French — well earned.'
                    : 'All three of today’s challenges done — très bien !'}
              </Animated.Text>

              <View style={styles.rewardRow}>
                <Animated.View entering={ZoomIn.delay(450).springify().damping(9)} style={styles.rewardChip}>
                  <Text style={styles.rewardEmoji}>⚡</Text>
                  <CountUp value={rewards?.xp ?? 0} duration={900} style={styles.rewardValue} />
                  <Text style={styles.rewardUnit}>XP</Text>
                </Animated.View>
                <Animated.View entering={ZoomIn.delay(650).springify().damping(9)} style={[styles.rewardChip, styles.coinChip]}>
                  <Text style={styles.rewardEmoji}>🪙</Text>
                  <CountUp value={rewards?.coins ?? 0} duration={900} style={styles.rewardValue} />
                  <Text style={styles.rewardUnit}>coins</Text>
                </Animated.View>
              </View>

              <Animated.View entering={FadeInUp.delay(900).duration(400)} style={styles.buttonWrap}>
                <Pressable
                  accessibilityRole="button"
                  onPress={onClose}
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                >
                  <Text style={styles.buttonText}>Awesome!</Text>
                </Pressable>
              </Animated.View>
            </>
          ) : failed ? (
            <Animated.View entering={FadeIn.duration(250)} style={styles.center}>
              <Text style={styles.title}>The chest stayed shut</Text>
              <Text style={styles.subtitle}>{error || 'Please try again in a moment.'}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [styles.button, styles.buttonMuted, pressed && styles.pressed]}
              >
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.Text entering={FadeIn.delay(300).duration(300)} style={styles.subtitle}>
              Unlocking your {chest.title}…
            </Animated.Text>
          )}
        </View>

        {opened ? <ConfettiBurst /> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF7D6',
  },
  stage: {
    width: 260,
    height: 250,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rays: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 34,
    height: 280,
    borderRadius: 17,
    backgroundColor: 'rgba(253, 224, 71, 0.14)',
  },
  chest: {
    fontSize: 104,
    lineHeight: 124,
    textAlign: 'center',
  },
  key: {
    position: 'absolute',
    fontSize: 46,
    top: 96,
  },
  panel: {
    minHeight: 220,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E3A8A',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#60A5FA',
  },
  coinChip: {
    backgroundColor: '#78350F',
    borderColor: '#FBBF24',
  },
  rewardEmoji: {
    fontSize: 22,
  },
  rewardValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  rewardUnit: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  buttonWrap: {
    width: '100%',
    marginTop: 26,
  },
  button: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    borderBottomWidth: 4,
    borderBottomColor: '#B45309',
  },
  buttonMuted: {
    backgroundColor: '#475569',
    borderBottomColor: '#1E293B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ translateY: 2 }],
  },
});
