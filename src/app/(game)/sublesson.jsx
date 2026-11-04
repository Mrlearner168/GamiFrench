import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCountryTopics } from '@/data/lessons/catalog';
import {
  getGrammarContent,
  getLearningContent,
  getPracticeContent,
  getQuizContent,
  getSpeakingContent,
} from '@/data/lessons/index';
import { SPEAKING_THRESHOLD, scorePronunciation } from '@/services/pronunciation';
import {
  clampScore,
  isPassingScore,
  starsForScore,
  sublessonXpForScore,
} from '@/services/scoring';
import { MISSION_PASS_PERCENTAGE } from '@/data/lessons/missionCatalog';
import { persistClipForDeferred, transcribeClip } from '@/services/transcription';
import {
  FRENCH_LOCALE,
  SPEECH_RATES,
  isVoiceWarm,
  speak as speakQueued,
  stopAll as stopAllSpeech,
  warmUpVoice,
} from '@/services/voice';

import { useNetworkStatus } from '@/services/connectivity';
import { sounds } from '@/services/sound';
import { useAuth } from '@/store/auth-context';
import { useLessonProgress } from '@/hooks/use-lesson-progress';
import { recordSubLessonCompletion } from '@/store/challenge-progress';
import {
  completeSubLesson,
  getSubLessonBestScore,
  noteSubLessonAttemptScore,
  isSubLessonLocked,
  loadLessonProgress,
  saveLastPlayedTopic,
  saveSubLessonPracticeScore,
  saveSubLessonResultStats,
  saveSubLessonSpeakingScore,
} from '@/store/lesson-progress';
import { enqueueContentProgress, enqueueSpeakingAttempt } from '@/store/pending-sync';

const STAGES = {
  LEARN: 'learn',
  PRACTICE: 'practice',
  SPEAKING: 'speaking',
  QUIZ: 'quiz',
  RESULT: 'result',
};

const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  SENTENCE_BUILDER: 'sentence-builder',
};

/*
 * Points awarded per quiz question type.
 * Sentence Builder is intentionally worth more because it is harder,
 * making results feel more interactive and rewarding.
 */
const QUIZ_POINTS = {
  'multiple-choice': 10,
  'true-false': 10,
  'sentence-builder': 20,
};

/*
 * The quiz runs hands-free.
 *
 * As soon as an answer is picked it is checked automatically after
 * QUIZ_AUTO_CHECK_MS, the correct answer stays on screen for
 * QUIZ_AUTO_ADVANCE_MS and then the next question opens by itself.
 * Tapping the button at any time simply skips the wait.
 */
const QUIZ_AUTO_CHECK_MS = 1000;
const QUIZ_AUTO_ADVANCE_MS = 3000;

const QUIZ_AUTO_CHECK_SECONDS = Math.ceil(QUIZ_AUTO_CHECK_MS / 1000);

const QUIZ_AUTO_ADVANCE_SECONDS = Math.ceil(QUIZ_AUTO_ADVANCE_MS / 1000);

/*
 * The text-to-speech engine is warmed up before the lesson opens. This is the
 * longest the readiness gate may wait; after it the lesson starts anyway so a
 * device without a French voice is never blocked.
 */
const VOICE_READY_TIMEOUT_MS = 3000;

/*
 * TEXT <-> VOICE SYNC
 *
 * The voice service hands a line to the platform engine and returns long before
 * any sound is produced, so the sentence could otherwise appear seconds before
 * it is read. The card therefore reveals the text as the engine really starts,
 * and lights up each word as it is spoken.
 */

const quizTypeOf = (quiz) =>
  quiz?.type ?? QUIZ_TYPES.MULTIPLE_CHOICE;

const pointsForQuizType = (quizType) =>
  QUIZ_POINTS[quizType] ?? QUIZ_POINTS[QUIZ_TYPES.MULTIPLE_CHOICE];

/*
 * Single-letter cards (m1-l1-alphabet: 'A', 'B', ...) cannot be scored
 * reliably by any recognizer, so the Try target falls back to the card's
 * example word ('ami', 'bonjour', ...). Returned as { target, isFallback }.
 */
const learnTryTargetForItem = (item) => {
  const french = String(item?.french ?? '').trim();
  const example = String(item?.example ?? '').trim();

  if (french.length < 2 && example) {
    return { target: example, isFallback: true };
  }

  return { target: french, isFallback: false };
};

/*
 * Shared deterministic scorer. Tier 1 (Learn Try) and Tier 2 (graded Speaking)
 * both use scorePronunciation() so the number shown in practice is the number
 * the gate will grade — the old word-recall helper always drifted from it.
 */
const scoreForTarget = (target, transcript) => {
  if (!transcript || !target) {
    return {
      score: 0,
      matchedWords: [],
      missedWords: [],
      extraWords: [],
      targetWords: [],
    };
  }

  return scorePronunciation(target, transcript);
};

const normalizeQuizAnswer = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item)
          .trim()
          .toLowerCase()
      )
      .join(' ');
  }

  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, '');
};

/*
 * Transcription + scoring now live in services/transcription.ts (the
 * offline-first ladder) and services/pronunciation.js (the deterministic
 * score), so the speaking check works with no network as well as online.
 */

