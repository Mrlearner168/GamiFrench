import { useAuth } from '@/store/auth-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Result() {

  const { score, total, id } = useLocalSearchParams();

  const finalScore = Number(score);
  const totalQuestions = Number(total);

  const percentage = Math.round((finalScore / totalQuestions) * 100);

  let stars = 1;

  if (percentage >= 100) {
    stars = 3;
  } else if (percentage >= 70) {
    stars = 2;
  }

  const nextMission = Number(id) + 1;
  const [xpEarned, setXpEarned] = useState(null);
  const [syncError, setSyncError] = useState('');
  const { authenticatedRequest } = useAuth();

  useEffect(() => {
    let active = true;
    authenticatedRequest(`/progress/${Number(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ stars }),
    })
      .then((data) => {
        if (active) setXpEarned(data.xpAwarded);
      })
      .catch(() => {
        if (active) setSyncError('Your result could not be synchronized.');
      });
    return () => { active = false; };
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        🎉 Mission Complete
      </Text>

      <View style={styles.card}>

        <Text style={styles.score}>
          {finalScore} / {totalQuestions}
        </Text>

        <Text style={styles.percent}>
          {percentage}%
        </Text>

        <Text style={styles.stars}>
          {'⭐'.repeat(stars)}
        </Text>

        <View style={styles.rewardBox}>

          <Text style={styles.reward}>
            ⭐ XP Earned: {xpEarned ?? '...'}
          </Text>
          {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}

        </View>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.replace('/journey')
        }
      >
        <Text style={styles.buttonText}>
          Return to Journey
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Next Mission: {nextMission}
      </Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'space-between',
    padding: 20,
  },

  title: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
  },

  score: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  percent: {
    marginTop: 10,
    fontSize: 26,
    color: '#555',
  },

  stars: {
    marginTop: 20,
    fontSize: 40,
  },

  rewardBox: {
    marginTop: 30,
    width: '100%',
  },

  reward: {
    fontSize: 20,
    marginBottom: 15,
    color: '#16A34A',
    fontWeight: 'bold',
  },

  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#777',
    fontSize: 16,
  },
  syncError: {
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },

});