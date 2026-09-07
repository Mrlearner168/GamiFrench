import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, ProgressBar } from '@/components/game-ui';
import { getCountryTopics, getDefaultModuleId, getModuleLabel } from '@/data/lesson-catalog';
import { getTopicProgress, loadLessonProgress } from '@/store/lesson-progress';

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
  const { country = 'Canada', module: moduleParam, topicId } = useLocalSearchParams();
  const countryName = Array.isArray(country) ? country[0] : country;
  const moduleId = Array.isArray(moduleParam) ? moduleParam[0] : moduleParam || getDefaultModuleId(countryName);
  const catalogTopics = getCountryTopics(countryName, moduleId);
  const topics = topicId
    ? catalogTopics.filter((topic) => topic.id === (Array.isArray(topicId) ? topicId[0] : topicId))
    : catalogTopics;
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadLessonProgress().then(setProgress);
  }, []);

  const openTopic = (lesson) => {
    const completed = getTopicProgress(progress, countryName, lesson).completed;
    const subLessons = Array.isArray(lesson?.subLessons) ? lesson.subLessons : [];
    const firstSubLesson = subLessons[0];
    const firstLessonCompleted = !firstSubLesson || completed.includes(firstSubLesson.id);
    const nextIndex = subLessons.findIndex((subLesson) => !completed.includes(subLesson.id));

    router.push({
      pathname: '/sublesson',
      params: {
        country: countryName,
        module: moduleId,
        topicId: lesson.id,
        subLessonIndex: firstLessonCompleted && nextIndex >= 0 ? nextIndex : 0,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GameHeader back eyebrow={getModuleLabel(countryName, moduleId)} title={countryName} subtitle="Choose what you want to learn. Small steps add up!" />
        {countryImages[countryName] ? <Image source={countryImages[countryName]} style={styles.countryImage} /> : null}
        <Text style={styles.sectionTitle}>Your topics</Text>
        {topics.map((lesson) => {
          const topicProgress = getTopicProgress(progress, countryName, lesson);
          const locked = false;
          const status = topicProgress.count === topicProgress.total ? 'Completed' : topicProgress.count ? 'In progress' : 'Available';
          return (
            <Pressable key={lesson.id} disabled={locked} onPress={() => openTopic(lesson)}
              accessibilityRole="button" accessibilityLabel={`${lesson.title}, ${status}`}
              style={({ pressed }) => [styles.card, locked && styles.lockedCard, pressed && styles.pressed]}>
              <Text style={styles.icon}>{lesson.icon}</Text>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}><Text style={styles.cardTitle}>{lesson.title}</Text><Text style={[styles.status, status === 'Completed' && styles.completed]}>{locked ? '🔒' : status}</Text></View>
                <Text style={styles.description}>{lesson.description}</Text>
                <View style={styles.progressRow}><Text style={styles.progressText}>{topicProgress.count}/{topicProgress.total} sub-lessons</Text><ProgressBar value={topicProgress.total ? topicProgress.count / topicProgress.total : 0} color={status === 'Completed' ? '#10B981' : '#1577D4'} /></View>
              </View>
            </Pressable>
          );
        })}
        <Text style={styles.future}>A more complex topic will be added here in a future update.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  content: { paddingBottom: 36 },
  countryImage: { height: 120, marginHorizontal: 20, borderRadius: 20, opacity: 0.9 },
  sectionTitle: { marginHorizontal: 20, marginTop: 22, marginBottom: 10, color: '#344054', fontSize: 15, fontWeight: '800' },
  card: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E1E8F0', shadowColor: '#21344D', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  lockedCard: { opacity: 0.5 },
  pressed: { opacity: 0.75 },
  icon: { fontSize: 28, marginRight: 12, marginTop: 2 },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  cardTitle: { flex: 1, color: '#182133', fontSize: 16, lineHeight: 21, fontWeight: '800' },
  status: { color: '#1577D4', fontSize: 11, fontWeight: '800' },
  completed: { color: '#16855A' },
  description: { marginTop: 5, color: '#7A8798', fontSize: 12, lineHeight: 17 },
  progressRow: { marginTop: 12 },
  progressText: { marginBottom: 5, color: '#667085', fontSize: 11, fontWeight: '700' },
  future: { margin: 10, color: '#98A2B3', textAlign: 'center', fontSize: 12 },
});
