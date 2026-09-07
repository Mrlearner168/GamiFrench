import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, PrimaryButton, StatPill } from '@/components/game-ui';
import { missionCatalog } from '@/data/missions';

export default function Mission() {
  const { missionId } = useLocalSearchParams();
  const missionKey = Array.isArray(missionId) ? missionId[0] : missionId;
  const mission = missionCatalog.find((item) => String(item.id) === String(missionKey));
  const { id, title, challenge, country, module: moduleId, topicId } = mission || {};

  const startMission = () => {
    if (!mission) return;

    router.push({
      pathname: '/lesson',
      params: { country, module: moduleId, topicId },
    });
  };

  if (!mission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <GameHeader back eyebrow="MISSION BRIEF" title="Mission not found" subtitle="Return to your journey to choose an available mission." />
          <PrimaryButton onPress={() => router.replace('/journey')}>Return to journey</PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <StatPill icon="⭐" value="1,280" label="XP" />
          <StatPill icon="🔥" value="4" label="day streak" />
          <StatPill icon="❤️" value="5" label="hearts" />
        </View>

        <GameHeader
          back
          eyebrow="MISSION BRIEF"
          title={title || 'Mission'}
          subtitle="A short lesson, a useful phrase, and a reward waiting for you."
        />

        <View style={[styles.card, challenge && styles.challengeCard]}>
          <View style={styles.headerRow}>
            <Text style={styles.mission}>MISSION {String(id || '').padStart(2, '0')}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.status}>Current</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{title || 'Your next mission'}</Text>
          <Text style={styles.cardMeta}>Ready for your next French lesson</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Stage</Text>
            <Text style={styles.value}>The Village</Text>
            <Text style={styles.label}>Difficulty</Text>
            <Text style={styles.value}>Beginner</Text>
            <Text style={styles.label}>Estimated time</Text>
            <Text style={styles.value}>3 minutes</Text>
            <Text style={styles.label}>Reward</Text>
            <Text style={styles.reward}>+100 XP</Text>
            <Text style={styles.reward}>+50 coins</Text>
          </View>

          {challenge ? (
            <View style={styles.challengeRow}>
              <Text style={styles.challengeTitle}>STAGE CHALLENGE</Text>
              <Text style={styles.challengeReward}>+250 XP</Text>
            </View>
          ) : null}
        </View>

        <PrimaryButton onPress={startMission}>Start mission</PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  content: { paddingHorizontal: 20, paddingBottom: 36, gap: 18 },
  topBar: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E1E8F0',
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  challengeCard: { backgroundColor: '#FFF9E8', borderColor: '#F2D48B' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  mission: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#667085' },
  statusBadge: { backgroundColor: '#E7F1FB', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  status: { fontSize: 11, fontWeight: '800', color: '#1577D4' },
  cardTitle: { marginTop: 14, fontSize: 20, lineHeight: 26, fontWeight: '800', color: '#182133' },
  cardMeta: { marginTop: 5, color: '#7A8798', fontSize: 13, lineHeight: 19 },
  infoContainer: { gap: 8, marginTop: 18 },
  label: { fontSize: 13, color: '#7A8798', marginTop: 8 },
  value: { fontSize: 17, fontWeight: '700', color: '#1577D4' },
  reward: { fontSize: 17, color: '#16855A', fontWeight: '800' },
  challengeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0DCA8' },
  challengeTitle: { color: '#B36B00', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  challengeReward: { color: '#B36B00', fontWeight: '800', fontSize: 12 },
});
