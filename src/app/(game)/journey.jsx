import { router } from 'expo-router';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const missions = [
  {
    id: 1,
    title: 'Greeting the Villagers',
    status: 'completed',
    challenge: false,
  },
  {
    id: 2,
    title: 'Counting Apples',
    status: 'current',
    challenge: false,
  },
  {
    id: 3,
    title: "The Painter's Colors",
    status: 'locked',
    challenge: false,
  },
  {
    id: 4,
    title: 'Meet the Animals',
    status: 'locked',
    challenge: false,
  },
  {
    id: 5,
    title: 'Village Challenge',
    status: 'locked',
    challenge: true,
  },
];

export default function Journey() {
  const openMission = (mission) => {
    if (mission.status === 'locked') return;

    router.push({
      pathname: '/mission',
      params: {
        id: mission.id,
        title: mission.title,
        challenge: mission.challenge,
      },
    });
  };

  const renderMission = ({ item }) => {
    const cardStyle = [
      styles.card,
      item.status === 'current' && styles.currentCard,
      item.challenge && styles.challengeCard,
    ];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={item.status === 'locked'}
        style={cardStyle}
        onPress={() => openMission(item)}
      >
        <View style={styles.headerRow}>
          <Text style={styles.missionNumber}>
            Mission {item.id}
          </Text>

          <Text style={styles.status}>
            {item.status === 'completed'
              ? '✅ Completed'
              : item.status === 'current'
              ? '⭐ Current'
              : '🔒 Locked'}
          </Text>
        </View>

        <Text style={styles.title}>
          {item.title}
        </Text>

        {item.challenge && (
          <Text style={styles.challenge}>
            🏆 Stage Challenge
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.stage}>
        🌻 Stage 1
      </Text>

      <Text style={styles.stageName}>
        The Village
      </Text>

      <Text style={styles.subtitle}>
        Complete missions to continue your journey.
      </Text>

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMission}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },

  stage: {
    fontSize: 18,
    color: '#666',
  },

  stageName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 5,
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 25,
    color: '#666',
    fontSize: 15,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },

  currentCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },

  challengeCard: {
    backgroundColor: '#FFF8DC',
  },

  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  missionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },

  status: {
    fontSize: 14,
    marginLeft: 8,
  },

  title: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },

  challenge: {
    marginTop: 10,
    color: '#B8860B',
    fontWeight: 'bold',
    fontSize: 15,
  },

});