export default function SubLessonScreen() {
  const { authenticatedRequest } = useAuth();
  const {
    country = 'Canada',
    module: moduleParam,
    topicId,
    subLessonIndex = '0',
  } = useLocalSearchParams();

  const countryName = Array.isArray(country)
    ? country[0]
    : country;

  const moduleId = Array.isArray(moduleParam)
    ? moduleParam[0]
    : moduleParam;
  console.log("Module ID being used as a quiz" , moduleId);

  const topicKey = Array.isArray(topicId)
    ? topicId[0]
    : topicId;

  const indexParam = Array.isArray(subLessonIndex)
    ? subLessonIndex[0]
    : subLessonIndex;

  const lessonIndex = Number.parseInt(indexParam, 10);

  /*
   * REFS FOR RECORDING TIMERS
   */
  const recordingStartTimeRef = useRef(null);
  const autoStopTimerRef = useRef(null);
  /*
   * Local sequence for deferred-queue idempotency keys. Used instead of a
   * timestamp so the speaking handler stays free of impure calls (the React
   * purity rule rejects `Date.now()` in component scope).
   */
  const speakingAttemptSeqRef = useRef(0);

  /*
   * LOAD CATALOG
   */
  /*
   * TRACK LAST PLAYED
   */
  useEffect(() => {
    if (countryName && topicKey) {
      saveLastPlayedTopic(countryName, topicKey, indexParam);
    }
  }, [countryName, topicKey, indexParam]);


  const topics = useMemo(() => {
    return getCountryTopics(countryName, moduleId);
  }, [countryName, moduleId]);

  const topic = useMemo(() => {
    return topics.find(
      (item) => item.id === topicKey
    );
  }, [topics, topicKey]);

  const subLesson = useMemo(() => {
    const safeIndex = Number.isNaN(lessonIndex)
      ? 0
      : lessonIndex;

    return topic?.subLessons?.[safeIndex] ?? null;
  }, [topic, lessonIndex]);

  /*
   * LOAD CONTENT
   */

  const learningContent = useMemo(() => {
    return getLearningContent(
      moduleId,
      subLesson?.id
    );
  }, [moduleId, subLesson?.id]);

  const grammar = useMemo(() => {
    return getGrammarContent(
      moduleId,
      subLesson?.id,
      learningContent,
      subLesson
    );
  }, [moduleId, subLesson, learningContent]);

  const practiceContent = useMemo(() => {
    return getPracticeContent(
      moduleId,
      subLesson?.id
    );
  }, [moduleId, subLesson?.id]);

  const speakingContent = useMemo(() => {
    return getSpeakingContent(
      moduleId,
      subLesson?.id
    );
  }, [moduleId, subLesson?.id]);

  const quizContent = useMemo(() => {
    return getQuizContent(
      moduleId,
      subLesson?.id
    );
  }, [moduleId, subLesson?.id]);

  /*
   * Memoised so the array reference stays stable across renders: without it
   * the automatic learn-speech effect below would restart (stop and replay
   * the sentence) on every re-render.
   */
  const learningItems = useMemo(
    () =>
      Array.isArray(learningContent?.items)
        ? learningContent.items
        : [],
    [learningContent]
  );

  /*
   * Practice content is stored as one array of activities per sublesson,
   * so the array itself is the list of items.
   */
  const practiceItems = Array.isArray(practiceContent)
    ? practiceContent
    : Array.isArray(practiceContent?.items)
      ? practiceContent.items
      : [];

  /*
   * The quiz only uses multiple choice, true/false and sentence builder
   * questions; any other question type is filtered out.
   * The memo keeps the item and question objects stable so the automatic
   * timers are never restarted by a re-render.
   */
  const quizItems = useMemo(() => {
    const supportedQuizTypes = [
      QUIZ_TYPES.MULTIPLE_CHOICE,
      QUIZ_TYPES.TRUE_FALSE,
      QUIZ_TYPES.SENTENCE_BUILDER,
    ];

    return Array.isArray(quizContent)
      ? quizContent.filter(
          (question) =>
            !question?.type ||
            supportedQuizTypes.includes(question.type)
        )
      : [];
  }, [quizContent]);

  /*
   * STATE
   */

  const [stage, setStage] = useState(STAGES.LEARN);

  const [learnIndex, setLearnIndex] = useState(0);
  const [showGrammar, setShowGrammar] = useState(false);

  const [practiceIndex, setPracticeIndex] =
    useState(0);
  const [quizIndex, setQuizIndex] = useState(0);

  /*
   * Seconds left before the next quiz question opens automatically.
   * It stays null while no answer is being shown.
   */
  const [quizAdvanceSeconds, setQuizAdvanceSeconds] = useState(null);

  /*
   * Seconds left before the picked answer is checked automatically.
   * It stays null while no answer is waiting to be checked.
   */
  const [quizCheckSeconds, setQuizCheckSeconds] = useState(null);

  const { progress, ready: progressReady } = useLessonProgress(authenticatedRequest);

  /*
   * PRACTICE
   */

  const [practiceItemScores, setPracticeItemScores] =
    useState([]);

  const [practiceScore, setPracticeScore] =
    useState(0);

  const [
    practiceSelectedAnswer,
    setPracticeSelectedAnswer,
  ] = useState(null);

  const [practiceFeedback, setPracticeFeedback] =
    useState(false);

  const [practiceCorrect, setPracticeCorrect] =
    useState(false);

  /*
   * QUIZ
   */

  const [quizAnswers, setQuizAnswers] = useState([]);

  const [resultQuizScore, setResultQuizScore] =
    useState(0);

  const [resultQuizPoints, setResultQuizPoints] = useState(0);
  const [resultQuizMaxPoints, setResultQuizMaxPoints] = useState(0);
  const [resultQuizBreakdown, setResultQuizBreakdown] = useState([]);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [quizInput, setQuizInput] = useState('');

  const [sentenceWords, setSentenceWords] =
    useState([]);

  const [
    showQuizFeedback,
    setShowQuizFeedback,
  ] = useState(false);

  const [isQuizCorrect, setIsQuizCorrect] =
    useState(false);

  const [serverStars, setServerStars] = useState(0);
  const [serverXpAwarded, setServerXpAwarded] = useState(0);

  /*
   * RESULT
   *
   * The score actually graded and stored for this run, plus how many
   * pronunciation attempts were made. The result screen shows the stored score
   * (never a recomputed one) so the number on screen is always the number the
   * server was paid for, and the attempt count feeds the topic statistics.
   */
  const [resultOverallScore, setResultOverallScore] = useState(null);
  const [speakingAttemptCount, setSpeakingAttemptCount] = useState(0);
  const [serverXpTotal, setServerXpTotal] = useState(0);

  /*
   * SPEAKING
   *
   * Tier 1 (Learn Try, ungraded) vs Tier 2 (Speaking stage, graded):
   * the Try state below is ephemeral per Learn card and NEVER touches
   * speakingAccuracy / speakingAttemptCount / the persisted stores.
   */

  const [
    speakingTranscript,
    setSpeakingTranscript,
  ] = useState('');

  const [
    speakingAccuracy,
    setSpeakingAccuracy,
  ] = useState(null);

  /*
   * True when an offline attempt could not be scored on the device and was
   * queued for later grading. The speaking stage surfaces a note so the learner
   * isn't left staring at a blank screen.
   */
  const [speakingDeferred, setSpeakingDeferred] = useState(false);

  const [isRecordingUI, setIsRecordingUI] =
    useState(false);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  /*
   * TIER 1 — Learn Try (ungraded, formative).
   *
   * One ephemeral attempt per Learn card. Reset on every card change
   * (see nextLearn / restartLesson). Next is NEVER blocked by this score.
   */
  const [learnTryRecording, setLearnTryRecording] = useState(false);
  const [learnTryAnalyzing, setLearnTryAnalyzing] = useState(false);
  const [learnTryTranscript, setLearnTryTranscript] = useState('');
  const [learnTryScore, setLearnTryScore] = useState(null);
  const [learnTryWords, setLearnTryWords] = useState({
    matched: [],
    missed: [],
  });
  const [learnTryError, setLearnTryError] = useState(null);

  /*
   * Which part of the grading is running, so the waiting screen can say
   * whether the audio is still being transcribed or already being scored.
   */
  const [analysisStep, setAnalysisStep] = useState(null);

  /*
   * VOICE READINESS
   *
   * isVoiceReady stays false until the text-to-speech engine has been warmed
   * up, which is what lets the lesson screen open with instant audio.
   * warmUpStep drives the loader copy shown while that happens.
   */
  // Usually already true: the voice is warmed once at app launch.
  const [isVoiceReady, setIsVoiceReady] = useState(isVoiceWarm);

  /*
   * Which part of the warm up is running: 'resolving' while the device voice
   * list is being read, 'warming' while silent primer sentences are teaching
   * the engine to speak for real.
   */
  const [warmUpStep, setWarmUpStep] = useState('resolving');

  /*
   * TEXT <-> VOICE SYNC
   *
   * Which part of the model voice the current learn card is showing:
   *
   *   'loading'  the sentence has been handed to the engine but has not
   *              started speaking yet, so a loader stands in its place,
   *   'speaking' the engine reported onStart, which is when the text is
   *              revealed — text and voice are in sync from here on,
   *   'idle'     nothing is being spoken, so the card reads normally.
   */
  const [learnVoicePhase, setLearnVoicePhase] = useState('loading');

  /*
   * Index of the word the model voice is currently reading, or null when the
   * engine is not reporting word boundaries. Drives the follow-along highlight
   * so the learner can see each word light up as it is spoken.
   */
  const [, setSpokenWordIndex] = useState(null);

  /**
   * Read-aloud speed for the Listen buttons. A beginner can slow the model
   * voice down instead of struggling to catch normal pace.
   */
  const [speechRateKey] = useState('normal');

  /*
   * Subscribe to connectivity changes so the screen re-renders when the
   * connection drops or returns (the value itself is read via
   * `useNetworkStatus()` in the sync layer; nothing here consumes it).
   */
  useNetworkStatus();

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  /*
   * CLEANUP TIMERS ON UNMOUNT
   */
  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
    };
  }, []);

  /*
   * LOAD PROGRESS
   *
   * The device copy is shown first (a few ms) and the server's answer is
   * merged in when it arrives, so a slow / waking server no longer leaves
   * this screen locked while the voice is already speaking.
   */

  /*
   * AUDIO PERMISSION
   */
  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync()
      .catch((error) => {
        console.log(
          'Audio permission error:',
          error
        );
      });
  }, []);

  /*
   * TEXT TO SPEECH WARM UP
   *
   * The voice service warms the engine ONCE per app run (started at launch
   * from the root layout), so normally the engine is already hot here and the
   * lesson opens straight away with no loader. Only on a cold start does this
   * wait, behind the readiness loader, for the shared warm up:
   *
   * 1. The engine is asked for its voices, which binds the platform TTS
   *    service and remembers the French / English voice ids for later.
   * 2. A short REAL utterance is spoken (silently, volume 0) once per
   *    language, and the warm up waits until the engine reports it finished.
   *    A whitespace-only utterance is skipped by most engines, which is why
   *    a muted ' ' never warmed anything up and the first lesson sentence
   *    arrived many seconds after the screen opened.
   * 3. Only then does the readiness gate open, so the screen appears with a
   *    hot engine and the first sentence plays immediately.
   *
   * VOICE_READY_TIMEOUT_MS is the overall backstop: if anything hangs, the
   * lesson still opens on time instead of blocking a device with no engine.
   */
  useEffect(() => {
    let active = true;

    /*
     * The voice list and the silent primer are both handled by the voice
     * service, which owns the timeouts and the fallbacks. This effect only has
     * to open the readiness gate once the engine is hot.
     */
    const waitForVoice = async () => {
      if (isVoiceWarm()) {
        setIsVoiceReady(true);
        return;
      }

      setWarmUpStep('warming');
      await warmUpVoice();

      if (active) {
        setIsVoiceReady(true);
      }
    };

    waitForVoice();

    // Never let a missing voice engine hold the lesson hostage.
    const readyTimer = setTimeout(() => {
      setIsVoiceReady(true);
    }, VOICE_READY_TIMEOUT_MS);

    return () => {
      active = false;
      clearTimeout(readyTimer);

      // Leaving the screen drops anything queued, so a line can never play
      // over the screen the learner just opened.
      stopAllSpeech();
    };
  }, []);

  /*
   * LOCK CHECK
   *
   * Plain value (not a hook), computed before the speech effect so the voice
   * can wait for it. Nothing counts as locked until progress is known.
   */
  const isLocked =
    progressReady &&
    isSubLessonLocked(progress, countryName, topic, lessonIndex);

  /*
   * AUTOMATIC LEARN SPEECH
   *
   * Held back until the voice is warm, so the first sentence plays
   * immediately instead of after a cold start. The card then runs by itself:
   *
   *   English intro → French sentence
   *
   * The card is behind the voice loader for the whole intro, and the French
   * sentence is revealed by the engine's own onStart callback so the text and
   * the voice start together (see LEARN_VOICE_START_TIMEOUT_MS for the
   * backstop that reveals it anyway).
   *
   * Every step is queued from the previous one's completion callback (or
   * error, or stop), and each one carries a timeout backstop so a TTS engine
   * that never reports "finished" cannot stall the card on its loader.
   */
  useEffect(() => {
    // Speak only once the lesson itself is on screen: never over a loader,
    // a locked screen, or before the progress check has answered.
    if (stage !== STAGES.LEARN || !isVoiceReady || !progressReady || isLocked) {
      return undefined;
    }

    const frenchText =
      learningItems[learnIndex]?.french;

    if (!frenchText) {
      return undefined;
    }

    let active = true;

    /*
     * Read the model sentence once.
     *
     * The old sequence played a spoken English instruction ("Listen carefully
     * and repeat after me.") before *every* card, which cost several seconds of
     * dead air per word and made the lesson feel sluggish. That prompt now
     * appears once, as on-screen copy, and the voice speaks only the French.
     */
    const runVoice = async () => {
      setLearnVoicePhase('loading');

      await speakQueued(frenchText, {
        language: FRENCH_LOCALE,
        rate: SPEECH_RATES.normal,

        // Reveal the sentence as the voice reaches it and light up each word
        // as it is read, so the learner can follow along.
        onStart: () => {
          if (active) setLearnVoicePhase('speaking');
        },
        onWord: (index) => {
          if (active) setSpokenWordIndex(index);
        },
        // A new card starts its sentence at once, never behind the last one.
        cutIn: true,
      });

      if (!active) return;

      setSpokenWordIndex(null);
      setLearnVoicePhase('idle');
    };

    runVoice();

    return () => {
      active = false;
      stopAllSpeech();
    };
  }, [stage, learnIndex, learningItems, isVoiceReady, progressReady, isLocked]);

  /*
   * Memoised so the question object stays stable while a question is on
   * screen; that keeps the automatic timers from being restarted.
   */
  const currentQuiz = useMemo(
    () => quizItems[quizIndex],
    [quizItems, quizIndex]
  );

  /*
   * QUIZ ANSWER HELPERS
   *
   * These are memoised for the same reason: the auto-check timer below only
   * restarts when the learner really changes an answer.
   */

  const getQuizUserAnswer = useCallback(
    (quiz) => {
      switch (quizTypeOf(quiz)) {
        case QUIZ_TYPES.SENTENCE_BUILDER:
          return sentenceWords;

        default:
          return selectedAnswer;
      }
    },
    [selectedAnswer, sentenceWords]
  );

  const isQuizAnswerReady = useCallback(
    (quiz) => {
      if (!quiz) return false;

      switch (quizTypeOf(quiz)) {
        case QUIZ_TYPES.SENTENCE_BUILDER:
          return sentenceWords.length > 0;

        default:
          return !!selectedAnswer;
      }
    },
    [selectedAnswer, sentenceWords]
  );

  const evaluateQuizAnswer = useCallback(
    (quiz) => {
      const normalizedUser = normalizeQuizAnswer(
        getQuizUserAnswer(quiz)
      );

      const normalizedCorrect = normalizeQuizAnswer(quiz.answer);

      return normalizedUser === normalizedCorrect;
    },
    [getQuizUserAnswer]
  );

  /*
   * Reveals the result of the current question and starts the countdown that
   * opens the next one. The 5 second auto-check timer calls it, and so does
   * tapping "Check Answer".
   */
  const checkQuizAnswer = useCallback(() => {
    if (!currentQuiz || showQuizFeedback) return;
    if (!isQuizAnswerReady(currentQuiz)) return;

    const correct = evaluateQuizAnswer(currentQuiz);
    const earnedPoints = correct
      ? pointsForQuizType(quizTypeOf(currentQuiz))
      : 0;

    setIsQuizCorrect(correct);
    setShowQuizFeedback(true);

    // Instant game feedback: bright chime for correct, soft tone for miss.
    if (correct) sounds.correct();
    else sounds.wrong();

    setQuizCheckSeconds(null);

    // Starts the countdown that is shown next to the button.
    setQuizAdvanceSeconds(QUIZ_AUTO_ADVANCE_SECONDS);

    // Appended with an updater so a repeated trigger can never drop an answer.
    setQuizAnswers((current) => [
      ...current,
      {
        questionId: currentQuiz.id,
        question: currentQuiz.question,
        quizType: quizTypeOf(currentQuiz),
        points: earnedPoints,
        maxPoints: pointsForQuizType(quizTypeOf(currentQuiz)),
        answer: getQuizUserAnswer(currentQuiz),
        correct,
      },
    ]);
  }, [
    currentQuiz,
    evaluateQuizAnswer,
    getQuizUserAnswer,
    isQuizAnswerReady,
    showQuizFeedback,
  ]);

  /*
   * AUTOMATIC ANSWER CHECK
   *
   * The learner never has to tap "Check Answer": as soon as an answer is
   * picked the button turns into a countdown and the answer is checked when
   * the countdown ends. Changing the answer restarts the countdown.
   */
  useEffect(() => {
    const isWaitingToCheck =
      stage === STAGES.QUIZ &&
      !showQuizFeedback &&
      isQuizAnswerReady(currentQuiz);

    if (!isWaitingToCheck) {
      return undefined;
    }

    // Only ticks the countdown shown on the button.
    const countdownTimer = setInterval(() => {
      setQuizCheckSeconds((value) =>
        value === null ? null : Math.max(value - 1, 0)
      );
    }, 1000);

    const checkTimer = setTimeout(() => {
      checkQuizAnswer();
    }, QUIZ_AUTO_CHECK_MS);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(checkTimer);
    };
  }, [
    checkQuizAnswer,
    currentQuiz,
    isQuizAnswerReady,
    showQuizFeedback,
    stage,
  ]);

  /*
   * Clears the question that was just answered and opens the next one.
   * The "Next Question" button and the automatic advance timer both use it,
   * so a question always resets exactly the same way.
   */
  const goToNextQuizQuestion = useCallback(() => {
    setShowQuizFeedback(false);
    setSelectedAnswer(null);
    setQuizInput('');
    setSentenceWords([]);
    setIsQuizCorrect(false);
    setQuizCheckSeconds(null);
    setQuizIndex((value) => value + 1);
  }, []);

  /*
   * AUTOMATIC QUIZ ADVANCE
   *
   * Once an answer is checked, the revealed answer stays on screen for
   * QUIZ_AUTO_ADVANCE_MS and then the next question opens on its own, so the
   * learner does not have to tap "Next Question" again. The last question is
   * left to the learner because it finishes the sublesson and awards the
   * score.
   */
  useEffect(() => {
    const isShowingAnswer =
      stage === STAGES.QUIZ &&
      showQuizFeedback &&
      quizIndex < quizItems.length - 1;

    if (!isShowingAnswer) {
      return undefined;
    }

    // Only ticks the countdown shown next to the button.
    const countdownTimer = setInterval(() => {
      setQuizAdvanceSeconds((value) =>
        value === null ? null : Math.max(value - 1, 0)
      );
    }, 1000);

    const advanceTimer = setTimeout(() => {
      goToNextQuizQuestion();
    }, QUIZ_AUTO_ADVANCE_MS);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(advanceTimer);
    };
  }, [
    goToNextQuizQuestion,
    quizIndex,
    quizItems.length,
    showQuizFeedback,
    stage,
  ]);

  /*
   * SAFETY
   */

  if (!topic || !subLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>
            Lesson data not found.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace('/home')
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>
            Complete the previous lesson to unlock
            this one.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace({
                pathname: '/lesson',
                params: {
                  country: countryName,
                  module: moduleId,
                },
              })
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * CURRENT ITEMS
   */

  const currentLearnItem =
    learningItems[learnIndex];

  const currentPracticeItem =
    practiceItems[practiceIndex];

  /*
   * Plain function (NOT useCallback): it sits after the early returns for
   * !topic / isLocked above, and any hook call here changes the hook count
   * between renders -> "Rendered more hooks than during the previous render".
   */
  const resetLearnTry = () => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    // If the learner tapped Next mid-take, the recorder would otherwise keep
    // running orphaned in the background holding the mic.
    if (learnTryRecording) {
      try {
        const maybePromise = audioRecorder.stop();
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
      } catch (_e) {
        // ignore clean up error — recorder may be idle already
      }
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    }
    setLearnTryRecording(false);
    setLearnTryAnalyzing(false);
    setLearnTryTranscript('');
    setLearnTryScore(null);
    setLearnTryWords({ matched: [], missed: [] });
    setLearnTryError(null);
  };

  /*
 * SPEECH
 *
 * Every Listen button goes through the voice queue, which guarantees one
 * utterance at a time and the learner's chosen speed. Repeated taps on the same
 * line restart it instead of stacking up copies.
 */
  const speak = (text, options = {}) => {
    if (!text) return;

    speakQueued(text, {
      language: FRENCH_LOCALE,
      rate: SPEECH_RATES[speechRateKey] ?? SPEECH_RATES.normal,
      // A tap plays now: it cuts off the older line, and tapping the line
      // that is playing replays it from the start.
      cutIn: true,
      ...options,
    });
  };

  /*
   * LEARN
   */

  const nextLearn = () => {
    resetLearnTry();
    if (
      learnIndex <
      learningItems.length - 1
    ) {
      // The next card opens behind the voice loader too, so its sentence can
      // never flash on screen before the voice reaches it.
      setLearnVoicePhase('loading');

      setLearnIndex(
        (value) => value + 1
      );

      return;
    }

    if (speakingContent) {
      setSpeakingTranscript('');
      setSpeakingAccuracy(null);
      setStage(STAGES.SPEAKING);
    } else {
      startQuiz();
    }
  };

  /*
   * PRACTICE
   */

  const handlePracticeAnswer = (answer) => {
    if (practiceFeedback) return;

    setPracticeSelectedAnswer(answer);
  };

  const checkPracticeAnswer = () => {
    if (!currentPracticeItem) return;

    if (
      currentPracticeItem.answer !== undefined
    ) {
      if (!practiceSelectedAnswer) {
        Alert.alert(
          'Choose an answer',
          'Select an answer before continuing.'
        );

        return;
      }

      const correct =
        normalizeQuizAnswer(
          practiceSelectedAnswer
        ) ===
        normalizeQuizAnswer(
          currentPracticeItem.answer
        );

      setPracticeCorrect(correct);
      setPracticeFeedback(true);

      if (correct) sounds.correct();
      else sounds.wrong();

      return;
    }

    setPracticeCorrect(true);
    setPracticeFeedback(true);
    sounds.correct();
  };

  const nextPractice = async () => {
    const score =
      currentPracticeItem?.answer !== undefined
        ? practiceCorrect
          ? 100
          : 0
        : 100;

    const nextScores = [
      ...practiceItemScores,
      {
        itemId:
          currentPracticeItem?.id ??
          `practice-${practiceIndex}`,
        score,
      },
    ];

    setPracticeItemScores(nextScores);
    setPracticeSelectedAnswer(null);
    setPracticeFeedback(false);
    setPracticeCorrect(false);

    if (
      practiceIndex <
      practiceItems.length - 1
    ) {
      setPracticeIndex(
        (value) => value + 1
      );

      return;
    }

    const validScores = nextScores
      .map((item) => item.score)
      .filter(
        (value) =>
          typeof value === 'number' &&
          !Number.isNaN(value)
      );

    const averageScore = validScores.length
      ? Math.round(
          validScores.reduce(
            (total, value) =>
              total + value,
            0
          ) / validScores.length
        )
      : 0;

    setPracticeScore(averageScore);

    try {
      await saveSubLessonPracticeScore(
        countryName,
        topic.id,
        subLesson.id,
        averageScore,
        nextScores
      );
    } catch (error) {
      console.log(
        'Failed saving practice score:',
        error
      );
    }

    if (speakingContent) {
      setSpeakingTranscript('');
      setSpeakingAccuracy(null);
      setStage(STAGES.SPEAKING);
    } else {
      startQuiz();
    }
  };

  /*
   * START QUIZ
   */

  const startQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizInput('');
    setSentenceWords([]);
    setShowQuizFeedback(false);
    setQuizAdvanceSeconds(null);
    setQuizCheckSeconds(null);
    setQuizAnswers([]);
    setIsQuizCorrect(false);

    setStage(STAGES.QUIZ);
  };

  /*
   * TIER 1 — Learn Try (ungraded).
   *
   * Same record -> transcribe -> scorePronunciation pipeline as the graded
   * Speaking stage, but deliberately lightweight:
   *   - 1s minimum (single words like 'ami' take < 3s),
   *   - local deterministic score only, never the Groq LLM refine,
   *   - nothing persisted, nothing queued, Next never blocked.
   * The TTS engine is stopped first so the model voice does not bleed
   * into the recording. Takes the target explicitly so the 20s auto-stop
   * timer (fired from startLearnTry's closure) always scores the card
   * the recording started on, even if the learner tapped Next mid-take.
   */
   const startLearnTry = async () => {
    if (learnTryRecording || learnTryAnalyzing) return;
    if (isRecordingUI || isAnalyzing) return;

    const { target: startedTarget } = learnTryTargetForItem(currentLearnItem);

    if (!startedTarget) return;
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Microphone access is needed to practice pronunciation.'
        );
        return;
      }

      // The model voice must not run over the learner recording themselves.
      stopAllSpeech();

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      // eslint-disable-next-line react-hooks/purity -- recording timestamps are read in this Learn-Try tap handler, never during render.
      recordingStartTimeRef.current = Date.now();
      setLearnTryRecording(true);
      setLearnTryAnalyzing(false);
      setLearnTryTranscript('');
      setLearnTryScore(null);
      setLearnTryWords({ matched: [], missed: [] });
      setLearnTryError(null);

      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = setTimeout(() => {
        stopLearnTryAndScore(startedTarget);
      }, 20000);
    } catch (error) {
      console.log('Failed to start Learn Try recording:', error);
      Alert.alert('Recording error', 'Unable to start recording.');
    }
  };

  const stopLearnTryAndScore = async (explicitTarget) => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    const durationSeconds =
      (Date.now() - (recordingStartTimeRef.current ?? Date.now())) / 1000;

    setLearnTryRecording(false);

    // Single words are spoken in ~1s; the graded stage needs 3s, Try does not.
    if (durationSeconds < 1) {
      try {
        await audioRecorder.stop();
      } catch (_e) {
        // ignore clean up error
      }
      setLearnTryError('Too short — hold the button, say the word, then stop.');
      return;
    }

    const { target: currentTarget } = learnTryTargetForItem(currentLearnItem);
    const tryTarget = explicitTarget ?? currentTarget;

    if (!tryTarget) return;

    setLearnTryAnalyzing(true);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) throw new Error('Recording failed. No audio file was created.');

      const transcription = await transcribeClip({
        audioUri: uri,
        targetPhrase: tryTarget,
      });

      const transcript = transcription.text ?? '';
      setLearnTryTranscript(transcript);

      if (!transcript) {
        // Practice only: an empty transcript scores 0 locally and is simply
        // shown — never persisted, never queued for deferred grading.
        setLearnTryScore(0);
        setLearnTryWords({ matched: [], missed: [] });
        setLearnTryError('Could not hear you — try again, a little louder.');
        return;
      }

      const graded = scoreForTarget(tryTarget, transcript);
      setLearnTryScore(graded.score);
      setLearnTryWords({
        matched: graded.matchedWords ?? [],
        missed: graded.missedWords ?? [],
      });
    } catch (error) {
      console.log('Learn Try analysis error:', error);
      setLearnTryError(error?.message ?? 'Unable to analyze pronunciation.');
    } finally {
      setLearnTryAnalyzing(false);
      try {
        await setAudioModeAsync({ allowsRecording: false });
      } catch (_e) {
        // ignore mode restore error
      }
    }
  };

  /*
   * SPEAKING LOGIC WITH DURATION LIMITS & LLM NORMALIZATION
   */

  const startRecording = async () => {
    if (learnTryRecording || learnTryAnalyzing) return;

    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Microphone access is needed to practice pronunciation.'
        );

        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();

      audioRecorder.record();
      sounds.listen();

      // eslint-disable-next-line react-hooks/purity -- recording timestamps are read in this tap handler, never during render.
      recordingStartTimeRef.current = Date.now();
      setIsRecordingUI(true);
      setSpeakingTranscript('');
      setSpeakingAccuracy(null);
      setSpeakingDeferred(false);

      // Set max duration threshold (20 seconds auto-stop)
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = setTimeout(() => {
        stopRecordingAndRate();
      }, 20000);
    } catch (error) {
      console.log(
        'Failed to start recording:',
        error
      );

      Alert.alert(
        'Recording error',
        'Unable to start recording.'
      );
    }
  };

  const stopRecordingAndRate = async () => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    // eslint-disable-next-line react-hooks/purity -- duration math runs in the stop-recording tap handler, never during render.
    const durationSeconds = (Date.now() - (recordingStartTimeRef.current ?? Date.now())) / 1000;

    setIsRecordingUI(false);

    // Validate minimum duration (3 seconds)
    if (durationSeconds < 3) {
      try {
        await audioRecorder.stop();
      } catch (_e) {
        // ignore clean up error
      }
      Alert.alert(
        'Recording Too Short',
        'Please speak for at least 3 seconds so we can accurately rate your pronunciation.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('transcribing');

    try {
      await audioRecorder.stop();

      const uri = audioRecorder.uri;

      if (!uri) {
        throw new Error(
          'Recording failed. No audio file was created.'
        );
      }

      const targetPhrase = speakingContent?.target ?? '';

      /*
       * Transcribe with the offline-first ladder: Groq Whisper when online,
       * then the OS on-device recognizer, then on-device Whisper. This is what
       * lets the speaking check work with no connection at all.
       */
      const transcription = await transcribeClip({
        audioUri: uri,
        targetPhrase,
      });

      /*
       * Offline AND no on-device engine could read the clip. Rather than score
       * it zero and punish the learner for having no signal, keep the recording
       * and let the sync engine grade it once we are back online.
       */
      if (!transcription.text && transcription.engine === 'deferred') {
        speakingAttemptSeqRef.current += 1;
        const idempotencyKey = `${subLesson.id}-${speakingAttemptSeqRef.current}`;
        const durableUri = await persistClipForDeferred(uri, idempotencyKey);

        if (durableUri) {
          await enqueueSpeakingAttempt({
            contentKey: subLesson.id,
            moduleKey: moduleId,
            targetPhrase,
            audioFileUri: durableUri,
            localScore: 0,
            idempotencyKey,
            createdAt: new Date().toISOString(),
          });

          setSpeakingDeferred(true);

          Alert.alert(
            'Saved for later',
            "You're offline and this device can't score speech without a connection. Your recording was saved and will be graded automatically once you're back online."
          );
          return;
        }
      }

      const transcript = transcription.text ?? '';
      setSpeakingTranscript(transcript);

      if (!transcript) {
        // Nothing recognizable was heard. It still counts as an attempt so the
        // statistics stay honest, but it can never lower a stored best score.
        setSpeakingAccuracy(0);
        await recordSpeakingAttempt(0);
        return;
      }

      setAnalysisStep('scoring');

      /*
       * FAST RESULT: a deterministic local score is shown immediately, so the
       * learner sees a percentage without waiting for the network round trip
       * below. The LLM then refines it (it also understands digit vs written
       * number matches, e.g. "5" vs "cinq"). Same scorer as the Learn Try
       * tier, so practice and grading never disagree.
       */
      const provisional = scoreForTarget(targetPhrase, transcript);
      const provisionalScore = provisional.score;

      setSpeakingAccuracy(provisionalScore);

      // A perfect local match cannot be improved by the LLM, so skip it.
      if (provisionalScore >= 100) {
        await recordSpeakingAttempt(provisionalScore);
        return;
      }

      let calculatedScore = null;

      const apiKey =
        process.env.EXPO_PUBLIC_GROQ_API_KEY ??
        process.env.GROQ_API_KEY;

      /*
       * ONLINE REFINEMENT: the LLM understands digit-vs-word matches ("5" vs
       * "cinq") and can lift a near miss, but it is optional. Offline (or with
       * no key) the deterministic local score above is already final.
       */
      if (apiKey) {
      try {
        const rateResponse = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a French pronunciation grader. Compare the target phrase with the transcript and return JSON with key "score" (0-100). Automatically treat numerical digits (e.g., 5) and written numbers (e.g., cinq) as identical matches.',
                },
                {
                  role: 'user',
                  content: `Target phrase: "${targetPhrase}"\nStudent transcript: "${transcript}"`,
                },
              ],
              temperature: 0,
              response_format: {
                type: 'json_object',
              },
            }),
          }
        );

        const rateData = await rateResponse.json();
        const content = rateData?.choices?.[0]?.message?.content;

        if (rateResponse.ok && content) {
          const cleanContent = content
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

          const parsed = JSON.parse(cleanContent);

          if (typeof parsed.score === 'number') {
            calculatedScore = parsed.score;
          }
        }
      } catch (error) {
        // console.warn('LLM scoring failed:', error);
        console.warn('Automatic scoring is unavailable right now. Your basic score was used instead.');
      }
      }

      if (calculatedScore === null || Number.isNaN(calculatedScore)) {
        calculatedScore = scoreForTarget(targetPhrase, transcript).score;
      }

      const finalScore = Math.min(
        100,
        Math.max(0, Math.round(calculatedScore))
      );

      setSpeakingAccuracy(finalScore);
      await recordSpeakingAttempt(finalScore);
    } catch (error) {
      console.log('Speech analysis error:', error);

      Alert.alert(
        'Analysis Error',
        error?.message ?? 'Unable to analyze pronunciation.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(null);
    }
  };

  /*
   * Persist one graded pronunciation attempt as soon as it is graded.
   *
   * The speaking store keeps the best score and accumulates the attempts, and it
   * is what the end-of-topic result screen and the backend topic payload read.
   * Recording it here — instead of only when the learner presses Continue — means
   * a back-press, a crash or a mid-lesson quit can no longer throw the speaking
   * score away and leave the result screen showing 0%.
   */
  const recordSpeakingAttempt = async (score) => {
    setSpeakingAttemptCount((count) => count + 1);

    // Pronunciation feedback: celebrate a solid pass, encourage a retry.
    if (typeof score === 'number') {
      if (score >= SPEAKING_THRESHOLD) sounds.great();
      else sounds.wrong();
    }

    try {
      await saveSubLessonSpeakingScore(
        countryName,
        topic.id,
        subLesson.id,
        {
          score,
          attempts: 1,
          passed: score >= SPEAKING_THRESHOLD,
        }
      );
    } catch (error) {
      console.log('Failed saving speaking score:', error);
    }
  };

  const continueFromSpeaking = () => {
    /*
     * For a speaking sub-lesson the speaking check stands in for the practice
     * stage, so its score is what the overall average below blends in. The score
     * itself already lives in the speaking store (see recordSpeakingAttempt):
     * writing it into the practice record as well would hide the real
     * practice-stage average and leave the quiz / speaking split empty for the
     * end-of-topic result screen.
     */
    const practiceScoreValue =
      typeof speakingAccuracy === 'number' ? speakingAccuracy : 0;

    setPracticeScore(practiceScoreValue);

    startQuiz();
  };

  /*
   * QUIZ ANSWER HANDLING
   */

  const selectAnswer = (answer) => {
    if (showQuizFeedback) return;

    setSelectedAnswer(answer);
    sounds.tap();

    // Changing the answer restarts the automatic check countdown.
    setQuizCheckSeconds(QUIZ_AUTO_CHECK_SECONDS);
  };

  const addSentenceWord = (word) => {
    if (showQuizFeedback) return;

    setSentenceWords((current) => [...current, word]);
    sounds.pop();

    setQuizCheckSeconds(QUIZ_AUTO_CHECK_SECONDS);
  };

  const removeSentenceWord = (index) => {
    if (showQuizFeedback) return;

    setSentenceWords((current) =>
      current.filter((_, i) => i !== index)
    );
    sounds.tap();

    setQuizCheckSeconds(QUIZ_AUTO_CHECK_SECONDS);
  };

  const handleQuizAction = async () => {
    if (!currentQuiz) return;

    if (!showQuizFeedback) {
      if (!isQuizAnswerReady(currentQuiz)) {
        Alert.alert(
          'Answer required',
          'Complete the question before continuing.'
        );
        return;
      }

      // Same check the automatic countdown performs, just without the wait.
      checkQuizAnswer();
      return;
    }

    if (quizIndex < quizItems.length - 1) {
      goToNextQuizQuestion();
      return;
    }

    // --- NEW LOGIC: Calculate points-based quiz score before completing ---
    const completedQuizScore = quizAnswers.filter(
      (answer) => answer.correct
    ).length;

    const completedQuizPoints = quizAnswers.reduce(
      (total, answer) => total + (answer.points ?? (answer.correct ? 10 : 0)),
      0
    );
    const completedQuizMaxPoints = quizItems.reduce(
      (total, item) => total + pointsForQuizType(quizTypeOf(item)),
      0
    );

    const breakdown = quizItems.map((item, itemIndex) => {
      const recorded = quizAnswers[itemIndex];
      const maxPoints = pointsForQuizType(quizTypeOf(item));
      return {
        questionId: item.id,
        question: item.question,
        quizType: quizTypeOf(item),
        points: recorded?.points ?? 0,
        maxPoints,
        correct: recorded?.correct ?? false,
      };
    });

    setResultQuizScore(completedQuizScore);
    setResultQuizPoints(completedQuizPoints);
    setResultQuizMaxPoints(completedQuizMaxPoints);
    setResultQuizBreakdown(breakdown);

    const quizPercentage = completedQuizMaxPoints > 0
      ? Math.round((completedQuizPoints / completedQuizMaxPoints) * 100)
      : 0;

    /*
     * What the server grades. Stars and XP are paid from the quiz answers,
     * graded again on the server against its own answer key, so the device
     * only sends what the learner picked. The pronunciation score is graded
     * on the device and cannot be checked there, so it never pays: the offline
     * estimate below uses the same quiz-only rule (see
     * Backend/docs/SUBLESSON_GRADING.md).
     */
    const submittedAnswers = {};
    quizAnswers.forEach((recorded) => {
      if (recorded?.questionId === undefined || recorded?.questionId === null) return;
      submittedAnswers[String(recorded.questionId)] = Array.isArray(recorded.answer)
        ? recorded.answer.map(String)
        : String(recorded.answer ?? '');
    });
    const rewardScore = quizPercentage;
    const rewardStars = starsForScore(rewardScore);
    const speakingScoreForSync =
      speakingContent && typeof practiceScore === 'number' ? practiceScore : undefined;

    const scoresToAverage = [quizPercentage];

    // Practice is the speaking exercise, so its score is already included
    // via practiceScore (do not add speakingAccuracy twice).
    if (speakingContent) {
      scoresToAverage.push(practiceScore);
    }

    const overallScore = scoresToAverage.length
      ? Math.round(
          scoresToAverage.reduce((total, value) => total + value, 0) /
            scoresToAverage.length
        )
      : 0;

    /*
     * Persist the quiz / speaking split for the end-of-topic result screen.
     *
     * The quiz percentage belongs to the quiz and the pronunciation score to the
     * speaking store (already written when it was graded); the practice record
     * keeps its own stage average. All of it is stored best-ever, so replaying
     * the sub-lesson and scoring worse cannot lower the topic statistics.
     */
    try {
      await saveSubLessonResultStats(countryName, topic.id, subLesson.id, {
        quizScore: quizPercentage,
        speakingScore: speakingContent ? practiceScore : 0,
        speakingAttempts: speakingAttemptCount,
      });
    } catch (statsError) {
      console.log('Failed saving sub-lesson result statistics:', statsError);
    }

    /*
     * Daily challenge tracking.
     *
     * Stars come from the shared bands in services/scoring.js — the same
     * 90/75/50 bands the server applies — and a sub-lesson that was already
     * completed before this run counts as a replay (see the "Memory Refresh"
     * challenge).
     */
    const challengeStars = starsForScore(overallScore);

    let isSubLessonCompletedToday = false;
    // Best score BEFORE this attempt: lifting a lesson from under 80% to 80%+
    // is what the "weak spot" challenges reward.
    let previousBestScore = null;

    try {
      const storedProgress = await loadLessonProgress();
      const completedIds = Array.isArray(storedProgress?.[countryName]?.[topic.id])
        ? storedProgress[countryName][topic.id]
        : [];
      isSubLessonCompletedToday = completedIds.includes(subLesson.id);
      previousBestScore = getSubLessonBestScore(subLesson.id);
      // Remember every attempt, failed ones too, so a later 80%+ on a lesson
      // first failed here counts as fixing a weak spot.
      noteSubLessonAttemptScore(subLesson.id, overallScore);
    } catch (progressError) {
      console.log('Failed to read stored progress for challenges:', progressError);
    }
    const improvedWeakSpot =
      previousBestScore !== null &&
      previousBestScore < MISSION_PASS_PERCENTAGE &&
      overallScore >= MISSION_PASS_PERCENTAGE;

    // The result screen must show the score that was actually graded, never a
    // freshly recomputed one.
    setResultOverallScore(overallScore);

    // Celebration matched to performance: full fanfare for a pass,
    // gentle tone when the learner should retry.
    if (isPassingScore(overallScore)) {
      if (overallScore >= 90) sounds.levelup();
      else sounds.complete();
    } else {
      sounds.wrong();
    }

    // A sub-lesson is complete from 50% up. Below that nothing is marked
    // complete and no reward is claimed.
    if (isPassingScore(overallScore)) {
      try {
        await completeSubLesson(countryName, topic.id, subLesson.id, overallScore);

        // Local, offline-safe and never allowed to block the lesson flow.
        recordSubLessonCompletion({
          country: countryName,
          moduleId,
          topicId: topic.id,
          subLessonId: subLesson.id,
          score: overallScore,
          quizScore: quizPercentage,
          speakingScore: speakingContent ? practiceScore : null,
          stars: challengeStars,
          xp: sublessonXpForScore(overallScore),
          replay: isSubLessonCompletedToday,
          improved: improvedWeakSpot,
        }).catch((challengeError) => {
          console.log('Failed to update challenge progress:', challengeError);
        });

        try {
          const res = await authenticatedRequest('/progress/content', {
            method: 'PUT',
            body: JSON.stringify({
              contentKey: subLesson.id,
              contentType: 'sublesson',
              moduleKey: moduleId,
              answers: submittedAnswers,
              speakingScore: speakingScoreForSync,
            }),
          });

          /*
           * The server owns the reward, so the screen defers to it: `stars` and
           * `xpAwarded` are the stored bests for this sub-lesson, while
           * `lastXpAwarded` is what this run actually paid. A replay therefore
           * reports 0 XP instead of presenting an old reward as a new one.
           */
          if (res && res.data) {
            const earnedThisRun = Number(res.data.lastXpAwarded ?? 0);

            setServerStars(Number(res.data.stars ?? rewardStars));
            setServerXpAwarded(earnedThisRun);
            setServerXpTotal(Number(res.data.xpAwarded ?? earnedThisRun));
          }
        } catch (syncError) {
          /*
           * Offline: estimate with the same quiz-only rule and shared bands
           * the server uses, and queue the answers so the server grades them
           * and settles the real amount — possibly 0 XP for a replay — the
           * next time it can be reached.
           */
          setServerStars(rewardStars);
          setServerXpAwarded(sublessonXpForScore(rewardScore));
          setServerXpTotal(sublessonXpForScore(rewardScore));

          await enqueueContentProgress({
            contentKey: subLesson.id,
            contentType: 'sublesson',
            moduleKey: moduleId,
            answers: submittedAnswers,
            localScore: rewardScore,
            speakingScore: speakingScoreForSync,
          });
          // console.warn('Sublesson progress queued for synchronization.', syncError);
          console.warn('Your progress is saved on this device and will sync when you are back online.');
        }
      } catch (error) {
        console.log('Error synchronizing sublesson completion:', error);
      }
    }

    setStage(STAGES.RESULT);
  };

  /*
   * RESTART
   */
  const restartLesson = () => {
    setStage(STAGES.LEARN);

    setLearnIndex(0);
    setPracticeIndex(0);

    // A fresh run starts on a card whose text waits for the voice again.
    setLearnVoicePhase('loading');
    setQuizIndex(0);
    setQuizAdvanceSeconds(null);
    setQuizCheckSeconds(null);

    setPracticeItemScores([]);
    setPracticeScore(0);

    setPracticeSelectedAnswer(null);
    setPracticeFeedback(false);
    setPracticeCorrect(false);

    setSpeakingTranscript('');
    setSpeakingAccuracy(null);
    setSpeakingDeferred(false);
    setAnalysisStep(null);
    setIsAnalyzing(false);
    setIsRecordingUI(false);
    resetLearnTry();

    setQuizAnswers([]);
    setResultQuizScore(0);
    setResultQuizPoints(0);
    setResultQuizMaxPoints(0);
    setResultQuizBreakdown([]);

    // A fresh run starts from an empty reward slate: the next result screen
    // must only ever show what the new run earns.
    setServerStars(0);
    setServerXpAwarded(0);
    setServerXpTotal(0);
    setResultOverallScore(null);
    setSpeakingAttemptCount(0);

    setSelectedAnswer(null);  
    setQuizInput('');
    setSentenceWords([]);

    setShowQuizFeedback(false);
    setIsQuizCorrect(false);

    setServerStars(0);
    setServerXpAwarded(0);
  };

  /*
   * RETURN TO LESSON LIST
   */
  /*
   * HANDLE NAVIGATION AFTER LESSON COMPLETION
   */
  const handleContinueSubLesson = () => {
    const totalSubLessons = topic?.subLessons?.length ?? 0;
    const hasNextSubLesson = lessonIndex < totalSubLessons - 1;

    // Check if there are more sublessons in the CURRENT topic
    if (hasNextSubLesson) {
      router.replace({
        pathname: '/sublesson',
        params: {
          country: countryName,
          module: moduleId,
          topicId: topicKey,
          subLessonIndex: String(lessonIndex + 1),
        },
      });
      return;
    }

    // Check if there are more topics in the module
    const currentTopicIndex = topics.findIndex((item) => item.id === topicKey);
    const hasNextTopic = currentTopicIndex !== -1 && currentTopicIndex < topics.length - 1;

    if (hasNextTopic) {
      // Instead of jumping into the next topic's sublesson, return to the lesson menu
      router.replace({
        pathname: '/lesson',
        params: {
          country: countryName,
          module: moduleId,
        },
      });
    } else {
      // LAST SUBLESSON OF THE LAST SUBTOPIC -> Navigate to the final Topic/Module Quiz
      router.replace({
        pathname: '/quiz',
        params: {
          module: moduleId,
        },
      });
    }
  };

  /*
   * BACK TO LESSON
   *
   * Always navigates to the lesson menu of the current module explicitly.
   * A plain router.back() is not used because sublesson screens replace each
   * other in the navigation stack, so going back would not reliably land on
   * the lesson screen.
   */
  const goBackToLesson = () => {
    stopAllSpeech();

    router.replace({
      pathname: '/lesson',
      params: {
        country: countryName,
        module: moduleId,
      },
    });
  };

  /*
   * READINESS GATE + LOADER
   *
   * Everything the sublesson needs — learn / practice / speaking / quiz data —
   * is resolved synchronously from the local catalog before the first paint,
   * and the text-to-speech engine is warmed up by the effect above. This
   * loader covers that warm up so the screen never opens into silence: the
   * lesson appears only once the voice is ready to speak, and the first
   * sentence then plays immediately. The warm up effect guarantees the flag
   * flips within VOICE_READY_TIMEOUT_MS even if the engine is missing.
   */
  if (!isVoiceReady || !progressReady) {
    return (
      <SafeAreaView style={styles.voiceLoadingContainer}>
        <ActivityIndicator size="large" color="#1577D4" />

        <Text style={styles.voiceLoadingTitle}>
          Getting your lesson ready…
        </Text>

        <View style={styles.voiceLoadingSteps}>
          <View style={styles.voiceLoadingStepRow}>
            <View style={styles.voiceLoadingStepIcon}>
              <Text style={styles.voiceLoadingStepCheck}>✓</Text>
            </View>

            <Text style={styles.voiceLoadingStepText}>
              Lesson data loaded
            </Text>
          </View>

          <View style={styles.voiceLoadingStepRow}>
            <View style={styles.voiceLoadingStepIcon}>
              <ActivityIndicator size="small" color="#1577D4" />
            </View>

            <Text style={styles.voiceLoadingStepText}>
              {warmUpStep === 'warming'
                ? 'Warming up the French voice…'
                : 'Finding the French voice…'}
            </Text>
          </View>
        </View>

        <Text style={styles.voiceLoadingText}>
          The first sentence plays as soon as the lesson opens.
        </Text>
      </SafeAreaView>
    );
  }

  /*
   * RENDER
   */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={goBackToLesson}
            style={({ pressed }) => [
              styles.backIconButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.stage}>
            {countryName} • {topic.title}
          </Text>
        </View>

        <Text style={styles.title}>{subLesson.title}</Text>

        <View style={styles.stageContainer}>
          <StageItem
            number="1"
            title="Learn"
            active={stage === STAGES.LEARN}
            completed={stage !== STAGES.LEARN}
          />

          <StageItem
            number="2"
            title="Practice"
            active={
              stage === STAGES.PRACTICE ||
              stage === STAGES.SPEAKING
            }
            completed={[
              STAGES.QUIZ,
              STAGES.RESULT,
            ].includes(stage)}
          />

          <StageItem
            number="3"
            title="Quiz"
            active={stage === STAGES.QUIZ}
            completed={stage === STAGES.RESULT}
          />

          <StageItem
            number="4"
            title="Result"
            active={stage === STAGES.RESULT}
            completed={stage === STAGES.RESULT}
          />
        </View>

        {stage === STAGES.LEARN && (
          <LearnStage
            item={currentLearnItem}
            index={learnIndex}
            total={learningItems.length}
            speak={speak}
            hasGrammar={!!grammar}
            voicePhase={learnVoicePhase}
            onOpenGrammar={() => setShowGrammar(true)}
            onNext={nextLearn}
            tryTarget={learnTryTargetForItem(currentLearnItem).target}
            tryIsFallback={learnTryTargetForItem(currentLearnItem).isFallback}
            tryRecording={learnTryRecording}
            tryAnalyzing={learnTryAnalyzing}
            tryTranscript={learnTryTranscript}
            tryScore={learnTryScore}
            tryWords={learnTryWords}
            tryError={learnTryError}
            onTryStart={startLearnTry}
            onTryStop={stopLearnTryAndScore}
            onTryReset={resetLearnTry}
          />
        )}

        {stage === STAGES.SPEAKING && (
          <SpeakingStage
            speaking={speakingContent}
            isRecording={isRecordingUI}
            isAnalyzing={isAnalyzing}
            analysisStep={analysisStep}
            transcript={speakingTranscript}
            accuracy={speakingAccuracy}
            deferred={speakingDeferred}
            speak={speak}
            onStart={startRecording}
            onStop={stopRecordingAndRate}
            onContinue={continueFromSpeaking}
          />
        )}

        {stage === STAGES.QUIZ && (
          <QuizStage
            quiz={currentQuiz}
            index={quizIndex}
            total={quizItems.length}
            selectedAnswer={selectedAnswer}
            quizInput={quizInput}
            sentenceWords={sentenceWords}
            showFeedback={showQuizFeedback}
            isCorrect={isQuizCorrect}
            onSelect={selectAnswer}
            onInput={setQuizInput}
            onAddWord={addSentenceWord}
            onRemoveWord={removeSentenceWord}
            onSubmit={handleQuizAction}
            earnedPoints={
              showQuizFeedback
                ? quizAnswers[quizIndex]?.points ?? 0
                : 0
            }
            maxPoints={pointsForQuizType(quizTypeOf(currentQuiz))}
            autoAdvanceSeconds={quizAdvanceSeconds}
            autoCheckSeconds={
              quizCheckSeconds ?? QUIZ_AUTO_CHECK_SECONDS
            }
            speak={speak}
          />
        )}

        {stage === STAGES.RESULT && (
          <ResultStage
            quizScore={resultQuizScore}
            quizTotal={quizItems.length}
            quizPoints={resultQuizPoints}
            quizMaxPoints={resultQuizMaxPoints}
            quizBreakdown={resultQuizBreakdown}
            practiceScore={practiceScore}
            // A speaking sub-lesson is graded by the speech check, so the card
            // must say what the number really measures.
            practiceLabel={speakingContent ? 'Speaking' : 'Practice'}
            storedOverallScore={resultOverallScore}
            stars={serverStars}
            xpAwarded={serverXpAwarded}
            xpTotal={serverXpTotal}
            onRestart={restartLesson}
            onContinue={handleContinueSubLesson}
          />
        )}
      </ScrollView>

      {showGrammar && grammar && (
        <GrammarPanel
          grammar={grammar}
          speak={speak}
          onClose={() => setShowGrammar(false)}
        />
      )}
    </SafeAreaView>
  );
}

