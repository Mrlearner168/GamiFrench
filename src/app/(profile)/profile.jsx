import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, ProgressBar } from '@/components/game-ui';
import { findSubLessonById, getCountryForModule } from '@/data/lessons/catalog';
import { isOfflineError } from '@/services/apiClient';
import { useAuth } from '@/store/auth-context';
import {
  buildOfflineProfile,
  readProfileCache,
  saveProfileCache,
} from '@/store/profile-cache';

const LEVEL_LABELS = {
  beginner: 'Beginner (A1)',
  elementary: 'Elementary (A2)',
  intermediate: 'Intermediate (B1)',
  advanced: 'Advanced (B2+)',
};

const GOAL_LABELS = {
  general: 'General French',
  travel: 'Travel & everyday French',
  work: 'Work & career',
  study: 'Study & exams',
  culture: 'Culture & media',
  fluency: 'Fluency practice',
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/* Parses date-only values (`YYYY-MM-DD`) and ISO timestamps without the
   timezone shift that `new Date('2025-01-05')` would introduce. */
function parseDateValue(value) {
  if (!value) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMonthYear(value) {
  const date = parseDateValue(value);
  return date ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}` : 'Not available';
}

function formatDay(value) {
  const date = parseDateValue(value);
  return date
    ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    : 'No activity yet';
}

function labelFromMap(labels, value, fallback) {
  if (!value) return fallback;
  return labels[value] ?? `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/* `m1-l3-greetings` → `M1 L3 Greetings` for keys without catalog metadata. */
function prettifyContentKey(contentKey) {
  if (!contentKey) return 'Lesson';

  return contentKey
    .split('-')
    .map((token) => (token.length <= 2
      ? token.toUpperCase()
      : `${token.charAt(0).toUpperCase()}${token.slice(1)}`))
    .join(' ');
}

function starsLabel(stars) {
  const filled = Math.max(0, Math.min(Number(stars) || 0, 3));
  return `${'★'.repeat(filled)}${'☆'.repeat(3 - filled)}`;
}

/* Resolves a stored content key into a friendly title plus its module context. */
function describeContentKey(contentKey, moduleKey) {
  const match = findSubLessonById(contentKey);
  if (!match) {
    return {
      title: prettifyContentKey(contentKey),
      context: moduleKey ? prettifyContentKey(moduleKey) : 'Sub-lesson',
      icon: '📘',
    };
  }

  const country = getCountryForModule(match.module?.id);
  return {
    title: match.subLesson?.title ?? prettifyContentKey(contentKey),
    context: [country, match.lesson?.title].filter(Boolean).join(' • '),
    icon: match.lesson?.icon ?? '📘',
  };
}

export default function Profile() {
  const { session, authenticatedRequest, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(
    () => authenticatedRequest('/profile'),
    [authenticatedRequest],
  );

  /*
   * Offline sources, in priority order:
   *   1. the cached server payload - still server truth, just older;
   *   2. a payload rebuilt from this device's progress mirrors.
   *
   * Only reached when the network is unreachable. A 4xx/5xx is a real answer
   * from the backend and keeps the error screen below, exactly like the other
   * offline-first screens (`journey.jsx`, `mission.jsx`).
   */
  const loadFromDevice = useCallback(async () => {
    const cached = await readProfileCache();
    const rebuilt = await buildOfflineProfile(session?.user, cached?.payload);

    return {
      payload: cached?.payload ?? rebuilt,
      cached,
      rebuilt,
    };
  }, [session?.user]);

  /*
   * Paint the cached payload straight away so opening the profile on a plane
   * shows the last known numbers immediately, then revalidate behind it.
   */
  const hydrateFromCache = useCallback(async () => {
    const cached = await readProfileCache();
    if (!cached) return false;

    setProfile((current) => current ?? cached.payload);
    return true;
  }, []);

  // Refresh every time the screen regains focus so rewards claimed in a lesson
  // are reflected as soon as the learner comes back.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        hydrateFromCache();

        try {
          const json = await fetchProfile();
          if (!active) return;

          setProfile(json);
          setIsStale(false);
          setError('');

          // The freshest server answer replaces the cached one.
          saveProfileCache(json);
        } catch (err) {
          if (!active) return;
          console.log('[Profile] falling back to on-device data', err);

          if (isOfflineError(err)) {
            const { payload } = await loadFromDevice();
            if (!active) return;

            setProfile(payload);
            setIsStale(true);
            setError('');
          } else {
            setError('Unable to load your profile. Please try again in a moment.');
          }
        } finally {
          if (active) setIsLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [fetchProfile, hydrateFromCache, loadFromDevice]),
  );

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const json = await fetchProfile();
      setProfile(json);
      setIsStale(false);
      setError('');
      saveProfileCache(json);
    } catch (err) {
      console.log('[Profile] failed to refresh profile', err);

      if (isOfflineError(err)) {
        const { payload } = await loadFromDevice();
        setProfile(payload);
        setIsStale(true);
        setError('');
      } else {
        setError('Unable to refresh your profile. Pull down to try again.');
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [fetchProfile, loadFromDevice]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    return reload();
  }, [reload]);

  const user = profile?.user ?? {};
  const progress = profile?.progress ?? {};
  const learning = profile?.learning ?? {};
  const content = profile?.content ?? {};

  const displayName = user.displayName ?? session?.user?.displayName ?? 'Traveler';
  const email = user.email ?? session?.user?.email ?? '';
  const avatarEmoji = (user.gender ?? session?.user?.gender) === 'female' ? '👧🏽' : '👦🏽';

  const xp = progress.xp ?? 0;
  const level = progress.level ?? 1;
  const levelStartXp = progress.levelStartXp ?? 0;
  const nextLevelXp = progress.nextLevelXp ?? Math.max(levelStartXp + 100, xp);
  const levelSpan = Math.max(nextLevelXp - levelStartXp, 1);
  const isMaxLevel = Boolean(progress.isMaxLevel);
  const xpToNextLevel = progress.xpToNextLevel ?? Math.max(nextLevelXp - xp, 0);
  const levelProgress = Math.min(
    Math.max(
      typeof progress.levelProgress === 'number'
        ? progress.levelProgress
        : (xp - levelStartXp) / levelSpan,
      0,
    ),
    1,
  );

  const streak = progress.streak ?? 0;
  const longestStreak = progress.longestStreak ?? streak;
  const coins = progress.coins ?? 0;
  const hearts = progress.hearts ?? 5;
  const lessonsCompleted = progress.lessonsCompleted ?? 0;
  const overallGrade20 = Number(progress.overallAverageGrade20) || 0;

  const frenchLevelLabel = labelFromMap(LEVEL_LABELS, learning.frenchLevel ?? user.frenchLevel, 'Beginner (A1)');
  const learningGoalLabel = labelFromMap(GOAL_LABELS, learning.learningGoal, 'General French');
  /* The level rises automatically when module finals are passed at 80%+. */
  const nextLevel = learning.nextLevel;
  const nextLevelValue = nextLevel
    ? `${nextLevel.label} · pass ${
        nextLevel.modulesLeft.length === 1 ? 'the final' : 'the finals'
      } of module${nextLevel.modulesLeft.length === 1 ? '' : 's'} ${nextLevel.modulesLeft.join(', ')}`
    : learning.frenchLevel === 'advanced'
      ? 'Top level reached 🎉'
      : null;
  const dailyTargetMinutes = learning.dailyTargetMinutes ?? 10;

  const contentTracked = content.tracked ?? 0;
  const contentCompleted = content.completed ?? 0;
  const averageScore = content.averageScore ?? 0;
  const bestScore = content.bestScore ?? 0;
  const starsEarned = content.starsEarned ?? 0;
  const completionRate = Math.min(
    Math.max(
      typeof content.completionRate === 'number'
        ? content.completionRate
        : (contentTracked ? contentCompleted / contentTracked : 0),
      0,
    ),
    1,
  );

  const recentActivity = Array.isArray(profile?.recentActivity) ? profile.recentActivity : [];

  const stats = [
    { id: 'xp', icon: '⭐', value: String(xp), label: 'Total score' },
    { id: 'coins', icon: '🪙', value: String(coins), label: 'Coins earned' },
    {
      id: 'streak',
      icon: '🔥',
      value: `${streak} ${streak === 1 ? 'day' : 'days'}`,
      label: `Best streak ${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`,
    },
    { id: 'hearts', icon: '❤️', value: `${hearts}/5`, label: 'Hearts available' },
    {
      id: 'grade',
      icon: '📝',
      value: `${overallGrade20 !== null && overallGrade20 !== undefined ? overallGrade20.toFixed(2) : '—'} / 20`,
      label: 'Average grade (0–20 scale)',
    },
  ];

  const planRows = [
    { id: 'daily', icon: '⏱️', label: 'Daily goal', value: `${dailyTargetMinutes} min / day` },
    { id: 'goal', icon: '🎯', label: 'Learning goal', value: learningGoalLabel },
    { id: 'level', icon: '📘', label: 'French level', value: frenchLevelLabel },
    ...(nextLevelValue ? [{ id: 'next-level', icon: '🎓', label: 'Next level', value: nextLevelValue }] : []),
    { id: 'lessons', icon: '✅', label: 'Lessons completed', value: String(lessonsCompleted) },
    { id: 'member', icon: '📅', label: 'Member since', value: formatMonthYear(user.memberSince) },
    { id: 'active', icon: '🕒', label: 'Last practice', value: formatDay(progress.lastActiveDate) },
    { id: 'timezone', icon: '🌍', label: 'Time zone', value: learning.timezone ?? 'UTC' },
  ];

  const actions = [
    {
      id: 'journey',
      icon: '🗺️',
      title: 'My journey',
      description: 'Continue your quest and unlock the next country.',
      onPress: () => router.push('/journey'),
    },
    {
      id: 'achievements',
      icon: '🏆',
      title: 'Achievements',
      description: 'Review badges, milestones, and your next goal.',
      onPress: () => router.push('/achievements'),
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: 'Settings',
      description: 'Adjust your daily goal, audio, and preferences.',
      onPress: () => router.push('/settings'),
    },
    {
      id: 'feedback',
      icon: '📝',
      title: 'Share your feedback',
      description: 'Tell us what you think of GamiFrench (10 quick questions).',
      onPress: () => router.push('/feedback'),
    },
    ...(session?.user?.role === 'teacher' || session?.user?.role === 'admin'
      ? [
          {
            id: 'learning-gain',
            icon: '📊',
            title: 'Class results',
            description: 'Pre-test versus post-test learning gain for your learners.',
            onPress: () => router.push('/learning-gain'),
          },
        ]
      : []),
  ];

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>We could not load your profile</Text>
          <Text style={styles.errorText}>{error || 'Please try again in a moment.'}</Text>
          <PrimaryButton onPress={handleRetry}>Try again</PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={reload}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        )}
      >
        <View style={styles.header}>
          {router.canGoBack?.() ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>‹ Back</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.pageTitle}>Profile</Text>
          <Text style={styles.pageSubtitle}>
            Your progress, learning plan, and account shortcuts in one place.
          </Text>
        </View>

        {isStale ? (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              Offline — showing the progress saved on this device. It will sync
              automatically when you reconnect.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* ============================== HERO ============================== */}
        <View style={styles.heroCard}>
          <View pointerEvents="none" style={styles.heroGlow} />

          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarEmoji}</Text>
            </View>
            <View style={styles.heroIdentity}>
              <Text style={styles.heroName} numberOfLines={1}>{displayName}</Text>
              {email ? (
                <Text style={styles.heroEmail} numberOfLines={1}>{email}</Text>
              ) : null}
              <View style={styles.chipRow}>
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipText}>🇫🇷 {frenchLevelLabel}</Text>
                </View>
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipText}>🎯 {learningGoalLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.levelHeader}>
            <Text style={styles.levelBadge}>Level {level}</Text>
            <Text style={styles.levelCaption}>
              {isMaxLevel ? 'Max level reached 🎉' : `${xpToNextLevel} XP to Level ${level + 1}`}
            </Text>
          </View>

          <View style={styles.heroTrack}>
            <View style={[styles.heroFill, { width: `${Math.round(levelProgress * 100)}%` }]} />
          </View>

          <Text style={styles.heroXpText}>
            {xp} XP earned · {isMaxLevel ? 'Legend status' : `band ${levelStartXp}–${nextLevelXp} XP`}
          </Text>
          <Text style={styles.heroStreakText}>
            🔥 {streak === 0
              ? 'Start a streak today'
              : `${streak}-day streak · best ${longestStreak} days`}
          </Text>
        </View>

        {/* ============================= STATS ============================== */}
        <View style={styles.statGrid}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ======================= PROGRESS BREAKDOWN ======================= */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📈 Progress breakdown</Text>

          <View style={styles.metricGrid}>
            <Metric label="Lessons done" value={lessonsCompleted} />
            <Metric
              label="Sub-lessons"
              value={contentTracked ? `${contentCompleted}/${contentTracked}` : contentCompleted}
            />
            <Metric label="Average score" value={`${averageScore}%`} />
            <Metric label="Stars earned" value={starsEarned} />
          </View>

          <ProgressLine
            label="Sub-lesson completion"
            value={completionRate}
            caption={`${Math.round(completionRate * 100)}% finished`}
          />
          <ProgressLine
            label="Quiz accuracy"
            value={averageScore / 100}
            caption={bestScore ? `Best score ${bestScore}%` : 'No scores yet'}
            tone="#10B981"
          />
        </View>

        {/* ========================== LEARNING PLAN ========================= */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎯 Learning plan</Text>
          {planRows.map((row, index) => (
            <View
              key={row.id}
              style={[styles.detailRow, index === planRows.length - 1 && styles.detailRowLast]}
            >
              <Text style={styles.detailIcon}>{row.icon}</Text>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* ========================= RECENT ACTIVITY ======================== */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🕒 Recent activity</Text>
          {recentActivity.length === 0 ? (
            <Text style={styles.emptyText}>
              Finish a sub-lesson and your latest scores will show up here.
            </Text>
          ) : (
            recentActivity.map((item, index) => {
              const details = describeContentKey(item.contentKey, item.moduleKey);

              return (
                <View
                  key={`${item.contentKey}-${index}`}
                  style={[
                    styles.activityRow,
                    index === recentActivity.length - 1 && styles.detailRowLast,
                  ]}
                >
                  <Text style={styles.activityIcon}>{details.icon}</Text>
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{details.title}</Text>
                    <Text style={styles.activityMeta} numberOfLines={1}>
                      {details.context} · {formatDay(item.completedAt)}
                    </Text>
                  </View>
                  <View style={styles.activityScore}>
                    <Text style={styles.activityScoreValue}>{item.bestScore ?? 0}%</Text>
                    <Text style={styles.activityStars}>{starsLabel(item.stars)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ========================== QUICK ACTIONS ========================= */}
        <Text style={styles.standaloneTitle}>⚡ Quick actions</Text>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            accessibilityRole="button"
            accessibilityLabel={action.title}
            activeOpacity={0.8}
            onPress={action.onPress}
            style={styles.actionRow}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.description}</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          activeOpacity={0.8}
          onPress={signOut}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ProgressLine({ label, value, caption, tone = '#2563EB' }) {
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;

  return (
    <View style={styles.progressLine}>
      <View style={styles.progressLineHeader}>
        <Text style={styles.progressLineLabel}>{label}</Text>
        <Text style={styles.progressLineCaption}>{caption}</Text>
      </View>
      <ProgressBar value={safeValue} color={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#58616E',
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
    color: '#58616E',
    lineHeight: 22,
    textAlign: 'center',
  },
  header: {
    marginBottom: 18,
  },
  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 10,
    marginBottom: 6,
  },
  backLinkText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
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
  errorBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#92400E',
    fontSize: 14,
    lineHeight: 20,
  },
  offlineBanner: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: '#1E3A8A',
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  heroGlow: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 34,
  },
  heroIdentity: {
    flex: 1,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  heroEmail: {
    marginTop: 3,
    color: '#DBEAFE',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  heroChipText: {
    color: '#EFF6FF',
    fontSize: 12,
    fontWeight: '600',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  levelBadge: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  levelCaption: {
    color: '#DBEAFE',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginTop: 10,
  },
  heroFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  heroXpText: {
    marginTop: 10,
    color: '#DBEAFE',
    fontSize: 13,
  },
  heroStreakText: {
    marginTop: 4,
    color: '#EFF6FF',
    fontSize: 13,
    fontWeight: '600',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    elevation: 3,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F3E8A',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#7B8CA0',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 14,
  },
  standaloneTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 26,
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  metric: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F3E8A',
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#7B8CA0',
  },
  progressLine: {
    marginTop: 16,
  },
  progressLineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLineLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  progressLineCaption: {
    fontSize: 13,
    color: '#64748B',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailIcon: {
    width: 26,
    marginRight: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  detailValue: {
    maxWidth: '50%',
    fontSize: 15,
    fontWeight: '700',
    color: '#1E3A8A',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  activityIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    paddingRight: 10,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  activityMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  activityScore: {
    alignItems: 'flex-end',
  },
  activityScoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  activityStars: {
    marginTop: 2,
    fontSize: 12,
    color: '#F59E0B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 26,
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
    lineHeight: 20,
  },
  actionChevron: {
    marginLeft: 8,
    fontSize: 24,
    color: '#94A3B8',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 4,
    alignItems: 'center',
    elevation: 3,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
});






