/**
 * The animated welcome scene at the top of the Welcome screen.
 *
 *   - a night sky with twinkling stars and a soft glowing moon;
 *   - a dotted flight route that draws itself across five countries, each
 *     flag popping in as the route reaches it;
 *   - a paper plane that keeps flying the route, banking with the curve;
 *   - French words that float up and fade, like thoughts on the way;
 *   - a greeting that cycles "Bonjour", "Salut", "Bienvenue", "Coucou".
 *
 * Everything runs on the UI thread (Reanimated). With "Reduce motion" turned
 * on, the scene is shown still: route, flags and plane in place, no loops.
 * The scene is decorative; screen readers only hear the greeting.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

// Scene height: full size, or `compact` for short phones. The route is laid
// out relative to the height, so both sizes keep the same shape.
const SCENE_HEIGHT = 250;
const COMPACT_SCENE_HEIGHT = 196;
const routeTop = (height) => height * 0.6; // y of the route's end points (bows up 34% of the height)
const FLIGHT_MS = 6500;

const GREETINGS = ['Bonjour', 'Salut', 'Bienvenue', 'Coucou'];

const STOPS = [
  { flag: '🇨🇦', name: 'Canada' },
  { flag: '🇲🇦', name: 'Maroc' },
  { flag: '🇨🇮', name: "Côte d'Ivoire" },
  { flag: '🇨🇲', name: 'Cameroun' },
  { flag: '🇫🇷', name: 'France' },
];

const WORDS = ['merci', 'croissant', 'bonjour', 'ami', 'voyage', 'soleil'];

/* Deterministic 0..1 "random" so rendering stays pure. */
const jitter = (index, salt) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* A point on the route for t in 0..1 (plain JS and worklet-safe). */
function routePoint(t, width, height) {
  'worklet';
  const left = 34;
  const right = width - 34;
  return {
    x: left + (right - left) * t,
    y: height * 0.6 - Math.sin(Math.PI * t) * height * 0.34,
  };
}

function Star({ index, width, height, still }) {
  const glow = useSharedValue(0.25);
  const size = 2 + Math.round(jitter(index, 3) * 2);

  useEffect(() => {
    if (still) return;
    glow.set(
      withDelay(
        jitter(index, 4) * 2000,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 900 + jitter(index, 5) * 900 }),
            withTiming(0.25, { duration: 900 + jitter(index, 6) * 900 })
          ),
          -1
        )
      )
    );
  }, [glow, index, still]);

  const style = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: jitter(index, 1) * (width - 8),
          top: jitter(index, 2) * (routeTop(height) - 40),
        },
        style,
      ]}
    />
  );
}

function FloatingWord({ word, index, width, height, still }) {
  const rise = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    rise.set(
      withDelay(
        600 + index * 1300,
        withRepeat(withTiming(1, { duration: 7000, easing: Easing.out(Easing.quad) }), -1)
      )
    );
  }, [rise, index, still]);

  const style = useAnimatedStyle(() => ({
    opacity: still ? 0 : rise.value < 0.15 ? rise.value / 0.15 : 1 - (rise.value - 0.15) / 0.85,
    transform: [{ translateY: -rise.value * 55 }],
  }));

  return (
    <Animated.View
      style={[
        styles.word,
        // Middle band only, below the route, so words never cover a flag.
        { left: width * 0.24 + jitter(index, 7) * (width * 0.52 - 80), top: height - 36 - jitter(index, 8) * 12 },
        style,
      ]}
    >
      <Text style={styles.wordText}>{word}</Text>
    </Animated.View>
  );
}

function Plane({ width, height, still }) {
  const progress = useSharedValue(still ? 0.62 : 0);

  useEffect(() => {
    if (still) return;
    progress.set(
      withDelay(
        1400,
        withRepeat(withTiming(1, { duration: FLIGHT_MS, easing: Easing.inOut(Easing.sin) }), -1)
      )
    );
  }, [progress, still]);

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    const here = routePoint(t, width, height);
    const ahead = routePoint(Math.min(1, t + 0.01), width, height);
    const angle = (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI;
    return {
      opacity: t > 0.97 ? (1 - t) / 0.03 : t < 0.03 ? t / 0.03 : 1,
      transform: [
        { translateX: here.x - 14 },
        { translateY: here.y - 16 },
        { rotate: `${angle + 45}deg` }, // ✈️ points up-right at 0deg
      ],
    };
  });

  return <Animated.Text style={[styles.plane, style]}>✈️</Animated.Text>;
}

