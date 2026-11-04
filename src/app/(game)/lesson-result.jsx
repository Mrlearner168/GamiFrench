import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHeader, PrimaryButton } from '@/components/game-ui';
import { lessonCatalog } from '@/data/lessons/catalog';
import { sounds } from '@/services/sound';
import { QUIZ_WEIGHT, SPEAKING_WEIGHT } from '@/services/pronunciation';
import { starsForScore } from '@/services/scoring';
import { useAuth } from '@/store/auth-context';
import {
  isSubLessonCompleted,
  loadLessonProgress,
  loadPracticeScores,
  loadSpeakingScores,
} from '@/store/lesson-progress';
import { enqueueTopicResult } from '@/store/pending-sync';

const clamp = (number) => Math.max(0, Math.min(100, Math.round(Number(number) || 0)));
const mean = (values) => (values.length
  ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
  : 0);
// Star bands come from services/scoring (they mirror STAR_BANDS in
// Backend/services/assessment_service.py), so this screen, the sub-lesson result
// screen and the server always rate the same percentage the same way.
const starsFor = (score) => starsForScore(score);
const first = (item, fallback = null) => (Array.isArray(item) ? item[0] : item ?? fallback);

/*
 * End-of-topic result screen.
 *
 * Shown after the learner finishes the last sub-lesson of a topic. It
 * rebuilds the statistics from the local stores (quiz accuracy and
 * pronunciation accuracy per sub-lesson), shows the precise breakdown, and
 * syncs one aggregated row to the backend via PUT /progress/topics — the
 * server recomputes the headline numbers with the same weighted formula, so
 * what the learner sees always matches what is stored.
 */
