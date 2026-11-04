import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, ProgressBar } from '@/components/game-ui';
import {
  getCountryTopics,
  getDefaultModuleId,
  getModuleLabel,
} from '@/data/lessons/catalog';
import {
  DIFFICULTY_COPY,
  buildTopicRanking,
  describeStartupInsight,
  getReasonCopy,
  getRecommendedTopic,
} from '@/services/recommendations';
import { NODE_PASS_PERCENTAGE } from '@/services/scoring';
import { useAuth } from '@/store/auth-context';
import {
  getTopicProgress,
  loadLastPlayedTopic,
} from '@/store/lesson-progress';
import { useLessonProgress } from '@/hooks/use-lesson-progress';
import { getStartupAssessment } from '@/store/profile-cache';

const countryImages = {
  Canada: require('../../../assets/images/countries/canada.jpg'),
  France: require('../../../assets/images/countries/france.jpg'),
  Morocco: require('../../../assets/images/countries/morocco.jpg'),
  Italy: require('../../../assets/images/countries/italy.jpg'),
  IvoryCoast: require('../../../assets/images/countries/ivory_coast.jpg'),
  Luxembourg: require('../../../assets/images/countries/luxembourg.jpg'),
  Monaco: require('../../../assets/images/countries/monaco.jpg'),
  Switzerland: require('../../../assets/images/countries/switzerland.jpg'),
  Belgium: require('../../../assets/images/countries/belgium.jpg'),
  Cameroon: require('../../../assets/images/countries/cameroon.jpg'),
};

