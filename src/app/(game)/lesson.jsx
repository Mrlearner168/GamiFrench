import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { lessons } from '../../data/lessons';

export default function Lesson() {
  const { id } = useLocalSearchParams();

  const lesson = lessons[id];

  const [index, setIndex] = useState(0);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const word = lesson.vocabulary[index];

  const nextCard = () => {
    if (index < lesson.vocabulary.length - 1) {
      setIndex(index + 1);
      return;
    }

    router.push({
      pathname: '/quiz',
      params: {
        id,
      },
    });
  };

  const previousCard = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.stage}>
        {lesson.stage}
      </Text>

      <Text style={styles.title}>
        {lesson.title}
      </Text>

      <Text style={styles.goal}>
        {lesson.goal}
      </Text>

      <View style={styles.progressContainer}>
        <Text style={styles.progress}>
          {index + 1} / {lesson.vocabulary.length}
        </Text>
      </View>

      <View style={styles.card}>

        <Text style={styles.french}>
          {word.french}
        </Text>

        <Text style={styles.english}>
          {word.english}
        </Text>

        <Text style={styles.label}>
          Pronunciation
        </Text>

        <Text style={styles.value}>
          {word.pronunciation}
        </Text>

        <Text style={styles.label}>
          Example
        </Text>

        <Text style={styles.value}>
          {word.example}
        </Text>

      </View>

      <View style={styles.buttonRow}>

        <TouchableOpacity
          style={[
            styles.button,
            index === 0 && styles.disabledButton,
          ]}
          disabled={index === 0}
          onPress={previousCard}
        >
          <Text style={styles.buttonText}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={nextCard}
        >
          <Text style={styles.buttonText}>
            {index === lesson.vocabulary.length - 1
              ? 'Start Quiz'
              : 'Next'}
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
    justifyContent: 'space-between',
  },

  stage: {
    fontSize: 16,
    color: '#666',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 5,
  },

  goal: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },

  progressContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },

  progress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    elevation: 3,
  },

  french: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E3A8A',
  },

  english: {
    fontSize: 24,
    textAlign: 'center',
    color: '#16A34A',
    marginTop: 10,
  },

  label: {
    marginTop: 25,
    fontSize: 14,
    color: '#777',
    fontWeight: '600',
  },

  value: {
    marginTop: 5,
    fontSize: 18,
    color: '#222',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  button: {
    flex: 0.47,
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#BDBDBD',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  error: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 50,
  },

});