export default function LessonResultScreen() {
  const params = useLocalSearchParams();
  const { authenticatedRequest } = useAuth();
  const country = first(params.country, 'Canada');
  const moduleId = first(params.module, 'module-1');
  const topicId = first(params.topicId);

  const module = useMemo(
    () => lessonCatalog.find((item) => item.id === moduleId),
    [moduleId]
  );
  const lesson = useMemo(
    () => module?.lessons?.find((item) => item.id === topicId),
    [module, topicId]
  );

  const [rows, setRows] = useState(null);
  const [syncStatus, setSyncStatus] = useState('saving');
  const syncedRef = useRef(false);

  useEffect(() => {
    let active = true;

    if (!lesson || !topicId) {
      return () => { active = false; };
    }

    (async () => {
      const [practiceScores, speakingScores, progress] = await Promise.all([
        loadPracticeScores(),
        loadSpeakingScores(),
        loadLessonProgress(),
      ]);

      const built = lesson.subLessons.map((subLesson) => {
        const record = practiceScores?.[country]?.[topicId]?.[subLesson.id] ?? {};
        const speech = speakingScores?.[country]?.[topicId]?.[subLesson.id] ?? {};
        const quizScore = clamp(record.quizScore ?? record.score ?? 0);
        const speakingScore = clamp(speech.score ?? record.speakingScore ?? 0);
        const overall = clamp(QUIZ_WEIGHT * quizScore + SPEAKING_WEIGHT * speakingScore);
        return {
          id: subLesson.id,
          title: subLesson.title,
          quizScore,
          speakingScore,
          overall,
          stars: starsFor(overall),
          attempts: Number(speech.attempts ?? record.speakingAttempts ?? 0) || 0,
          completed: isSubLessonCompleted(progress, country, lesson, subLesson.id),
        };
      });

      if (active) setRows(built);
    })();

    return () => { active = false; };
  }, [country, lesson, topicId]);

  const stats = useMemo(() => {
    if (!rows?.length) return null;
    const overalls = rows.map((row) => row.overall);
    const quizMean = mean(rows.map((row) => row.quizScore));
    const speakingMean = mean(rows.map((row) => row.speakingScore));
    return {
      quizMean,
      speakingMean,
      // Same rounding order as the server: round the means first, then blend.
      overall: clamp(QUIZ_WEIGHT * quizMean + SPEAKING_WEIGHT * speakingMean),
      best: Math.max(...overalls),
      worst: Math.min(...overalls),
      attempts: rows.reduce((total, row) => total + row.attempts, 0),
      completed: rows.filter((row) => row.completed).length,
      total: rows.length,
    };
  }, [rows]);

  // Celebrate once when the topic result lands.
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (!stats || celebratedRef.current) return;
    celebratedRef.current = true;
    if (stats.completed >= stats.total) {
      if (stats.overall >= 90) sounds.levelup();
      else sounds.complete();
    } else {
      sounds.star();
    }
  }, [stats]);

  useEffect(() => {
    if (!stats || !lesson || !topicId || syncedRef.current) return;
    syncedRef.current = true;

    const payload = {
      topicKey: topicId,
      moduleKey: moduleId,
      quizScore: stats.quizMean,
      speakingScore: stats.speakingMean,
      subLessonsTotal: stats.total,
      subLessonsCompleted: stats.completed,
      speakingAttempts: stats.attempts,
      timeSpentSeconds: 0,
      breakdown: rows.map((row) => ({
        contentKey: row.id,
        quizScore: row.quizScore,
        speakingScore: row.speakingScore,
        overall: row.overall,
      })),
    };

    (async () => {
      try {
        await authenticatedRequest('/progress/topics', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSyncStatus('saved');
      } catch (error) {
        console.log('Topic result sync failed, queuing for later:', error);
        await enqueueTopicResult(payload).catch((queueError) => {
          console.log('Offline queue failed:', queueError);
        });
        setSyncStatus('offline');
      }
    })();
  }, [authenticatedRequest, lesson, moduleId, rows, stats, topicId]);

  if (!lesson || !topicId) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.centerIcon}>🔎</Text>
          <Text style={styles.centerTitle}>Topic not found</Text>
          <PrimaryButton onPress={() => router.back()}>Go back</PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  if (!rows || !stats) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.centerIcon}>📊</Text>
          <Text style={styles.centerTitle}>Crunching your results…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const grade20 = Math.round(stats.overall * 0.2 * 10) / 10;
  const allCompleted = stats.completed >= stats.total;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GameHeader
          eyebrow="TOPIC RESULT"
          title={lesson.title}
          subtitle={`${stats.completed} of ${stats.total} sub-lessons completed`}
        />

        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>{allCompleted ? '🎉' : '📈'}</Text>
          <Text style={styles.heroScore}>{stats.overall}%</Text>
          <Text style={styles.heroLabel}>Overall score</Text>
          <Text style={styles.stars}>{'⭐'.repeat(starsForScore(stats.overall))}</Text>
          <Text style={styles.grade}>{grade20} / 20</Text>
          <Text style={styles.heroCaption}>
            {allCompleted
              ? 'Topic complete! Your result is saved to your profile.'
              : 'Finish every sub-lesson to complete this topic.'}
          </Text>
        </View>

        <View style={styles.statRow}>
          <StatTile icon="🧠" value={`${stats.quizMean}%`} label="Quiz accuracy" />
          <StatTile icon="🗣️" value={`${stats.speakingMean}%`} label="Pronunciation" />
        </View>
        <View style={styles.statRow}>
          <StatTile icon="🎙️" value={String(stats.attempts)} label="Speak attempts" />
          <StatTile icon="🎯" value={`${stats.best}%`} label="Best result" />
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Sub-lesson breakdown</Text>
          <View style={styles.breakdownHeader}>
            <Text style={[styles.breakdownCell, styles.grow]}>Lesson</Text>
            <Text style={styles.breakdownCell}>Quiz</Text>
            <Text style={styles.breakdownCell}>Speak</Text>
            <Text style={styles.breakdownCell}>Total</Text>
          </View>
          {rows.map((row) => (
            <View key={row.id} style={styles.breakdownRow}>
              <View style={styles.grow}>
                <Text style={styles.breakdownTitle} numberOfLines={1}>
                  {row.completed ? '✓ ' : '• '}{row.title}
                </Text>
              </View>
              <Text style={styles.breakdownValue}>{row.quizScore}%</Text>
              <Text style={styles.breakdownValue}>{row.speakingScore}%</Text>
              <Text style={styles.breakdownValueStrong}>{row.overall}%</Text>
            </View>
          ))}
          <View style={styles.breakdownFooter}>
            <Text style={styles.breakdownFooterText}>
              Range {stats.worst}%–{stats.best}% · weighted {Math.round(QUIZ_WEIGHT * 100)}% quiz +{' '}
              {Math.round(SPEAKING_WEIGHT * 100)}% pronunciation
            </Text>
          </View>
        </View>

        <Text style={styles.syncNote}>
          {syncStatus === 'saving' && 'Saving your result…'}
          {syncStatus === 'saved' && '✓ Result saved to your profile'}
          {syncStatus === 'offline' && 'Saved on this device — it will sync when you are back online.'}
        </Text>

        <PrimaryButton
          onPress={() => router.replace({ pathname: '/lesson', params: { country, module: moduleId } })}
        >
          Back to lessons
        </PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ icon, value, label }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F7FA' },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  centerIcon: { fontSize: 48 },
  centerTitle: { color: '#182133', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  heroCard: { backgroundColor: '#182133', borderRadius: 24, padding: 26, alignItems: 'center', gap: 6 },
  heroIcon: { fontSize: 44 },
  heroScore: { color: '#FFF', fontSize: 56, fontWeight: '900' },
  heroLabel: { color: '#B8C7D9', fontSize: 13, fontWeight: '700', letterSpacing: 1.2 },
  stars: { fontSize: 24, marginTop: 4 },
  grade: { color: '#FDE68A', fontSize: 22, fontWeight: '800' },
  heroCaption: { color: '#B8C7D9', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  statRow: { flexDirection: 'row', gap: 12 },
  statTile: { flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 16, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E3E9F2' },
  statIcon: { fontSize: 22 },
  statValue: { color: '#182133', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#8491A3', fontSize: 12, fontWeight: '700' },
  breakdownCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, gap: 10, borderWidth: 1, borderColor: '#E3E9F2' },
  sectionTitle: { color: '#182133', fontSize: 16, fontWeight: '800' },
  breakdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownCell: { width: 56, color: '#8491A3', fontSize: 11, fontWeight: '800', textAlign: 'right', letterSpacing: 0.6 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  breakdownTitle: { color: '#182133', fontSize: 14, fontWeight: '700' },
  breakdownValue: { width: 56, color: '#667085', fontSize: 14, textAlign: 'right' },
  breakdownValueStrong: { width: 56, color: '#1577D4', fontSize: 14, fontWeight: '800', textAlign: 'right' },
  breakdownFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  breakdownFooterText: { color: '#8491A3', fontSize: 12, lineHeight: 17 },
  syncNote: { color: '#667085', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  grow: { flex: 1 },
});

