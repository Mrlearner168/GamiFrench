/**
 * Small celebration pieces for result screens.
 *
 *   <ConfettiBurst />  emoji confetti that falls once over the screen
 *   <CountUp value />  a number that counts up from 0 (the score reveal)
 *
 * Both are purely decorative: hidden from screen readers, never block touches.
 */
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const PIECES = ['🎉', '✨', '⭐', '🎊', '💫', '🥐', '🇫🇷'];
const PIECE_COUNT = 22;

/* Deterministic 0..1 "random" per piece, so rendering stays pure. */
const jitter = (index, salt) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function ConfettiPiece({ emoji, left, delay, duration, drift, spin, height }) {
  const fall = useSharedValue(0);

  useEffect(() => {
    fall.set(withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) })));
  }, [fall, delay, duration]);

  const style = useAnimatedStyle(() => ({
    opacity: fall.value < 0.85 ? 1 : (1 - fall.value) / 0.15,
    transform: [
      { translateY: -40 + fall.value * (height + 80) },
      { translateX: Math.sin(fall.value * Math.PI * 2) * drift },
      { rotate: `${fall.value * spin}deg` },
    ],
  }));

  return <Animated.Text style={[styles.piece, { left }, style]}>{emoji}</Animated.Text>;
}

export function ConfettiBurst() {
  const { width, height } = Dimensions.get('window');

  // Scattered but stable for the life of the burst.
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, index) => ({
        key: index,
        emoji: PIECES[index % PIECES.length],
        left: jitter(index, 1) * (width - 24),
        delay: jitter(index, 2) * 600,
        duration: 1800 + jitter(index, 3) * 1400,
        drift: 10 + jitter(index, 4) * 30,
        spin: (jitter(index, 5) > 0.5 ? 1 : -1) * (180 + jitter(index, 6) * 360),
      })),
    [width]
  );

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {pieces.map(({ key, ...piece }) => (
        <ConfettiPiece key={key} {...piece} height={height} />
      ))}
    </View>
  );
}

/** Counts from 0 up to `value` (ease-out), then shows `value` exactly. */
export function CountUp({ value, duration = 900, suffix = '', style }) {
  const target = Math.max(0, Math.round(Number(value) || 0));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let frame;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      setShown(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return (
    <Text style={style} accessibilityLabel={`${target}${suffix}`}>
      {shown}
      {suffix}
    </Text>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    fontSize: 22,
  },
});
