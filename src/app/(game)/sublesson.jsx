import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCountryTopics } from '@/data/lesson-catalog';
import {
  completeSubLesson,
  isSubLessonLocked,
  loadLessonProgress,
  loadPracticeScores,
  saveSubLessonPracticeScore,
} from '@/store/lesson-progress';

const STAGES = {
  LEARN: 'learn',
  PRACTICE: 'practice',
  QUIZ: 'quiz',
  RESULT: 'result',
};

// Local fallback similarity calculator in case of network issues or JSON parse errors
const calculateLocalScore = (target, spoken) => {
  if (!spoken || !target) return 0;
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëîïôöùûüç]/gi, '')
      .trim()
      .split(/\s+/);

  const targetWords = normalize(target);
  const spokenWords = normalize(spoken);

  let matches = 0;
  spokenWords.forEach((word) => {
    if (targetWords.includes(word)) matches++;
  });

  const score = Math.round((matches / Math.max(targetWords.length, 1)) * 100);
  return Math.min(100, Math.max(0, score));
};

export default function SubLessonScreen() {
  const {
    country = 'Canada',
    module: moduleParam,
    topicId,
    subLessonIndex = '0',
  } = useLocalSearchParams();

  const countryName = Array.isArray(country) ? country[0] : country;
  const moduleId = Array.isArray(moduleParam) ? moduleParam[0] : moduleParam;
  const topicKey = Array.isArray(topicId) ? topicId[0] : topicId;
  const indexParam = Array.isArray(subLessonIndex)
    ? subLessonIndex[0]
    : subLessonIndex;

  const topics = getCountryTopics(countryName, moduleId);
  const topic = topics.find((item) => item.id === topicKey);
  const lessonIndex = Number.parseInt(indexParam, 10);

  const subLesson =
    topic?.subLessons?.[
      Number.isNaN(lessonIndex) ? 0 : lessonIndex
    ];

  const items = useMemo(() => subLesson?.items ?? [], [topicKey, lessonIndex, subLesson]);
  const quiz = useMemo(() => subLesson?.quiz ?? [], [topicKey, lessonIndex, subLesson]);

  // -----------------------------------------
  // LESSON STATE
  // -----------------------------------------

  const [stage, setStage] = useState(STAGES.LEARN);
  const [learnIndex, setLearnIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [progress, setProgress] = useState({});

  const [quizAnswers, setQuizAnswers] = useState([]);
  const [resultQuizScore, setResultQuizScore] = useState(0);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceItemScores, setPracticeItemScores] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);

  // -----------------------------------------
  // VOICE / PRACTICE & SPEAKING STATE
  // -----------------------------------------

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecordingUI, setIsRecordingUI] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Practice Stage recording state
  const [practiceTranscript, setPracticeTranscript] = useState('');
  const [practiceAccuracy, setPracticeAccuracy] = useState(null);

  // -----------------------------------------
  // PERMISSIONS
  // -----------------------------------------

  useEffect(() => {
    AudioModule.requestRecordingPermissionsAsync();
  }, []);

  useEffect(() => {
    loadLessonProgress().then(setProgress);
    loadPracticeScores();
  }, []);

  useEffect(() => {
    if (stage !== STAGES.LEARN) return undefined;

    const frenchText = items[learnIndex]?.french;
    if (!frenchText) return undefined;

    let isActive = true;
    Speech.stop();
    Speech.speak('Listen carefully, then repeat after me.', {
      language: 'en-US',
      rate: 0.9,
      onDone: () => {
        if (!isActive) return;

        Speech.speak(frenchText, {
          language: 'fr-FR',
          rate: 0.8,
        });
      },
    });

    return () => {
      isActive = false;
      Speech.stop();
    };
  }, [items, learnIndex, stage]);

  // -----------------------------------------
  // SAFETY CHECK
  // -----------------------------------------

  const isLocked = isSubLessonLocked(progress, countryName, topic, lessonIndex);

  if (!topic || !subLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>Lesson data not found.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>Complete the first lesson to unlock this one.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace({ pathname: '/lesson', params: { country: countryName } })}
          >
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -----------------------------------------
  // CURRENT ITEM
  // -----------------------------------------

  const currentLearnItem = items[learnIndex];
  const currentPracticeItem = items[practiceIndex];
  const currentQuiz = quiz[quizIndex];

  // -----------------------------------------
  // SPEECH
  // -----------------------------------------

  const speak = (text) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, {
      language: 'fr-FR',
      rate: 0.8,
    });
  };

  // -----------------------------------------
  // LEARN
  // -----------------------------------------

  const nextLearn = () => {
    if (learnIndex < items.length - 1) {
      setLearnIndex((value) => value + 1);
      return;
    }

    setPracticeIndex(0);
    setPracticeAccuracy(null);
    setPracticeTranscript('');
    setPracticeItemScores([]);
    setPracticeScore(0);
    setStage(STAGES.PRACTICE);
  };

  // -----------------------------------------
  // PRACTICE
  // -----------------------------------------

  const nextPractice = async () => {
    const nextScores = [
      ...practiceItemScores,
      { itemId: currentPracticeItem.id, score: practiceAccuracy },
    ];
    setPracticeItemScores(nextScores);
    setPracticeAccuracy(null);
    setPracticeTranscript('');

    if (practiceIndex < items.length - 1) {
      setPracticeIndex((value) => value + 1);
      return;
    }

    const validScores = nextScores
      .map((item) => item.score)
      .filter((score) => typeof score === 'number');
    const averageScore = validScores.length
      ? Math.round(
          validScores.reduce((total, score) => total + score, 0) /
            validScores.length
        )
      : 0;

    setPracticeScore(averageScore);
    await saveSubLessonPracticeScore(
      countryName,
      topic.id,
      subLesson.id,
      averageScore,
      nextScores
    );

    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowQuizFeedback(false);
    setQuizAnswers([]);
    setPracticeItemScores([]);
    setStage(STAGES.QUIZ);
  };

  // -----------------------------------------
  // QUIZ
  // -----------------------------------------

  const selectAnswer = (answer) => {
    if (!showQuizFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleQuizAction = () => {
    if (!showQuizFeedback) {
      if (!selectedAnswer) {
        Alert.alert('Choose an answer', 'Select an answer before continuing.');
        return;
      }

      const correct = selectedAnswer === currentQuiz.answer;
      setIsQuizCorrect(correct);
      setShowQuizFeedback(true);

      const updatedAnswers = [
        ...quizAnswers,
        {
          questionId: currentQuiz.id,
          answer: selectedAnswer,
          correct,
        },
      ];

      setQuizAnswers(updatedAnswers);

    } else {
      setShowQuizFeedback(false);
      setSelectedAnswer(null);

      if (quizIndex < quiz.length - 1) {
        setQuizIndex((value) => value + 1);
      } else {
        const completedQuizScore = quizAnswers.filter(
          (quizAnswer) => quizAnswer.correct
        ).length;
        setResultQuizScore(completedQuizScore);
        completeSubLesson(countryName, topic.id, subLesson.id);
        setStage(STAGES.RESULT);
      }
    }
  };

  // -----------------------------------------
  // RECORDING & GROQ ANALYSIS
  // -----------------------------------------

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Microphone access is needed to practice your pronunciation.'
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setIsRecordingUI(true);
      if (stage === STAGES.PRACTICE) {
        setPracticeTranscript('');
        setPracticeAccuracy(null);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording error', 'Unable to start recording.');
    }
  };

  const stopRecordingAndRate = async (targetPhrase) => {
    setIsRecordingUI(false);
    setIsAnalyzing(true);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) {
        throw new Error('Recording failed. No audio file was created.');
      }

      const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? process.env.GROQ_API_KEY;
      console.log('Using Groq API key:', apiKey ? 'Present' : 'Missing');
      if (!apiKey) {
        throw new Error('Groq API key is missing. Check EXPO_PUBLIC_GROQ_API_KEY in your .env file.');
      }

      const uploadResult = await FileSystem.uploadAsync(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        uri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          parameters: {
            model: 'whisper-large-v3-turbo',
            language: 'fr',
          },
        }
      );

      const transData = JSON.parse(uploadResult.body);
      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(
          transData.error?.message || 'Audio transcription failed.'
        );
      }

      const userSpokenText = transData.text?.trim() || '';

      setPracticeTranscript(userSpokenText);

      if (!userSpokenText) {
        setPracticeAccuracy(0);
        return;
      }

      let calculatedScore = null;

      try {
        const rateRes = await fetch(
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
                    'You are a French pronunciation tutor. Compare the target phrase with the student transcript and output a JSON object containing a single key "score" with an integer value from 0 to 100.',
                },
                {
                  role: 'user',
                  content: `Target phrase: "${targetPhrase}"\nStudent transcript: "${userSpokenText}"`,
                },
              ],
              temperature: 0,
              response_format: { type: 'json_object' },
            }),
          }
        );

        const rateData = await rateRes.json();

        if (rateRes.ok && rateData.choices?.[0]?.message?.content) {
          const rawContent = rateData.choices[0].message.content;
          const cleanContent = rawContent
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

          const parsed = JSON.parse(cleanContent);
          if (typeof parsed.score === 'number') {
            calculatedScore = parsed.score;
          }
        }
      } catch (llmErr) {
        console.warn('Groq LLM scoring failed, using local calculation:', llmErr);
      }

      if (calculatedScore === null || Number.isNaN(calculatedScore)) {
        calculatedScore = calculateLocalScore(targetPhrase, userSpokenText);
      }

      const finalScore = Math.min(100, Math.max(0, calculatedScore));

      setPracticeAccuracy(finalScore);
    } catch (error) {
      console.error('Speech analysis error:', error);
      Alert.alert(
        'Analysis Error',
        error.message || 'Unable to analyze your pronunciation.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // -----------------------------------------
  // RESULT
  // -----------------------------------------

  const restartLesson = () => {
    setStage(STAGES.LEARN);
    setLearnIndex(0);
    setPracticeIndex(0);
    setQuizIndex(0);
    setQuizAnswers([]);
    setResultQuizScore(0);
    setShowQuizFeedback(false);
    setPracticeTranscript('');
    setPracticeAccuracy(null);
  };

  const returnToLesson = () => {
    router.replace({
      pathname: '/lesson',
      params: {
        country: countryName,
        module: moduleId,
        topicId: topicKey,
      },
    });
  };

  // -----------------------------------------
  // RENDER
  // -----------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stage}>
          {countryName} • {topic.title}
        </Text>

        <Text style={styles.title}>{subLesson.title}</Text>

        {/* STAGE INDICATOR */}
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
            active={stage === STAGES.PRACTICE}
            completed={[STAGES.QUIZ, STAGES.RESULT].includes(stage)}
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

        {/* LEARN STAGE */}
        {stage === STAGES.LEARN && (
          <LearnStage
            item={currentLearnItem}
            index={learnIndex}
            total={items.length}
            speak={speak}
            onNext={nextLearn}
          />
        )}

        {/* PRACTICE STAGE */}
        {stage === STAGES.PRACTICE && (
          <PracticeStage
            item={currentPracticeItem}
            index={practiceIndex}
            total={items.length}
            speak={speak}
            isRecording={isRecordingUI}
            isAnalyzing={isAnalyzing}
            transcript={practiceTranscript}
            accuracy={practiceAccuracy}
            onStart={startRecording}
            onStop={() => stopRecordingAndRate(currentPracticeItem.french)}
            onNext={nextPractice}
          />
        )}

        {/* QUIZ STAGE */}
        {stage === STAGES.QUIZ && (
          <QuizStage
            quiz={currentQuiz}
            index={quizIndex}
            total={quiz.length}
            selectedAnswer={selectedAnswer}
            showFeedback={showQuizFeedback}
            isCorrect={isQuizCorrect}
            onSelect={selectAnswer}
            onSubmit={handleQuizAction}
          />
        )}

        {/* RESULT STAGE */}
        {stage === STAGES.RESULT && (
          <ResultStage
            quizScore={resultQuizScore}
            quizTotal={quiz.length}
            practiceScore={practiceScore}
            onRestart={restartLesson}
            onContinue={returnToLesson}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STAGE INDICATOR
// ======================================================

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
      <Text style={[styles.stageItemText, active && styles.stageItemTextActive]}>
        {title}
      </Text>
    </View>
  );
}

// ======================================================
// LEARN STAGE
// ======================================================

function LearnStage({ item, index, total, speak, onNext }) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>Learn</Text>
        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>

      <Text style={styles.instruction}>Listen and learn this French word.</Text>

      <View style={styles.learningCard}>
        <Text style={styles.frenchLarge}>{item.french}</Text>

        <Pressable style={styles.soundButton} onPress={() => speak(item.french)}>
          <Text style={styles.soundButtonText}>🔊 Listen</Text>
        </Pressable>

        <Text style={styles.englishLarge}>{item.english}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Pronunciation</Text>
          <Text style={styles.infoValue}>{item.pronunciation}</Text>
        </View>

        <View style={styles.exampleBox}>
          <Text style={styles.infoLabel}>Example</Text>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleFrench}>{item.example}</Text>
            <Pressable onPress={() => speak(item.example)}>
              <Text style={styles.smallSound}>🔊</Text>
            </Pressable>
          </View>
          <Text style={styles.exampleEnglish}>{item.exampleEnglish}</Text>
          <Text style={styles.examplePronunciation}>
            {item.examplePronunciation}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>
          {index === total - 1 ? 'Start Practice' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ======================================================
// PRACTICE STAGE
// ======================================================

function PracticeStage({
  item,
  index,
  total,
  speak,
  isRecording,
  isAnalyzing,
  transcript,
  accuracy,
  onStart,
  onStop,
  onNext,
}) {
  const canContinue = accuracy !== null && accuracy >= 50;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>Practice</Text>
        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>

      <Text style={styles.instruction}>
        Listen and complete the voice trial. Score at least 50% to unlock Next.
      </Text>

      <View style={styles.practiceCard}>
        <Text style={styles.practicePrompt}>Say this:</Text>
        <Text style={styles.frenchPractice}>{item.french}</Text>

        <Pressable
          style={styles.largeSoundButton}
          onPress={() => speak(item.french)}
        >
          <Text style={styles.largeSoundText}>🔊 Play pronunciation</Text>
        </Pressable>

        <Text style={styles.practicePronunciation}>{item.pronunciation}</Text>

        <View style={styles.divider} />

        {/* VOICE TRIAL */}
        {isAnalyzing ? (
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="large" color="#1577D4" />
            <Text style={styles.analyzingText}>Evaluating voice trial...</Text>
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
              {isRecording ? '⏹ Stop & Evaluate' : '🎙 Tap for Voice Trial'}
            </Text>
          </TouchableOpacity>
        )}

        {transcript ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>You said</Text>
            <Text style={styles.transcript}>&quot;{transcript}&quot;</Text>

            {accuracy !== null && (
              <View style={styles.accuracyContainer}>
                <Text style={styles.accuracyLabel}>Pronunciation Score</Text>
                <Text
                  style={[
                    styles.accuracyScore,
                    accuracy >= 50 ? styles.scoreGood : styles.scoreNeedsWork,
                  ]}
                >
                  {accuracy}%
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {accuracy !== null && accuracy < 50 && (
          <Text style={styles.trialWarningText}>
            Score is below 50%. Please try again to unlock the next button!
          </Text>
        )}
      </View>

      {/* SHOW NEXT BUTTON ONLY IF PRONUNCIATION SCORE IS AT LEAST 50% */}
      {canContinue && (
        <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.primaryButtonText}>
            {index === total - 1 ? 'Start Quiz' : 'Next'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ======================================================
// QUIZ STAGE
// ======================================================

function QuizStage({
  quiz,
  index,
  total,
  selectedAnswer,
  showFeedback,
  isCorrect,
  onSelect,
  onSubmit,
}) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>Quick Quiz</Text>
        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>

      <View style={styles.quizCard}>
        <Text style={styles.quizQuestion}>{quiz.question}</Text>

        {quiz.choices.map((choice) => {
          const selected = selectedAnswer === choice;
          const isAnswerChoice = choice === quiz.answer;

          let choiceStyle = styles.choiceButton;
          if (showFeedback) {
            if (isAnswerChoice) {
              choiceStyle = [styles.choiceButton, styles.choiceButtonCorrect];
            } else if (selected && !isCorrect) {
              choiceStyle = [
                styles.choiceButton,
                styles.choiceButtonIncorrect,
              ];
            }
          } else if (selected) {
            choiceStyle = [styles.choiceButton, styles.choiceButtonSelected];
          }

          return (
            <Pressable
              key={choice}
              onPress={() => onSelect(choice)}
              disabled={showFeedback}
              style={choiceStyle}
            >
              <View
                style={[
                  styles.choiceCircle,
                  selected && styles.choiceCircleSelected,
                ]}
              >
                {selected && <View style={styles.choiceDot} />}
              </View>

              <Text
                style={[
                  styles.choiceText,
                  selected && styles.choiceTextSelected,
                ]}
              >
                {choice}
              </Text>
            </Pressable>
          );
        })}

        {/* IMMEDIATE EXPLANATION & FEEDBACK BOX */}
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
              {isCorrect ? '🎉 Congratulations! Correct!' : '❌ Not quite right!'}
            </Text>

            <Text style={styles.feedbackExplanation}>
              {isCorrect
                ? `Great job! "${quiz.answer}" is the correct answer.`
                : `The correct answer is: "${quiz.answer}". ${
                    quiz.explanation ||
                    'Review this term in the Learn section to reinforce your vocabulary!'
                  }`}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          !selectedAnswer && !showFeedback && styles.disabledButton,
        ]}
        disabled={!selectedAnswer && !showFeedback}
        onPress={onSubmit}
      >
        <Text style={styles.primaryButtonText}>
          {showFeedback
            ? index === total - 1
              ? 'See Results'
              : 'Next Question'
            : 'Check Answer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ======================================================
// RESULT STAGE
// ======================================================

function ResultStage({
  quizScore,
  quizTotal,
  practiceScore,
  onRestart,
  onContinue,
}) {
  const quizPercentage =
    quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;
  const overallScore = quizPercentage;

  let message = 'Keep practicing!';
  if (overallScore >= 90) message = 'Excellent work!';
  else if (overallScore >= 80) message = 'Great job!';
  else if (overallScore >= 60) message = 'Good effort!';

  return (
    <View>
      <View style={styles.resultHeader}>
        <Text style={styles.resultEmoji}>{overallScore >= 80 ? '🎉' : '💪'}</Text>
        <Text style={styles.resultTitle}>{message}</Text>
        <Text style={styles.resultSubtitle}>You completed this sublesson.</Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.overallLabel}>Overall Score</Text>
        <Text style={styles.overallScore}>{overallScore}%</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {quizScore}/{quizTotal}
          </Text>
          <Text style={styles.statLabel}>Quiz</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{practiceScore}%</Text>
          <Text style={styles.statLabel}>Practice</Text>
        </View>

      </View>

      {overallScore >= 50 && (
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={onRestart}>
        <Text style={styles.secondaryButtonText}>Practice Again</Text>
      </TouchableOpacity>
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 50,
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
  },
  stageCircleTextActive: {
    color: '#FFFFFF',
  },
  stageItemText: {
    fontSize: 10,
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
    shadowOffset: { width: 0, height: 4 },
  },
  frenchLarge: {
    fontSize: 42,
    fontWeight: '900',
    color: '#182133',
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 4 },
  },
  practicePrompt: {
    fontSize: 14,
    color: '#98A2B3',
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  frenchPractice: {
    fontSize: 32,
    fontWeight: '900',
    color: '#182133',
    textAlign: 'center',
    marginBottom: 15,
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
  practicePronunciation: {
    fontSize: 16,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E8F0',
    marginVertical: 20,
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
  accuracyContainer: {
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 12,
    color: '#98A2B3',
    textTransform: 'uppercase',
    fontWeight: '800',
    marginBottom: 5,
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
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    elevation: 3,
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  quizQuestion: {
    fontSize: 20,
    fontWeight: '800',
    color: '#182133',
    marginBottom: 20,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  choiceCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E1E8F0',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceCircleSelected: {
    borderColor: '#1577D4',
  },
  choiceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1577D4',
  },
  choiceText: {
    fontSize: 16,
    color: '#182133',
    fontWeight: '600',
    flex: 1,
  },
  choiceTextSelected: {
    color: '#1577D4',
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
  speakingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 25,
    elevation: 3,
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 4 },
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
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#21344D',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#182133',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#667085',
    fontWeight: '700',
    textTransform: 'uppercase',
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
  },
});