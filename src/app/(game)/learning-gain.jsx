import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, PrimaryButton, StatPill } from '@/components/game-ui';
import { authenticatedRequest, useAuth } from '@/store/auth-context';

const PRE_KEY = 'pre-test';
const POST_KEY = 'post-test';

export default function LearningGain() {
  const { authenticatedRequest } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await authenticatedRequest(
        `/surveys/learning-gain?preKey=${PRE_KEY}&postKey=${POST_KEY}`,
      );
      setData(json);
    } catch (err) {
      console.log('[LearningGain] failed to load', err);
      setError(err?.message ?? 'Could not load class results. Try again.');
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GameHeader eyebrow="Class results" title="Learning gain" back />
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading class results…</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GameHeader eyebrow="Class results" title="Learning gain" back />
          <View style={styles.centered}>
            <Text style={styles.errorIcon}>😕</Text>
            <Text style={styles.errorTitle}>Could not load results</Text>
            <Text style={styles.errorText}>{error}</Text>
            <PrimaryButton onPress={load}>Try again</PrimaryButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const pairedCount = data?.pairedCount ?? 0;
  const meanGain = data?.meanGain;
  const minGain = data?.minGain;
  const maxGain = data?.maxGain;
  const users = Array.isArray(data?.users) ? data.users : [];

return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GameHeader eyebrow="Class results" title="Learning gain" back />
        <Text style={styles.subtitle}>
          Pre-test versus post-test gain for learners who completed both
          assessments.
        </Text>

        <View style={styles.statGrid}>
          <StatPill icon="👥" value={String(pairedCount)} label="Learners" />
          <StatPill icon="📈" value={meanGain == null ? '—' : meanGain.toFixed(1)} label="Mean gain" />
          <StatPill icon="▲" value={maxGain == null ? '—' : maxGain} label="Best gain" />
          <StatPill icon="▼" value={minGain == null ? '—' : minGain} label="Lowest gain" />
        </View>

        {users.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No paired results yet</Text>
            <Text style={styles.emptyText}>
              Learners appear here once they have completed both the pre-test
              and the post-test.
            </Text>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Learner detail</Text>
            {users.map((row) => (
              <View key={row.userId} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <Text style={styles.userLabel}>Learner {row.userId.slice(-4)}</Text>
                  <Text style={styles.userMeta}>Pre {row.preScore} → Post {row.postScore}</Text>
                </View>
                <View style={styles.userGain}>
                  <Text style={[styles.userGainValue, row.gain > 0 ? styles.gainUp : row.gain < 0 ? styles.gainDown : styles.gainFlat]}>
                    {row.gain >= 0 ? '+' : ''}{row.gain}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity accessibilityRole="button" activeOpacity={0.8} onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>‹ Back to profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 14, fontSize: 15, color: '#58616E' },
  errorIcon: { fontSize: 40 },
  errorTitle: { marginTop: 12, fontSize: 20, fontWeight: 'bold', color: '#1E3A8A', textAlign: 'center' },
  errorText: { marginTop: 8, marginBottom: 20, fontSize: 15, color: '#58616E', lineHeight: 22, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 20 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#182133', marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  userInfo: { flex: 1 },
  userLabel: { fontSize: 15, fontWeight: '700', color: '#182133' },
  userMeta: { marginTop: 2, fontSize: 13, color: '#64748B' },
  userGain: { alignItems: 'flex-end', minWidth: 70 },
  userGainValue: { fontSize: 17, fontWeight: '800' },
  gainUp: { color: '#10B981' },
  gainDown: { color: '#DC2626' },
  gainFlat: { color: '#64748B' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#182133', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginTop: 6, paddingHorizontal: 20 },
  backLink: { alignSelf: 'center', marginTop: 14, paddingVertical: 6, paddingRight: 10 },
  backLinkText: { color: '#2563EB', fontSize: 15, fontWeight: '700' },
});
