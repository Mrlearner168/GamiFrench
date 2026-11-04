import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, ProgressBar } from '@/components/game-ui';
import { getNextLearningTarget } from '@/data/lessons/nextTarget';
import { buildAchievementSummary } from '@/store/achievements';
import { useAuth } from '@/store/auth-context';
import {
  loadClaimedMissions,
  loadLastPlayedTopic,
  loadLessonProgress,
} from '@/store/lesson-progress';

/*
 * ---------------------------------------------------------------------------
 * ACHIEVEMENTS
 *
 * Everything on this screen comes from the device mirrors (store/achievements.js),
 * so it renders with no connection at all.
 *
 * The previous version called `GET /achievements`, which answers with
 * `'badges': [], 'nextGoal': None` - so it showed four number tiles and an empty
 * list, and failed outright when offline. Two of those tiles were also
 * misleading: the server never increments `streak`, and `lessons_completed`
 * only counts mission claims, so a learner who finished thirty sub-lessons read
 * 0.
 *
 * The screen is now ordered by how well each element motivates a return visit:
 *   1. momentum headline   - where the learner stands right now
 *   2. nearest goal        - the closest achievable win (near-miss motivation)
 *   3. today's challenges  - concrete short-term targets
 *   4. consistency strip   - shows a visible run worth protecting
 *   5. mastery split       - which skill needs work (actionable, not vanity)
 *   6. badges              - lifetime recognition
 *   7. recent wins         - proof of progress
 * ---------------------------------------------------------------------------
 */

/* ---------------------------------------------------------------------------
 * SMALL PRESENTATION PIECES
 * ------------------------------------------------------------------------- */

/* "3 / 10" style counter used on badge and challenge rows. */
function Counter({ value, target }) {
  return (
    <Text style={styles.counter}>
      {value} / {target}
    </Text>
  );
}

/*
 * One cell per day. Intensity grows with the number of sub-lessons finished, so
 * a hard streak is legible at a glance without reading any numbers.
 */
function ConsistencyStrip({ consistency }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>Consistency</Text>
        <Text style={styles.cardMeta}>
          {consistency.activeDays} of {consistency.totalDays} days
        </Text>
      </View>

      <View style={styles.stripRow}>
        {consistency.days.map((day) => {
          const intensity = Math.min(day.subLessons, 3);

          return (
            <View
              key={day.dateKey}
              accessibilityLabel={`${day.dateKey}: ${
                day.active ? `${day.subLessons} sub-lessons` : 'no activity'
              }`}
              style={[
                styles.stripCell,
                day.isToday && styles.stripCellToday,
                day.active && styles.stripCellActive[intensity - 1],
              ]}
            />
          );
        })}
      </View>

      <Text style={styles.cardFootnote}>
        {consistency.activeDays > 0
          ? 'Every cell is a day you showed up. Keep the row unbroken.'
          : 'Finish one activity today to light up your first cell.'}
      </Text>
    </View>
  );
}

/*
 * Quiz and speaking are reported separately because a single blended score is
 * not actionable: it tells the learner they are "average" but not which skill to
 * practise. Splitting it makes the next step obvious.
 */
