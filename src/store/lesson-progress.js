import * as SecureStore from 'expo-secure-store';

const KEY = 'gamifrench.lesson-progress';
const PRACTICE_SCORES_KEY = 'gamifrench.practice-scores';
let cachedProgress = {};
let cachedPracticeScores = {};

export async function loadPracticeScores() {
  if (Object.keys(cachedPracticeScores).length) return cachedPracticeScores;
  const stored = await SecureStore.getItemAsync(PRACTICE_SCORES_KEY);
  cachedPracticeScores = stored ? JSON.parse(stored) : {};
  return cachedPracticeScores;
}

export async function loadLessonProgress() {
  if (Object.keys(cachedProgress).length) return cachedProgress;
  const stored = await SecureStore.getItemAsync(KEY);
  cachedProgress = stored ? JSON.parse(stored) : {};
  return cachedProgress;
}

export async function completeSubLesson(country, topicId, subLessonId) {
  const progress = await loadLessonProgress();
  const countryProgress = progress[country] || {};
  const topicProgress = countryProgress[topicId] || [];
  if (!topicProgress.includes(subLessonId)) topicProgress.push(subLessonId);
  cachedProgress = { ...progress, [country]: { ...countryProgress, [topicId]: topicProgress } };
  await SecureStore.setItemAsync(KEY, JSON.stringify(cachedProgress));
  return cachedProgress;
}

export async function saveSubLessonPracticeScore(
  country,
  topicId,
  subLessonId,
  score,
  itemScores = []
) {
  await loadPracticeScores();

  const countryScores = cachedPracticeScores[country] || {};
  const topicScores = countryScores[topicId] || {};
  cachedPracticeScores = {
    ...cachedPracticeScores,
    [country]: {
      ...countryScores,
      [topicId]: {
        ...topicScores,
        [subLessonId]: {
          score,
          itemScores,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  };

  await SecureStore.setItemAsync(
    PRACTICE_SCORES_KEY,
    JSON.stringify(cachedPracticeScores)
  );
  return cachedPracticeScores;
}

export function getSubLessonPracticeScore(
  practiceScores,
  country,
  topicId,
  subLessonId
) {
  return practiceScores?.[country]?.[topicId]?.[subLessonId] ?? null;
}

export function getTopicProgress(progress, country, lesson) {
  const topicId = lesson?.id;
  const completed = Array.isArray(progress?.[country]?.[topicId]) ? progress[country][topicId] : [];
  const subLessons = Array.isArray(lesson?.subLessons) ? lesson.subLessons : [];

  return { completed, count: completed.length, total: subLessons.length };
}

export function isSubLessonLocked(progress, country, lesson, subLessonIndex = 0) {
  const subLessons = Array.isArray(lesson?.subLessons) ? lesson.subLessons : [];
  if (!subLessons.length) return false;

  const index = Number.parseInt(subLessonIndex, 10);
  if (Number.isNaN(index) || index <= 0) return false;

  const firstSubLesson = subLessons[0];
  if (!firstSubLesson?.id) return false;

  const completed = Array.isArray(progress?.[country]?.[lesson?.id])
    ? progress[country][lesson.id]
    : [];

  return !completed.includes(firstSubLesson.id);
}
