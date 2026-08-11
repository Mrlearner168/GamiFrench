import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, PrimaryButton, StatPill } from '@/components/game-ui';

export default function Mission() {
  const { id, title, challenge } = useLocalSearchParams();

  const startMission = () => {
    router.push({
      pathname: '/lesson',
      params: { id, title, challenge },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <StatPill icon="⭐" value="1,280" label="XP" />
          <StatPill icon="🔥" value="4" label="day streak" />
        </View>

        <GameHeader
          back
          eyebrow="MISSION BRIEF"
          title={title || 'Mission'}
          subtitle="A short lesson, a useful phrase, and a reward waiting for you."
        />

        <View style={styles.card}>
          <Text style={styles.mission}>MISSION {String(id || '').padStart(2, '0')}</Text>
          <Text style={styles.cardTitle}>{title || 'Your next mission'}</Text>

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

          {challenge === 'true' ? (
            <View style={styles.challengeBox}>
              <Text style={styles.challengeTitle}>STAGE CHALLENGE</Text>
              <Text style={styles.challengeText}>Complete this challenge to unlock the next stage.</Text>
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E1E8F0',
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  mission: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#667085' },
  cardTitle: { marginTop: 14, fontSize: 24, lineHeight: 31, fontWeight: '800', color: '#182133' },
  infoContainer: { gap: 8, marginTop: 18 },
  label: { fontSize: 13, color: '#7A8798', marginTop: 8 },
  value: { fontSize: 17, fontWeight: '700', color: '#1577D4' },
  reward: { fontSize: 17, color: '#16855A', fontWeight: '800' },
  challengeBox: { marginTop: 18, backgroundColor: '#FFF4D8', padding: 15, borderRadius: 14 },
  challengeTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#B36B00' },
  challengeText: { marginTop: 8, color: '#8C5A0A', fontSize: 14, lineHeight: 20 },
});