export default function CountryLessonScreen() {
  const { authenticatedRequest } = useAuth();
  const {
    country = 'Canada',
    module: moduleParam,
    topicId,
  } = useLocalSearchParams();

  const countryName = Array.isArray(country) ? country[0] : country;

  const moduleId = useMemo(() => {
    const normalizedModule = Array.isArray(moduleParam)
      ? moduleParam[0]
      : moduleParam;

    return normalizedModule || getDefaultModuleId(countryName);
  }, [countryName, moduleParam]);

  // Device copy first (instant), then merged with the server when it answers.
  const { progress } = useLessonProgress(authenticatedRequest);
  const [startupAssessment, setStartupAssessment] = useState(null);
  const [lastPlayedTopic, setLastPlayedTopic] = useState(null);

  const catalogTopics = useMemo(() => {
    return getCountryTopics(countryName, moduleId);
  }, [countryName, moduleId]);

  const selectedTopicId = Array.isArray(topicId)
    ? topicId[0]
    : topicId;

  /*
   * Personalization: topics stay in course order (stable numbering and
   * locking); the engine only picks which one to highlight as "next".
   */
  const recommendedTopic = useMemo(() => {
    if (selectedTopicId) return null;
    const ranked = buildTopicRanking({
      topics: catalogTopics,
      country: countryName,
      lessonProgress: progress,
      startupAssessment,
      lastPlayedTopic,
    });
    return getRecommendedTopic(ranked);
  }, [catalogTopics, countryName, progress, startupAssessment, lastPlayedTopic, selectedTopicId]);

  const recommendedCopy = getReasonCopy(recommendedTopic?.reason);

  const insight = useMemo(
    () => describeStartupInsight(startupAssessment, catalogTopics.map((t) => t.id)),
    [startupAssessment, catalogTopics]
  );

  const focusTitles = useMemo(() => {
    if (!insight) return [];
    return insight.focusTopicKeys
      .map((key) => catalogTopics.find((t) => t.id === key)?.title)
      .filter(Boolean);
  }, [insight, catalogTopics]);

  const topics = useMemo(() => {
    if (!selectedTopicId) return catalogTopics;

    return catalogTopics.filter(
      (topic) => topic.id === selectedTopicId
    );
  }, [catalogTopics, selectedTopicId]);

  /*
   * Personalization data lives on the device, so it loads in parallel with
   * (and never waits behind) the server progress request.
   */
  useEffect(() => {
    let mounted = true;

    Promise.all([getStartupAssessment(moduleId), loadLastPlayedTopic()])
      .then(([startup, lastPlayed]) => {
        if (mounted) {
          setStartupAssessment(startup);
          setLastPlayedTopic(lastPlayed);
        }
      })
      .catch(() => {
        if (mounted) {
          setStartupAssessment(null);
          setLastPlayedTopic(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [moduleId]);

  const getStatus = (topicProgress) => {
    const count = Number(topicProgress?.count ?? 0);
    const total = Number(topicProgress?.total ?? 0);

    if (total > 0 && count >= total) {
      return 'Completed';
    }

    if (count > 0) {
      return 'In progress';
    }

    return 'Available';
  };

  // Check if every lesson in the module is completed
  const areAllLessonsCompleted = useMemo(() => {
    if (!topics.length) return false;
    return topics.every((lesson) => {
      const topicProgress = getTopicProgress(progress, countryName, lesson);
      return getStatus(topicProgress) === 'Completed';
    });
  }, [topics, progress, countryName]);

  const openTopic = (lesson) => {
    if (!lesson?.id) {
      return;
    }

    const topicProgress = getTopicProgress(
      progress,
      countryName,
      lesson
    );

    const completed = Array.isArray(topicProgress?.completed)
      ? topicProgress.completed
      : [];

    const subLessons = Array.isArray(lesson?.subLessons)
      ? lesson.subLessons
      : [];

    let firstIncompleteIndex = subLessons.findIndex(
      (subLesson) => !completed.includes(subLesson.id)
    );

    if (firstIncompleteIndex < 0) {
      firstIncompleteIndex = 0;
    }

    router.push({
      pathname: '/sublesson',
      params: {
        country: countryName,
        module: moduleId,
        topicId: lesson.id,
        subLessonIndex: String(firstIncompleteIndex),
      },
    });
  };

  const openQuiz = () => {
    router.push({
      pathname: '/quiz',
      params: {
        mode: 'final',
        country: countryName,
        module: moduleId,
      },
    });
  };

  const recommendedLesson = recommendedTopic
    ? catalogTopics.find((t) => t.id === recommendedTopic.topicKey)
    : null;
  const recommendedNumber = recommendedLesson
    ? catalogTopics.indexOf(recommendedLesson) + 1
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GameHeader
          back
          eyebrow={getModuleLabel(countryName, moduleId)}
          title={countryName}
          subtitle="Choose what you want to learn. Small steps add up!"
        />

        {countryImages[countryName] ? (
          <Image
            source={countryImages[countryName]}
            style={styles.countryImage}
          />
        ) : null}

        {!selectedTopicId && insight && (
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={styles.insightBody}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.paceChip}>
                  {DIFFICULTY_COPY[insight.difficulty].label}
                </Text>
              </View>
              <Text style={styles.insightText}>{insight.message}</Text>
              {focusTitles.length > 0 && (
                <Text style={styles.insightFocus}>
                  🎯 Focus on: {focusTitles.join(', ')}
                </Text>
              )}
            </View>
          </View>
        )}

        {!selectedTopicId && recommendedLesson && recommendedTopic && (
          <Pressable
            onPress={() => openTopic(recommendedLesson)}
            accessibilityRole="button"
            accessibilityLabel={`${recommendedCopy?.label ?? 'Up next'}: ${recommendedLesson.title}`}
            style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
          >
            <Text style={styles.heroLabel}>
              {recommendedCopy?.icon ?? '⭐'} {(recommendedCopy?.label ?? 'Up next').toUpperCase()}
            </Text>
            <View style={styles.heroRow}>
              <Text style={styles.heroIcon}>{recommendedLesson.icon || '📘'}</Text>
              <View style={styles.heroBody}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {recommendedLesson.title}
                </Text>
                <Text style={styles.heroMeta}>
                  Lesson {recommendedNumber} of {catalogTopics.length} •{' '}
                  {recommendedTopic.progress.count}/{recommendedTopic.progress.total} sub-lessons
                </Text>
              </View>
              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>
                  {recommendedTopic.progress.count > 0 ? 'Resume' : 'Start'}
                </Text>
              </View>
            </View>
            {!!recommendedCopy?.hint && (
              <Text style={styles.heroHint}>{recommendedCopy.hint}</Text>
            )}
          </Pressable>
        )}

        {!selectedTopicId && areAllLessonsCompleted && (
          <Pressable
            onPress={openQuiz}
            accessibilityRole="button"
            accessibilityLabel="Take the final assessment"
            style={({ pressed }) => [styles.heroCard, styles.quizCard, pressed && styles.pressed]}
          >
            <Text style={[styles.heroLabel, styles.quizTitle]}>🏁 ALL LESSONS DONE</Text>
            <View style={styles.heroRow}>
              <Text style={styles.heroIcon}>📝</Text>
              <View style={styles.heroBody}>
                <Text style={[styles.heroTitle, styles.quizTitle]}>Final assessment</Text>
                <Text style={styles.heroMeta}>Score {NODE_PASS_PERCENTAGE}% to unlock your next destination.</Text>
              </View>
              <View style={[styles.heroButton, styles.heroQuizButton]}>
                <Text style={styles.heroButtonText}>Start</Text>
              </View>
            </View>
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your lessons</Text>

          <Text style={styles.lessonCount}>
            {topics.length} {topics.length === 1 ? 'lesson' : 'lessons'}
          </Text>
        </View>

        {topics.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📚</Text>

            <Text style={styles.emptyTitle}>
              No lessons available
            </Text>

            <Text style={styles.emptyText}>
              This module does not have any available lessons yet.
            </Text>
          </View>
        ) : (
          <>
            {topics.map((lesson, index) => {
              const topicProgress = getTopicProgress(
                progress,
                countryName,
                lesson
              );

              const count = Number(topicProgress?.count ?? 0);
              const total = Number(topicProgress?.total ?? 0);
              const status = getStatus(topicProgress);
              const isCompleted = status === 'Completed';

              let isLocked = false;
              if (index > 0) {
                const prevLesson = topics[index - 1];
                const prevProgress = getTopicProgress(progress, countryName, prevLesson);
                isLocked = getStatus(prevProgress) !== 'Completed';
              }

              const isRecommended =
                !isLocked && recommendedTopic?.topicKey === lesson.id;

              const progressValue =
                total > 0
                  ? Math.min(count / total, 1)
                  : 0;

              const subLessonCount = Array.isArray(lesson?.subLessons)
                ? lesson.subLessons.length
                : total > 0
                  ? total
                  : 0;

              return (
                <Pressable
                  key={lesson.id}
                  onPress={() => !isLocked && openTopic(lesson)}
                  disabled={isLocked}
                  accessibilityRole="button"
                  accessibilityLabel={isLocked ? `${lesson.title}, Locked` : `${lesson.title}, ${status}`}
                  style={({ pressed }) => [
                    styles.card,
                    isRecommended && styles.recommendedCard,
                    isLocked && styles.lockedCard,
                    pressed && !isLocked && styles.pressed,
                  ]}
                >
                  <View style={[styles.numberBadge, isLocked && styles.lockedBadge]}>
                    <Text style={[styles.numberText, isLocked && styles.lockedNumberText]}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.icon}>
                    {isLocked ? '🔒' : (lesson.icon || '📘')}
                  </Text>

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <Text
                        style={[styles.cardTitle, isLocked && styles.lockedText]}
                        numberOfLines={2}
                      >
                        {lesson.title}
                      </Text>

                      <Text
                        style={[
                          styles.status,
                          isCompleted && styles.completed,
                          isLocked && styles.lockedStatusText
                        ]}
                      >
                        {isLocked ? 'Locked' : (isCompleted ? '✓ Completed' : status)}
                      </Text>
                    </View>

                    {isRecommended && recommendedCopy && (
                      <Text style={styles.reasonBadge}>
                        {recommendedCopy.icon} {recommendedCopy.label}
                      </Text>
                    )}
                    {!!lesson.description && (
                      <Text
                        style={styles.description}
                        numberOfLines={3}
                      >
                        {lesson.description}
                      </Text>
                    )}

                    <View style={styles.metaRow}>
                      <Text style={styles.lessonType}>
                        {lesson.type
                          ? lesson.type.replace(/-/g, ' ')
                          : 'lesson'}
                      </Text>

                      <Text style={styles.progressText}>
                        {count}/{subLessonCount} sub-lessons
                      </Text>
                    </View>

                    <ProgressBar
                      value={progressValue}
                      color={
                        isCompleted
                          ? '#10B981'
                          : isLocked 
                          ? '#E1E8F0' 
                          : '#1577D4'
                      }
                    />
                  </View>
                </Pressable>
              );
            })}
          </>
        )}

        <View style={styles.futureCard}>
          <Text style={styles.futureIcon}>🧭</Text>

          <View style={styles.futureBody}>
            <Text style={styles.futureTitle}>
              Keep going
            </Text>

            <Text style={styles.futureText}>
              Complete each lesson to unlock the final quiz and move forward through your journey.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },

  content: {
    paddingBottom: 40,
  },

  countryImage: {
    height: 130,
    marginHorizontal: 20,
    borderRadius: 20,
    opacity: 0.92,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#344054',
    fontSize: 16,
    fontWeight: '800',
  },

  lessonCount: {
    color: '#98A2B3',
    fontSize: 12,
    fontWeight: '700',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8F0',
    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  quizCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FDF4FF',
  },

  quizBadge: {
    backgroundColor: '#F3E8FF',
  },

  quizBadgeText: {
    fontSize: 14,
  },

  quizTitle: {
    color: '#6B21A8',
  },

  quizStatusReady: {
    color: '#7C3AED',
    fontWeight: '900',
  },

  lockedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    marginTop: 2,
  },

  lockedBadge: {
    backgroundColor: '#F1F5F9',
  },

  numberText: {
    color: '#1577D4',
    fontSize: 12,
    fontWeight: '900',
  },

  lockedNumberText: {
    color: '#94A3B8',
  },

  icon: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 0,
  },

  cardBody: {
    flex: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },

  cardTitle: {
    flex: 1,
    color: '#182133',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  lockedText: {
    color: '#64748B',
  },

  status: {
    color: '#1577D4',
    fontSize: 10,
    fontWeight: '800',
  },

  completed: {
    color: '#16855A',
  },

  lockedStatusText: {
    color: '#94A3B8',
  },

  reasonBadge: {
    marginTop: 6,
    color: '#B45309',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  description: {
    marginTop: 6,
    color: '#7A8798',
    fontSize: 12,
    lineHeight: 17,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },

  lessonType: {
    color: '#667085',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  progressText: {
    color: '#667085',
    fontSize: 10,
    fontWeight: '700',
  },

  emptyCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 24,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8F0',
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 34,
    marginBottom: 8,
  },

  emptyTitle: {
    color: '#182133',
    fontSize: 16,
    fontWeight: '800',
  },

  emptyText: {
    marginTop: 6,
    color: '#7A8798',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  recommendedCard: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },

  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  insightIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  insightBody: {
    flex: 1,
  },

  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  insightTitle: {
    flex: 1,
    color: '#065F46',
    fontSize: 14,
    fontWeight: '800',
  },

  paceChip: {
    color: '#047857',
    backgroundColor: '#D1FAE5',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },

  insightText: {
    marginTop: 4,
    color: '#065F46',
    fontSize: 12,
    lineHeight: 17,
  },

  insightFocus: {
    marginTop: 6,
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '700',
  },

  heroCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#B45309',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  heroLabel: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  heroIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  heroBody: {
    flex: 1,
    marginRight: 10,
  },

  heroTitle: {
    color: '#182133',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },

  heroMeta: {
    marginTop: 3,
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
  },

  heroButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderColor: '#B45309',
  },

  heroQuizButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#6D28D9',
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  heroHint: {
    marginTop: 8,
    color: '#92400E',
    fontSize: 11,
    lineHeight: 16,
  },

  futureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 6,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#D7E7FA',
  },

  futureIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  futureBody: {
    flex: 1,
  },

  futureTitle: {
    color: '#19558F',
    fontSize: 13,
    fontWeight: '800',
  },

  futureText: {
    marginTop: 3,
    color: '#58708A',
    fontSize: 11,
    lineHeight: 16,
  },
});
