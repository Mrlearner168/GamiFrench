import { isColdStartError } from '@/services/apiClient';
import { useAuth } from '@/store/auth-context';
import { saveModuleQuizResult } from '@/store/lesson-progress';
import { saveStartupAssessment } from '@/store/profile-cache';
import { enqueueAssessmentAttempt } from '@/store/pending-sync';
import { sounds } from '@/services/sound';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { BounceIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfettiBurst, CountUp } from '@/components/celebration';
import { getCountryTopics } from '@/data/lessons/catalog';
import { REMEDIATION_THRESHOLD } from '@/services/recommendations';
import { NODE_PASS_PERCENTAGE, starsForScore } from '@/services/scoring';

/* Placement topic verdicts, strongest first. */
function topicVerdict(score) {
  if (score >= NODE_PASS_PERCENTAGE) return { icon: '💪', label: 'Strong', tone: 'strong' };
  if (score >= REMEDIATION_THRESHOLD) return { icon: '🙂', label: 'Getting there', tone: 'mid' };
  return { icon: '🎯', label: 'Focus here', tone: 'focus' };
}

export default function Result() {
  const {
    assessmentKey,
    answers: rawAnswers,
    attemptId,
    mode,
    country,
    module,
  } = useLocalSearchParams();
  const safeAssessmentKey = Array.isArray(assessmentKey) ? assessmentKey[0] : assessmentKey;
  const safeAttemptId = Array.isArray(attemptId) ? attemptId[0] : attemptId;
  const safeMode = Array.isArray(mode) ? mode[0] : mode;
  const safeCountry = Array.isArray(country) ? country[0] : country;
  const safeModule = Array.isArray(module) ? module[0] : module;
  const fallbackAttemptId = useRef(createAttemptId());
  const answers = useMemo(() => parseAnswers(rawAnswers), [rawAnswers]);
  const [attempt, setAttempt] = useState(null);
  // Right/wrong per question (no expected answers) and, for the placement
  // check, the score per topic. Both come back with the graded attempt.
  const [review, setReview] = useState([]);
  const [topicResults, setTopicResults] = useState({});
  const [syncError, setSyncError] = useState('');
  // Answers queued offline: graded by the server on the next sync.
  const [queuedOffline, setQueuedOffline] = useState(false);
  // Set when this pass earned the next French level (e.g. A1 -> A2).
  const [levelUp, setLevelUp] = useState(null);
  const [isLoadingXp, setIsLoadingXp] = useState(true);
  const { authenticatedRequest } = useAuth();

  useEffect(() => {
    let active = true;

    if (!safeAssessmentKey || Object.keys(answers).length === 0) {
      return () => { active = false; };
    }

    authenticatedRequest(`/assessments/${encodeURIComponent(safeAssessmentKey)}/attempts`, {
      method: 'POST',
      body: JSON.stringify({
        answers,
        idempotencyKey: safeAttemptId || fallbackAttemptId.current,
      }),
    })
      .then((data) => {
        if (active) {
          setAttempt(data.attempt);
          setReview(Array.isArray(data.review) ? data.review : []);
          setTopicResults(data.topicResults ?? {});
          setLevelUp(data.levelUp ?? null);
          if (data.levelUp) setTimeout(() => sounds.levelup(), 1600);
          setIsLoadingXp(false);

          const quizPercentage = Number(data.attempt?.percentage) || 0;

          /* Placement check: save REAL per-topic mastery. The placement
           * questions are tagged by topic, so each topic gets its own score;
           * a topic the check did not cover falls back to the overall score.
           * Topics under the remediation threshold are flagged as weak, which
           * drives "Focus on" and the recommended lesson. */
          if (safeMode === 'startup' && safeModule) {
            const perTopic = data.topicResults ?? {};
            const topics = getCountryTopics(safeCountry ?? 'Canada', safeModule) ?? [];
            const topicMastery = {};
            for (const topic of topics) {
              const score = Number.isFinite(perTopic[topic.id]) ? perTopic[topic.id] : quizPercentage;
              topicMastery[topic.id] = {
                score,
                weakness: score < REMEDIATION_THRESHOLD,
                stars: starsForScore(score),
              };
            }
            saveStartupAssessment({
              moduleKey: safeModule,
              takenAt: new Date().toISOString(),
              percentage: quizPercentage,
              topicMastery,
            }).catch((err) => {
              console.log('Failed to save startup assessment:', err);
            });
          }

          /* Final assessment: record every attempt locally (the store keeps
           * the best). The map stop and the challenge gate only unlock the next
           * module at NODE_PASS_PERCENTAGE (80%), even offline afterwards. */
          if (safeMode === 'final') {
            if (
              safeAssessmentKey &&
              String(safeAssessmentKey).startsWith('module-')
            ) {
              saveModuleQuizResult(safeAssessmentKey, quizPercentage).catch(
                (gateError) => {
                  console.log('Failed to save the module quiz result:', gateError);
                }
              );
            }
          }
        }
      })
      .catch(async (err) => {
        // A real refusal from the server (4xx) would never sync: show it.
        if (!isColdStartError(err)) {
          if (active) {
            setSyncError(err?.message || 'Your answers could not be graded. Please try again.');
            setIsLoadingXp(false);
          }
          return;
        }

        await enqueueAssessmentAttempt({
          assessmentKey: safeAssessmentKey,
          answers,
          idempotencyKey: safeAttemptId || fallbackAttemptId.current,
        });

        /* Placement check: remember that it was taken, so the learner is not
         * asked again. The real per-topic result replaces this provisional
         * one when the answers sync (store/assessment-sync.js). */
        if (safeMode === 'startup' && safeModule) {
          saveStartupAssessment({
            moduleKey: safeModule,
            takenAt: new Date().toISOString(),
            percentage: 0,
            topicMastery: {},
            pending: true,
          }).catch(() => {});
        }

        if (active) {
          setQueuedOffline(true);
          setIsLoadingXp(false);
        }
      });
      
    return () => { active = false; };
  }, [answers, authenticatedRequest, safeAssessmentKey, safeAttemptId, safeCountry, safeMode, safeModule]);

  const finalScore = attempt?.score ?? 0;
  const totalQuestions = attempt?.totalQuestions ?? Math.max(Object.keys(answers).length, 1);
  const percentage = attempt?.percentage ?? 0;
  const stars = attempt?.stars ?? 0;
  const xpEarned = attempt?.xpAwarded ?? 0;
  const frenchGrade20 = attempt?.frenchGrade20 ?? 0;
  const gradeMention = attempt?.gradeMention ?? '';
  const celebratedRef = useRef(false);

  // Celebrate once when the graded result arrives.
  useEffect(() => {
    if (!attempt || celebratedRef.current) return;
    celebratedRef.current = true;
    if (percentage >= 90) sounds.levelup();
    else if (percentage >= 50) sounds.complete();
    else sounds.wrong();
    if (stars >= 1) {
      const timer = setTimeout(() => sounds.star(), 450);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [attempt, percentage, stars]);
  const requestError = !safeAssessmentKey || Object.keys(answers).length === 0
    ? 'Your assessment answers are missing. Please retake the assessment.'
    : syncError;
  const isSubmitting = !requestError && isLoadingXp;
  const answeredCount = Object.keys(answers).length;

  /* Final quiz verdict: the next stop unlocks only at 80%+; below that the
   * learner retries. Unknown while the attempt is still being graded. */
  const isFinal = safeMode === 'final';
  const finalGraded = isFinal && Boolean(attempt);
  const finalPassed = finalGraded && percentage >= NODE_PASS_PERCENTAGE;
  const finalNeedsRetry = finalGraded && !finalPassed;

  const isPlacement = safeMode === 'startup';
  const graded = Boolean(attempt);
  const celebrate = graded && (finalPassed || (!isFinal && percentage >= NODE_PASS_PERCENTAGE));
  const placementTopics = isPlacement
    ? (getCountryTopics(safeCountry ?? 'Canada', safeModule ?? 'module-1') ?? [])
      .filter((topic) => Number.isFinite(topicResults[topic.id]))
    : [];

  const retryFinalQuiz = () => {
    router.replace({
      pathname: '/quiz',
      params: { mode: 'final', country: safeCountry ?? 'Canada', module: safeModule ?? 'module-1' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Animated.Text entering={BounceIn.delay(100)} style={styles.headerIcon}>
            {queuedOffline ? '📝' : finalNeedsRetry ? '💪' : isPlacement ? '🧭' : '🎉'}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(450)} style={styles.title}>
            {queuedOffline
              ? 'Answers saved!'
              : finalNeedsRetry
              ? 'Almost there!'
              : finalPassed
                ? 'Stop complete!'
                : isPlacement
                  ? 'Placement check done!'
                  : 'Mission Complete!'}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(300).duration(450)} style={styles.subtitle}>
            {queuedOffline
              ? 'Nice work finishing it offline.'
              : finalNeedsRetry
              ? `You need ${NODE_PASS_PERCENTAGE}% to unlock the next stop. Review and try again!`
              : finalPassed
                ? 'Next destination unlocked'
                : isPlacement
                  ? 'Your lessons are now tailored to you. XP comes from the lessons and the final quiz.'
                  : 'Great job finishing this module'}
          </Animated.Text>
        </View>

        {queuedOffline ? (
          <Animated.View entering={FadeInUp.delay(350).duration(500)} style={styles.card}>
            <Text style={styles.offlineIcon}>📴</Text>
            <Text style={styles.scoreLabel}>SAVED OFFLINE</Text>
            <Text style={styles.offlineText}>
              Your {answeredCount} answers are saved on this phone. They are graded as soon as you are
              back online — your score, stars and XP will appear then
              {isFinal ? `, and the next stop unlocks if you reached ${NODE_PASS_PERCENTAGE}%` : ''}.
            </Text>
          </Animated.View>
        ) : (
        <Animated.View entering={FadeInUp.delay(350).duration(500)} style={styles.card}>
          <Text style={styles.scoreLabel}>YOUR SCORE</Text>
          {graded ? (
            <CountUp value={percentage} suffix="%" style={styles.percent} />
          ) : (
            <Text style={styles.percent}>…</Text>
          )}
          <Text style={styles.scoreText}>{finalScore} out of {totalQuestions} correct</Text>

          {gradeMention ? (
            <>
              <View style={styles.divider} />
              <Text style={[styles.scoreLabel, { marginTop: 8 }]}>FRENCH GRADE</Text>
              <Text style={[styles.percent, { fontSize: 52 }]}>{frenchGrade20} / 20</Text>
              <Text style={styles.scoreText}>{gradeMention}</Text>
            </>
          ) : null}

          <View style={styles.divider} />

          {/* Stars pop in one by one; unearned ones stay as faint outlines. */}
          {graded ? (
            <View style={styles.starRow} accessibilityLabel={`${stars} of 3 stars`}>
              {[0, 1, 2].map((slot) =>
                slot < stars ? (
                  <Animated.Text
                    key={slot}
                    entering={ZoomIn.delay(900 + slot * 260).springify().damping(9)}
                    style={styles.starSlot}
                  >
                    ⭐
                  </Animated.Text>
                ) : (
                  <Text key={slot} style={[styles.starSlot, styles.starEmpty]}>⭐</Text>
                )
              )}
            </View>
          ) : null}

          <View style={styles.rewardBox}>
            {isSubmitting ? (
              <View style={styles.xpLoading}>
                <ActivityIndicator color="#16A34A" />
                <Text style={styles.xpText}> Syncing Progress...</Text>
              </View>
            ) : (
              <Animated.View entering={ZoomIn.delay(1500).springify()} style={styles.xpBadge}>
                <Text style={styles.xpText}>⚡ +{xpEarned ?? 0} XP Earned</Text>
              </Animated.View>
            )}

            {requestError ? <Text style={styles.syncError}>{requestError}</Text> : null}
          </View>
        </Animated.View>
        )}

        {/* LEVEL UP: passing this final earned the next French level */}
        {levelUp ? (
          <Animated.View entering={ZoomIn.delay(1200).springify().damping(10)} style={styles.levelUpCard}>
            <Text style={styles.levelUpIcon}>🎓</Text>
            <Text style={styles.levelUpEyebrow}>NEW FRENCH LEVEL</Text>
            <Text style={styles.levelUpTitle}>{levelUp.label}</Text>
            <Text style={styles.levelUpText}>
              Your finals prove it — your profile now shows your new level.
            </Text>
          </Animated.View>
        ) : null}

        {/* PLACEMENT: what the learner already knows, per topic */}
        {placementTopics.length > 0 ? (
          <Animated.View entering={FadeInUp.delay(600).duration(450)} style={styles.section}>
            <Text style={styles.sectionTitle}>WHAT YOU ALREADY KNOW</Text>
            {placementTopics.map((topic, index) => {
              const verdict = topicVerdict(topicResults[topic.id]);
              return (
                <Animated.View
                  key={topic.id}
                  entering={FadeInDown.delay(800 + index * 120).duration(350)}
                  style={styles.topicRow}
                >
                  <Text style={styles.topicIcon}>{verdict.icon}</Text>
                  <Text style={styles.topicTitle} numberOfLines={2}>{topic.title}</Text>
                  <Text style={[styles.topicChip, styles[`topic_${verdict.tone}`]]}>{verdict.label}</Text>
                </Animated.View>
              );
            })}
          </Animated.View>
        ) : null}

        {/* REVIEW: right or wrong per question, never the expected answer */}
        {review.length > 0 ? (
          <Animated.View entering={FadeInUp.delay(700).duration(450)} style={styles.section}>
            <Text style={styles.sectionTitle}>YOUR ANSWERS</Text>
            {review.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(900 + index * 70).duration(300)}
                style={styles.reviewRow}
                accessibilityLabel={`${item.correct ? 'Correct' : 'Incorrect'}: ${item.prompt}`}
              >
                <Text style={[styles.reviewMark, item.correct ? styles.reviewRight : styles.reviewWrong]}>
                  {item.correct ? '✓' : '✗'}
                </Text>
                <Text style={styles.reviewPrompt}>{item.prompt}</Text>
              </Animated.View>
            ))}
            {isFinal && review.some((item) => !item.correct) ? (
              <Text style={styles.reviewNote}>
                Tip: revisit the lessons for the ✗ questions before you retry.
              </Text>
            ) : null}
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.delay(900).duration(450)} style={styles.footer}>
          {isPlacement ? (
            <>
              <Text style={[styles.scoreLabel, { marginBottom: 12 }]}>
                {queuedOffline
                  ? 'Start learning now — your lessons adapt once the check is graded.'
                  : percentage >= 50
                    ? 'You are ready to start lessons!'
                    : "Let's review the basics first."}
              </Text>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => router.replace(`/lesson?country=${safeCountry ?? 'Canada'}&module=${safeModule ?? 'module-1'}`)}
              >
                <Text style={styles.buttonText}>Start Lessons</Text>
              </TouchableOpacity>
            </>
          ) : finalNeedsRetry ? (
            <>
              <Text style={[styles.scoreLabel, styles.retryHint]}>
                PASS MARK {NODE_PASS_PERCENTAGE}% · YOU SCORED {percentage}%
              </Text>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={retryFinalQuiz}
              >
                <Text style={styles.buttonText}>Retry Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={() => router.replace(`/lesson?country=${safeCountry ?? 'Canada'}&module=${safeModule ?? 'module-1'}`)}
              >
                <Text style={styles.secondaryButtonText}>Review Lessons</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => router.replace('/home')}
            >
              <Text style={styles.buttonText}>
                {finalPassed ? 'Continue Journey' : 'Return to Home'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

      </ScrollView>
      {celebrate ? <ConfettiBurst /> : null}
    </SafeAreaView>
  );
}

function parseAnswers(rawAnswers) {
  const value = Array.isArray(rawAnswers) ? rawAnswers[0] : rawAnswers;
  if (!value) return {};
  try {
    const answers = JSON.parse(value);
    return answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {};
  } catch {
    return {};
  }
}

function createAttemptId() {
  return `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Slightly softer background
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 40,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  percent: {
    fontSize: 64,
    fontWeight: '900',
    color: '#2563EB',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginVertical: 24,
  },
  stars: {
    fontSize: 48,
    letterSpacing: 8,
    marginBottom: 20,
  },
  rewardBox: {
    width: '100%',
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  xpLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  xpText: {
    fontSize: 18,
    color: '#15803D',
    fontWeight: '800',
  },
  levelUpCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FBBF24',
  },
  levelUpIcon: {
    fontSize: 44,
  },
  levelUpEyebrow: {
    marginTop: 6,
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  levelUpTitle: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  levelUpText: {
    marginTop: 6,
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  offlineIcon: {
    fontSize: 44,
    textAlign: 'center',
    marginBottom: 6,
  },
  offlineText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
  },
  syncError: {
    marginTop: 12,
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  starSlot: {
    fontSize: 46,
  },
  starEmpty: {
    opacity: 0.18,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#64748B',
    marginBottom: 12,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topicIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  topicTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  topicChip: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  topic_strong: {
    color: '#047857',
    backgroundColor: '#D1FAE5',
  },
  topic_mid: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
  },
  topic_focus: {
    color: '#9F1239',
    backgroundColor: '#FFE4E6',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  reviewMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 10,
    overflow: 'hidden',
  },
  reviewRight: {
    backgroundColor: '#22C55E',
  },
  reviewWrong: {
    backgroundColor: '#EF4444',
  },
  reviewPrompt: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  reviewNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  retryHint: {
    marginBottom: 12,
    textAlign: 'center',
    color: '#B45309',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: '700',
  },
});
