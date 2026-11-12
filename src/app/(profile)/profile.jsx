import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/game-ui';
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
  // The backend stores the average on the French 0-20 scale; present it as a
  // two-decimal percentage out of 100 (80.00 = pass, 100.00 = excellent).
  const overallGrade100 = ((Number(progress.overallAverageGrade20) || 0) * 5).toFixed(2);

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

  const highlights = [
    { id: 'xp', icon: '⭐', tint: '#FEF3C7', value: String(xp), label: 'Total XP' },
    {
      id: 'grade',
      icon: '📝',
      tint: '#EDE9FE',
      value: overallGrade100,
      suffix: '%',
      label: 'Avg grade',
    },
    { id: 'lessons', icon: '✅', tint: '#DCFCE7', value: String(lessonsCompleted), label: 'Lessons done' },
    { id: 'stars', icon: '🌟', tint: '#FFEDD5', value: String(starsEarned), label: 'Stars earned' },
  ];

  const planRows = [
    { id: 'daily', icon: '⏱️', tint: '#DBEAFE', label: 'Daily goal', value: `${dailyTargetMinutes} min / day` },
    { id: 'goal', icon: '🎯', tint: '#FCE7F3', label: 'Learning goal', value: learningGoalLabel },
    { id: 'level', icon: '📘', tint: '#E0E7FF', label: 'French level', value: frenchLevelLabel },
    ...(nextLevelValue
      ? [{ id: 'next-level', icon: '🎓', tint: '#FEF3C7', label: 'Next level', value: nextLevelValue, stacked: true }]
      : []),
    { id: 'member', icon: '📅', tint: '#DCFCE7', label: 'Member since', value: formatMonthYear(user.memberSince) },
    { id: 'active', icon: '🕒', tint: '#F1F5F9', label: 'Last practice', value: formatDay(progress.lastActiveDate) },
    { id: 'timezone', icon: '🌍', tint: '#CCFBF1', label: 'Time zone', value: learning.timezone ?? 'UTC' },
  ];

  const actions = [
    {
      id: 'journey',
      icon: '🗺️',
      tint: '#DBEAFE',
      title: 'My journey',
      description: 'Continue your quest',
      onPress: () => router.push('/journey'),
    },
    {
      id: 'achievements',
      icon: '🏆',
      tint: '#FEF3C7',
      title: 'Achievements',
      description: 'Badges & milestones',
      onPress: () => router.push('/achievements'),
    },
    {
      id: 'settings',
      icon: '⚙️',
      tint: '#F1F5F9',
      title: 'Settings',
      description: 'Goal, audio & more',
      onPress: () => router.push('/settings'),
    },
    {
      id: 'feedback',
      icon: '💬',
      tint: '#FCE7F3',
      title: 'Feedback',
      description: '10 quick questions',
      onPress: () => router.push('/feedback'),
    },
    ...(session?.user?.role === 'teacher' || session?.user?.role === 'admin'
      ? [
          {
            id: 'learning-gain',
            icon: '📊',
            tint: '#DCFCE7',
            title: 'Class results',
            description: 'Pre vs post-test gain',
            onPress: () => router.push('/learning-gain'),
          },
        ]
      : []),
  ];

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BRAND} />
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

  const canGoBack = router.canGoBack?.();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={reload}
            tintColor={BRAND}
            colors={[BRAND]}
          />
        )}
      >
        {/* ============================ TOP BAR ============================= */}
        <View style={styles.topBar}>
          {canGoBack ? (
            <IconButton icon="‹" label="Go back" onPress={() => router.back()} large />
          ) : (
            <View style={styles.iconButtonSpacer} />
          )}
          <Text style={styles.topBarTitle}>Profile</Text>
          <IconButton icon="⚙️" label="Settings" onPress={() => router.push('/settings')} />
        </View>

        {isStale ? (
          <View style={[styles.banner, styles.bannerOffline]}>
            <Text style={styles.bannerIcon}>📴</Text>
            <Text style={[styles.bannerText, styles.bannerOfflineText]}>
              Offline — showing the progress saved on this device. It syncs when you reconnect.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.banner, styles.bannerError]}>
            <Text style={styles.bannerIcon}>⚠️</Text>
            <Text style={[styles.bannerText, styles.bannerErrorText]}>{error}</Text>
          </View>
        ) : null}

        {/* ============================== HERO ============================== */}
        <View style={styles.hero}>
          <View pointerEvents="none" style={[styles.heroBubble, styles.heroBubbleA]} />
          <View pointerEvents="none" style={[styles.heroBubble, styles.heroBubbleB]} />
          <View pointerEvents="none" style={[styles.heroBubble, styles.heroBubbleC]} />

          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarEmoji}</Text>
              </View>
            </View>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>LV {level}</Text>
            </View>
          </View>

          <Text style={styles.heroName} numberOfLines={1}>{displayName}</Text>
          {email ? <Text style={styles.heroEmail} numberOfLines={1}>{email}</Text> : null}

          <View style={styles.chipRow}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>🇫🇷 {frenchLevelLabel}</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText} numberOfLines={1}>🎯 {learningGoalLabel}</Text>
            </View>
          </View>

          <View style={styles.xpBox}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLevel}>Level {level}</Text>
              <Text style={styles.xpValue}>{xp} XP</Text>
            </View>
            <View
              style={styles.xpTrack}
              accessibilityRole="progressbar"
              accessibilityLabel={`Level ${level}, ${Math.round(levelProgress * 100)} percent to the next level`}
            >
              <View style={[styles.xpFill, { width: `${Math.round(levelProgress * 100)}%` }]} />
            </View>
            <Text style={styles.xpCaption}>
              {isMaxLevel ? 'Max level reached 🎉' : `${xpToNextLevel} XP to Level ${level + 1}`}
            </Text>
          </View>

          <View style={styles.heroStats}>
            <HeroStat
              icon="🔥"
              value={streak}
              label={streak === 1 ? 'day streak' : 'day streak'}
              hint={`Best ${longestStreak}`}
            />
            <View style={styles.heroStatDivider} />
            <HeroStat icon="🪙" value={coins} label="coins" />
            <View style={styles.heroStatDivider} />
            <HeroStat icon="❤️" value={`${hearts}/5`} label="hearts" />
          </View>
        </View>

        {/* =========================== HIGHLIGHTS =========================== */}
        <View style={styles.tileGrid}>
          {highlights.map((item) => (
            <View key={item.id} style={[styles.tile, styles.tileCompact]}>
              <View style={[styles.tileIcon, styles.tileIconCompact, { backgroundColor: item.tint }]}>
                <Text style={styles.tileIconText}>{item.icon}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.tileValue} numberOfLines={1}>
                  {item.value}
                  {item.suffix ? <Text style={styles.tileSuffix}>{item.suffix}</Text> : null}
                </Text>
                <Text style={styles.tileLabel} numberOfLines={1}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ============================ PROGRESS ============================ */}
        <SectionHeader title="Progress" />
        <View style={styles.card}>
          <View style={styles.metricRow}>
            <Metric
              label="Sub-lessons"
              value={contentTracked ? `${contentCompleted}/${contentTracked}` : contentCompleted}
            />
            <View style={styles.metricDivider} />
            <Metric label="Avg score" value={`${averageScore}%`} />
            <View style={styles.metricDivider} />
            <Metric label="Best score" value={bestScore ? `${bestScore}%` : '—'} />
          </View>

          <ProgressLine
            label="Sub-lesson completion"
            value={completionRate}
            caption={`${Math.round(completionRate * 100)}%`}
          />
          <ProgressLine
            label="Quiz accuracy"
            value={averageScore / 100}
            caption={`${averageScore}%`}
            tone="#10B981"
          />
        </View>

        {/* ========================== LEARNING PLAN ========================= */}
        <SectionHeader title="Learning plan" />
        <View style={[styles.card, styles.listCard]}>
          {planRows.map((row, index) => (
            <View
              key={row.id}
              style={[styles.listRow, index === planRows.length - 1 && styles.listRowLast]}
            >
              <View style={[styles.rowIcon, { backgroundColor: row.tint }]}>
                <Text style={styles.rowIconText}>{row.icon}</Text>
              </View>
              {row.stacked ? (
                <View style={styles.rowBody}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowStackedValue}>{row.value}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowValue} numberOfLines={2}>{row.value}</Text>
                </>
              )}
            </View>
          ))}
        </View>

        {/* ========================= RECENT ACTIVITY ======================== */}
        <SectionHeader title="Recent activity" />
        <View style={[styles.card, styles.listCard]}>
          {recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>
                Finish a sub-lesson and your latest scores will show up here.
              </Text>
            </View>
          ) : (
            recentActivity.map((item, index) => {
              const details = describeContentKey(item.contentKey, item.moduleKey);
              const score = Number(item.bestScore ?? 0);

              return (
                <View
                  key={`${item.contentKey}-${index}`}
                  style={[styles.listRow, index === recentActivity.length - 1 && styles.listRowLast]}
                >
                  <View style={[styles.rowIcon, styles.activityIconTile]}>
                    <Text style={styles.rowIconText}>{details.icon}</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{details.title}</Text>
                    <Text style={styles.activityMeta} numberOfLines={1}>
                      {details.context} · {formatDay(item.completedAt)}
                    </Text>
                  </View>
                  <View style={styles.activityScore}>
                    <View style={[styles.scorePill, scorePillStyle(score)]}>
                      <Text style={[styles.scorePillText, scorePillTextStyle(score)]}>{score}%</Text>
                    </View>
                    <Text style={styles.activityStars}>{starsLabel(item.stars)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ============================ SHORTCUTS =========================== */}
        <SectionHeader title="Shortcuts" />
        <View style={styles.tileGrid}>
          {actions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              onPress={action.onPress}
              style={({ pressed }) => [styles.tile, styles.actionTile, pressed && styles.pressed]}
            >
              <View style={[styles.tileIcon, { backgroundColor: action.tint }]}>
                <Text style={styles.tileIconText}>{action.icon}</Text>
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle} numberOfLines={1}>{action.description}</Text>
              <Text style={styles.actionArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={signOut}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
        >
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </Pressable>

        <Text style={styles.footer}>GamiFrench · member since {formatMonthYear(user.memberSince)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Green from 80% (the pass mark), amber from 50%, red below. */
function scorePillStyle(score) {
  if (score >= 80) return styles.scorePillGood;
  if (score >= 50) return styles.scorePillOk;
  return styles.scorePillLow;
}

function scorePillTextStyle(score) {
  if (score >= 80) return styles.scorePillGoodText;
  if (score >= 50) return styles.scorePillOkText;
  return styles.scorePillLowText;
}

function IconButton({ icon, label, onPress, large = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Text style={large ? styles.iconButtonTextLarge : styles.iconButtonText}>{icon}</Text>
    </Pressable>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function HeroStat({ icon, value, label, hint }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>
        {icon} {value}
      </Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
      {hint ? <Text style={styles.heroStatHint}>{hint}</Text> : null}
    </View>
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

function ProgressLine({ label, value, caption, tone = BRAND }) {
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;

  return (
    <View style={styles.progressLine}>
      <View style={styles.progressLineHeader}>
        <Text style={styles.progressLineLabel}>{label}</Text>
        <Text style={[styles.progressLineCaption, { color: tone }]}>{caption}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(safeValue * 100)}%`, backgroundColor: tone }]} />
      </View>
    </View>
  );
}

const BRAND = '#1476D4';
const INK = '#0F172A';
const MUTED = '#64748B';
const SURFACE = '#FFFFFF';
const BACKGROUND = '#F3F6FB';

const cardShadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 2,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 14, fontSize: 15, color: MUTED },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle: { fontSize: 20, fontWeight: '800', color: INK, textAlign: 'center' },
  errorText: { fontSize: 15, color: MUTED, textAlign: 'center', marginTop: 8, marginBottom: 20, lineHeight: 22 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  /* Top bar */
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  topBarTitle: { fontSize: 18, fontWeight: '800', color: INK },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  iconButtonSpacer: { width: 42, height: 42 },
  iconButtonText: { fontSize: 18 },
  iconButtonTextLarge: { fontSize: 28, lineHeight: 30, color: INK, fontWeight: '600', marginTop: -2 },

  /* Banners */
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, padding: 14, marginBottom: 14 },
  bannerIcon: { fontSize: 16, lineHeight: 20 },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  bannerOffline: { backgroundColor: '#FFF7E6' },
  bannerOfflineText: { color: '#8A5A00' },
  bannerError: { backgroundColor: '#FEF2F2' },
  bannerErrorText: { color: '#B42318' },

  /* Hero */
  hero: {
    backgroundColor: BRAND,
    borderRadius: 28,
    paddingTop: 26,
    paddingHorizontal: 20,
    paddingBottom: 18,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 8,
  },
  heroBubble: { position: 'absolute', borderRadius: 999 },
  heroBubbleA: { width: 240, height: 240, top: -110, right: -70, backgroundColor: 'rgba(99,102,241,0.55)' },
  heroBubbleB: { width: 180, height: 180, bottom: -70, left: -60, backgroundColor: 'rgba(56,189,248,0.35)' },
  heroBubbleC: { width: 70, height: 70, top: 40, left: 26, backgroundColor: 'rgba(255,255,255,0.08)' },

  avatarWrap: { alignItems: 'center', marginBottom: 12 },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  avatar: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 50 },
  levelPill: {
    marginTop: -14,
    backgroundColor: '#FACC15',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 3,
    borderColor: BRAND,
  },
  levelPillText: { fontSize: 12, fontWeight: '900', color: '#422006', letterSpacing: 0.5 },

  heroName: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', maxWidth: '100%' },
  heroEmail: { fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 2, maxWidth: '100%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  heroChipText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  xpBox: {
    alignSelf: 'stretch',
    marginTop: 18,
    backgroundColor: 'rgba(15,23,42,0.18)',
    borderRadius: 18,
    padding: 14,
  },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  xpLevel: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  xpValue: { color: '#FDE68A', fontSize: 15, fontWeight: '900' },
  xpTrack: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 5, backgroundColor: '#FACC15' },
  xpCaption: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', marginTop: 8 },

  heroStats: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.25)' },
  heroStatValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  heroStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  heroStatHint: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 1 },

  /* Tiles (highlights + shortcuts) */
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 16 },
  tile: {
    width: '48.3%',
    backgroundColor: SURFACE,
    borderRadius: 22,
    padding: 16,
    ...cardShadow,
  },
  tileIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  tileIconText: { fontSize: 20 },
  tileCompact: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  tileIconCompact: { marginBottom: 0 },
  tileValue: { fontSize: 22, fontWeight: '900', color: INK },
  tileSuffix: { fontSize: 14, fontWeight: '700', color: MUTED },
  tileLabel: { fontSize: 13, color: MUTED, fontWeight: '600', marginTop: 2 },

  actionTile: { minHeight: 132 },
  actionTitle: { fontSize: 15, fontWeight: '800', color: INK },
  actionSubtitle: { fontSize: 12, color: MUTED, marginTop: 3 },
  actionArrow: { position: 'absolute', top: 16, right: 16, fontSize: 16, color: '#94A3B8', fontWeight: '700' },

  /* Sections */
  sectionTitle: { fontSize: 18, fontWeight: '900', color: INK, marginTop: 26, marginBottom: 10, marginLeft: 4 },
  card: { backgroundColor: SURFACE, borderRadius: 22, padding: 18, ...cardShadow },
  listCard: { paddingVertical: 6 },

  metricRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metric: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, height: 32, backgroundColor: '#E2E8F0' },
  metricValue: { fontSize: 20, fontWeight: '900', color: INK },
  metricLabel: { fontSize: 12, color: MUTED, fontWeight: '600', marginTop: 2 },

  progressLine: { marginTop: 16 },
  progressLineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLineLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  progressLineCaption: { fontSize: 14, fontWeight: '800' },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: '#EEF2F7', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },

  /* List rows */
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  listRowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowIconText: { fontSize: 18 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#334155', flexShrink: 0 },
  rowValue: { flex: 1, fontSize: 14, fontWeight: '700', color: INK, textAlign: 'right' },
  rowStackedValue: { fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 18 },

  activityIconTile: { backgroundColor: '#EFF6FF' },
  activityTitle: { fontSize: 15, fontWeight: '800', color: INK },
  activityMeta: { fontSize: 12, color: MUTED, marginTop: 2 },
  activityScore: { alignItems: 'flex-end', gap: 4 },
  scorePill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  scorePillText: { fontSize: 13, fontWeight: '900' },
  scorePillGood: { backgroundColor: '#DCFCE7' },
  scorePillGoodText: { color: '#15803D' },
  scorePillOk: { backgroundColor: '#FEF3C7' },
  scorePillOkText: { color: '#B45309' },
  scorePillLow: { backgroundColor: '#FEE2E2' },
  scorePillLowText: { color: '#B91C1C' },
  activityStars: { fontSize: 12, color: '#F59E0B', letterSpacing: 1 },

  emptyState: { alignItems: 'center', paddingVertical: 18, gap: 8 },
  emptyIcon: { fontSize: 32 },
  emptyText: { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },

  /* Sign out + footer */
  signOutButton: {
    marginTop: 28,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  signOutButtonText: { color: '#DC2626', fontSize: 16, fontWeight: '800' },
  footer: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 18 },
});
