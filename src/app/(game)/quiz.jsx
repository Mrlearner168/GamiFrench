import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { quizzes } from '../../data/quizzes';

export default function Quiz() {

  const { id } = useLocalSearchParams();

  const questions = quizzes[id];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  if (!questions) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No quiz found.</Text>
      </SafeAreaView>
    );
  }

  const question = questions[current];

  const selectAnswer = (choice) => {

    let newScore = score;

    if (choice === question.answer) {
      newScore++;
      setScore(newScore);
    }

    if (current === questions.length - 1) {

      router.push({
        pathname: '/result',
        params: {
          score: newScore,
          total: questions.length,
          id,
        },
      });

      return;
    }

    setCurrent(current + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <Text style={styles.progress}>
        Question {current + 1} / {questions.length}
      </Text>

      <View style={styles.card}>

        <Text style={styles.question}>
          {question.question}
        </Text>

      </View>

      {question.choices.map((choice) => (

        <TouchableOpacity
          key={choice}
          style={styles.choice}
          onPress={() => selectAnswer(choice)}
        >
          <Text style={styles.choiceText}>
            {choice}
          </Text>
        </TouchableOpacity>

      ))}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },

  progress: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    elevation: 2,
  },

  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  choice: {
    backgroundColor: '#2563EB',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
  },

  choiceText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

});