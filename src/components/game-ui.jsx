import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GameHeader({ eyebrow, title, subtitle, back = false }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.headerTopRow}>
        {back ? (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        ) : null}
        <Text style={[styles.eyebrow, back && styles.eyebrowWithBack]}>{eyebrow}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, color = '#1577D4' }) {
  return (
    <View accessibilityRole="progressbar" style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(value, 1)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function StatPill({ icon, value, label }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        {label ? <Text style={styles.statLabel}>{label}</Text> : null}
      </View>
    </View>
  );
}

export function PrimaryButton({ children, onPress, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 18 },
  headerTopRow: { minHeight: 30, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F2FB', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  backIcon: { color: '#1577D4', fontSize: 30, lineHeight: 30, marginTop: -3 },
  eyebrow: { color: '#1577D4', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  eyebrowWithBack: { flex: 1 },
  title: { color: '#182133', fontSize: 32, fontWeight: '800', lineHeight: 38, marginTop: 8 },
  subtitle: { color: '#667085', fontSize: 15, lineHeight: 22, marginTop: 8 },
  progressTrack: { height: 8, backgroundColor: '#DCE6F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, minWidth: 68 },
  statIcon: { fontSize: 16, marginRight: 6 },
  statValue: { color: '#182133', fontSize: 13, fontWeight: '800' },
  statLabel: { color: '#8491A3', fontSize: 10, marginTop: 1 },
  primaryButton: { minHeight: 54, borderRadius: 16, backgroundColor: '#1577D4', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
});