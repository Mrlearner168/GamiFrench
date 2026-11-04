/**
 * An on/off switch with a sliding thumb, the same on iOS, Android and web.
 * The whole row is the touch target (see SettingSwitchRow); the switch itself
 * is decorative for screen readers, which read the row as one "switch".
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const THUMB = 24;
const TRAVEL = TRACK_WIDTH - THUMB - 6;

export function ToggleSwitch({ value, color = '#16A34A' }) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(value ? 1 : 0, { damping: 15, stiffness: 220 }));
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#CBD5E1', color]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
  }));

  return (
    <Animated.View style={[styles.track, trackStyle]} importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Animated.View>
  );
}

/** A settings row: icon, title, description and a switch. Tapping anywhere toggles. */
export function SettingSwitchRow({ icon, title, description, value, onChange, color, last = false }) {
  const press = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  return (
    <Pressable
      onPress={() => onChange(!value)}
      onPressIn={() => press.set(withTiming(0.98, { duration: 80 }))}
      onPressOut={() => press.set(withTiming(1, { duration: 120 }))}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <Animated.View style={[styles.row, last && styles.rowLast, pressStyle]}>
        {icon ? (
          <View style={[styles.iconBubble, value ? styles.iconOn : styles.iconOff]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        ) : null}
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        <ToggleSwitch value={value} color={color} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOn: {
    backgroundColor: '#DCFCE7',
  },
  iconOff: {
    backgroundColor: '#F1F5F9',
  },
  icon: {
    fontSize: 20,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  description: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
