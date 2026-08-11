import { useAuth } from '@/store/auth-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusText = {
  earned: 'Earned',
  'in-progress': 'In progress',
  locked: 'Locked',
};

export default function Achievements() {
  const [playerStats, setPlayerStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [nextGoal, setNextGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authenticatedRequest } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const json = await authenticatedRequest('/achievements');
        setPlayerStats(json.playerStats || {});
        setBadges(json.badges || []);
        setNextGoal(json.nextGoal || null);
      } catch (err) {
        setError('Unable to load achievements.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const renderBadge = ({ item }) => {
    const isEarned = item.status === 'earned';
    const isLocked = item.status === 'locked';
    const progressRatio = Math.min((item.progress || 0) / (item.target || 1), 1);

    return (
      <View
        style={[
          styles.badgeCard,
          isEarned && styles.badgeCardEarned,
          isLocked && styles.badgeCardLocked,
        ]}
      >
        <View style={styles.badgeHeader}>
          <Text style={styles.badgeIcon}>{item.icon}</Text>
          <View style={styles.badgeText}>
            <Text style={styles.badgeTitle}>{item.title}</Text>
            <Text style={styles.badgeSubtitle}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.badgeFooter}>
          <Text style={[styles.badgeStatus, isEarned && styles.badgeStatusEarned]}>
            {statusText[item.status]}
          </Text>
          {!isEarned && (
            <Text style={styles.badgeProgressText}>
              {item.progress}/{item.target}
            </Text>
          )}
        </View>

        {!isEarned && (
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 20 }}>Loading achievements...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Achievements</Text>
        <Text style={styles.pageSubtitle}>
          Track your milestones, badges, and progress through the French quest.
        </Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>XP</Text>
          <Text style={styles.summaryValue}>{playerStats?.xp ?? '-'}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Streak</Text>
          <Text style={styles.summaryValue}>{playerStats?.streak ?? '-'}d</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Badges</Text>
          <Text style={styles.summaryValue}>{badges.filter((b) => b.status === 'earned').length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Missions</Text>
          <Text style={styles.summaryValue}>{playerStats?.lessons_completed ?? '-'}</Text>
        </View>
      </View>

      {nextGoal && (
        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Text style={styles.featureLabel}>Next milestone</Text>
            <TouchableOpacity onPress={() => router.push('/journey')}>
              <Text style={styles.featureAction}>See journey</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.featureTitle}>{nextGoal.title}</Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${(nextGoal.progress / nextGoal.target) * 100}%` }]}
            />
          </View>
          <Text style={styles.featureProgressText}>
            {nextGoal.progress} / {nextGoal.target} lessons completed
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Badges</Text>

      <FlatList
        data={badges}
        keyExtractor={(item) => item.key || item.id}
        renderItem={renderBadge}
        contentContainerStyle={styles.badgeList}
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#7B8CA0',
  },
  summaryValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F3E8A',
  },
  error: {
    color: '#B42318',
    marginBottom: 12,
  },
  featureCard: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 13,
    color: '#BFDBFE',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  featureAction: {
    color: '#EFF6FF',
    fontWeight: '700',
  },
  featureTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  progressBarBackground: {
    marginTop: 16,
    height: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  featureProgressText: {
    marginTop: 10,
    color: '#DBEAFE',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  badgeList: {
    paddingBottom: 30,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  badgeCardEarned: {
    borderColor: '#10B981',
    borderWidth: 1,
  },
  badgeCardLocked: {
    opacity: 0.85,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  badgeText: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  badgeSubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  badgeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeStatus: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badgeStatusEarned: {
    color: '#10B981',
  },
  badgeProgressText: {
    fontSize: 13,
    color: '#334155',
  },
});
