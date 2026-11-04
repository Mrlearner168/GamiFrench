import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Animated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isColdStartError } from '@/services/apiClient';
import { readCachedAssessment, saveCachedAssessment } from '@/store/assessment-cache';
import { useAuth } from '@/store/auth-context';
import { sounds } from '@/services/sound';
import { NODE_PASS_PERCENTAGE } from '@/services/scoring';

/* How long the picked answer stays highlighted before the next question. */
const PICK_DELAY_MS = 320;

/* A friendly line under the progress bar, by how far along the learner is. */
function cheerFor(index, total) {
  if (total <= 1) return 'Show what you know!';
  if (index === 0) return "Let's go! 🚀";
  if (index === total - 1) return 'Last one — finish strong! 🏁';
  if (index === Math.floor(total / 2)) return 'Halfway there! 💪';
  return ['Nice rhythm! 🎵', 'Keep it up! ✨', 'You got this! 🌟', 'Trust your instinct! 🧠'][index % 4];
}

const QUIZ_TYPES = ['multiple-choice', 'true-false', 'sentence-builder'];

const QUIZ_POINTS = {
  'multiple-choice': 10,
  'true-false': 10,
  'sentence-builder': 20,
};

const QUIZ_TYPE_META = {
  'multiple-choice': { label: 'Multiple Choice', emoji: '🔵', hint: 'Pick the best answer • +10 pts' },
  'true-false': { label: 'True / False', emoji: '⚖️', hint: 'Quick judgement call • +10 pts' },
  'sentence-builder': { label: 'Sentence Builder', emoji: '🧩', hint: 'Harder challenge • +20 pts' },
};

const pointsForType = (qType) => QUIZ_POINTS[qType] ?? 10;
const metaForType = (qType) => QUIZ_TYPE_META[qType] ?? QUIZ_TYPE_META['multiple-choice'];

