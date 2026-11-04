import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChestOpening, ChestWiggle } from '@/components/chest-opening';
import { GameHeader, ProgressBar } from '@/components/game-ui';
import {
  CHALLENGE_TIERS,
  formatDateLabel,
  getChallengeBandLabel,
  getChallengeCycle,
  getWeekEndLabel,
  toDateKey,
} from '@/data/challenges/challengeCatalog';
import {
  getDailyModuleChallenge,
  resolveModuleChallengeProgress,
} from '@/data/challenges/moduleDailyChallenge';
import {
  buildChallengeGate,
  clampRouteToGate,
} from '@/data/challenges/moduleGate';
import { getWeakTopics, weakTopicRoute } from '@/data/challenges/weakTopics';
import { getNextLearningTarget } from '@/data/lessons/nextTarget';
import { useDailyResetTimer, useWeeklyResetTimer } from '@/hooks/use-challenge-timer';
import { useAuth } from '@/store/auth-context';
import { sounds } from '@/services/sound';
import {
  buildDailyOverview,
  buildWeeklyOverview,
  claimChallengeReward,
  getPinnedSpotlightTopic,
  isRewardClaimed,
  loadChallengeState,
  mergeServerChallengeClaims,
  pinSpotlightTopic,
  syncDailyCompletion,
} from '@/store/challenge-progress';
import { getStartupAssessment } from '@/store/profile-cache';
import {
  applyServerProgress,
  claimedMissionsFromServer,
  loadClaimedMissions,
  loadLastPlayedTopic,
  loadLessonProgress,
  loadModuleQuizResults,
  mergeClaimedMissions,
} from '@/store/lesson-progress';

/*
|--------------------------------------------------------------------------
| DAILY CHALLENGE SCREEN
|--------------------------------------------------------------------------
| Three challenges are assigned every day (see
| src/data/challenges/challengeCatalog.js) and one weekly goal runs from
| Monday to Sunday. Progress is tracked from real gameplay by
| src/store/challenge-progress.js, so this screen only renders what the
| player actually did.
|--------------------------------------------------------------------------
*/

const PROGRESS_COUNTRY = 'Canada';

/* Re-check the calendar every 30s so the screen rolls over at midnight. */
const DAY_ROLLOVER_CHECK_MS = 30000;

const COLORS = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  primary: '#1577D4',
  primaryDark: '#0F5AA5',
  text: '#182133',
  muted: '#667085',
  border: '#E3E9F2',
  success: '#10B981',
  successDark: '#047857',
  successSoft: '#DCFCE7',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  warningText: '#B45309',
};

/*
 * Where a challenge sends the player. Every target comes from the shared
 * course navigation helper, so "Start" always opens real content.
 */
function buildChallengeRoute(challenge, target, weakTopic = null) {
  const country = target?.country ?? PROGRESS_COUNTRY;
  const moduleId = target?.moduleId ?? 'module-1';

  switch (challenge?.cta) {
    case 'weak-topic':
      // The learner's weakest topic; with none, the next lesson to learn.
      return (
        weakTopicRoute(weakTopic) ?? {
          pathname: '/lesson',
          params: { country, module: moduleId },
        }
      );

    case 'lesson':
      return { pathname: '/lesson', params: { country, module: moduleId } };

    case 'mission':
      return {
        pathname: '/mission',
        params: {
          missionId: target?.missionId ?? 'mission-1',
          country,
        },
      };

    case 'journey':
      return {
        pathname: '/journey',
        params: {
          missionId: target?.missionId ?? 'mission-1',
          country,
        },
      };

    case 'sublesson':
    default:
      if (target?.topicId) {
        return {
          pathname: '/sublesson',
          params: {
            country,
            module: moduleId,
            topicId: target.topicId,
            subLessonIndex: String(target.subLessonIndex ?? 0),
          },
        };
      }

      return { pathname: '/lesson', params: { country, module: moduleId } };
  }
}

