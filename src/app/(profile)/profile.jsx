import { useAuth } from '@/store/auth-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const { authenticatedRequest } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const json = await authenticatedRequest('/profile');
        setProfile(json);
      } catch (err) {
        setError('Unable to load your profile.');
      }
    }
    load();
  }, []);

  const settingsActions = [
    {
      id: 'edit-profile',
      title: 'Edit profile',
      description: 'Update your avatar and name.',
      icon: '✏️',
      onPress: () => router.push('/settings'),
    },
    {
      id: 'view-journey',
      title: 'View journey',
      description: 'See your current progress path.',
      icon: '🗺️',
      onPress: () => router.push('/journey'),
    },
    {
      id: 'go-achievements',
      title: 'Achievements',
      description: 'Review earned badges and goals.',
      icon: '🏆',
      onPress: () => router.push('/achievements'),
    },
  ];

  if (error) {
    return <SafeAreaView style={styles.container}><Text style={{ margin: 20 }}>{error}</Text></SafeAreaView>;
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 20 }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Profile</Text>
        <Text style={styles.pageSubtitle}>
          Your progress, stats, and quick account actions.
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileBadge}>
          <Text style={styles.profileBadgeText}>🌻</Text>
        </View>

        <Text style={styles.profileName}>{profile.user.displayName}</Text>
        <Text style={styles.profileMeta}>{profile.user.frenchLevel} · Level {profile.progress.level}</Text>

        <View style={styles.profileStatsRow}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatLabel}>Score</Text>
            <Text style={styles.profileStatValue}>{profile.progress.xp}</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatLabel}>Streak</Text>
            <Text style={styles.profileStatValue}>{profile.progress.streak}d</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Current progress</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Missions</Text>
            <Text style={styles.progressValue}>0</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Lessons</Text>
            <Text style={styles.progressValue}>{profile.progress.lessonsCompleted}</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Challenges</Text>
            <Text style={styles.progressValue}>0</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      {settingsActions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionRow}
          activeOpacity={0.8}
          onPress={action.onPress}
        >
          <Text style={styles.actionIcon}>{action.icon}</Text>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.description}</Text>
          </View>
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
  header: {
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  pageSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#58616E',
    lineHeight: 22,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    elevation: 3,
    marginBottom: 16,
    alignItems: 'center',
  },
  profileBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileBadgeText: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  profileMeta: {
    marginTop: 6,
    fontSize: 15,
    color: '#64748B',
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 22,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatLabel: {
    color: '#7B8CA0',
    fontSize: 13,
  },
  profileStatValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F3E8A',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginRight: 10,
  },
  progressItemLast: {
    marginRight: 0,
  },
  progressLabel: {
    fontSize: 13,
    color: '#7B8CA0',
  },
  progressValue: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F3E8A',
  },
  actionRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  actionSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
});