/*
 * STAGE ITEM
 */
function StageItem({ number, title, active, completed }) {
  return (
    <View style={styles.stageItem}>
      <View
        style={[
          styles.stageCircle,
          active && styles.stageCircleActive,
          completed && styles.stageCircleCompleted,
        ]}
      >
        <Text
          style={[
            styles.stageCircleText,
            (active || completed) && styles.stageCircleTextActive,
          ]}
        >
          {completed ? '✓' : number}
        </Text>
      </View>

      <Text
        style={[
          styles.stageItemText,
          active && styles.stageItemTextActive,
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

/*
 * LEARN
 */
function LearnStage({
  item,
  index,
  total,
  speak,
  hasGrammar,
  voicePhase = 'idle',
  onOpenGrammar,
  onNext,
  tryTarget = '',
  tryIsFallback = false,
  tryRecording = false,
  tryAnalyzing = false,
  tryTranscript = '',
  tryScore = null,
  tryWords = { matched: [], missed: [] },
  tryError = null,
  onTryStart,
  onTryStop,
  onTryReset,
}) {
  if (!item) {
    return (
      <EmptyStage
        title="Learning content unavailable"
        text="Add learning content for this sublesson."
      />
    );
  }

  /*
   * TEXT <-> VOICE SYNC
   *
   * The French sentence is the line the card speaks, so it stands behind the
   * loader until the voice really starts (see learnVoicePhase). A card whose
   * item has no French line has nothing to wait for, so it always reads.
   */
  const isWaitingForVoice = voicePhase === 'loading' && !!item.french;

  const isVoiceSpeaking = voicePhase === 'speaking';

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>Learn</Text>
        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>

      <Text style={styles.instruction}>
        Listen and learn this French word or expression — the words appear
        with the voice.
      </Text>

      <View style={styles.learningCard}>
        {isWaitingForVoice ? (
          <View style={styles.frenchLoadingBox}>
            <ActivityIndicator size="large" color="#1577D4" />

            <Text style={styles.frenchLoadingText}>
              Preparing the voice for this word…
            </Text>
          </View>
        ) : (
          <Text style={styles.frenchLarge}>{item.french}</Text>
        )}

        <Pressable
          style={styles.soundButton}
          disabled={isWaitingForVoice}
          onPress={() => speak(item.french)}
        >
          <Text style={styles.soundButtonText}>
            {isWaitingForVoice
              ? '⏳ Voice loading…'
              : isVoiceSpeaking
                ? '🔊 Playing…'
                : '🔊 Listen'}
          </Text>
        </Pressable>
        
        {/*
         * TIER 1 — ungraded Try. Same record/transcribe/score pattern as the
         * graded Speaking stage, but practice-only: the score below never
         * gates Next, is never persisted, and is never queued for sync.
         */}
        <View style={styles.tryBox}>
          <Text style={styles.tryTitle}>🎙️ Have a try — practice only</Text>
          <Text style={styles.tryHint}>
            {tryIsFallback
              ? `This letter is too short to score, so try its example word: "${tryTarget}". Doesn't affect your score.`
              : 'Say what you just heard. Practice only — it never blocks Next.'}
          </Text>

          {tryAnalyzing ? (
            <View style={styles.tryAnalyzingRow}>
              <ActivityIndicator size="small" color="#1577D4" />
              <Text style={styles.tryAnalyzingText}>
                Listening and scoring…
              </Text>
            </View>
          ) : (
            <View style={styles.tryButtonRow}>
              <Pressable
                disabled={isWaitingForVoice}
                onPress={
                  tryRecording
                    ? () => onTryStop(tryTarget)
                    : onTryStart
                }
                style={({ pressed }) => [
                  styles.tryButton,
                  tryRecording && styles.tryButtonRecording,
                  (isWaitingForVoice || pressed) && styles.tryButtonPressed,
                ]}
              >
                <Text style={styles.tryButtonText}>
                  {tryRecording ? '⏹ Stop & Check' : '🎙️ Try saying it'}
                </Text>
              </Pressable>

              {(tryTranscript || tryScore !== null) && (
                <Pressable onPress={onTryReset} style={styles.tryRetryButton}>
                  <Text style={styles.tryRetryText}>↻ Retry</Text>
                </Pressable>
              )}
            </View>
          )}

          {tryRecording && (
            <Text style={styles.tryRecordingHint}>
              ● Recording… say “{tryTarget}”, then tap Stop.
            </Text>
          )}

          {!!tryTranscript && (
            <View style={styles.tryResultBox}>
              <Text style={styles.resultLabel}>You said</Text>
              <Text style={styles.transcript}>“{tryTranscript}”</Text>

              {tryScore !== null && (
                <Text
                  style={[
                    styles.tryScore,
                    tryScore >= SPEAKING_THRESHOLD
                      ? styles.scoreGood
                      : styles.scoreNeedsWork,
                  ]}
                >
                  {tryScore}%
                  {tryScore >= SPEAKING_THRESHOLD
                    ? ' — nice, that would pass!'
                    : ' — keep trying, no pressure.'}
                </Text>
              )}

              {(tryWords.matched?.length > 0 ||
                tryWords.missed?.length > 0) && (
                <View style={styles.wordChipsRow}>
                  {tryWords.matched.map((word, wordIndex) => (
                    <View
                      key={`matched-${word}-${wordIndex}`}
                      style={[styles.wordChip, styles.wordChipMatched]}
                    >
                      <Text style={styles.wordChipTextMatched}>{word}</Text>
                    </View>
                  ))}
                  {tryWords.missed.map((word, wordIndex) => (
                    <View
                      key={`missed-${word}-${wordIndex}`}
                      style={[styles.wordChip, styles.wordChipMissed]}
                    >
                      <Text style={styles.wordChipTextMissed}>{word}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {!!tryError && !tryTranscript && (
            <Text style={styles.tryErrorText}>{tryError}</Text>
          )}
          {!!tryError && !!tryTranscript && (
            <Text style={styles.tryErrorSoft}>{tryError}</Text>
          )}
        </View>

        <Text style={styles.englishLarge}>{item.english}</Text>

        {!!item.pronunciation && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Pronunciation</Text>
            <Text style={styles.infoValue}>{item.pronunciation}</Text>
          </View>
        )}

        {!!item.example && (
          <View style={styles.exampleBox}>
            <Text style={styles.infoLabel}>Example</Text>

            <View style={styles.exampleRow}>
              <Text style={styles.exampleFrench}>{item.example}</Text>
              <Pressable onPress={() => speak(item.example)}>
                <Text style={styles.smallSound}>🔊</Text>
              </Pressable>
            </View>

            {!!item.exampleEnglish && (
              <Text style={styles.exampleEnglish}>
                {item.exampleEnglish}
              </Text>
            )}

            {!!item.examplePronunciation && (
              <Text style={styles.examplePronunciation}>
                {item.examplePronunciation}
              </Text>
            )}
          </View>
        )}

        {!!item.usage && (
          <View style={styles.usageBox}>
            <Text style={styles.infoLabel}>Usage</Text>
            <Text style={styles.usageText}>{item.usage}</Text>
          </View>
        )}
      </View>

      <View style={styles.learnActionRow}>
        {hasGrammar && (
          <TouchableOpacity
            style={styles.grammarButton}
            onPress={onOpenGrammar}
          >
            <Text style={styles.grammarButtonText}>
              📘 Grammar
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.learnNextButton}
          onPress={onNext}
        >
          <Text style={styles.primaryButtonText}>
            {index === total - 1 ? 'Continue' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/*
 * PRACTICE
 */
function PracticeStage({
  item,
  index,
  total,
  selectedAnswer,
  showFeedback,
  isCorrect,
  onSelect,
  onCheck,
  onNext,
  speak,
}) {
  if (!item) {
    return (
      <EmptyStage
        title="Practice unavailable"
        text="Add practice content for this sublesson."
      />
    );
  }

  const hasOptions =
    Array.isArray(item.options) && item.options.length > 0;

  const isAnswered =
    item.answer === undefined || !!selectedAnswer;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>Practice</Text>

        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>

      <View style={styles.practiceCard}>
        <Text style={styles.practiceType}>
          {item.type
            ? item.type.replace(/-/g, ' ')
            : 'Practice activity'}
        </Text>

        {!!item.prompt && (
          <Text style={styles.practicePromptText}>{item.prompt}</Text>
        )}

        {!!item.targetSound && (
          <View style={styles.exampleRow}>
            <Text style={styles.practiceTarget}>{item.targetSound}</Text>

            <Pressable
              onPress={() => speak(item.targetSound)}
            >
              <Text style={styles.smallSound}>🔊</Text>
            </Pressable>
          </View>
        )}

        {!!item.targetWord && (
          <View style={styles.exampleRow}>
            <Text style={styles.practiceTarget}>{item.targetWord}</Text>

            <Pressable
              onPress={() => speak(item.targetWord)}
            >
              <Text style={styles.smallSound}>🔊</Text>
            </Pressable>
          </View>
        )}

        {!!item.sequence && (
          <Text style={styles.practiceTarget}>
            {Array.isArray(item.sequence)
              ? item.sequence.join(' ')
              : item.sequence}
          </Text>
        )}

        {hasOptions && (
          <View style={styles.practiceOptions}>
            {item.options.map((option) => {
              const selected = selectedAnswer === option;

              let optionStyle = styles.choiceButton;

              if (showFeedback) {
                if (option === item.answer) {
                  optionStyle = [
                    styles.choiceButton,
                    styles.choiceButtonCorrect,
                  ];
                } else if (selected && !isCorrect) {
                  optionStyle = [
                    styles.choiceButton,
                    styles.choiceButtonIncorrect,
                  ];
                }
              } else if (selected) {
                optionStyle = [
                  styles.choiceButton,
                  styles.choiceButtonSelected,
                ];
              }

              return (
                <Pressable
                  key={option}
                  disabled={showFeedback}
                  onPress={() => onSelect(option)}
                  style={optionStyle}
                >
                  <Text style={styles.choiceText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {showFeedback && (
          <View
            style={[
              styles.feedbackContainer,
              isCorrect
                ? styles.feedbackCorrectBox
                : styles.feedbackIncorrectBox,
            ]}
          >
            <Text
              style={[
                styles.feedbackTitle,
                isCorrect ? styles.scoreGood : styles.scoreNeedsWork,
              ]}
            >
              {isCorrect ? '🎉 Correct!' : '❌ Try again!'}
            </Text>

            {item.answer !== undefined && (
              <Text style={styles.feedbackExplanation}>
                Correct answer: {item.answer}
              </Text>
            )}
          </View>
        )}
      </View>

      {!showFeedback ? (
        <TouchableOpacity
          disabled={!isAnswered}
          style={[
            styles.primaryButton,
            !isAnswered && styles.disabledButton,
          ]}
          onPress={onCheck}
        >
          <Text style={styles.primaryButtonText}>Check</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.primaryButtonText}>
            {index === total - 1 ? 'Continue' : 'Next'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/*
 * SPEAKING
 */
function SpeakingStage({
  speaking,
  isRecording,
  isAnalyzing,
  analysisStep = null,
  transcript,
  accuracy,
  deferred = false,
  speak,
  onStart,
  onStop,
  onContinue,
}) {
  if (!speaking) {
    return (
      <EmptyStage
        title="Speaking content unavailable"
        text="Add speaking content for this sublesson."
      />
    );
  }

  const canContinue = accuracy !== null && accuracy >= 50;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>Practice</Text>
        <Text style={styles.counter}>Speak</Text>
      </View>

      <Text style={styles.instruction}>
        Listen to the sentence, then say it aloud (3s min, 20s max).
      </Text>

      <View style={styles.speakingCard}>
        <Text style={styles.sayLabel}>Say this:</Text>
        <Text style={styles.targetPhrase}>{speaking.target}</Text>

        <Pressable
          style={styles.largeSoundButton}
          onPress={() => speak?.(speaking.target)}
        >
          <Text style={styles.largeSoundText}>🔊 Listen</Text>
        </Pressable>

        {!!speaking.translation && (
          <Text style={styles.translation}>{speaking.translation}</Text>
        )}

        {!!speaking.pronunciation && (
          <Text style={styles.pronunciationText}>
            {speaking.pronunciation}
          </Text>
        )}

        {isAnalyzing ? (
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.analyzingText}>
              {analysisStep === 'scoring'
                ? 'Fine-tuning your score...'
                : 'Transcribing your audio...'}
            </Text>

            {accuracy !== null && (
              <Text style={styles.analyzingSubText}>
                {analysisStep === 'scoring'
                  ? `Provisional score: ${accuracy}% — being refined`
                  : `Provisional score: ${accuracy}%`}
              </Text>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={isRecording ? onStop : onStart}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? '⏹ Stop & Evaluate' : '🎙 Start Speaking'}
            </Text>
          </TouchableOpacity>
        )}

        {!!transcript && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>You said</Text>
            <Text style={styles.transcript}>“{transcript}”</Text>

            {accuracy !== null && (
              <Text
                style={[
                  styles.accuracyScore,
                  accuracy >= 50
                    ? styles.scoreGood
                    : styles.scoreNeedsWork,
                ]}
              >
                {accuracy}%
              </Text>
            )}
          </View>
        )}

        {accuracy !== null && accuracy < 50 && (
          <Text style={styles.trialWarningText}>
            Score at least 50% to continue.
          </Text>
        )}

        {deferred && (
          <Text style={styles.trialWarningText}>
            Saved for later — it will be scored when you are back online.
          </Text>
        )}
      </View>

      {canContinue && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onContinue}
        >
          <Text style={styles.primaryButtonText}>Continue to Quiz</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/*
 * QUIZ
 */
function QuizStage({
  quiz,
  index,
  total,
  selectedAnswer,
  quizInput,
  sentenceWords,
  showFeedback,
  isCorrect,
  onSelect,
  onInput,
  onAddWord,
  onRemoveWord,
  onSubmit,
  earnedPoints = 0,
  maxPoints = 0,
  autoAdvanceSeconds = null,
  autoCheckSeconds = null,
  speak,
}) {
  if (!quiz) {
    return (
      <EmptyStage
        title="Quiz unavailable"
        text="Add quiz content for this sublesson."
      />
    );
  }

  const quizType = quizTypeOf(quiz);
  const questionPoints = pointsForQuizType(quizType);
  const isLastQuestion = index === total - 1;
  const canSubmitAnswer =
    showFeedback ||
    (quizType === QUIZ_TYPES.SENTENCE_BUILDER
      ? sentenceWords.length > 0
      : !!selectedAnswer);

  // An answer is picked and the automatic check is counting down.
  const isWaitingToCheck = !showFeedback && canSubmitAnswer;

  // The answer was revealed and the next question is counting down.
  const isWaitingForNextQuestion = showFeedback && !isLastQuestion;

  const autoCheckCountdown =
    autoCheckSeconds ?? QUIZ_AUTO_CHECK_SECONDS;
  const autoAdvanceCountdown =
    autoAdvanceSeconds ?? QUIZ_AUTO_ADVANCE_SECONDS;

  const isCountingDown =
    isWaitingToCheck || isWaitingForNextQuestion;
  const countdownSeconds = isWaitingToCheck
    ? autoCheckCountdown
    : autoAdvanceCountdown;
  const countdownTotal = isWaitingToCheck
    ? QUIZ_AUTO_CHECK_SECONDS
    : QUIZ_AUTO_ADVANCE_SECONDS;

  const getTypeLabel = () => {
    switch (quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        return 'Multiple Choice';

      case QUIZ_TYPES.TRUE_FALSE:
        return 'True or False';

      case QUIZ_TYPES.SENTENCE_BUILDER:
        return 'Sentence Builder';

      default:
        return 'Quiz';
    }
  };

  const renderMultipleChoice = () => {
    const choices = Array.isArray(quiz.choices) ? quiz.choices : [];

    return (
      <View>
        {choices.map((choice) => {
          const selected = selectedAnswer === choice;
          const correctChoice = choice === quiz.answer;

          let choiceStyle = styles.choiceButton;

          if (showFeedback) {
            if (correctChoice) {
              choiceStyle = [
                styles.choiceButton,
                styles.choiceButtonCorrect,
              ];
            } else if (selected && !isCorrect) {
              choiceStyle = [
                styles.choiceButton,
                styles.choiceButtonIncorrect,
              ];
            }
          } else if (selected) {
            choiceStyle = [
              styles.choiceButton,
              styles.choiceButtonSelected,
            ];
          }

          return (
            <Pressable
              key={choice}
              disabled={showFeedback}
              onPress={() => onSelect(choice)}
              style={choiceStyle}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderTrueFalse = () => {
    const choices = ['True', 'False'];

    return (
      <View>
        {choices.map((choice) => {
          const selected = selectedAnswer === choice;
          const correctChoice = choice === quiz.answer;

          let choiceStyle = styles.choiceButton;

          if (showFeedback) {
            if (correctChoice) {
              choiceStyle = [
                styles.choiceButton,
                styles.choiceButtonCorrect,
              ];
            } else if (selected && !isCorrect) {
              choiceStyle = [
                styles.choiceButton,
                styles.choiceButtonIncorrect,
              ];
            }
          } else if (selected) {
            choiceStyle = [
              styles.choiceButton,
              styles.choiceButtonSelected,
            ];
          }

          return (
            <Pressable
              key={choice}
              disabled={showFeedback}
              onPress={() => onSelect(choice)}
              style={choiceStyle}
            >
              <Text style={styles.choiceText}>
                {choice === 'True' ? '✓ True' : '✕ False'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderListening = () => {
    return (
      <View>
        <Pressable
          style={styles.listenQuizButton}
          onPress={() => speak?.(quiz.audioText ?? quiz.question ?? '')}
        >
          <Text style={styles.listenQuizButtonText}>
            🔊 Play French Audio
          </Text>
        </Pressable>

        {!!quiz.instruction && (
          <Text style={styles.quizInstruction}>{quiz.instruction}</Text>
        )}

        {Array.isArray(quiz.choices) &&
          quiz.choices.length > 0 &&
          renderMultipleChoice()}
      </View>
    );
  };

  const renderFillBlank = () => {
    return (
      <View>
        <TextInput
          value={quizInput}
          onChangeText={onInput}
          editable={!showFeedback}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={quiz.placeholder ?? 'Type your answer...'}
          placeholderTextColor="#98A2B3"
          style={[
            styles.quizInput,
            showFeedback &&
              (isCorrect
                ? styles.inputCorrect
                : styles.inputIncorrect),
          ]}
        />
      </View>
    );
  };

  const renderSentenceBuilder = () => {
    const availableWords = Array.isArray(quiz.words) ? quiz.words : [];

    return (
      <View>
        <Text style={styles.builderLabel}>Your sentence</Text>

        <View style={styles.sentenceAnswerBox}>
          {sentenceWords.length > 0 ? (
            sentenceWords.map((word, wordIndex) => (
              <Pressable
                key={`${word}-${wordIndex}`}
                disabled={showFeedback}
                onPress={() => onRemoveWord(wordIndex)}
                style={styles.selectedWord}
              >
                <Text style={styles.selectedWordText}>{word}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptySentenceText}>
              Tap the words below to build your sentence.
            </Text>
          )}
        </View>

        <Text style={styles.builderLabel}>Available words</Text>

        <View style={styles.wordBank}>
          {availableWords.map((word, wordIndex) => {
            const used = sentenceWords.includes(word);

            return (
              <Pressable
                key={`${word}-${wordIndex}`}
                disabled={used || showFeedback}
                onPress={() => onAddWord(word)}
                style={[
                  styles.wordButton,
                  used && styles.wordButtonUsed,
                ]}
              >
                <Text
                  style={[
                    styles.wordButtonText,
                    used && styles.wordButtonTextUsed,
                  ]}
                >
                  {word}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>Quiz</Text>

        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>

      <View style={styles.quizCard}>
        <View style={styles.quizTypeBadge}>
          <Text style={styles.quizTypeText}>{getTypeLabel()}</Text>
        </View>

        <View style={styles.quizPointsBadge}>
          <Text style={styles.quizPointsText}>
            {showFeedback
              ? `+${earnedPoints} / ${maxPoints || questionPoints} pts`
              : `Worth ${maxPoints || questionPoints} pts`}
          </Text>
        </View>

        {!!quiz.question && (
          <Text style={styles.quizQuestion}>{quiz.question}</Text>
        )}

        {quizType === QUIZ_TYPES.MULTIPLE_CHOICE &&
          renderMultipleChoice()}

        {quizType === QUIZ_TYPES.TRUE_FALSE && renderTrueFalse()}

        {quizType === QUIZ_TYPES.SENTENCE_BUILDER &&
          renderSentenceBuilder()}

        {showFeedback && (
          <View
            style={[
              styles.feedbackContainer,
              isCorrect
                ? styles.feedbackCorrectBox
                : styles.feedbackIncorrectBox,
            ]}
          >
            <Text
              style={[
                styles.feedbackTitle,
                isCorrect ? styles.scoreGood : styles.scoreNeedsWork,
              ]}
            >
              {isCorrect ? '🎉 Correct!' : '❌ Not quite right!'}
            </Text>

            <Text style={styles.feedbackPoints}>
              {isCorrect
                ? `+${earnedPoints || questionPoints} points earned`
                : `Worth ${maxPoints || questionPoints} points — try the next one!`}
            </Text>

            <Text style={styles.feedbackExplanation}>
              Correct answer:{' '}
              {Array.isArray(quiz.answer)
                ? quiz.answer.join(' ')
                : quiz.answer}
            </Text>

            {!!quiz.explanation && (
              <Text
                style={[
                  styles.feedbackExplanation,
                  { marginTop: 8 },
                ]}
              >
                {quiz.explanation}
              </Text>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          !canSubmitAnswer && styles.disabledButton,
        ]}
        disabled={!canSubmitAnswer}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {showFeedback
            ? isLastQuestion
              ? 'See Results'
              : `Next Question (${autoAdvanceCountdown}s)`
            : isWaitingToCheck
              ? `Checking in ${autoCheckCountdown}s`
              : 'Check Answer'}
        </Text>
      </TouchableOpacity>

      {isCountingDown && (
        <View style={styles.quizAutoAdvanceTrack}>
          <View
            style={[
              styles.quizAutoAdvanceFill,
              {
                width: `${Math.round(
                  (countdownSeconds / countdownTotal) * 100
                )}%`,
              },
            ]}
          />
        </View>
      )}

      {isWaitingToCheck && (
        <Text style={styles.quizAutoAdvanceHint}>
          Your answer is checked automatically — tap to check it now.
        </Text>
      )}

      {showFeedback && (
        <Text style={styles.quizAutoAdvanceHint}>
          {isLastQuestion
            ? 'Tap See Results when you are ready.'
            : 'The next question opens on its own — tap to skip the wait.'}
        </Text>
      )}
    </View>
  );
}


/*
 * RESULT
 */
function ResultStage({
  quizScore,
  quizTotal,
  quizPoints = 0,
  quizMaxPoints = 0,
  quizBreakdown = [],
  practiceScore,
  practiceLabel = 'Practice',
  storedOverallScore = null,
  stars,
  xpAwarded = 0,
  xpTotal = 0,
  onRestart,
  onContinue,
}) {
  const quizPercentage =
    quizMaxPoints > 0
      ? Math.round((quizPoints / quizMaxPoints) * 100)
      : quizTotal > 0
        ? Math.round((quizScore / quizTotal) * 100)
        : 0;

  const quizTypeLabel = (quizType) => {
    switch (quizType) {
      case QUIZ_TYPES.MULTIPLE_CHOICE:
        return 'Multiple Choice';
      case QUIZ_TYPES.TRUE_FALSE:
        return 'True / False';
      case QUIZ_TYPES.SENTENCE_BUILDER:
        return 'Sentence Builder';
      default:
        return 'Quiz';
    }
  };

  const quizTypeEmoji = (quizType) => {
    switch (quizType) {
      case QUIZ_TYPES.SENTENCE_BUILDER:
        return '🧩';
      case QUIZ_TYPES.TRUE_FALSE:
        return '⚖️';
      default:
        return '🔵';
    }
  };

  const scores = [
    quizPercentage,
    practiceScore,
  ];

  /*
   * The headline number is the score that was actually graded and stored for
   * this run. The local average is only a fallback for the rare case where the
   * run never reached grading, so what the learner sees can never drift away
   * from the score the server rewarded.
   */
  const localOverallScore = scores.length
    ? Math.round(
        scores.reduce((total, value) => total + value, 0) / scores.length
      )
    : 0;

  const overallScore =
    typeof storedOverallScore === 'number'
      ? clampScore(storedOverallScore)
      : localOverallScore;

  let message = 'Keep practicing!';

  if (overallScore >= 90) {
    message = 'Excellent work!';
  } else if (overallScore >= 80) {
    message = 'Great job!';
  } else if (overallScore >= 60) {
    message = 'Good effort!';
  }

  return (
    <View>
      <View style={styles.resultHeader}>
        <Text style={styles.resultEmoji}>
          {overallScore >= 80 ? '🎉' : '💪'}
        </Text>

        <Text style={styles.resultTitle}>{message}</Text>

        <Text style={styles.resultSubtitle}>
          You completed this sublesson.
        </Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.overallLabel}>Overall Score</Text>
        <Text style={styles.overallScore}>{overallScore}%</Text>

        <Text style={styles.quizPointsSummary}>
          {quizMaxPoints > 0
            ? `🎯 Quiz points: ${quizPoints} / ${quizMaxPoints} pts`
            : `🎯 Quiz: ${quizScore}/${quizTotal} correct`}
        </Text>

        {overallScore >= 50 && (
          <>
            <View style={styles.divider} />
            {stars > 0 && (
              <Text style={styles.starsText}>
                {'⭐'.repeat(stars)}
              </Text>
            )}
            <View style={styles.xpBadge}>
              {/*
                * Only XP this run actually paid is presented as "earned": a
                * replay is settled by the server and pays nothing new, so it
                * must not look like a fresh reward.
                */}
              <Text style={styles.xpText}>
                {xpAwarded > 0
                  ? `⚡ +${xpAwarded} XP Earned`
                  : xpTotal > 0
                    ? `⭐ Best result already banked (${xpTotal} XP total)`
                    : '⭐ No new XP this time'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {quizScore}/{quizTotal}
          </Text>

          <Text style={styles.statLabel}>Quiz</Text>
          {quizMaxPoints > 0 && (
            <Text style={styles.statSubLabel}>
              {quizPoints} pts • {quizPercentage}%
            </Text>
          )}
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{practiceScore}%</Text>
          <Text style={styles.statLabel}>{practiceLabel}</Text>
        </View>
      </View>

      {quizBreakdown.length > 0 && (
        <View style={styles.pointsCard}>
          <Text style={styles.pointsTitle}>Points breakdown</Text>
          <Text style={styles.pointsSubtitle}>
            Sentence Builder questions are worth double — nice bonus when you
            nail them!
          </Text>

          {quizBreakdown.map((entry, entryIndex) => (
            <View
              key={`${entry.questionId ?? 'question'}-${entryIndex}`}
              style={[
                styles.pointsRow,
                entry.correct
                  ? styles.pointsRowCorrect
                  : styles.pointsRowIncorrect,
              ]}
            >
              <Text style={styles.pointsEmoji}>
                {entry.correct ? '✅' : '❌'}
              </Text>

              <View style={styles.pointsInfo}>
                <Text style={styles.pointsQuestion} numberOfLines={2}>
                  Q{entryIndex + 1}: {entry.question ?? 'Quiz question'}
                </Text>
                <Text style={styles.pointsType}>
                  {quizTypeEmoji(entry.quizType)}{' '}
                  {quizTypeLabel(entry.quizType)} • +{entry.points}/
                  {entry.maxPoints} pts
                </Text>
              </View>

              <Text
                style={[
                  styles.pointsValue,
                  entry.correct
                    ? styles.pointsValueCorrect
                    : styles.pointsValueIncorrect,
                ]}
              >
                +{entry.points}
              </Text>
            </View>
          ))}
        </View>
      )}

      {overallScore >= 50 && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onContinue}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onRestart}
      >
        <Text style={styles.secondaryButtonText}>Practice Again</Text>
      </TouchableOpacity>
    </View>
  );
}

/*
 * GRAMMAR
 */

function GrammarPanel({ grammar, speak, onClose }) {
  if (!grammar) {
    return null;
  }

  return (
    <View style={styles.grammarOverlay}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.grammarBackdrop}
        onPress={onClose}
      />

      <View style={styles.grammarSheet}>
        <View style={styles.grammarHeader}>
          <View style={styles.grammarHeaderText}>
            <Text style={styles.grammarTitle}>Grammar</Text>

            {!!grammar.title && (
              <Text style={styles.grammarSubtitle}>
                {grammar.title}
                {grammar.level ? ` • ${grammar.level}` : ''}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.grammarCloseButton}
            onPress={onClose}
          >
            <Text style={styles.grammarCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.grammarScroll}
          contentContainerStyle={styles.grammarScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!!grammar.focus && (
            <View style={styles.grammarFocusBox}>
              <Text style={styles.grammarFocusText}>
                {grammar.focus}
              </Text>
            </View>
          )}

          {grammar.overview.length > 0 && (
            <View style={styles.grammarSection}>
              <Text style={styles.grammarSectionTitle}>
                How French works here
              </Text>

              {grammar.overview.map((line) => (
                <View key={line} style={styles.grammarBulletRow}>
                  <Text style={styles.grammarBullet}>•</Text>
                  <Text style={styles.grammarBulletText}>{line}</Text>
                </View>
              ))}
            </View>
          )}

          {grammar.rules.length > 0 && (
            <View style={styles.grammarSection}>
              <Text style={styles.grammarSectionTitle}>Key rules</Text>

              {grammar.rules.map((rule) => (
                <View key={rule.title} style={styles.grammarRuleCard}>
                  <Text style={styles.grammarRuleTitle}>{rule.title}</Text>

                  {!!rule.text && (
                    <Text style={styles.grammarRuleText}>{rule.text}</Text>
                  )}

                  {!!rule.french && (
                    <View style={styles.grammarFrenchRow}>
                      <Text style={styles.grammarFrench}>{rule.french}</Text>

                      <Pressable onPress={() => speak(rule.french)}>
                        <Text style={styles.smallSound}>🔊</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {grammar.tenses.length > 0 && (
            <View style={styles.grammarSection}>
              <Text style={styles.grammarSectionTitle}>
                Tenses & conjugations
              </Text>

              {grammar.tenses.map((tense) => (
                <View key={tense.name} style={styles.grammarTenseCard}>
                  <Text style={styles.grammarTenseName}>{tense.name}</Text>

                  {!!tense.note && (
                    <Text style={styles.grammarTenseNote}>{tense.note}</Text>
                  )}

                  {tense.forms.map((form) => (
                    <View
                      key={`${tense.name}-${form.french}`}
                      style={styles.grammarFormRow}
                    >
                      <View style={styles.grammarFormText}>
                        <Text style={styles.grammarFormFrench}>
                          {form.french}
                        </Text>

                        {!!form.english && (
                          <Text style={styles.grammarFormEnglish}>
                            {form.english}
                          </Text>
                        )}
                      </View>

                      <Pressable onPress={() => speak(form.french)}>
                        <Text style={styles.smallSound}>🔊</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {grammar.useCases.length > 0 && (
            <View style={styles.grammarSection}>
              <Text style={styles.grammarSectionTitle}>
                When to use it
              </Text>

              {grammar.useCases.map((useCase, useCaseIndex) => (
                <View
                  key={`${useCase.french}-${useCaseIndex}`}
                  style={styles.grammarUseCaseCard}
                >
                  {!!useCase.situation && (
                    <Text style={styles.grammarUseCaseSituation}>
                      {useCase.situation}
                    </Text>
                  )}

                  <View style={styles.grammarFrenchRow}>
                    <Text style={styles.grammarFrench}>
                      {useCase.french}
                    </Text>

                    <Pressable onPress={() => speak(useCase.french)}>
                      <Text style={styles.smallSound}>🔊</Text>
                    </Pressable>
                  </View>

                  {!!useCase.english && (
                    <Text style={styles.grammarUseCaseEnglish}>
                      {useCase.english}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {grammar.goals.length > 0 && (
            <View style={styles.grammarSection}>
              <Text style={styles.grammarSectionTitle}>
                What you will be able to do
              </Text>

              {grammar.goals.map((goal) => (
                <View key={goal} style={styles.grammarBulletRow}>
                  <Text style={styles.grammarBullet}>✓</Text>
                  <Text style={styles.grammarBulletText}>{goal}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.grammarDoneButton}
            onPress={onClose}
          >
            <Text style={styles.primaryButtonText}>
              Got it, back to the lesson
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

/*
 * EMPTY
 */

function EmptyStage({ title, text }) {
  return (
    <View style={styles.emptyStage}>
      <Text style={styles.emptyStageIcon}>📚</Text>
      <Text style={styles.emptyStageTitle}>{title}</Text>
      <Text style={styles.emptyStageText}>{text}</Text>
    </View>
  );
}

/*
 * STYLES
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  backIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F2FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  backButtonPressed: {
    opacity: 0.78,
  },

  backIcon: {
    color: '#1577D4',
    fontSize: 30,
    lineHeight: 30,
    marginTop: -3,
  },

  stage: {
    fontSize: 13,
    color: '#7A8798',
    textTransform: 'uppercase',
    fontWeight: '800',
  },

  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#182133',
    marginTop: 5,
  },

  stageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },

  stageItem: {
    alignItems: 'center',
    flex: 1,
  },

  stageCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stageCircleActive: {
    backgroundColor: '#1577D4',
  },

  stageCircleCompleted: {
    backgroundColor: '#10B981',
  },

  stageCircleText: {
    color: '#7A8798',
    fontWeight: '800',
    fontSize: 11,
  },

  stageCircleTextActive: {
    color: '#FFFFFF',
  },

  stageItemText: {
    fontSize: 9,
    marginTop: 5,
    color: '#98A2B3',
    fontWeight: '700',
  },

  stageItemTextActive: {
    color: '#1577D4',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionNumber: {
    fontSize: 21,
    fontWeight: '900',
    color: '#182133',
  },

  counter: {
    fontSize: 14,
    color: '#1577D4',
    fontWeight: '800',
  },

  instruction: {
    color: '#667085',
    fontSize: 15,
    marginBottom: 18,
  },

  learningCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    elevation: 3,
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  frenchLarge: {
    fontSize: 42,
    fontWeight: '900',
    color: '#182133',
    textAlign: 'center',
  },

  /*
   * TEXT <-> VOICE SYNC
   *
   * The placeholder keeps the height of the French sentence, so the card does
   * not jump when the text and the voice arrive together.
   */
  frenchLoadingBox: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  frenchLoadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#66788A',
    textAlign: 'center',
  },

  voiceSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  voiceSyncText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#66788A',
  },

  soundButton: {
    alignSelf: 'center',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
  },

  soundButtonText: {
    color: '#1577D4',
    fontWeight: '800',
  },

  englishLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: '#667085',
    textAlign: 'center',
    marginTop: 15,
  },

  infoBox: {
    marginTop: 25,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
  },

  infoLabel: {
    fontSize: 12,
    color: '#98A2B3',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 16,
    color: '#182133',
    fontWeight: '600',
  },

  exampleBox: {
    marginTop: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
  },

  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  exampleFrench: {
    fontSize: 16,
    color: '#182133',
    fontWeight: '700',
    flex: 1,
  },

  smallSound: {
    fontSize: 20,
  },

  exampleEnglish: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 5,
  },

  examplePronunciation: {
    fontSize: 14,
    color: '#98A2B3',
    fontStyle: 'italic',
  },

  usageBox: {
    marginTop: 15,
    backgroundColor: '#EEF5FF',
    borderRadius: 12,
    padding: 15,
  },

  usageText: {
    color: '#475467',
    fontSize: 14,
    lineHeight: 20,
  },

  /*
   * TIER 1 — Learn Try (ungraded). Secondary treatment on purpose: the
   * graded Speaking stage owns the green recordButton, Try stays blue.
   */
  tryBox: {
    marginTop: 15,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#D6E7FB',
  },

  tryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1577D4',
    marginBottom: 4,
  },

  tryHint: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 18,
    marginBottom: 12,
  },

  tryButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tryButton: {
    flex: 1,
    backgroundColor: '#1577D4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },

  tryButtonRecording: {
    backgroundColor: '#EF4444',
  },

  tryButtonPressed: {
    opacity: 0.85,
  },

  tryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  tryRetryButton: {
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 25,
    backgroundColor: '#E8F2FB',
  },

  tryRetryText: {
    color: '#1577D4',
    fontWeight: '800',
    fontSize: 14,
  },

  tryAnalyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },

  tryAnalyzingText: {
    marginLeft: 8,
    color: '#1577D4',
    fontWeight: '700',
    fontSize: 14,
  },

  tryRecordingHint: {
    marginTop: 10,
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  tryResultBox: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },

  tryScore: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
    textAlign: 'center',
  },

  wordChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },

  wordChip: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
  },

  wordChipMatched: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },

  wordChipMissed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  wordChipTextMatched: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 13,
  },

  wordChipTextMissed: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 13,
  },

  tryErrorText: {
    marginTop: 10,
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  tryErrorSoft: {
    marginTop: 8,
    color: '#98A2B3',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  primaryButton: {
    backgroundColor: '#1577D4',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryButton: {
    backgroundColor: '#E1E8F0',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 15,
  },

  secondaryButtonText: {
    color: '#182133',
    fontSize: 16,
    fontWeight: '800',
  },

  disabledButton: {
    backgroundColor: '#B0C4DE',
    opacity: 0.7,
  },

  practiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    elevation: 3,
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  practiceType: {
    textAlign: 'center',
    color: '#98A2B3',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  practicePromptText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#182133',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 25,
  },

  practiceTarget: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1577D4',
    textAlign: 'center',
    marginBottom: 20,
  },

  practiceOptions: {
    marginTop: 10,
  },

  choiceButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E1E8F0',
    marginBottom: 12,
  },

  choiceButtonSelected: {
    borderColor: '#1577D4',
    backgroundColor: '#EFF6FF',
  },

  choiceButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },

  choiceButtonIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  choiceText: {
    fontSize: 16,
    color: '#182133',
    fontWeight: '600',
  },

  feedbackContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
  },

  feedbackCorrectBox: {
    backgroundColor: '#ECFDF5',
  },

  feedbackIncorrectBox: {
    backgroundColor: '#FEF2F2',
  },

  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },

  feedbackExplanation: {
    fontSize: 15,
    color: '#475467',
    lineHeight: 22,
  },

  quizAutoAdvanceTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E4EAF2',
    marginTop: 14,
    overflow: 'hidden',
  },

  quizAutoAdvanceFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1577D4',
  },

  quizAutoAdvanceHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#7A8798',
    lineHeight: 18,
  },

  speakingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    elevation: 3,
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  sayLabel: {
    fontSize: 14,
    color: '#98A2B3',
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },

  targetPhrase: {
    fontSize: 28,
    fontWeight: '900',
    color: '#182133',
    textAlign: 'center',
    marginBottom: 15,
  },

  translation: {
    fontSize: 16,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 5,
  },

  pronunciationText: {
    fontSize: 14,
    color: '#98A2B3',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },

  largeSoundButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    marginBottom: 15,
  },

  largeSoundText: {
    color: '#1577D4',
    fontWeight: '800',
    fontSize: 16,
  },

  analyzingBox: {
    alignItems: 'center',
    padding: 20,
  },

  analyzingText: {
    marginTop: 10,
    color: '#1577D4',
    fontWeight: '700',
  },

  analyzingSubText: {
    marginTop: 6,
    color: '#66788A',
    fontSize: 13,
    fontWeight: '600',
  },

  voiceLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F7F9FC',
  },

  voiceLoadingTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '800',
    color: '#182133',
    textAlign: 'center',
  },

  voiceLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#66788A',
    textAlign: 'center',
    lineHeight: 20,
  },

  voiceLoadingSteps: {
    marginTop: 24,
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#21344D',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  voiceLoadingStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  voiceLoadingStepIcon: {
    width: 22,
    marginRight: 8,
    alignItems: 'center',
  },

  voiceLoadingStepCheck: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '900',
  },

  voiceLoadingStepText: {
    flex: 1,
    color: '#475467',
    fontSize: 14,
    fontWeight: '700',
  },

  recordButton: {
    backgroundColor: '#10B981',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },

  recordButtonActive: {
    backgroundColor: '#EF4444',
  },

  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  resultBox: {
    marginTop: 25,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  resultLabel: {
    fontSize: 12,
    color: '#98A2B3',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 5,
  },

  transcript: {
    fontSize: 18,
    color: '#182133',
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
  },

  accuracyScore: {
    fontSize: 32,
    fontWeight: '900',
  },

  scoreGood: {
    color: '#10B981',
  },

  scoreNeedsWork: {
    color: '#F59E0B',
  },

  trialWarningText: {
    marginTop: 15,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '700',
  },

  /*
   * QUIZ
   */

  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    elevation: 3,
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  quizTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 15,
  },

  quizTypeText: {
    color: '#1577D4',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  quizQuestion: {
    fontSize: 20,
    fontWeight: '800',
    color: '#182133',
    marginBottom: 20,
    lineHeight: 28,
  },

  quizInstruction: {
    fontSize: 15,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  listenQuizButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },

  listenQuizButtonText: {
    color: '#1577D4',
    fontSize: 16,
    fontWeight: '900',
  },

  quizInput: {
    borderWidth: 2,
    borderColor: '#E1E8F0',
    borderRadius: 16,
    padding: 17,
    fontSize: 17,
    color: '#182133',
    backgroundColor: '#F8FAFC',
  },

  inputCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },

  inputIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  builderLabel: {
    fontSize: 13,
    color: '#667085',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  sentenceAnswerBox: {
    minHeight: 90,
    borderWidth: 2,
    borderColor: '#E1E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    gap: 8,
  },

  emptySentenceText: {
    color: '#98A2B3',
    fontSize: 14,
    lineHeight: 20,
  },

  selectedWord: {
    backgroundColor: '#1577D4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },

  selectedWordText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  wordButton: {
    borderWidth: 2,
    borderColor: '#E1E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },

  wordButtonUsed: {
    opacity: 0.35,
  },

  wordButtonText: {
    color: '#182133',
    fontWeight: '700',
  },

  wordButtonTextUsed: {
    color: '#98A2B3',
  },

  /*
   * RESULT
   */

  resultHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

  resultEmoji: {
    fontSize: 64,
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#182133',
    marginBottom: 5,
  },

  resultSubtitle: {
    fontSize: 16,
    color: '#667085',
  },

  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  overallLabel: {
    fontSize: 14,
    color: '#98A2B3',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 10,
  },

  overallScore: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1577D4',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#21344D',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#182133',
    marginBottom: 5,
  },

  statLabel: {
    fontSize: 10,
    color: '#667085',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  emptyStage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
  },

  emptyStageIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyStageTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#182133',
    textAlign: 'center',
  },

  emptyStageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 20,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  error: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginVertical: 16,
  },

  starsText: {
    fontSize: 36,
    letterSpacing: 6,
    marginBottom: 12,
    textAlign: 'center',
  },

  xpBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 5,
  },

  xpText: {
    fontSize: 16,
    color: '#15803D',
    fontWeight: '800',
    textAlign: 'center',
  },

  /*
   * GRAMMAR
   */

  learnActionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 30,
  },

  grammarButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  grammarButtonText: {
    color: '#1577D4',
    fontSize: 16,
    fontWeight: '800',
  },

  learnNextButton: {
    flex: 1,
    backgroundColor: '#1577D4',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  grammarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },

  grammarBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  grammarSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '88%',
  },

  grammarHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  grammarHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  grammarTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#182133',
  },

  grammarSubtitle: {
    fontSize: 13,
    color: '#7A8798',
    fontWeight: '700',
    marginTop: 3,
  },

  grammarCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  grammarScroll: {
    marginTop: 15,
    flexShrink: 1,
  },

  grammarScrollContent: {
    paddingBottom: 30,
  },

  grammarFocusBox: {
    backgroundColor: '#EEF5FF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },

  grammarFocusText: {
    color: '#1E4E8C',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  grammarSection: {
    marginBottom: 22,
  },

  grammarSectionTitle: {
    fontSize: 12,
    color: '#98A2B3',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 10,
  },

  grammarBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  grammarBullet: {
    color: '#1577D4',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 8,
  },

  grammarBulletText: {
    flex: 1,
    color: '#475467',
    fontSize: 14,
    lineHeight: 20,
  },

  grammarRuleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },

  grammarRuleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#182133',
    marginBottom: 5,
  },

  grammarRuleText: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 20,
  },

  grammarFrenchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  grammarFrench: {
    flex: 1,
    color: '#1577D4',
    fontSize: 15,
    fontWeight: '800',
    paddingRight: 10,
  },

  grammarTenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4EAF1',
    padding: 15,
    marginBottom: 12,
  },

  grammarTenseName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#182133',
  },

  grammarTenseNote: {
    color: '#7A8798',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  grammarFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 8,
  },

  grammarFormText: {
    flex: 1,
    paddingRight: 10,
  },

  grammarFormFrench: {
    color: '#182133',
    fontSize: 15,
    fontWeight: '700',
  },

  grammarFormEnglish: {
    color: '#98A2B3',
    fontSize: 13,
    marginTop: 2,
  },

  grammarUseCaseCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },

  grammarUseCaseSituation: {
    color: '#7A8798',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },

  grammarUseCaseEnglish: {
    color: '#667085',
    fontSize: 14,
    marginTop: 5,
  },

  grammarDoneButton: {
    backgroundColor: '#1577D4',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
});
