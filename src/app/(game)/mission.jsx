import { router, useLocalSearchParams } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Mission() {
  const { id, title, challenge } = useLocalSearchParams();

  const startMission = () => {
    router.push({
      pathname: '/lesson',
      params: {
        id,
        title,
        challenge,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <Text style={styles.header}>📜 Mission Brief</Text>

      <View style={styles.card}>

        <Text style={styles.mission}>
          Mission {id}
        </Text>

        <Text style={styles.title}>
          {title}
        </Text>

        <View style={styles.infoContainer}>

          <Text style={styles.label}>
            Stage
          </Text>

          <Text style={styles.value}>
            🌻 The Village
          </Text>

          <Text style={styles.label}>
            Difficulty
          </Text>

          <Text style={styles.value}>
            Beginner
          </Text>

          <Text style={styles.label}>
            Estimated Time
          </Text>

          <Text style={styles.value}>
            3 Minutes
          </Text>

          <Text style={styles.label}>
            Reward
          </Text>

          <Text style={styles.reward}>
            ⭐ 100 XP
          </Text>

          <Text style={styles.reward}>
            🪙 50 Coins
          </Text>

        </View>

        {challenge === 'true' && (
          <View style={styles.challengeBox}>
            <Text style={styles.challengeTitle}>
              🏆 Stage Challenge
            </Text>

            <Text style={styles.challengeText}>
              Complete this challenge to unlock the next stage.
            </Text>
          </View>
        )}

      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={startMission}
      >
        <Text style={styles.buttonText}>
          Start Mission
        </Text>
      </TouchableOpacity>
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
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },

  mission: {
    fontSize: 18,
    color: '#666',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 20,
  },

  infoContainer: {
    gap: 8,
  },

  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
  },

  reward: {
    fontSize: 18,
    color: '#16A34A',
    fontWeight: 'bold',
  },

  challengeBox: {
    marginTop: 25,
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 12,
  },

  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B45309',
  },

  challengeText: {
    marginTop: 8,
    color: '#92400E',
    fontSize: 15,
  },

  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

});