function Moon({ still }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    pulse.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      )
    );
  }, [pulse, still]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.25,
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  return (
    <View style={styles.moonWrap} pointerEvents="none">
      <Animated.View style={[styles.moonGlow, glow]} />
      <Text style={styles.moon}>🌙</Text>
    </View>
  );
}

function StopFlag({ stop, index, width, height, still }) {
  const t = index / (STOPS.length - 1);
  const point = routePoint(t, width, height);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (still) return;
    bob.set(
      withDelay(
        index * 220,
        withRepeat(
          withSequence(
            withTiming(-3, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) })
          ),
          -1
        )
      )
    );
  }, [bob, index, still]);

  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <Animated.View
      entering={still ? undefined : ZoomIn.delay(350 + index * 260).springify().damping(9)}
      style={[styles.stop, { left: point.x - 26, top: point.y - 14 }]}
    >
      <Animated.View style={[styles.stopInner, bobStyle]}>
        <View style={styles.flagBubble}>
          <Text style={styles.flag}>{stop.flag}</Text>
        </View>
        <Text style={styles.stopName} numberOfLines={1}>
          {stop.name}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export function WelcomeHero({ name, compact = false }) {
  const height = compact ? COMPACT_SCENE_HEIGHT : SCENE_HEIGHT;
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth - 40, 520);
  const still = useReducedMotion();
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    if (still) return undefined;
    const timer = setInterval(
      () => setGreetingIndex((index) => (index + 1) % GREETINGS.length),
      2200
    );
    return () => clearInterval(timer);
  }, [still]);

  const routeDots = Array.from({ length: 26 }, (_, index) => {
    const point = routePoint(index / 25, width, height);
    return { key: index, ...point };
  });

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.scene, { width, height }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length: 22 }, (_, index) => (
          <Star key={index} index={index} width={width} height={height} still={still} />
        ))}
        <Moon still={still} />

        {WORDS.map((word, index) => (
          <FloatingWord key={word} word={word} index={index} width={width} height={height} still={still} />
        ))}

        {/* The route draws itself dot by dot. */}
        {routeDots.map((dot) => (
          <Animated.View
            key={dot.key}
            entering={still ? undefined : FadeIn.delay(200 + dot.key * 45).duration(250)}
            style={[styles.routeDot, { left: dot.x - 2, top: dot.y - 2 }]}
          />
        ))}

        {STOPS.map((stop, index) => (
          <StopFlag key={stop.flag} stop={stop} index={index} width={width} height={height} still={still} />
        ))}

        <Plane width={width} height={height} still={still} />

        <View style={styles.horizon} />
      </View>

      <View style={styles.greetingRow} accessibilityRole="header" accessibilityLabel={`Bonjour, ${name}!`}>
        <View style={styles.greetingWordBox}>
          <Animated.Text
            key={GREETINGS[greetingIndex]}
            entering={still ? undefined : FadeInDown.duration(380)}
            exiting={still ? undefined : FadeOutUp.duration(260)}
            style={styles.greetingWord}
          >
            {GREETINGS[greetingIndex]},
          </Animated.Text>
        </View>
        <Animated.Text entering={still ? undefined : FadeIn.delay(300).duration(600)} style={styles.greetingName}>
          {name}!
        </Animated.Text>
      </View>
      <Animated.Text
        entering={still ? undefined : FadeInDown.delay(500).duration(600)}
        style={styles.tagline}
      >
        Ton voyage en français commence ici ✨
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  scene: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0B1437',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.25)',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  moonWrap: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonGlow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FDE68A',
  },
  moon: {
    fontSize: 30,
  },
  word: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  wordText: {
    color: '#E0E7FF',
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  routeDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(253, 224, 71, 0.75)',
  },
  stop: {
    position: 'absolute',
    width: 52,
    alignItems: 'center',
  },
  stopInner: {
    alignItems: 'center',
  },
  flagBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE047',
    shadowColor: '#FDE047',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  flag: {
    fontSize: 18,
  },
  stopName: {
    marginTop: 3,
    color: '#C7D2FE',
    fontSize: 9,
    fontWeight: '800',
  },
  plane: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontSize: 26,
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 46,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  greetingRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  greetingWordBox: {
    width: 180,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  greetingWord: {
    color: '#FDE047',
    fontSize: 32,
    fontWeight: '900',
  },
  greetingName: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  tagline: {
    marginTop: 6,
    color: '#C7D2FE',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