// Utility helper for structured console logging
const logQuizEvent = (event, payload = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[QUIZ_LOG][${timestamp}] ${event}`, JSON.stringify(payload, null, 2));
};

/* Minutes (rounded up) until an ISO time, never below 1. */
const minutesUntil = (iso) => {
  const ms = new Date(iso).getTime() - Date.now();
  return Number.isFinite(ms) ? Math.max(1, Math.ceil(ms / 60000)) : null;
};

export default function Quiz() {
  const { module, country, topicId, mode } = useLocalSearchParams();
  const safeModule = Array.isArray(module) ? module[0] : module;
  const safeMode = Array.isArray(mode) ? mode[0] : mode;
  const safeCountry = Array.isArray(country) ? country[0] : country;
  const { authenticatedRequest } = useAuth();

  /*
   * The placement check (mode 'startup') is stored apart from the module's
   * final quiz on the server, so it never pays XP, never costs hearts and can
   * never stand in for the final quiz. Both use the same questions.
   */
  const assessmentKey = safeModule
    ? safeMode === 'startup'
      ? `placement-${safeModule}`
      : safeModule
    : null;

  // Set when the server refuses a final quiz because the learner has 0 hearts.
  const [outOfHearts, setOutOfHearts] = useState(null);

  // The answer just tapped: highlighted for a beat before the next question,
  // and every other tap is ignored meanwhile (no double answers).
  const [picked, setPicked] = useState(null);
  const pickTimer = useRef(null);
  useEffect(() => () => clearTimeout(pickTimer.current), []);

  // Animated progress bar (0..1) and a small bounce on the picked answer.
  const progress = useSharedValue(0);
  const pickScale = useSharedValue(1);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const pickStyle = useAnimatedStyle(() => ({ transform: [{ scale: pickScale.value }] }));

  const [assessment, setAssessment] = useState(null);
  // The key the server actually served (see the placement fallback below);
  // the attempt must be submitted under the same key.
  const [servedKey, setServedKey] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  const [selectedTokenIndices, setSelectedTokenIndices] = useState([]);
  // True when the questions came from this device's offline copy.
  const [offlineCopy, setOfflineCopy] = useState(false);

  // Fetch assessment data
  useEffect(() => {
    let active = true;

    if (!safeModule) {
      logQuizEvent('FETCH_SKIPPED', { reason: 'No safeModule provided in search params' });
      return () => { active = false; };
    }

    logQuizEvent('FETCH_ASSESSMENT_START', { assessmentKey });

    const fetchAssessment = (key) =>
      authenticatedRequest(`/assessments/${encodeURIComponent(key)}`).then((data) => ({ data, key }));

    // A server that predates the per-topic placement check answers 404 for
    // `placement-module-N`; fall back to the module's own questions so the
    // check still loads (the older server graded placement that way).
    fetchAssessment(assessmentKey)
      .catch((err) => {
        if (assessmentKey !== safeModule && (err?.status === 404 || err?.code === 'NOT_FOUND')) {
          logQuizEvent('PLACEMENT_FALLBACK', { assessmentKey, fallback: safeModule });
          return fetchAssessment(safeModule);
        }
        throw err;
      })
      .then(({ data, key }) => {
        // Keep a copy so this quiz can be taken offline later.
        saveCachedAssessment(key, data).catch(() => {});
        if (active) {
          setServedKey(key);
          logQuizEvent('FETCH_ASSESSMENT_SUCCESS', {
            questionsCount: data?.questions?.length || 0,
            assessmentId: data?.id,
          });
          setAssessment(data);
        }
      })
      .catch(async (err) => {
        if (!active) return;
        logQuizEvent('FETCH_ASSESSMENT_ERROR', { error: err?.message || err });
        if (err?.code === 'OUT_OF_HEARTS') {
          setOutOfHearts(err.details ?? {});
          return;
        }

        // Offline (or the server is unreachable): use the copy on this device.
        if (isColdStartError(err)) {
          const primary = await readCachedAssessment(assessmentKey);
          const fallback =
            !primary && assessmentKey !== safeModule ? await readCachedAssessment(safeModule) : null;
          const cached = primary ?? fallback;
          if (!active) return;
          if (cached) {
            logQuizEvent('FETCH_ASSESSMENT_OFFLINE_COPY', { assessmentKey });
            // Answers are submitted under the key whose questions were shown.
            setServedKey(primary ? assessmentKey : safeModule);
            setOfflineCopy(true);
            setAssessment(cached);
            return;
          }
          setError(
            "You're offline and this quiz isn't downloaded yet. Connect once and it will be saved for offline use."
          );
          return;
        }

        setError('Failed to load assessment. Please check your connection and try again.');
      });

    return () => { active = false; };
  }, [authenticatedRequest, safeModule, assessmentKey]);

  // Log question changes when the learner advances. The token-selection
  // reset is done in submitAnswer (where `current` actually changes) instead
  // of an effect: setState inside an effect fires cascading renders.
  useEffect(() => {
    if (assessment?.questions?.[current]) {
      const activeQuestion = assessment.questions[current];
      logQuizEvent('QUESTION_LOADED', {
        step: current + 1,
        total: assessment.questions.length,
        questionId: activeQuestion.id,
        type: activeQuestion.type || (activeQuestion.choices ? 'multiple-choice' : 'true-false'),
      });
    }
  }, [current, assessment]);

  const questions = assessment?.questions;

  useEffect(() => {
    const total = questions?.length ?? 0;
    progress.set(withTiming(total ? current / total : 0, { duration: 450 }));
  }, [current, questions, progress]);

  const errorMessage = !safeModule ? 'No assessment was selected.' : error;

  if (outOfHearts) {
    const wait = outOfHearts.nextHeartAt ? minutesUntil(outOfHearts.nextHeartAt) : null;
    const reviewLessons = () =>
      router.replace({
        pathname: '/lesson',
        params: { country: safeCountry ?? 'Canada', module: safeModule ?? 'module-1' },
      });

    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.heartsIcon}>💔</Text>
        <Text style={styles.heartsTitle}>Out of hearts</Text>
        <Text style={styles.heartsText}>
          Each wrong answer in a final quiz costs a heart, and one heart comes back
          every {outOfHearts.heartRefillMinutes ?? 30} minutes.
          {wait ? ` Your next heart arrives in about ${wait} min.` : ''}
        </Text>
        <Text style={styles.heartsText}>Review the lessons while you wait — then come back and ace it!</Text>
        <TouchableOpacity style={styles.heartsButton} activeOpacity={0.8} onPress={reviewLessons}>
          <Text style={styles.heartsButtonText}>Review Lessons</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.heartsSecondary} activeOpacity={0.8} onPress={() => router.replace('/home')}>
          <Text style={styles.heartsSecondaryText}>Back to Map</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </SafeAreaView>
    );
  }

  if (!questions) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading assessment…</Text>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>This assessment currently has no questions.</Text>
      </SafeAreaView>
    );
  }

  const question = questions[current];

  const submitAnswer = (choice) => {
    if (picked !== null) return;
    setPicked(choice);
    sounds.tap();
    pickScale.set(withSequence(withSpring(1.06, { damping: 8 }), withSpring(1)));
    pickTimer.current = setTimeout(() => {
      setPicked(null);
      commitAnswer(choice);
    }, PICK_DELAY_MS);
  };

  const commitAnswer = (choice) => {
    const nextAnswers = { ...answers, [question.id]: choice };
    const isFinalQuestion = current === questions.length - 1;

    logQuizEvent('ANSWER_SUBMITTED', {
      questionId: question.id,
      submittedChoice: choice,
      isFinalQuestion,
      step: `${current + 1}/${questions.length}`,
    });

    if (isFinalQuestion) {
      const attemptId = createAttemptId();
      const payload = {
        assessmentKey: servedKey ?? assessmentKey,
        answers: JSON.stringify(nextAnswers),
        attemptId,
        mode: safeMode,
        country: Array.isArray(country) ? country[0] : country,
        module: safeModule,
        topicId: Array.isArray(topicId) ? topicId[0] : topicId,
      };

      logQuizEvent('QUIZ_COMPLETED', payload);

      router.replace({
        pathname: '/result',
        params: payload,
      });
      return;
    }

    setAnswers(nextAnswers);
    // Reset the sentence-builder token selection for the next question at the
    // same time `current` advances — never inside an effect (see above).
    setSelectedTokenIndices([]);
    setCurrent(current + 1);
  };

  const qTypeRaw = question.type || (question.choices ? 'multiple-choice' : 'true-false');
  const qType = QUIZ_TYPES.includes(qTypeRaw) ? qTypeRaw : 'multiple-choice';
  const qMeta = metaForType(qType);

  const handleAddToken = (index) => {
    if (!question.choices) return;
    logQuizEvent('SCRAMBLE_TOKEN_ADDED', { token: question.choices[index], index });
    sounds.pop();
    setSelectedTokenIndices((prev) => [...prev, index]);
  };

  const handleRemoveToken = (arrayIdxToRemove) => {
    const removedChoiceIdx = selectedTokenIndices[arrayIdxToRemove];
    if (question.choices) {
      logQuizEvent('SCRAMBLE_TOKEN_REMOVED', { token: question.choices[removedChoiceIdx], arrayIdxToRemove });
    }
    sounds.tap();
    setSelectedTokenIndices((prev) => prev.filter((_, idx) => idx !== arrayIdxToRemove));
  };

  const handleClearTokens = () => {
    logQuizEvent('SCRAMBLE_TOKENS_CLEARED');
    sounds.tap();
    setSelectedTokenIndices([]);
  };

  const isPlacement = safeMode === 'startup';
  const isFinal = safeMode === 'final';
  const hearts = assessment?.hearts?.hearts;
  const maxHearts = assessment?.hearts?.maxHearts ?? 5;
  const choiceStyle = (choice) => [
    styles.choice,
    picked === choice && styles.choicePicked,
    picked !== null && picked !== choice && styles.choiceDimmed,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* HEADER: quit, animated progress, counter */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Leave quiz"
            style={styles.quitButton}
          >
            <Text style={styles.quitText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.progressCount}>
            {current + 1}/{questions.length}
          </Text>
        </View>

        {/* MODE BANNER */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.modeBanner, isPlacement ? styles.modePlacement : styles.modeFinal]}
        >
          <Text style={styles.modeTitle}>
            {isPlacement
              ? '🧭 Placement check'
              : isFinal
                ? `🏁 Final quiz · ${NODE_PASS_PERCENTAGE}% to pass`
                : '📝 Quiz'}
          </Text>
          <Text style={styles.modeSub}>
            {isPlacement
              ? 'No pressure: this only tailors your lessons. No XP, no hearts.'
              : isFinal && Number.isFinite(hearts)
                ? `${'❤️'.repeat(Math.max(0, hearts))}${'🤍'.repeat(Math.max(0, maxHearts - hearts))}  each wrong answer costs a heart`
                : qMeta.hint}
          </Text>
        </Animated.View>

        {offlineCopy ? (
          <Text style={styles.offlineNote}>
            📴 Offline — your answers are saved and graded when you are back online.
          </Text>
        ) : null}

        <Text style={styles.cheer}>{cheerFor(current, questions.length)}</Text>

        {/* QUESTION: re-keyed so each one slides in */}
        <Animated.View
          key={question.id}
          entering={FadeInRight.springify().damping(16)}
          style={styles.typeContainer}
        >
          <View style={styles.card}>
            <Text style={styles.cardTag}>
              {qMeta.emoji} {qMeta.label.toUpperCase()} • +{pointsForType(qType)} PTS
            </Text>
            <Text style={styles.question}>{question.question}</Text>
          </View>

          {/* SENTENCE BUILDER */}
          {qType === 'sentence-builder' && (
            <>
              <View style={styles.answerBox}>
                {selectedTokenIndices.length === 0 ? (
                  <Text style={styles.placeholderText}>Tap the words below to build the sentence…</Text>
                ) : (
                  <View style={styles.tokenContainer}>
                    {selectedTokenIndices.map((choiceIdx, arrayIdx) => (
                      <Animated.View
                        key={`selected-${arrayIdx}-${choiceIdx}`}
                        entering={ZoomIn.springify().damping(14)}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={styles.selectedTokenChip}
                          disabled={picked !== null}
                          onPress={() => handleRemoveToken(arrayIdx)}
                        >
                          <Text style={styles.selectedTokenText}>{question.choices?.[choiceIdx]}</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.wordBankGrid}>
                {(question.choices || []).slice(0, 8).map((choice, idx) => {
                  const isSelected = selectedTokenIndices.includes(idx);
                  return (
                    <Animated.View
                      key={`choice-${idx}`}
                      entering={FadeInDown.delay(80 + idx * 50).duration(300)}
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.bankTokenChip, isSelected && styles.disabledBankChip]}
                        disabled={isSelected || picked !== null}
                        onPress={() => handleAddToken(idx)}
                      >
                        <Text style={[styles.bankTokenText, isSelected && styles.disabledBankText]}>
                          {choice}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>

              <View style={styles.scrambleActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  activeOpacity={0.7}
                  onPress={handleClearTokens}
                  disabled={selectedTokenIndices.length === 0 || picked !== null}
                >
                  <Text style={[styles.clearButtonText, selectedTokenIndices.length === 0 && styles.disabledText]}>
                    Clear
                  </Text>
                </TouchableOpacity>

                <Animated.View style={[styles.submitWrap, picked !== null && pickStyle]}>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      styles.submitButtonInline,
                      selectedTokenIndices.length === 0 && styles.disabledButton,
                    ]}
                    activeOpacity={0.7}
                    disabled={selectedTokenIndices.length === 0 || picked !== null}
                    onPress={() => {
                      const constructedSentence = selectedTokenIndices
                        .map((idx) => question.choices?.[idx])
                        .join(' ');
                      submitAnswer(constructedSentence);
                    }}
                  >
                    <Text style={styles.submitButtonText}>
                      {picked !== null ? 'Locked in ✓' : 'Submit Answer'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </>
          )}

          {/* TRUE / FALSE */}
          {qType === 'true-false' && (
            <View style={styles.trueFalseRow}>
              {[
                { value: 'True', label: '✓ True', style: styles.trueChoice },
                { value: 'False', label: '✕ False', style: styles.falseChoice },
              ].map((option, idx) => (
                <Animated.View
                  key={option.value}
                  entering={FadeInDown.delay(120 + idx * 80).duration(320)}
                  style={[styles.trueFalseCell, picked === option.value && pickStyle]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[...choiceStyle(option.value), option.style, styles.trueFalseChoice]}
                    disabled={picked !== null}
                    onPress={() => submitAnswer(option.value)}
                  >
                    <Text style={styles.choiceText}>{option.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {/* MULTIPLE CHOICE */}
          {qType === 'multiple-choice' &&
            (question.choices || []).slice(0, 8).map((choice, idx) => (
              <Animated.View
                key={`mc-${idx}`}
                entering={FadeInDown.delay(100 + idx * 70).duration(320)}
                style={picked === choice ? pickStyle : undefined}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={choiceStyle(choice)}
                  disabled={picked !== null}
                  onPress={() => submitAnswer(choice)}
                >
                  <View style={styles.choiceBadge}>
                    <Text style={styles.choiceBadgeText}>{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createAttemptId() {
  return `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  quitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  quitText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#475569',
  },
  progressTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#22C55E',
  },
  progressCount: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '900',
    color: '#475569',
    minWidth: 40,
    textAlign: 'right',
  },
  offlineNote: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  modeBanner: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  modePlacement: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  modeFinal: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
  },
  modeSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  cheer: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C3AED',
    textAlign: 'center',
    marginVertical: 10,
  },
  typeContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 30,
  },
  answerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minHeight: 100,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tokenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTokenChip: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  selectedTokenText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  wordBankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  bankTokenChip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 1,
  },
  bankTokenText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBankChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    elevation: 0,
  },
  disabledBankText: {
    color: '#D1D5DB',
  },
  scrambleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  clearButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  flashcard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    minHeight: 220,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  flashcardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#10B981',
  },
  incorrectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  /* Chunky "3D" answer buttons: a darker bottom edge that flattens when picked. */
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderBottomWidth: 5,
    borderColor: '#1D4ED8',
  },
  choicePicked: {
    backgroundColor: '#7C3AED',
    borderColor: '#5B21B6',
    borderBottomWidth: 2,
    marginTop: 3,
  },
  choiceDimmed: {
    opacity: 0.45,
  },
  choiceBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  choiceBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  trueFalseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trueFalseCell: {
    flex: 1,
  },
  trueFalseChoice: {
    paddingVertical: 28,
  },
  trueChoice: {
    backgroundColor: '#10B981',
    borderColor: '#047857',
  },
  falseChoice: {
    backgroundColor: '#EF4444',
    borderColor: '#B91C1C',
  },
  choiceText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    fontSize: 18,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  submitWrap: {
    flex: 1,
  },
  submitButtonInline: {
    marginBottom: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#EF4444',
  },
  heartsIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  heartsTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 10,
  },
  heartsText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 10,
  },
  heartsButton: {
    marginTop: 14,
    alignSelf: 'stretch',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  heartsButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  heartsSecondary: {
    marginTop: 10,
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  heartsSecondaryText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '800',
  },
});