/* "+60 XP" / "+25 🪙" chips used on cards and chests. */
function RewardChips({ rewards, compact = false }) {
  return (
    <View style={styles.rewardRow}>
      <View style={[styles.rewardChip, compact && styles.rewardChipCompact]}>
        <Text style={styles.rewardText}>+{rewards?.xp ?? 0} XP</Text>
      </View>
      <View style={[styles.rewardChip, compact && styles.rewardChipCompact]}>
        <Text style={styles.rewardText}>+{rewards?.coins ?? 0} 🪙</Text>
      </View>
    </View>
  );
}

function StatusPill({ claimed, completed }) {
  if (claimed) {
    return (
      <View style={[styles.statusPill, styles.statusPillClaimed]}>
        <Text style={[styles.statusPillText, styles.statusPillTextClaimed]}>
          ✓ Collected
        </Text>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={[styles.statusPill, styles.statusPillComplete]}>
        <Text style={[styles.statusPillText, styles.statusPillTextComplete]}>
          Ready to collect
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusPillText}>In progress</Text>
    </View>
  );
}

/* One assigned objective with its live progress and its action button. */
function ChallengeCard({ challenge, onStart, onCollect }) {
  const progress = challenge.progress;
  const isWeekly = challenge.tier === CHALLENGE_TIERS.WEEKLY;
  const isReady = Boolean(progress?.completed) && !challenge.claimed;
  const ratio = Math.min(1, (Number(progress?.percent) || 0) / 100);

  return (
    <View
      style={[
        styles.challengeCard,
        isReady && styles.challengeCardReady,
        challenge.claimed && styles.challengeCardClaimed,
      ]}
    >
      <View style={styles.challengeHeader}>
        <View style={[styles.iconBubble, isReady && styles.iconBubbleReady]}>
          <Text style={styles.iconText}>{challenge.icon}</Text>
        </View>

        <View style={styles.challengeHeading}>
          <View style={styles.challengeMetaRow}>
            <Text style={styles.categoryChip}>
              {isWeekly
                ? challenge.category
                : getChallengeBandLabel(challenge.difficulty)}
            </Text>
            {!isWeekly ? (
              <Text style={styles.categorySub}>{challenge.category}</Text>
            ) : null}
          </View>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>
            {challenge.description}
          </Text>
        </View>
      </View>

      <View style={styles.cardProgressBlock}>
        <ProgressBar
          value={ratio}
          color={progress?.completed ? COLORS.success : COLORS.primary}
        />
        <Text style={styles.progressNumbers}>
          {progress?.value ?? 0} / {progress?.target ?? 1} ·{' '}
          {progress?.percent ?? 0}%
        </Text>
      </View>

      {challenge.tip && !progress?.completed ? (
        <Text style={styles.challengeTip}>💡 {challenge.tip}</Text>
      ) : null}

      <View style={styles.challengeFooter}>
        <RewardChips rewards={challenge.rewards} />
        <View style={styles.challengeActions}>
          <StatusPill claimed={challenge.claimed} completed={progress?.completed} />

          {challenge.claimed ? null : progress?.completed ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Collect the rewards of ${challenge.title}`}
              onPress={() => onCollect(challenge)}
              style={({ pressed }) => [
                styles.collectButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.collectButtonText}>Collect</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Start ${challenge.title}`}
              onPress={() => onStart(challenge)}
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

/* Bonus chest: locked until the set (or the weekly goal) is cleared. */
function ChestCard({ chest, onCollect, hint, animated = false }) {
  const isReady = Boolean(chest.progress?.completed) && !chest.claimed;
  const ratio = Math.min(1, (Number(chest.progress?.percent) || 0) / 100);

  return (
    <View
      style={[
        styles.chestCard,
        isReady && styles.chestCardReady,
        chest.claimed && styles.chestCardClaimed,
      ]}
    >
      {animated ? (
        <ChestWiggle active={isReady} style={styles.chestIconWrap}>
          <Text style={styles.chestIcon}>{chest.icon}</Text>
          {isReady ? <Text style={styles.chestSparkle}>✨</Text> : null}
        </ChestWiggle>
      ) : (
        <Text style={styles.chestIcon}>{chest.icon}</Text>
      )}

      <View style={styles.chestInfo}>
        <Text style={styles.chestTitle}>{chest.title}</Text>
        <Text style={styles.chestDescription}>
          {chest.claimed
            ? 'Opened — the bonus was added to your XP and coins.'
            : isReady
              ? 'Unlocked! Collect your bonus.'
              : chest.description}
        </Text>
        {hint ? <Text style={styles.chestHint}>{hint}</Text> : null}

        <View style={styles.cardProgressBlock}>
          <ProgressBar
            value={ratio}
            color={isReady ? COLORS.warning : COLORS.muted}
          />
          <Text style={styles.progressNumbers}>
            {chest.progress?.value ?? 0} / {chest.progress?.target ?? 1}
          </Text>
        </View>
      </View>

      <View style={styles.chestAction}>
        <RewardChips rewards={chest.rewards} compact />
        {chest.claimed ? (
          <Text style={styles.chestClaimedText}>✓ Collected</Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open the ${chest.title}`}
            disabled={!isReady}
            onPress={() => onCollect(chest)}
            style={({ pressed }) => [
              styles.collectButton,
              !isReady && styles.buttonDisabled,
              pressed && isReady && styles.pressed,
            ]}
          >
            <Text style={styles.collectButtonText}>Open</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function ChallengeScreen() {
  const { authenticatedRequest } = useAuth();

  const [cycle, setCycle] = useState(() => getChallengeCycle());
  const [challengeState, setChallengeState] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [lastPlayedTopic, setLastPlayedTopic] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [playerStreak, setPlayerStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [claimFeedback, setClaimFeedback] = useState(null);
  const [startupByModule, setStartupByModule] = useState({});
  // The Weekly Chest opening sequence: { id, chest, status, rewards, pending, error }.
  const [chestOpening, setChestOpening] = useState(null);

  const dailyTimer = useDailyResetTimer();
  const weeklyTimer = useWeeklyResetTimer();

  /*
   * While the screen is open the assigned set is re-checked against the
   * calendar, so a player who keeps the app open past midnight immediately
   * sees tomorrow's challenges.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const todayKey = toDateKey();
      setCycle((current) =>
        current.dateKey === todayKey ? current : getChallengeCycle()
      );
    }, DAY_ROLLOVER_CHECK_MS);

    return () => clearInterval(interval);
  }, []);

  /*
   * Reload everything when the screen is focused: the local challenge store,
   * the mirrored mission claims and the server progress (which feeds the
   * lesson progress and the player's streak).
   */
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const load = async () => {
        setIsLoading(true);

        const [storedState, storedClaims, lastPlayed, storedQuizResults, startupList] =
          await Promise.all([
            loadChallengeState(),
            loadClaimedMissions(),
            loadLastPlayedTopic(),
            loadModuleQuizResults(),
            Promise.all(
              Array.from({ length: 10 }, (_, index) =>
                getStartupAssessment(`module-${index + 1}`).catch(() => null)
              )
            ),
          ]);
        let challengeSnapshot = storedState;

        let serverLessonProgress = null;
        let mergedClaims = storedClaims;
        let streak = 0;

        try {
          const serverProgress = await authenticatedRequest('/progress');

          /*
           * Same reconciliation the map uses: the server completions are
           * folded into the device mirror and bucketed under the country of
           * their own module. Reading them back through
           * lessonProgressFromServer(content, 'Canada') would hide every
           * module but the first one from the gate below, so challenges for
           * Morocco, Italy, ... would stay locked forever.
           */
          await applyServerProgress(serverProgress);
          serverLessonProgress = await loadLessonProgress();
          mergedClaims = mergeClaimedMissions(
            claimedMissionsFromServer(serverProgress.lessons),
            storedClaims
          );
          streak = Number(serverProgress.streak) || 0;

          // Rewards collected on another device show as collected here too.
          try {
            const serverClaims = await authenticatedRequest('/challenges/claims');
            challengeSnapshot = await mergeServerChallengeClaims(serverClaims);
          } catch (claimsError) {
            console.log('[Challenges] Could not read server claims:', claimsError);
          }
        } catch (error) {
          console.log('[Challenges] Failed to load server progress:', error);

          // Offline: the device mirror is additive, so it is still valid.
          serverLessonProgress = await loadLessonProgress();
        }

        if (!mounted) return;

        setChallengeState({ ...challengeSnapshot });
        setStartupByModule(
          Object.fromEntries(
            startupList
              .map((assessment, index) => [`module-${index + 1}`, assessment])
              .filter(([, assessment]) => assessment)
          )
        );
        setLessonProgress(serverLessonProgress);
        setClaimedMissions(mergedClaims);
        setLastPlayedTopic(lastPlayed);
        // Re-read: applyServerProgress may have restored final-quiz results
        // from the server (fresh install / cleared data).
        setQuizResults({ ...((await loadModuleQuizResults()) ?? storedQuizResults) });
        setPlayerStreak(streak);
        setIsLoading(false);
      };

      load();

      return () => {
        mounted = false;
      };
    }, [authenticatedRequest])
  );

  const daily = useMemo(
    () =>
      challengeState && cycle
        ? buildDailyOverview(challengeState, cycle, { streak: playerStreak })
        : null,
    [challengeState, cycle, playerStreak]
  );

  const weekly = useMemo(
    () =>
      challengeState && cycle
        ? buildWeeklyOverview(challengeState, cycle, { streak: playerStreak })
        : null,
    [challengeState, cycle, playerStreak]
  );

  /* Where the "Start" buttons should send the player. */
  const target = useMemo(
    () =>
      getNextLearningTarget({
        lessonProgress,
        claimedMissions,
        lastPlayedTopic,
      }),
    [lessonProgress, claimedMissions, lastPlayedTopic]
  );

  /*
   * MODULE GATE: challenges may never open content of a module the player
   * has not reached in the course. A module unlocks only when the previous
   * module is fully cleared and its final quiz was passed (>= 50%).
   */
  const gate = useMemo(
    () =>
      buildChallengeGate({
        lessonProgress,
        quizResults,
        requestedModuleId: target?.moduleId ?? null,
      }),
    [lessonProgress, quizResults, target]
  );

  /*
   * MODULE SPOTLIGHT: the separate daily bonus challenge drawn from the
   * unlocked module topics (moduleDailyChallenge.js). Worth extra points.
   */
  /* Weakest topics first (low sub-lesson scores, placement weaknesses). */
  const weakTopics = useMemo(
    () =>
      lessonProgress
        ? getWeakTopics({
            unlockedModuleIds: gate?.unlockedModuleIds ?? [],
            startupByModule,
          })
        : [],
    [lessonProgress, gate?.unlockedModuleIds, startupByModule]
  );

  const pinnedSpotlightTopic = getPinnedSpotlightTopic(challengeState, cycle?.dateKey);

  const spotlight = useMemo(() => {
    if (!challengeState || !cycle) return null;

    const challenge = getDailyModuleChallenge(
      new Date(),
      gate?.unlockedModuleIds ?? [],
      { weakTopics, pinnedTopicId: pinnedSpotlightTopic }
    );
    if (!challenge) return null;

    return {
      challenge,
      progress: resolveModuleChallengeProgress(challengeState, challenge, {
        dateKey: cycle.dateKey,
      }),
      claimed: isRewardClaimed(
        challengeState,
        'days',
        cycle.dateKey,
        challenge.id
      ),
    };
  }, [challengeState, cycle, gate?.unlockedModuleIds, weakTopics, pinnedSpotlightTopic]);

  /* Keep today's spotlight topic fixed once it has been shown. */
  const spotlightTopicId = spotlight?.challenge?.topicId ?? null;
  useEffect(() => {
    if (!cycle?.dateKey || !spotlightTopicId || pinnedSpotlightTopic) return;
    pinSpotlightTopic(cycle.dateKey, spotlightTopicId).catch((error) =>
      console.log('[Challenges] Could not pin the spotlight topic:', error)
    );
  }, [cycle?.dateKey, spotlightTopicId, pinnedSpotlightTopic]);

  /*
   * Streak bookkeeping: the daily store helper decides whether the streak
   * grows (whole set cleared) or resets (a day was skipped).
   */
  const dailyCleared = Boolean(daily?.allCleared);
  const dailyDateKey = daily?.dateKey ?? null;

  useEffect(() => {
    if (!dailyDateKey) return undefined;

    let active = true;

    syncDailyCompletion({ dateKey: dailyDateKey, allCleared: dailyCleared })
      .then((next) => {
        if (active && next) setChallengeState({ ...next });
      })
      .catch((error) => {
        console.log('[Challenges] Failed to sync the daily streak:', error);
      });

    return () => {
      active = false;
    };
  }, [dailyDateKey, dailyCleared]);

  /* Inline confirmation messages disappear on their own. */
  useEffect(() => {
    if (!claimFeedback) return undefined;

    const timer = setTimeout(() => setClaimFeedback(null), 6000);

    return () => clearTimeout(timer);
  }, [claimFeedback]);

  const handleCollect = async (item) => {
    if (!daily) return;

    const scope =
      item.tier === CHALLENGE_TIERS.WEEKLY ? 'weeks' : 'days';
    const scopeKey = scope === 'weeks' ? cycle.weekKey : daily.dateKey;

    const result = await claimChallengeReward(item, {
      scope,
      scopeKey,
      send: authenticatedRequest,
    });
    const nextState = await loadChallengeState();

    setChallengeState({ ...nextState });

    if (result.claimed) {
      sounds.reward();
      setClaimFeedback({
        tone: 'success',
        text: result.pending
          ? `${item.title} collected — your +${result.rewards.xp} XP and +${result.rewards.coins} coins arrive when you are back online.`
          : `${item.title} collected — +${result.rewards.xp} XP and +${result.rewards.coins} coins added to your level.`,
      });
      return;
    }

    if (result.error) {
      setClaimFeedback({ tone: 'info', text: result.error });
      return;
    }

    setClaimFeedback({
      tone: 'info',
      text: 'That reward was already collected.',
    });
  };

  /*
   * Both chests get a full-screen opening: the animation starts at once and
   * bursts open when the server has paid, with the paid amounts.
   */
  const openChest = async (chest) => {
    if (!daily || chestOpening) return;
    const id = Date.now();
    setChestOpening({ id, chest, status: 'opening' });

    const isWeekly = chest.tier === CHALLENGE_TIERS.WEEKLY;
    const result = await claimChallengeReward(chest, {
      scope: isWeekly ? 'weeks' : 'days',
      scopeKey: isWeekly ? cycle.weekKey : daily.dateKey,
      send: authenticatedRequest,
    });
    setChallengeState({ ...(await loadChallengeState()) });

    if (result.claimed) {
      sounds.reward();
      setChestOpening({ id, chest, status: 'opened', rewards: result.rewards, pending: result.pending });
      return;
    }
    setChestOpening({
      id,
      chest,
      status: 'failed',
      error: result.alreadyClaimed ? 'This chest was already opened.' : result.error,
    });
  };

  const handleStart = (challenge) => {
    setClaimFeedback(null);

    /* Spotlight challenges carry their own deep link into the right topic. */
    const requested =
      challenge.directRoute ?? buildChallengeRoute(challenge, target, weakTopics[0] ?? null);

    /*
     * The gate: any route that points into a locked module is rewritten to
     * the highest unlocked module, and the player gets an explanation.
     */
    const safeRoute = clampRouteToGate(requested, gate);

    if (safeRoute.locked) {
      setClaimFeedback({ tone: 'info', text: safeRoute.message });
    }

    router.push(safeRoute.route);
  };

  if (isLoading || !daily || !weekly) {
    return (
      <SafeAreaView style={styles.container}>
        <GameHeader
          back
          eyebrow="DAILY QUEST"
          title="Challenges"
          subtitle="Fresh objectives are assigned every day at midnight."
        />
        <View style={styles.loadingArea}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Loading today&apos;s challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const remaining = Math.max(0, daily.total - daily.completed);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GameHeader
          back
          eyebrow="DAILY QUEST"
          title="Challenges"
          subtitle="Three objectives assigned every day — they renew at midnight."
        />

        {/* =========================================================
            HERO: streak, reset timer, progress, vault
        ========================================================= */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>
                🔥 {daily.streak}-day streak
              </Text>
            </View>
            <View style={styles.heroTimer}>
              <Text style={styles.heroTimerLabel}>NEW SET IN</Text>
              <Text style={styles.heroTimerValue}>{dailyTimer.text}</Text>
            </View>
          </View>

          <Text style={styles.heroDate}>{formatDateLabel(daily.dateKey)}</Text>
          <Text style={styles.heroProgressText}>
            {daily.completed} of {daily.total} cleared
            {remaining > 0 ? ` · ${remaining} to go` : ' · set complete'}
          </Text>

          <View style={styles.heroProgressTrack}>
            <View
              style={[styles.heroProgressFill, { width: `${daily.percent}%` }]}
            />
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.heroFooterBlock}>
              <Text style={styles.heroFooterLabel}>Earned from challenges</Text>
              <Text style={styles.heroFooterValue}>
                +{daily.vault.xp} XP · +{daily.vault.coins} 🪙
              </Text>
            </View>
            <View style={[styles.heroFooterBlock, styles.heroFooterBlockRight]}>
              <Text style={styles.heroFooterLabel}>Best streak</Text>
              <Text style={styles.heroFooterValue}>{daily.longestStreak} days</Text>
            </View>
          </View>

          {daily.collectableCount > 0 ? (
            <View style={styles.heroBanner}>
              <Text style={styles.heroBannerText}>
                🎉 {daily.collectableCount} reward
                {daily.collectableCount === 1 ? '' : 's'} waiting · +
                {daily.pendingRewards.xp} XP and +{daily.pendingRewards.coins} coins
              </Text>
            </View>
          ) : null}
        </View>

        {claimFeedback ? (
          <Text
            style={[
              styles.feedback,
              claimFeedback.tone === 'success'
                ? styles.feedbackSuccess
                : styles.feedbackInfo,
            ]}
          >
            {claimFeedback.text}
          </Text>
        ) : null}

        {/* =========================================================
            MODULE GATE BANNER
            Shown when the current course target sits in a module the
            challenges are not allowed to open yet.
        ========================================================= */}
        {gate?.lockMessage ? (
          <View style={styles.gateBanner}>
            <Text style={styles.gateBannerIcon}>🔒</Text>
            <View style={styles.gateBannerBody}>
              <Text style={styles.gateBannerText}>{gate.lockMessage}</Text>
              {gate.gateStatus ? (
                <Text style={styles.gateBannerSub}>
                  {gate.gateStatus.completedTopics}/{gate.gateStatus.totalTopics}{' '}
                  topics cleared · module quiz{' '}
                  {gate.gateStatus.quizPassed ? 'passed ✓' : 'not passed yet'}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* =========================================================
            TODAY'S ASSIGNED CHALLENGES
        ========================================================= */}
        <Text style={styles.sectionTitle}>Today&apos;s challenges</Text>
        <Text style={styles.sectionSubtitle}>
          Assigned from the daily pool: one warm-up, one core, one stretch.
        </Text>

        {daily.challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onStart={handleStart}
            onCollect={handleCollect}
          />
        ))}

        <ChestCard
          chest={daily.chest}
          onCollect={openChest}
          animated
          hint={
            daily.allCleared
              ? 'Daily set complete — well played!'
              : `Clear ${remaining} more challenge${remaining === 1 ? '' : 's'} to unlock`
          }
        />

        {/* =========================================================
            MODULE SPOTLIGHT (separate daily bonus, extra points)
            Drawn every day from the modules the player unlocked — see
            src/data/challenges/moduleDailyChallenge.js.
        ========================================================= */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Module spotlight</Text>
          <View style={styles.weekTimer}>
            <Text style={styles.heroTimerLabel}>EXTRA POINTS</Text>
            <Text style={styles.spotlightBonus}>
              +{spotlight?.challenge.rewards.xp ?? 0} XP · +
              {spotlight?.challenge.rewards.coins ?? 0} 🪙
            </Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>
          One bonus challenge a day, taken from the topics of the modules you
          have unlocked. New topic every midnight.
        </Text>

        {spotlight ? (
          <ChallengeCard
            challenge={{
              ...spotlight.challenge,
              progress: spotlight.progress,
              claimed: spotlight.claimed,
            }}
            onStart={handleStart}
            onCollect={handleCollect}
          />
        ) : (
          <Text style={styles.spotlightEmpty}>
            No module topic available yet — finish a sub-lesson to light up the
            spotlight.
          </Text>
        )}

        {gate?.nextUnlockHint ? (
          <Text style={styles.gateHint}>🗝️ {gate.nextUnlockHint}</Text>
        ) : null}

        {/* =========================================================
            WEEKLY GOAL
        ========================================================= */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>This week&apos;s goal</Text>
          <View style={styles.weekTimer}>
            <Text style={styles.heroTimerLabel}>
              ENDS {getWeekEndLabel().toUpperCase()}
            </Text>
            <Text style={styles.weekTimerValue}>{weeklyTimer.text}</Text>
          </View>
        </View>

        {weekly.challenge ? (
          <ChallengeCard
            challenge={{
              ...weekly.challenge,
              progress: weekly.progress,
              claimed: weekly.claimed,
            }}
            onStart={handleStart}
            onCollect={handleCollect}
          />
        ) : null}

        <ChestCard chest={weekly.chest} onCollect={openChest} animated />

        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How challenges work</Text>
          <Text style={styles.infoLine}>
            • A fresh set of three challenges is assigned every day at local
            midnight, and the weekly goal rotates every Monday.
          </Text>
          <Text style={styles.infoLine}>
            • Progress is measured from real gameplay: finished sub-lessons,
            quiz and speaking accuracy, stars earned and missions collected.
          </Text>
          <Text style={styles.infoLine}>
            • Clear all three to open the Daily Chest and keep your challenge
            streak alive.
          </Text>
          <Text style={styles.infoLine}>
            • The Spotlight is a separate daily bonus. When you have a weak
            topic (a lesson under 80%, or a topic the placement check flagged)
            it picks that topic and asks for 80%; otherwise it reviews a topic
            from a module you have unlocked.
          </Text>
          <Text style={styles.infoLine}>
            • Challenges follow the course gate: a new module&apos;s content
            only becomes usable here after you finish every topic of the
            previous module and pass its module quiz with 80% or more.
          </Text>
          <Text style={styles.infoLine}>
            • Challenge rewards are real XP and coins, kept small on purpose:
            lessons, missions and quizzes stay the main way to level up. Only
            passed lessons count, and you need to study that day to collect.
          </Text>
        </View>
      </ScrollView>

      {chestOpening ? (
        <ChestOpening
          key={chestOpening.id}
          visible
          chest={chestOpening.chest}
          status={chestOpening.status}
          rewards={chestOpening.rewards}
          pending={chestOpening.pending}
          error={chestOpening.error}
          onClose={() => setChestOpening(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: '600',
  },

  /* ------------------------------- HERO ------------------------------- */
  hero: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroChipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  heroTimer: {
    alignItems: 'flex-end',
  },
  heroTimerLabel: {
    color: '#CFE4F8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heroTimerValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  heroDate: {
    color: '#EAF3FD',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
  heroProgressText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  heroProgressTrack: {
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginTop: 12,
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  heroFooterBlock: {
    flex: 1,
  },
  heroFooterBlockRight: {
    alignItems: 'flex-end',
  },
  heroFooterLabel: {
    color: '#CFE4F8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroFooterValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  heroBanner: {
    marginTop: 14,
    backgroundColor: 'rgba(220,252,231,0.95)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  heroBannerText: {
    color: COLORS.successDark,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },

  /* ----------------------------- FEEDBACK ----------------------------- */
  feedback: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  feedbackSuccess: {
    backgroundColor: COLORS.successSoft,
    color: COLORS.successDark,
  },
  feedbackInfo: {
    backgroundColor: COLORS.warningSoft,
    color: COLORS.warningText,
  },

  /* ----------------------------- SECTIONS ----------------------------- */
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 26,
    marginHorizontal: 20,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    marginHorizontal: 20,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 26,
    marginHorizontal: 20,
  },
  weekTimer: {
    alignItems: 'flex-end',
  },
  weekTimerValue: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  /* ----------------------------- GATE/SPOTLIGHT ----------------------------- */
  gateBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.warningSoft,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  gateBannerIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  gateBannerBody: {
    flex: 1,
  },
  gateBannerText: {
    color: COLORS.warningText,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  gateBannerSub: {
    color: COLORS.warningText,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  spotlightBonus: {
    color: COLORS.warningText,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  spotlightEmpty: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    marginHorizontal: 20,
  },
  gateHint: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 12,
    marginHorizontal: 20,
  },

  /* ---------------------------- REWARDS/PILL ---------------------------- */
  rewardRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardChip: {
    backgroundColor: '#EAF4FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rewardChipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rewardText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  statusPill: {
    backgroundColor: '#EEF2F7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillComplete: {
    backgroundColor: COLORS.successSoft,
  },
  statusPillClaimed: {
    backgroundColor: '#EAF4FF',
  },
  statusPillText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  statusPillTextComplete: {
    color: COLORS.successDark,
  },
  statusPillTextClaimed: {
    color: COLORS.primaryDark,
  },

  /* ------------------------- CHALLENGE CARD ------------------------- */
  challengeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  challengeCardReady: {
    borderColor: COLORS.success,
  },
  challengeCardClaimed: {
    opacity: 0.82,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBubbleReady: {
    backgroundColor: COLORS.successSoft,
  },
  iconText: {
    fontSize: 22,
  },
  challengeHeading: {
    flex: 1,
  },
  challengeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  categorySub: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  challengeTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  challengeDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  cardProgressBlock: {
    marginTop: 12,
  },
  progressNumbers: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  challengeTip: {
    color: '#7C6318',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 10,
  },
  challengeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startButton: {
    minWidth: 78,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  collectButton: {
    minWidth: 78,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  pressed: {
    opacity: 0.78,
  },

  /* ---------------------------- CHEST CARD ---------------------------- */
  chestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chestCardReady: {
    backgroundColor: '#FFFBEB',
    borderColor: COLORS.warning,
  },
  chestCardClaimed: {
    opacity: 0.85,
  },
  chestIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  chestIconWrap: {
    marginRight: 0,
  },
  chestSparkle: {
    position: 'absolute',
    top: -8,
    right: 4,
    fontSize: 14,
  },
  chestInfo: {
    flex: 1,
    marginRight: 10,
  },
  chestTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  chestDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  chestHint: {
    color: COLORS.warningText,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  chestAction: {
    alignItems: 'flex-end',
    gap: 8,
  },
  chestClaimedText: {
    color: COLORS.successDark,
    fontSize: 12,
    fontWeight: '800',
  },

  /* ------------------------------ INFO ------------------------------ */
  infoCard: {
    marginTop: 26,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoLine: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
});
