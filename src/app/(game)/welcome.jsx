import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/store/auth-context';

const JOURNEY_STAGES = [
  {
    id: 1,
    title: 'Lesson A0',
    subtitle: 'Learn greetings, basic phrases, and meet your first villagers.',
    icon: '🏡',
  },
  {
    id: 2,
    title: 'Lesson A1',
    subtitle: 'Practice numbers, colors, and everyday vocabulary.',
    icon: '🍎',
  },
  {
    id: 3,
    title: 'Lesson A2',
    subtitle: 'Unlock new grammar missions and strengthen your skills.',
    icon: '🏰',
  },
];

export default function Welcome() {
  const router = useRouter();
  const { session } = useAuth();

  const name = session?.user?.firstName ?? 'Friend';

  const handleContinue = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.title}>Bonjour, {name}!</Text>
          <Text style={styles.subtitle}>
            Your French journey begins now. Follow the map, unlock each stage, and watch your progress grow.
          </Text>
        </View>

        <View style={styles.mapPreview}>
          <Text style={styles.mapHeading}>Your adventure map</Text>
          <View style={styles.routeLine} />
          {JOURNEY_STAGES.map((stage, index) => (
            <View key={stage.id} style={styles.stageRow}>
              <View style={styles.stageMarker}>
                <Text style={styles.stageIcon}>{stage.icon}</Text>
              </View>
              <View style={styles.stageDetails}>
                <Text style={styles.stageTitle}>{stage.title}</Text>
                <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>First step</Text>
          <Text style={styles.calloutText}>
            Complete your first mission in the village to unlock the next chapter of your map.
          </Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleContinue} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>View my journey</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },
  scrollContent: { padding: 24, paddingBottom: 32 },
  hero: { marginBottom: 28 },
  eyebrow: { color: '#1577D4', fontSize: 12, fontWeight: '800', letterSpacing: 1.8, marginBottom: 10 },
  title: { color: '#182133', fontSize: 32, fontWeight: '800', lineHeight: 40 },
  subtitle: { marginTop: 12, color: '#52607D', fontSize: 16, lineHeight: 24 },
  mapPreview: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E6EDF6' },
  mapHeading: { color: '#10293B', fontSize: 15, fontWeight: '800', marginBottom: 16 },
  routeLine: { position: 'absolute', left: 40, top: 46, bottom: 32, width: 4, backgroundColor: '#D3E7FB', borderRadius: 2 },
  stageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 20 },
  stageMarker: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E7F1FB', alignItems: 'center', justifyContent: 'center' },
  stageIcon: { fontSize: 22 },
  stageDetails: { flex: 1 },
  stageTitle: { color: '#182133', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  stageSubtitle: { color: '#667085', fontSize: 13, lineHeight: 19 },
  callout: { backgroundColor: '#E8F6FF', borderRadius: 20, padding: 18, marginBottom: 30 },
  calloutTitle: { color: '#1577D4', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  calloutText: { color: '#344054', fontSize: 14, lineHeight: 20 },
  primaryButton: { height: 56, borderRadius: 16, backgroundColor: '#1577D4', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
