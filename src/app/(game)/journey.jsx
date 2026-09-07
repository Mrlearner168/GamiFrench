import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, ProgressBar, StatPill } from '@/components/game-ui';
import { getCountryTopics } from '@/data/lesson-catalog';
import { missionCatalog } from '@/data/missions';
import { getTopicProgress, loadLessonProgress } from '@/store/lesson-progress';

export default function Journey() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let mounted = true;

    loadLessonProgress().then((storedProgress) => {
      if (mounted) setProgress(storedProgress);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const topics = getCountryTopics('Canada', 'module-1');
  const missions = missionCatalog.map((mission, index) => {
    const topic = topics.find((item) => item.id === mission.topicId);
    const topicProgress = getTopicProgress(progress, mission.country, topic);
    const completed = topicProgress.total > 0 && topicProgress.count === topicProgress.total;
    const previousMission = index > 0 ? missionCatalog[index - 1] : null;
    const previousTopic = previousMission
      ? topics.find((item) => item.id === previousMission.topicId)
      : null;
    const previousProgress = getTopicProgress(progress, mission.country, previousTopic);
    const unlocked = index === 0 || (
      previousProgress.total > 0 && previousProgress.count === previousProgress.total
    );

    return {
      ...mission,
      status: completed ? 'completed' : unlocked ? 'current' : 'locked',
      progress: topicProgress,
    };
  });

  const completedMissions = missions.filter((mission) => mission.status === 'completed').length;

  const openMission = (mission) => {
    if (mission.status === 'locked') return;

    router.push({
      pathname: '/mission',
      params: {
        missionId: String(mission.id),
      },
    });
  };

  const renderMission = ({ item }) => {
    const cardStyle = [
      styles.card,
      item.status === 'current' && styles.currentCard,
      item.challenge && styles.challengeCard,
    ];

    const statusLabel = item.status === 'completed' ? 'Completed' : item.status === 'current' ? 'Current' : 'Locked';

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${statusLabel}`}
        disabled={item.status === 'locked'}
        onPress={() => openMission(item)}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed, item.status === 'locked' && styles.lockedCard]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.missionNumber}>MISSION {String(item.id).padStart(2, '0')}</Text>
          <View style={[styles.statusBadge, item.status === 'completed' && styles.completedBadge, item.status === 'locked' && styles.lockedBadge]}>
            <Text style={styles.status}>{statusLabel}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.cardMeta}>{item.status === 'locked' ? 'Complete the previous mission to unlock' : item.status === 'current' ? 'Ready for your next French lesson' : 'Lesson complete - review anytime'}</Text>
        <Text style={styles.lessonProgress}>
          {item.progress.count}/{item.progress.total} sub-lessons complete
        </Text>

        {item.challenge && (
          <View style={styles.challengeRow}><Text style={styles.challenge}>STAGE CHALLENGE</Text><Text style={styles.challengeReward}>+250 XP</Text></View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <StatPill icon="⭐" value="1,280" label="XP" />
        <StatPill icon="🔥" value="4" label="day streak" />
        <StatPill icon="❤️" value="5" label="hearts" />
      </View>
      <GameHeader eyebrow="STAGE 01  /  THE VILLAGE" title="Your journey" subtitle="Complete each mission to unlock the next part of the story." />
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressTitle}>Stage progress</Text>
          <Text style={styles.progressValue}>{completedMissions} / {missions.length} missions</Text>
        </View>
        <ProgressBar value={missions.length ? completedMissions / missions.length : 0} />
      </View>

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMission}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  topBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  progressSection: { paddingHorizontal: 20, marginBottom: 14 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { color: '#344054', fontSize: 13, fontWeight: '700' },
  progressValue: { color: '#1577D4', fontSize: 13, fontWeight: '800' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8F0',
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  currentCard: {
    borderWidth: 2,
    borderColor: '#1577D4',
  },

  challengeCard: {
    backgroundColor: '#FFF9E8',
    borderColor: '#F2D48B',
  },
  lockedCard: { opacity: 0.58 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },

  missionNumber: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#667085',
  },
  statusBadge: { backgroundColor: '#E7F1FB', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  completedBadge: { backgroundColor: '#E4F7EE' },
  lockedBadge: { backgroundColor: '#EEF1F4' },
  status: { fontSize: 11, fontWeight: '800', color: '#1577D4' },

  title: {
    marginTop: 14,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#182133',
  },
  cardMeta: { marginTop: 5, color: '#7A8798', fontSize: 13, lineHeight: 19 },
  lessonProgress: { marginTop: 10, color: '#1577D4', fontSize: 12, fontWeight: '700' },
  challengeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0DCA8' },
  challenge: { color: '#B36B00', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  challengeReward: { color: '#B36B00', fontWeight: '800', fontSize: 12 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },

});