function MasteryCard({ mastery }) {
  const rows = [
    { key: 'quiz', label: 'Quiz accuracy', value: mastery.quiz, tone: '#1577D4' },
    { key: 'speaking', label: 'Speaking', value: mastery.speaking, tone: '#10B981' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Skill mastery</Text>

      {rows.map((row) => (
        <View key={row.key} style={styles.masteryRow}>
          <View style={styles.masteryHeader}>
            <Text style={styles.masteryLabel}>{row.label}</Text>
            <Text style={styles.masteryValue}>
              {row.value === null ? '—' : `${row.value}%`}
            </Text>
          </View>

          {row.value === null ? (
            <Text style={styles.masteryEmpty}>Not measured yet</Text>
          ) : (
            <ProgressBar value={row.value / 100} color={row.tone} />
          )}
        </View>
      ))}

      {mastery.quiz !== null && mastery.speaking !== null ? (
        <Text style={styles.cardFootnote}>
          {mastery.speaking < mastery.quiz - 10
            ? 'Speaking is trailing your quiz — try a pronunciation check.'
            : mastery.quiz < mastery.speaking - 10
              ? 'Quiz is trailing your speaking — revisit the vocabulary.'
              : 'Both skills are tracking evenly. Keep both warm.'}
        </Text>
      ) : null}
    </View>
  );
}

function BadgeRow({ badge }) {
  const isEarned = badge.status === 'earned';
  const isLocked = badge.status === 'locked';

  return (
    <View
      style={[
        styles.badgeRow,
        isEarned && styles.badgeRowEarned,
        isLocked && styles.badgeRowLocked,
      ]}
    >
      <Text style={[styles.badgeIcon, isLocked && styles.badgeIconLocked]}>
        {badge.icon}
      </Text>

      <View style={styles.badgeBody}>
        <Text style={[styles.badgeTitle, isLocked && styles.badgeTitleLocked]}>
          {badge.title}
        </Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>

        {!isEarned ? (
          <View style={styles.badgeProgressBlock}>
            <ProgressBar
              value={badge.progress / Math.max(badge.target, 1)}
              color={isLocked ? '#B6C2D2' : '#1577D4'}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.badgeSide}>
        {isEarned ? (
          <Text style={styles.badgeEarnedMark}>✓</Text>
        ) : (
          <Counter value={badge.progress} target={badge.target} />
        )}
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------------------
 * SCREEN
 * ------------------------------------------------------------------------- */
export default function Achievements() {
  const { authenticatedRequest } = useAuth();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  /*
   * Reload on focus so a badge earned in a lesson shows up the moment the
   * learner navigates back, exactly like the profile screen.
   *
   * The summary is built from the device mirrors, so this succeeds offline; the
   * only server call (the streak) quietly falls back to the device copy when it
   * fails. The error state is therefore only reachable if
   * local storage itself fails, which is a genuinely different problem from
   * "no connection" and deserves its own message.
   */
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          // The server streak is preferred; offline the device copy is used.
          const serverStreak = await authenticatedRequest('/progress')
            .then((data) => ({ streak: data?.streak, longestStreak: data?.longestStreak }))
            .catch(() => null);
          const next = await buildAchievementSummary({ serverStreak });
          if (!active) return;

          setSummary(next);
          setError('');
        } catch (err) {
          if (!active) return;
          console.log('[Achievements] failed to build the summary', err);
          setError('Could not read your saved progress on this device.');
        } finally {
          if (active) setIsLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [authenticatedRequest])
  );

  /*
 * Where a goal should send the learner.
 *
 * Mirrors `buildChallengeRoute` in challenge.jsx: the goal's `cta` decides the
 * destination, and every route falls back to the topic list when there is no
 * specific target, so "Start" can never open an empty screen.
 */
function buildNearestRoute(goal, target) {
  const country = target?.country ?? 'Canada';
  const moduleId = target?.moduleId ?? 'module-1';

  const lessonRoute = () => router.push('/lesson', { country, module: moduleId });

  switch (goal?.cta) {
    case 'mission':
      return router.push('/mission', {
        missionId: target?.missionId ?? 'mission-1',
        country,
      });

    case 'journey':
      return router.push('/journey', {
        missionId: target?.missionId ?? 'mission-1',
        country,
      });

    case 'lesson':
      return lessonRoute();

    case 'sublesson':
    default:
      if (target?.topicId) {
        return router.push({
          pathname: '/sublesson',
          params: {
            country,
            module: moduleId,
            topicId: target.topicId,
            subLessonIndex: String(target.subLessonIndex ?? 0),
          },
        });
      }

      return lessonRoute();
  }
}

/*
 * Deep-links into the exact content that moves the nearest goal forward.
 *
 * PARAM NAMES MATTER: SubLessonScreen destructures exactly `topicId` and
 * `subLessonIndex` (see sublesson.jsx `useLocalSearchParams`). Sending `topic`
 * / `subLesson` / `index` instead silently left both undefined, so the screen
 * fell back to `Canada` / index 0 and opened an empty topic.
 */
  const startNearest = useCallback(
    async (goal) => {
      const [progress, claimedMissions, lastPlayedTopic] = await Promise.all([
        loadLessonProgress(),
        loadClaimedMissions(),
        loadLastPlayedTopic(),
      ]);

      const target = getNextLearningTarget({
        lessonProgress: progress,
        claimedMissions,
        lastPlayedTopic,
      });

      buildNearestRoute(goal, target);
    },
    []
  );

/*
 * The header is repeated in the loading and empty states so the back button is
 * always reachable: a screen that traps the learner while it loads is worse than
 * one that shows an empty state. This mirrors challenge.jsx.
 */
const HEADER_PROPS = {
  back: true,
  eyebrow: 'Your progress',
  title: 'Achievements',
  subtitle: 'Milestones, streaks, and what to reach next.',
};

if (isLoading) {
  return (
    <SafeAreaView style={styles.container}>
      <GameHeader {...HEADER_PROPS} />
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1577D4" />
        <Text style={styles.loadingText}>Reading your progress…</Text>
      </View>
    </SafeAreaView>
  );
}

if (!summary) {
  return (
    <SafeAreaView style={styles.container}>
      <GameHeader {...HEADER_PROPS} />
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>🗂️</Text>
        <Text style={styles.emptyTitle}>No progress on this device yet</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <Text style={styles.emptyHint}>
          Finish a sub-lesson and your milestones will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

  const { headline, nearest, badges } = summary;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GameHeader {...HEADER_PROPS} />

        {/* ========================= MOMENTUM ========================= */}
        <View
          style={[
            styles.headlineCard,
            headline.tone === 'positive' && styles.headlineCardPositive,
          ]}
        >
          <Text style={styles.headlineIcon}>{headline.icon}</Text>
          <Text style={styles.headlineTitle}>{headline.title}</Text>
          <Text style={styles.headlineDetail}>{headline.detail}</Text>
        </View>

        {/* ======================== NEAREST GOAL ======================== */}
        {nearest ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardEyebrow}>Closest to unlocking</Text>
              <Text style={styles.cardMeta}>{nearest.percent}%</Text>
            </View>

            <View style={styles.nearestRow}>
              <Text style={styles.nearestIcon}>{nearest.icon}</Text>
              <View style={styles.nearestBody}>
                <Text style={styles.nearestTitle}>{nearest.title}</Text>
                <Text style={styles.nearestDescription}>{nearest.description}</Text>
              </View>
            </View>

            <View style={styles.nearestProgressBlock}>
              <ProgressBar value={nearest.percent / 100} color="#10B981" />
              <Text style={styles.nearestProgressText}>
                {nearest.remaining > 0
                  ? `${nearest.remaining} to go · ${nearest.progress}/${nearest.target}`
                  : 'Ready to claim'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Start ${nearest.title}`}
              onPress={() => startNearest(nearest)}
              style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>Nothing within reach</Text>
            <Text style={styles.emptyHint}>
              Every milestone in view is still far off. Keep practising and the
              closest one will appear here.
            </Text>
          </View>
        )}

{/* ==================== TODAY'S CHALLENGES ==================== */}
        {summary.dailyChallenges.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Today&apos;s challenges</Text>
              <Text style={styles.cardMeta}>
                {summary.dailyChallenges.filter((item) => item.progress.completed).length}/
                {summary.dailyChallenges.length}
              </Text>
            </View>

            {summary.dailyChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeRow}>
                <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                <View style={styles.challengeBody}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <ProgressBar
                    value={challenge.progress.value / challenge.progress.target}
                    color={challenge.progress.completed ? '#10B981' : '#1577D4'}
                  />
                </View>
                {challenge.progress.completed ? (
                  <Text style={styles.badgeEarnedMark}>✓</Text>
                ) : (
                  <Counter
                    value={challenge.progress.value}
                    target={challenge.progress.target}
                  />
                )}
              </View>
            ))}
          </View>
        ) : null}

        {/* ======================== CONSISTENCY ======================== */}
        <ConsistencyStrip consistency={summary.consistency} />

        {/* ========================== MASTERY ========================== */}
        <MasteryCard mastery={summary.mastery} />

        {/* =========================== BADGES =========================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Badges</Text>
            <Text style={styles.cardMeta}>
              {summary.earnedBadgeCount} of {badges.length}
            </Text>
          </View>

          {badges.map((badge) => (
            <BadgeRow key={badge.key} badge={badge} />
          ))}
        </View>

        {/* ======================== RECENT WINS ======================== */}
        {summary.recentWins.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Recent wins</Text>
              {summary.performance?.average !== null &&
              summary.performance?.average !== undefined ? (
                <Text style={styles.cardMeta}>
                  avg {summary.performance.average}%
                </Text>
              ) : null}
            </View>

            {/*
              The headline percentage: the learner's average across everything
              they have finished. It gives the three scores below a baseline, so
              each one can be read as above or below their own usual standard.
            */}
            {summary.performance?.comparable &&
            summary.performance?.average !== null ? (
              <View style={styles.performanceStrip}>
                <Text style={styles.performanceStripValue}>
                  {summary.performance.average}%
                </Text>
                <Text style={styles.performanceStripLabel}>
                  your average across {summary.performance.sampleSize} finished
                  sub-lessons · best {summary.performance.best}%
                </Text>
              </View>
            ) : null}

            {summary.recentWins.map((win) => (
              <View key={win.contentKey} style={styles.winRow}>
                <Text style={styles.winIcon}>{win.icon}</Text>
                <View style={styles.winBody}>
                  <Text style={styles.winTitle}>{win.title}</Text>
                  {win.context ? (
                    <Text style={styles.winContext}>{win.context}</Text>
                  ) : null}

                  {win.isPersonalBest ? (
                    <View style={styles.personalBestChip}>
                      <Text style={styles.personalBestText}>🏅 Personal best</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.winScore}>
                  <Text style={styles.winScoreValue}>{win.score}%</Text>

                  {win.delta === null || win.delta === undefined ? null : win.delta === 0 ? (
                    <Text style={styles.winDeltaFlat}>on par</Text>
                  ) : (
                    <Text
                      style={[
                        styles.winDelta,
                        win.delta > 0 ? styles.winDeltaUp : styles.winDeltaDown,
                      ]}
                    >
                      {win.delta > 0 ? '▲' : '▼'} {Math.abs(win.delta)} vs avg
                    </Text>
                  )}

                  <Text style={styles.winStars}>
                    {'★'.repeat(win.stars)}
                    {'☆'.repeat(3 - win.stars)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// __TAIL__

/* ---------------------------------------------------------------------------
 * STYLES
 *
 * Palette follows challenge.jsx (the closest sibling screen) so the two read as
 * one family: white cards on #F5F7FA, #1577D4 primary, #10B981 success.
 * ------------------------------------------------------------------------- */
const COLORS = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  primary: '#1577D4',
  success: '#10B981',
  text: '#182133',
  muted: '#667085',
  border: '#E3E9F2',
  subtle: '#8491A3',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* ---------------------------- loading / empty ---------------------------- */
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: COLORS.muted,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
  },
  emptyHint: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.subtle,
  },

  /* ------------------------------- headline ------------------------------- */
  headlineCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  headlineCardPositive: {
    backgroundColor: '#FFF8E6',
    borderColor: '#F6D68A',
  },
  headlineIcon: {
    fontSize: 30,
  },
  headlineTitle: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  headlineDetail: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.muted,
  },

  /* --------------------------------- cards --------------------------------- */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.primary,
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subtle,
  },
  cardFootnote: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.subtle,
  },

  /* ------------------------------ nearest goal ----------------------------- */
  nearestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearestIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  nearestBody: {
    flex: 1,
  },
  nearestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  nearestDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.muted,
  },
  nearestProgressBlock: {
    marginTop: 14,
  },
  nearestProgressText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  startButton: {
    marginTop: 14,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },

  /* ------------------------------- challenges ------------------------------ */
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  challengeIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  challengeBody: {
    flex: 1,
    paddingRight: 10,
    gap: 6,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* ------------------------------- consistency ----------------------------- */
  stripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 3,
  },
  stripCell: {
    flex: 1,
    height: 34,
    borderRadius: 5,
    backgroundColor: '#EDF1F7',
  },
  stripCellToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  stripCellActive: [
    { backgroundColor: '#BFE0FF' },
    { backgroundColor: '#7FC0F5' },
    { backgroundColor: COLORS.primary },
  ],

  /* --------------------------------- mastery -------------------------------- */
  masteryRow: {
    marginBottom: 14,
  },
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  masteryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  masteryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  masteryEmpty: {
    fontSize: 13,
    color: COLORS.subtle,
  },

  /* ---------------------------------- badges -------------------------------- */
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  badgeRowEarned: {
    backgroundColor: '#F3FDF7',
    borderRadius: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
  },
  badgeRowLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeBody: {
    flex: 1,
    paddingRight: 10,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  badgeTitleLocked: {
    color: COLORS.subtle,
  },
  badgeDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
  },
  badgeProgressBlock: {
    marginTop: 8,
  },
  badgeSide: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  badgeEarnedMark: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.success,
  },

  /* -------------------------------- recent wins ----------------------------- */

  /*
   * The performance baseline. It sits above the individual scores so a learner
   * reads "78% - 12 vs avg" rather than two unrelated numbers.
   */
  performanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F7FD',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  performanceStripValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 10,
  },
  performanceStripLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
  },
  personalBestChip: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  personalBestText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  winRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  winIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  winBody: {
    flex: 1,
    paddingRight: 10,
  },
  winTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  winContext: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.muted,
  },
  winScore: {
    alignItems: 'flex-end',
  },
  winScoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.success,
  },
  winDelta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
  },
  winDeltaUp: {
    color: COLORS.success,
  },
  winDeltaDown: {
    color: '#C2410C',
  },
  winDeltaFlat: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.subtle,
  },
  winStars: {
    marginTop: 2,
    fontSize: 12,
    color: '#F59E0B',
  },

  error: {
    color: '#B42318',
    fontSize: 14,
    textAlign: 'center',
  },
});
