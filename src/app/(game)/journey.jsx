import { router, useFocusEffect } from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GameHeader,
  ProgressBar,
  StatPill,
} from '@/components/game-ui';

import {
  getCountryForModule,
  getDefaultModuleId,
  lessonCatalog,
} from '@/data/lessons/catalog';

import {
  getMissionsByModule,
  missionCatalog,
} from '@/data/lessons/missionCatalog';

import { useAuth } from '@/store/auth-context';
import { isOfflineError } from '@/services/apiClient';
import {
  claimedMissionsFromServer,
  getMissionProgress,
  getObjectiveCompletion,
  getStageProgress,
  isMissionClaimed,
  lessonProgressFromServer,
  loadClaimedMissions,
  loadLessonProgress,
  mergeClaimedMissions,
} from '@/store/lesson-progress';

/*
 * Stage the journey falls back to when no progress data is available.
 */
const DEFAULT_STAGE_COUNTRY = 'Canada';

export default function Journey() {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const { authenticatedRequest } = useAuth();

  /*
   * Current country for this stage.
   *
   * The first progress load replaces it with the stage that owns the player's
   * current (not completed) mission. Afterwards the "Next Missions" button and
   * the back arrow switch it while browsing other stages.
   */
  const [country, setCountry] = useState(DEFAULT_STAGE_COUNTRY);

  /*
   * Index of the mission card that must be visible when the journey opens.
   * `null` means "there is nothing to scroll to".
   */
  const [pendingScrollIndex, setPendingScrollIndex] = useState(null);

  const listRef = useRef(null);

  /*
   * Set once the back/next arrows were used, so the automatic "open on the
   * current stage" sync stops fighting the player's own navigation.
   */
  const stageBrowsedByPlayer = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      /*
       * Re-arm the "auto-open to the current stage" guard on every fresh
       * visit. It is set to `true` by the back/next stage arrows so the
       * automatic stage sync does not override the player's own browsing.
       * Clearing it when the screen unmounts means a later visit re-opens
       * on the current stage.
       */
      stageBrowsedByPlayer.current = false;

      /*
       * Open the journey on the stage (country) that owns the player's
       * current mission and remember which card has to be visible.
       *
       * The sync runs after every progress load so the journey always shows
       * the mission being worked on, but it backs off as soon as the player
       * used the back/next arrows to browse another stage by hand.
       */
      const syncStageWithProgress = (loadedProgress, loadedClaims) => {
        if (stageBrowsedByPlayer.current) return;

        const stageCountry = getCurrentStageCountry(
          loadedProgress,
          loadedClaims
        );

        const missionIndex = getCurrentMissionIndex(
          stageCountry,
          loadedProgress,
          loadedClaims
        );

        console.log(
          `[Journey] Opening on the current stage: ${stageCountry} (mission index ${missionIndex})`
        );

        setCountry(stageCountry);
        setPendingScrollIndex(missionIndex);
      };

      const loadProgress = async () => {
        const storedClaims = await loadClaimedMissions();

        try {
          const serverProgress = await authenticatedRequest('/progress');

          if (mounted) {
            const mergedClaims = mergeClaimedMissions(
              claimedMissionsFromServer(serverProgress.lessons),
              storedClaims
            );

            const serverLessonProgress = lessonProgressFromServer(
              serverProgress.content,
              country
            );

            setProgress(serverLessonProgress);
            setPlayerStats({
              xp: serverProgress.xp ?? 0,
              streak: serverProgress.streak ?? 0,
              hearts: serverProgress.hearts ?? 5,
            });
            setClaimedMissions(mergedClaims);

            syncStageWithProgress(serverLessonProgress, mergedClaims);
          }
        } catch (error) {
          console.log('Failed to load server journey progress:', error);

          /*
           * A 4xx/5xx is a real server answer: the journey must show the truth
           * (nothing completed) instead of this device's stored copy, which may
           * belong to an account that used the phone before.
           */
          if (!isOfflineError(error)) {
            if (mounted) {
              setProgress({});
              setClaimedMissions(storedClaims);
              setIsError(true);

              syncStageWithProgress({}, storedClaims);
            }
            return;
          }

          try {
            const storedProgress = await loadLessonProgress();
            if (mounted) {
              setProgress(storedProgress);
              setClaimedMissions(storedClaims);
              setIsError(false);

              syncStageWithProgress(storedProgress, storedClaims);
            }
          } catch {
            if (mounted) {
              setProgress(null);
              setClaimedMissions(storedClaims);
              setIsError(true);

              // Without lesson progress the journey falls back to the first
              // stage that still has missions to collect.
              syncStageWithProgress(null, storedClaims);
            }
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        }
      };

      loadProgress();

      return () => {
        mounted = false;
        stageBrowsedByPlayer.current = false;
      };
    }, [authenticatedRequest])
  );

  /*
   * Missions of the current stage only.
   *
   * Each journey stage maps to one module, so the mission list stays
   * scoped to the active module and the "Next Missions" button can
   * swap the whole list when the stage is done.
   */
  const stageMissions = useMemo(
    () =>
      missionCatalog.filter(
        (mission) =>
          mission.moduleId === getDefaultModuleId(country)
      ),
    [country]
  );

  /*
   * Build the mission list.
   *
   * Mission data comes from missionCatalog.
   * Lesson/sublesson data comes from catalog.js.
   */
  const missions = useMemo(() => {
    if (!progress) return [];

    return stageMissions.map(
      (mission, index) => {
        /*
         * Resolve every objective's targetId against
         * the lesson catalog and check that exact
         * sub-lesson's completion state.
         */
        const objectives =
          (mission.objectives ?? []).map(
            (objective) => {
              const completion =
                getObjectiveCompletion(
                  progress,
                  country,
                  objective.targetId
                );

              if (!completion.found) {
                console.log(
                  `[Journey] Objective target "${objective.targetId}" not found in the catalog.`
                );
              }

              return {
                ...objective,
                result: completion.result,
                completed: completion.completed,
              };
            }
          );

        const completedObjectives =
          objectives.filter(
            (objective) =>
              objective.completed
          ).length;

        const totalObjectives =
          objectives.length;

        // A mission that has been claimed is completed even when the objective
        // list looks unfinished (server progress can lag behind the claim).
        const missionClaimed =
          isMissionClaimed(mission.id, claimedMissions);

        const missionCompleted =
          missionClaimed ||
          (totalObjectives > 0 &&
            completedObjectives ===
              totalObjectives);

        /*
         * Previous mission determines locking.
         */
        const previousMission =
          index > 0
            ? stageMissions[index - 1]
            : null;

        let previousMissionCompleted = true;

        if (previousMission) {
          previousMissionCompleted =
            isMissionCompleted(
              previousMission,
              progress,
              country,
              claimedMissions
            );
        }

        const unlocked =
          index === 0 ||
          previousMissionCompleted;

        let status = 'locked';

        if (missionCompleted) {
          status = 'completed';
        } else if (unlocked) {
          status = 'current';
        }

        const missionProgress =
          getMissionProgress(
            mission,
            progress,
            country,
            missionClaimed
          );

        return {
          ...mission,

          status,
          claimed: missionClaimed,

          progress: {
            count: completedObjectives,
            total: totalObjectives,
            percent: missionProgress.percent,
          },

          resolvedObjectives:
            objectives,
        };
      }
    );
  }, [stageMissions, progress, claimedMissions, country]);

  /*
   * The next mission to be done: the first unlocked mission that is not
   * completed yet. Powers the "Up next" quick-start button.
   */
  const nextMission = useMemo(
    () => missions.find((mission) => mission.status === 'current') ?? null,
    [missions]
  );

  /*
   * Bring the current mission into view.
   *
   * The journey opens on the stage that owns the current mission, but that
   * card can still sit below the fold, so the list is scrolled to it once the
   * data and the layout are ready. Index 0 is already visible at the top and
   * therefore needs no scroll.
   */
  useEffect(() => {
    if (pendingScrollIndex === null) return undefined;

    if (!listRef.current || pendingScrollIndex <= 0) {
      setPendingScrollIndex(null);
      return undefined;
    }

    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: pendingScrollIndex,
        animated: false,
        viewPosition: 0,
      });

      setPendingScrollIndex(null);
    }, 250);

    return () => clearTimeout(timer);
  }, [pendingScrollIndex]);

  /*
   * Stage (journey) percentage, blended from the
   * stage's real data: completed sub-lessons,
   * completed missions and earned reward points.
   */
  const stageModule = useMemo(
    () =>
      lessonCatalog.find((module) => module.id === getDefaultModuleId(country)),
    [country]
  );


  /*
   * Human-readable stage label, e.g. "STAGE 02 / Morocco".
   */
  const stageLabel = useMemo(() => {
    const moduleIndex = lessonCatalog.findIndex(
      (module) => module.id === stageModule?.id
    );

    const stageNumber =
      moduleIndex >= 0
        ? String(moduleIndex + 1).padStart(2, '0')
        : '--';

    return `STAGE ${stageNumber} / ${country}`;
  }, [stageModule, country]);


  const stageProgress = useMemo(() => {
    if (!stageModule) {
      return {
        overallPercent: 0,
        completedSubLessons: 0,
        totalSubLessons: 0,
        completedMissions: 0,
        totalMissions: 0,
        earnedPoints: 0,
        totalPoints: 0,
      };
    }

    return getStageProgress(
      stageModule,
      stageMissions,
      progress,
      country,
      claimedMissions
    );
  }, [stageModule, stageMissions, progress, claimedMissions, country]);

  /*
   * NEXT STAGE CHAINING:
   *
   * The next module in the catalog order (Canada -> Morocco -> ...). Once
   * every mission of the current stage is collected, the player can jump
   * straight into the next module's topics to start the new missions.
   */
  const nextStageModule = useMemo(() => {
    if (!stageModule) return null;

    const index = lessonCatalog.findIndex(
      (module) => module.id === stageModule.id
    );

    if (index === -1) return null;

    return lessonCatalog[index + 1] ?? null;
  }, [stageModule]);

  const nextStageCountry = nextStageModule
    ? getCountryForModule(nextStageModule.id)
    : null;

  /*
   * PREVIOUS STAGE NAVIGATION:
   *
   * The stage that comes before the current one (Morocco -> Canada -> ...).
   * Powers the back arrow that sits next to the quick-start button and lets
   * the player revisit the missions already completed in the previous stage.
   */
  const previousStageModule = useMemo(() => {
    if (!stageModule) return null;

    const index = lessonCatalog.findIndex(
      (module) => module.id === stageModule.id
    );

    if (index <= 0) return null;

    return lessonCatalog[index - 1] ?? null;
  }, [stageModule]);

  const previousStageCountry = previousStageModule
    ? getCountryForModule(previousStageModule.id)
    : null;

  /*
   * A stage that was just opened always starts on its first mission instead of
   * keeping the scroll position of the stage that was left behind. Any pending
   * automatic scroll is dropped as well, so it cannot pull the fresh list to a
   * mission index of the stage that was left behind.
   */
  const scrollMissionListToTop = () => {
    setPendingScrollIndex(null);

    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  };

  /*
   * The current stage is done when every one of its missions is
   * completed. Collected missions count as completed too, so a fully
   * claimed stage also unlocks the next module's missions.
   */
  const stageMissionsComplete = useMemo(() => {
    if (!progress) return false;

    return (
      stageMissions.length > 0 &&
      stageMissions.every((mission) =>
        isMissionCompleted(
          mission,
          progress,
          country,
          claimedMissions
        )
      )
    );
  }, [stageMissions, progress, country, claimedMissions]);

  const handleStartNextStage = () => {
    if (!nextStageModule) {
      console.log('No further module in the catalog. Staying on the journey.');
      return;
    }

    console.log(
      `Proceeding to the next stage missions: ${nextStageCountry} (${nextStageModule.id})`
    );

    // From here on the player browses the stages by hand.
    stageBrowsedByPlayer.current = true;

    // Switch the journey itself to the next module so its missions become
    // the stage's mission list ("next missions").
    setCountry(nextStageCountry);

    scrollMissionListToTop();
  };

  /*
   * Go back one stage to update/review the missions that are already
   * completed.
   *
   * The arrow is disabled on the first stage, which has nothing before it.
   */
  const handleGoToPreviousStage = () => {
    if (!previousStageModule) {
      console.log('No previous module in the catalog. Staying on the journey.');
      return;
    }

    console.log(
      `Returning to the previous stage missions: ${previousStageCountry} (${previousStageModule.id})`
    );

    // From here on the player browses the stages by hand.
    stageBrowsedByPlayer.current = true;

    setCountry(previousStageCountry);

    scrollMissionListToTop();
  };

  /*
   * Open the selected mission.
   *
   * We pass only IDs and the country.
   * The mission screen resolves the rest
   * from the catalogs.
   */
  const openMission = (mission) => {
    if (mission.status === 'locked') {
      // ADDED LOG: Log when user taps a locked mission
      console.log(`Mission ${mission.id} is locked. Interaction prevented.`);
      return;
    }

    // ADDED LOG: Log the mission details before routing
    console.log(`Navigating to mission: ${mission.id}, Status: ${mission.status}`);

    router.push({
      pathname: '/mission',
      params: {
        missionId: String(mission.id),
        country: String(country),
      },
    });
  };

  const renderMission = ({ item }) => {
    // A mission that is claimed shows "Collected", while one that only has all
    // objectives done (rewards not claimed yet) still shows "Completed".
    const statusLabel =
      item.status === 'completed'
        ? item.claimed
          ? '✓ Collected'
          : 'Completed'
        : item.status === 'current'
          ? 'Current'
          : 'Locked';

    // Locked missions are static content: they are not interactive, so they are
    // rendered as inert cards that assistive technology can ignore rather than
    // as buttons that would be announced but never respond.
    if (item.status === 'locked') {
      return (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.missionNumber}>
              MISSION {formatMissionNumber(item.id)}
            </Text>

            <View style={[styles.statusBadge, styles.lockedBadge]}>
              <Text style={[styles.status, styles.lockedStatus]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.cardMeta}>{item.description}</Text>

          <Text style={styles.lessonProgress}>
            {item.progress.count}/
            {item.progress.total} objectives • {item.progress.percent}% complete
          </Text>

          <Text style={styles.lockedText}>
            Complete the previous mission to unlock
          </Text>
        </View>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${statusLabel}`}
        disabled={item.status === 'locked'}
        onPress={() => openMission(item)}
        style={({ pressed }) => [
          styles.card,

          item.status === 'current' &&
            styles.currentCard,

          item.status === 'completed' &&
            styles.completedCard,

          item.status === 'locked' &&
            styles.lockedCard,

          pressed &&
            item.status !== 'locked' &&
            styles.pressed,
        ]}
      >
        {/* HEADER */}

        <View style={styles.headerRow}>
          <Text style={styles.missionNumber}>
            MISSION{' '}
            {formatMissionNumber(item.id)}
          </Text>

          <View
            style={[
              styles.statusBadge,

              item.status === 'completed' &&
                styles.completedBadge,

              item.status === 'locked' &&
                styles.lockedBadge,
            ]}
          >
            <Text
              style={[
                styles.status,
                item.status === 'completed' &&
                  styles.completedStatus,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* TITLE */}

        <Text style={styles.title}>
          {item.title}
        </Text>

        {/* DESCRIPTION */}

        <Text style={styles.cardMeta}>
          {item.description}
        </Text>

        {/* PROGRESS */}

        <Text style={styles.lessonProgress}>
          {item.progress.count}/
          {item.progress.total}{' '}
          objectives •{' '}
          {item.progress.percent}% complete
        </Text>

        {/* LOCK MESSAGE */}

        {item.status === 'locked' && (
          <Text style={styles.lockedText}>
            Complete the previous mission
            to unlock
          </Text>
        )}

        {/* REWARDS */}

        {item.rewards && (
          <View style={styles.rewardRow}>
            <Text style={styles.rewardText}>
              ⭐ +{item.rewards.xp} XP
            </Text>

            <Text style={styles.rewardText}>
              🪙 +{item.rewards.coins}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1577D4" />
          <Text style={styles.loadingText}>Loading your journey…</Text>
        </View>
      )}

      {isError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ⚠️ Unable to load progress from the server. Showing your last
            saved progress.
          </Text>
        </View>
      )}

      {/* PLAYER STATS */}

      <View style={styles.topBar}>
        <StatPill
          icon="⭐"
          value={
            playerStats
              ? Number(playerStats.xp).toLocaleString()
              : '1,280'
          }
          label="XP"
        />

        <StatPill
          icon="🔥"
          value={
            playerStats
              ? String(playerStats.streak)
              : '4'
          }
          label="day streak"
        />

        <StatPill
          icon="❤️"
          value={
            playerStats
              ? String(playerStats.hearts)
              : '5'
          }
          label="hearts"
        />
      </View>

      {/* PAGE HEADER */}

      <GameHeader
        back
        eyebrow={stageLabel}
        title="Your journey"
        subtitle="Complete each mission to unlock the next part of the story."
      />

      {/* STAGE PROGRESS */}

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressTitle}>
            Stage progress
          </Text>

          <Text style={styles.progressValue}>
            {stageProgress.overallPercent}%
          </Text>
        </View>

        <ProgressBar
          value={
            stageProgress.overallPercent / 100
          }
        />

        <Text style={styles.progressDetails}>
          {stageProgress.completedSubLessons}/
          {stageProgress.totalSubLessons} sub-lessons
          {' • '}
          {stageProgress.completedMissions}/
          {stageProgress.totalMissions} missions
          {' • '}
          {stageProgress.earnedPoints}/
          {stageProgress.totalPoints} XP points
        </Text>
      </View>

      {/* PREVIOUS / NEXT MISSION QUICK START */}

      <View style={styles.stageNavRow}>
        {/*
          Back arrow: opens the previous stage again so the missions that are
          already completed can be reviewed. It stays visible but disabled on
          the first stage of the journey.
        */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            previousStageModule
              ? `Previous missions: ${previousStageCountry}`
              : 'No previous missions'
          }
          accessibilityState={{
            disabled: !previousStageModule,
          }}
          disabled={!previousStageModule}
          hitSlop={8}
          onPress={handleGoToPreviousStage}
          style={({ pressed }) => [
            styles.stageBackButton,

            !previousStageModule &&
              styles.stageBackButtonDisabled,

            pressed &&
              previousStageModule &&
              styles.nextMissionButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.stageBackIcon,

              !previousStageModule &&
                styles.stageBackIconDisabled,
            ]}
          >
            ←
          </Text>
        </Pressable>

        <View style={styles.stageNavContent}>
          {nextMission ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Up next: ${nextMission.title}`}
              onPress={() => {
                console.log(`Journey quick-start: opening next mission ${nextMission.id}`);
                openMission(nextMission);
              }}
              style={({ pressed }) => [
                styles.nextMissionButton,
                pressed && styles.nextMissionButtonPressed,
              ]}
            >
              <View style={styles.nextMissionTextBlock}>
                <Text style={styles.nextMissionLabel}>
                  UP NEXT
                </Text>

                <Text style={styles.nextMissionTitle} numberOfLines={1}>
                  {nextMission.title}
                </Text>
              </View>

              <Text style={styles.nextMissionArrow}>
                →
              </Text>
            </Pressable>
          ) : nextStageModule ? (
            // The current stage is blocked or fully collected: jump to the next
            // module instead of trapping the player on a dead-end screen.
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Next missions: ${nextStageCountry} ${nextStageModule.flag}`}
              onPress={handleStartNextStage}
              style={({ pressed }) => [
                styles.nextMissionButton,
                styles.nextMissionsButton,
                pressed && styles.nextMissionButtonPressed,
              ]}
            >
              <View style={styles.nextMissionTextBlock}>
                <Text style={styles.nextMissionLabel}>
                  NEXT MISSIONS
                </Text>

                <Text style={styles.nextMissionTitle} numberOfLines={1}>
                  {nextStageCountry} {nextStageModule.flag}
                </Text>
              </View>

              <Text style={styles.nextMissionArrow}>
                →
              </Text>
            </Pressable>
          ) : stageMissionsComplete ? (
            <View style={styles.allDoneButton}>
              <Text style={styles.allDoneText}>
                ✓ All missions collected
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* MISSION LIST */}

      {stageMissions.length === 0 ? (
        <View style={styles.comingSoonBlock}>
          <Text style={styles.comingSoonTitle}>
            🗺️ Missions coming soon
          </Text>

          <Text style={styles.comingSoonText}>
            The missions for {country} are still being prepared. Tap “Next
            Missions” to preview the next stage of the journey.
          </Text>
        </View>
      ) : missions.length === 0 ? (
        <View style={styles.emptyMissionsBlock}>
          <Text style={styles.emptyMissionsText}>
            No missions to show yet. Tap “Next Missions” to preview the next
            stage of the journey.
          </Text>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={missions}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderMission}
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
        /*
         * Mission cards have different heights, so scrolling to an index can
         * fail before the list has measured every row. Fall back to the
         * estimated offset and let the list settle there.
         */
        onScrollToIndexFailed={(info) => {
          console.log(
            `[Journey] Could not scroll to mission index ${info.index}. Using the estimated offset.`
          );

          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          });

          setPendingScrollIndex(null);
        }}
      />
    </SafeAreaView>
  );
}

/*
 * Convert:
 *
 * mission-1
 * mission-2
 *
 * into:
 *
 * 01
 * 02
 */
function formatMissionNumber(
  missionId
) {
  const value = String(missionId)
    .replace('mission-', '');

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return String(number).padStart(2, '0');
}

/*
 * Check whether an entire mission is complete.
 *
 * Completion is derived from the mission's target
 * sub-lessons (or an already recorded claim).
 */
function isMissionCompleted(
  mission,
  progress,
  country,
  claimedMissions = []
) {
  if (!mission) {
    return false;
  }

  // Server- or locally-recorded claims always win over objective progress.
  if (isMissionClaimed(mission.id, claimedMissions)) {
    return true;
  }

  if (
    !mission.objectives?.length ||
    !progress
  ) {
    return false;
  }

  return (
    getMissionProgress(
      mission,
      progress,
      country,
      false
    ).percent === 100
  );
}

/*
 * Current stage (country) of the journey.
 *
 * The first stage whose missions are not all finished yet, which is the stage
 * that owns the mission the player is working on. When every mission of the
 * catalog is done, the last stage with missions stays selected so the
 * "all missions collected" state remains visible.
 */
function getCurrentStageCountry(progress, claimedMissions) {
  const stages = lessonCatalog.filter(
    (module) => getMissionsByModule(module.id).length > 0
  );

  if (!stages.length) {
    return DEFAULT_STAGE_COUNTRY;
  }

  const pendingStage = stages.find((module) => {
    const stageCountry = getCountryForModule(module.id);

    return getMissionsByModule(module.id).some(
      (mission) =>
        !isMissionCompleted(mission, progress, stageCountry, claimedMissions)
    );
  });

  return getCountryForModule(
    (pendingStage ?? stages[stages.length - 1]).id
  );
}

/*
 * Position of the mission the player is working on inside its stage.
 *
 * Powers the automatic scroll that shows the current (not completed) mission
 * as soon as the journey opens. A fully completed stage returns 0, which keeps
 * the list on its first card.
 */

function getCurrentMissionIndex(country, progress, claimedMissions) {
  const stageMissions = getMissionsByModule(getDefaultModuleId(country));

  const index = stageMissions.findIndex(
    (mission) =>
      !isMissionCompleted(mission, progress, country, claimedMissions)
  );

  return index === -1 ? 0 : index;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },

  topBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },

  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressTitle: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '700',
  },

  progressValue: {
    color: '#1577D4',
    fontSize: 13,
    fontWeight: '800',
  },

  progressDetails: {
    marginTop: 8,
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8F0',

    shadowColor: '#21344D',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 2,
  },

  currentCard: {
    borderWidth: 2,
    borderColor: '#1577D4',
  },

  completedCard: {
    borderColor: '#A8DEC3',
  },

  lockedCard: {
    opacity: 0.58,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  missionNumber: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#667085',
  },

  statusBadge: {
    backgroundColor: '#E7F1FB',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  completedBadge: {
    backgroundColor: '#E4F7EE',
  },

  completedStatus: {
    color: '#15803D',
  },

  /*
   * Row that hosts the previous-stage back arrow and the mission quick-start
   * button side by side.
   */
  stageNavRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  stageNavContent: {
    flex: 1,
  },

  stageBackButton: {
    width: 54,
    borderRadius: 16,
    backgroundColor: '#E8F2FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stageBackButtonDisabled: {
    opacity: 0.45,
  },

  stageBackIcon: {
    color: '#1577D4',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
  },

  stageBackIconDisabled: {
    color: '#8491A3',
  },

  nextMissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1577D4',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,

    shadowColor: '#21344D',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  nextMissionButtonPressed: {
    opacity: 0.85,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  nextMissionTextBlock: {
    flex: 1,
    marginRight: 12,
  },

  nextMissionLabel: {
    color: '#BFD9F5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  nextMissionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },

  nextMissionArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  // Green variant used by the "Next Missions" button when the whole
  // stage is done and the journey proceeds to the next module.
  nextMissionsButton: {
    backgroundColor: '#10B981',
  },

  comingSoonBlock: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E8F0',
    padding: 16,
  },

  comingSoonTitle: {
    color: '#182133',
    fontSize: 15,
    fontWeight: '800',
  },

  comingSoonText: {
    color: '#7A8798',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  allDoneButton: {
    alignItems: 'center',
    backgroundColor: '#E4F7EE',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  allDoneText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '800',
  },

  lockedBadge: {
    backgroundColor: '#EEF1F4',
  },

  status: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1577D4',
  },

  title: {
    marginTop: 14,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#182133',
  },

  cardMeta: {
    marginTop: 5,
    color: '#7A8798',
    fontSize: 13,
    lineHeight: 19,
  },

  lessonProgress: {
    marginTop: 10,
    color: '#1577D4',
    fontSize: 12,
    fontWeight: '700',
  },

  lockedText: {
    marginTop: 8,
    color: '#98A2B3',
    fontSize: 12,
    fontWeight: '600',
  },

  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F4',
  },

  rewardText: {
    color: '#B36B00',
    fontSize: 12,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.76,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F4F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  loadingText: {
    marginTop: 12,
    color: '#667085',
    fontSize: 14,
    fontWeight: '600',
  },

  errorBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },

  errorBannerText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
  },
});

