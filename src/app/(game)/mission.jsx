import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  findSubLessonById,
  getCountryForModule,
  lessonCatalog
} from '@/data/lessons/catalog';

import {
  getMissionById,
  getMissionNumber,
  getNextMission,
  MISSION_PASS_PERCENTAGE,
} from '@/data/lessons/missionCatalog';

import { isOfflineError } from '@/services/apiClient';
import { useAuth } from '@/store/auth-context';
import { recordMissionClaim } from '@/store/challenge-progress';
import { sounds } from '@/services/sound';
import {
  claimedMissionsFromServer,
  getObjectiveCompletion,
  isMissionClaimed,
  lessonProgressFromServer,
  loadClaimedMissions,
  loadLessonProgress,
  mergeClaimedMissions,
  saveClaimedMission,
} from '@/store/lesson-progress';
import { enqueueMissionClaim } from '@/store/pending-sync';

export default function MissionScreen() {
  const params = useLocalSearchParams();
  const [progressData, setProgressData] = useState(null);
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimedLocal, setIsClaimedLocal] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const { authenticatedRequest } = useAuth();

  // Auto-navigation after collecting rewards: keeps a handle on the pending
  // timer so it can be cancelled if the player leaves the screen first.
  const autoNavigateTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (autoNavigateTimerRef.current) {
        clearTimeout(autoNavigateTimerRef.current);
      }
    },
    []
  );

  console.log('MissionScreen initialized with params:', params);

  const missionId = Array.isArray(params.missionId)
    ? params.missionId[0]
    : params.missionId;

  const moduleParam = Array.isArray(params.module)
    ? params.module[0]
    : params.module;

  const topicParam = Array.isArray(params.topicId)
    ? params.topicId[0]
    : params.topicId;

  const country = Array.isArray(params.country)
    ? params.country[0]
    : params.country || 'Canada';

  console.log(`Resolved parameters - Mission ID: ${missionId}, Country: ${country}, Module: ${moduleParam ?? 'auto'}, Topic: ${topicParam ?? 'auto'}`);

  // Fetch progress every time this screen opens
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      console.log('MissionScreen focused. Fetching progress...');
      
      const fetchProgress = async () => {
        const storedClaims = await loadClaimedMissions();

        try {
          const serverProgress = await authenticatedRequest('/progress');
          console.log('Server progress fetched successfully.');

          if (mounted) {
            setProgressData(lessonProgressFromServer(serverProgress.content, country));
            setClaimedMissions(
              mergeClaimedMissions(
                claimedMissionsFromServer(serverProgress.lessons),
                storedClaims
              )
            );
            console.log('Progress data state updated from server.');
          }
        } catch (error) {
          console.log('Failed to load server mission progress:', error);

          /*
           * A 4xx/5xx is a real server answer, so the missions must show the
           * truth instead of this device's stored copy (which may belong to an
           * account that used the phone before).
           */
          if (!isOfflineError(error)) {
            if (mounted) {
              setProgressData({});
              setClaimedMissions(storedClaims);
            }
            return;
          }

          console.log('Falling back to local storage progress...');

          try {
            const stored = await loadLessonProgress();
            if (mounted) {
              setProgressData(stored);
              setClaimedMissions(storedClaims);
              console.log('Progress data state updated from local storage.', stored);
            }
          } catch {
            console.log('Failed to load local mission progress as well.');
            if (mounted) {
              setProgressData(null);
              setClaimedMissions(storedClaims);
            }
          }
        }
      };
      
      fetchProgress();
      
      return () => { 
        console.log('MissionScreen unfocused. Cleaning up fetchProgress...');
        mounted = false; 

        // Cancel any pending auto-navigation so we never route away from a
        // screen the player has already left.
        if (autoNavigateTimerRef.current) {
          clearTimeout(autoNavigateTimerRef.current);
          autoNavigateTimerRef.current = null;
        }
      };
    }, [authenticatedRequest])
  );

  const mission = useMemo(() => {
    const foundMission = getMissionById(missionId);
    console.log('Mission lookup result:', foundMission ? `Found "${foundMission.title}"` : 'Not found');
    return foundMission;
  }, [missionId]);

  // Hooks must be called in the same order on every render, so every memoized
  // value is computed (null-safely) before the "mission not found" early return.
  const module = useMemo(() => {
    if (moduleParam) {
      const found = lessonCatalog.find((item) => item.id === moduleParam);

      if (found) return found;
    }
    return mission ? lessonCatalog.find((item) => item.id === mission.moduleId) : null;
  }, [mission, moduleParam]);

  /*
   * A mission counts as claimed when it was claimed on this screen, when the
   * backend reports the claim, or when an earlier offline claim is mirrored
   * in local storage. Claimed missions are always 100% complete, even when
   * sub-lesson progress has not been synchronized to this device yet.
   */
  const missionClaimed = isClaimedLocal || isMissionClaimed(missionId, claimedMissions);

  // Dynamically map objectives and check their exact target sub-lesson
  const resolvedObjectives = useMemo(() => {
    if (!mission || !progressData) {
      console.log('Skipping objective resolution: missing mission or progress data.');
      return [];
    }

    return (mission.objectives || []).map((objective) => {
      const result = findSubLessonById(objective.targetId);
      let isCompleted = false;
      let isDone = false;
      let bestScore = null;

      if (result) {
        // An objective is complete only when its own target sub-lesson is done
        // with MISSION_PASS_PERCENTAGE (80%) - the same rule the server checks.
        const completion = getObjectiveCompletion(progressData, country, objective.targetId);
        isCompleted = completion.completed;
        isDone = completion.done;
        bestScore = completion.bestScore;
        console.log(`Objective "${objective.title}" sub-lesson "${result.subLesson.id}" completed: ${isCompleted}`);
      } else {
        // console.warn(`Target ID "${objective.targetId}" not found for objective "${objective.title}"`);
        console.warn('This objective is not available yet. Try updating the app or check back later.');
      }

      if (missionClaimed) {
        isCompleted = true;
      }

      return {
        ...objective,
        result,
        isCompleted,
        isDone,
        bestScore,
      };
    });
  }, [mission, progressData, country, missionClaimed]);

  // Count how many are actually true
  const objectiveCount = mission?.objectives?.length ?? 0;
  const completedObjectives = resolvedObjectives.filter((obj) => obj.isCompleted).length;
  console.log(`Mission completion status: ${completedObjectives} out of ${objectiveCount} objectives completed.`);

  const progress =
    objectiveCount > 0
      ? completedObjectives / objectiveCount
      : 0;

  const progressPercent = Math.round(progress * 100);

  // MISSION CHAINING: the next mission is read from the catalog order instead of
  // guessing the id (the old string arithmetic produced dead-end ids).
  const nextMission = useMemo(() => getNextMission(missionId), [missionId]);

  const nextMissionModule = useMemo(
    () => (nextMission
      ? lessonCatalog.find((item) => item.id === nextMission.moduleId)
      : null),
    [nextMission]
  );

  // NEXT STAGE CHAINING: when every mission of the current module is done,
  // the next module in the catalog (Canada -> Morocco -> ...) holds the new
  // missions, so the player is pointed at its topics.
  const nextModule = useMemo(() => {
    if (!module) return null;

    const index = lessonCatalog.findIndex(
      (item) => item.id === module.id
    );

    if (index === -1) return null;

    return lessonCatalog[index + 1] ?? null;
  }, [module]);

  const nextModuleCountry = nextModule
    ? getCountryForModule(nextModule.id)
    : null;

  if (!mission) {
    console.log('Rendering fallback UI: Mission not found.');
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          Mission not found
        </Text>

        <Text style={styles.errorText}>
          The mission ID {`"${missionId}"`} does not exist.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => {
            console.log('Navigating back from Mission Not Found screen');
            router.back();
          }}
        >
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleStartObjective = (objective) => {
    console.log(`Attempting to start objective: "${objective.title}" (Target ID: ${objective.targetId})`);
    
    const result = objective.result || findSubLessonById(objective.targetId);

    if (!result) {
      // console.warn(
      //   `Navigation aborted: Sublesson not found for target ID ${objective.targetId}`
      // );
      console.warn('This lesson could not be opened. Try restarting the app or pick another objective.');
      return;
    }

    const {
      module: targetModule,
      lesson: targetLesson,
      subLessonIndex,
    } = result;

    const routeParams = {
      country,
      module: targetModule.id,
      topicId: targetLesson.id,
      subLessonIndex: String(subLessonIndex),
    };
    
    console.log('Navigating to objective sublesson with params:', routeParams);

    router.push({
      pathname: '/lesson',
      params: routeParams,
    });
  };

  const handleStartMission = () => {
    console.log('Start Mission button pressed.');
    
    // Find the first uncompleted objective to start
    const firstIncompleteObjective = resolvedObjectives.find(obj => !obj.isCompleted);
    
    // If all are complete, default to the first one just in case
    const objectiveToStart = firstIncompleteObjective || resolvedObjectives[0];

    if (!objectiveToStart) {
      console.log('No objectives available to start.');
      return;
    }

    console.log(`Routing to objective: "${objectiveToStart.title}"`);
    handleStartObjective(objectiveToStart);
  };

  // Delay before the collected mission automatically moves on, so the player
  // can still see the "✓ Rewards collected" confirmation.
  const AUTO_NAVIGATE_DELAY_MS = 1600;

  const scheduleNextMissionNavigation = () => {
    if (autoNavigateTimerRef.current) {
      clearTimeout(autoNavigateTimerRef.current);
    }

    autoNavigateTimerRef.current = setTimeout(() => {
      autoNavigateTimerRef.current = null;
      console.log('Auto-navigating after reward collection.');
      handleOpenNextMission();
    }, AUTO_NAVIGATE_DELAY_MS);
  };

  const handleClaimRewards = async () => {
    if (isClaiming || missionClaimed) {
      console.log('Claim ignored: already claiming or already collected.');
      return;
    }

    const missionNumber = getMissionNumber(missionId);

    if (!missionNumber) {
      setClaimMessage('This mission could not be identified. Please reopen it from the journey map.');
      return;
    }

    setIsClaiming(true);
    setClaimMessage('');

    try {
      console.log(`Claiming rewards for mission ${missionId}...`);

      // Save rewards to database
      await authenticatedRequest('/missions/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missionId: missionNumber,
          rewards: mission.rewards,
          stars: 0,
        }),
      });

      console.log('Rewards claimed successfully.', missionNumber, mission.rewards);

      // Mirror the claim locally so "Collected" survives offline launches.
      const claimed = await saveClaimedMission(missionId);
      setClaimedMissions(claimed);
      setIsClaimedLocal(true);
      sounds.reward();

      // Daily challenge tracking ("Mission Collector" and "XP Hunter").
      recordMissionClaim({
        missionId,
        xp: mission.rewards?.xp ?? 0,
        coins: mission.rewards?.coins ?? 0,
        country,
      }).catch((challengeError) => {
        console.log('Failed to update challenge progress:', challengeError);
      });

      // Refresh progress so journey/home pick up the newly unlocked place.
      try {
        const serverProgress = await authenticatedRequest('/progress');
        setProgressData(lessonProgressFromServer(serverProgress.content, country));
        setClaimedMissions(
          mergeClaimedMissions(claimedMissionsFromServer(serverProgress.lessons), claimed)
        );
      } catch (refreshError) {
        console.log('Claimed successfully but progress refresh failed:', refreshError);
      }

      // Move on to the next mission automatically after collecting.
      scheduleNextMissionNavigation();
    } catch (error) {
      console.log('Failed to claim mission rewards:', error);

      if (!isOfflineError(error)) {
        setClaimMessage(
          error?.code === 'MISSION_NOT_COMPLETE'
            ? `Almost! Every objective needs ${MISSION_PASS_PERCENTAGE}% or more before the rewards unlock.`
            : error?.message || 'The rewards could not be collected. Please try again.'
        );
        return;
      }

      // Offline-first: queue the claim so the backend still records it later and
      // keep the mission marked as collected for the player.
      await enqueueMissionClaim({
        missionId: Number(missionNumber),
        stars: 0,
        rewards: mission.rewards ?? {},
      });
      const claimed = await saveClaimedMission(missionId);
      setClaimedMissions(claimed);
      setIsClaimedLocal(true);
      setClaimMessage('Rewards saved offline — they sync automatically once you are back online.');

      // Same daily challenge tracking for offline claims.
      recordMissionClaim({
        missionId,
        xp: mission.rewards?.xp ?? 0,
        coins: mission.rewards?.coins ?? 0,
        country,
      }).catch((challengeError) => {
        console.log('Failed to update challenge progress:', challengeError);
      });

      // Same flow offline: the claim is queued, so keep the chain moving.
      scheduleNextMissionNavigation();
    } finally {
      setIsClaiming(false);
    }
  };

  const handleOpenNextMission = () => {
    if (!nextMission) {
      console.log('No further mission in the catalog. Returning to the journey map.');
      router.replace('/journey');
      return;
    }

    const nextCountry = getCountryForModule(nextMission.moduleId) || country;
    const routeParams = { missionId: nextMission.id, country: nextCountry };

    console.log('Routing to next mission:', routeParams);

    router.replace({
      pathname: '/mission',
      params: routeParams,
    });
  };

  const handleOpenNextModule = () => {
    if (!nextModule) {
      console.log('No further module in the catalog. Returning to the journey map.');
      router.replace('/journey');
      return;
    }

    const targetCountry = getCountryForModule(nextModule.id) || country;

    console.log(
      `Routing to next module topics: ${targetCountry} (${nextModule.id})`
    );

    router.push({
      pathname: '/lesson',
      params: {
        country: targetCountry,
        module: nextModule.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            onPress={() => {
              console.log('Navigating back from Mission Screen header');
              router.back();
            }}
            style={styles.backIconButton}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>
              MISSION
            </Text>

            <Text
              style={styles.countryText}
              numberOfLines={1}
            >
              {country}
            </Text>
          </View>
        </View>

        {/* MISSION CARD */}

        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Text style={styles.missionIconText}>
              🎯
            </Text>
          </View>

          <Text style={styles.missionTitle}>
            {mission.title}
          </Text>

          <Text style={styles.missionDescription}>
            {mission.description}
          </Text>

          {module && (
            <Text style={styles.moduleText}>
              {module.title}
            </Text>
          )}
        </View>

        {/* PROGRESS */}

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>
              Mission Progress
            </Text>

            <Text style={styles.progressText}>
              {completedObjectives}/
              {mission.objectives.length} •{' '}
              {progressPercent}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* OBJECTIVES */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Objectives
          </Text>

          {resolvedObjectives.map(
            (objective, index) => {
              const result =
                objective.result;

              const subLesson =
                result?.subLesson;

              const lesson =
                result?.lesson;

              return (
                <View
                  key={objective.id || index}
                  style={styles.objectiveCard}
                >
                  <View
                    style={styles.objectiveNumber}
                  >
                    <Text
                      style={
                        styles.objectiveNumberText
                      }
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.objectiveContent
                    }
                  >
                    <Text
                      style={
                        styles.objectiveTitle
                      }
                    >
                      {objective.title}
                    </Text>

                    {subLesson && (
                      <Text
                        style={
                          styles.subLessonText
                        }
                      >
                        {lesson?.title} •{' '}
                        {subLesson.title}
                      </Text>
                    )}

                    {!result && (
                      <Text
                        style={styles.errorSmall}
                      >
                        Content not found
                      </Text>
                    )}

                    {/* The 80% mission rule, made visible per objective. */}
                    {result && !objective.isCompleted ? (
                      <Text style={styles.objectiveScore}>
                        {objective.bestScore != null
                          ? `Best ${objective.bestScore}% · reach ${MISSION_PASS_PERCENTAGE}% to complete`
                          : `Score ${MISSION_PASS_PERCENTAGE}% or more to complete`}
                      </Text>
                    ) : null}
                  </View>

                  <Pressable
                    style={[
                      styles.objectiveButton,
                      objective.isCompleted && { backgroundColor: '#10B981' }
                    ]}
                    onPress={() =>
                      handleStartObjective(
                        objective
                      )
                    }
                    disabled={!result}
                  >
                    <Text
                      style={
                        styles.objectiveButtonText
                      }
                    >
                      {objective.isCompleted ? '✓' : '→'}
                    </Text>
                  </Pressable>
                </View>
              );
            }
          )}
        </View>

        {/* REWARDS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Rewards
          </Text>

          <View style={styles.rewardCard}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>
                ⭐
              </Text>

              <View>
                <Text style={styles.rewardValue}>
                  +{mission.rewards?.xp ?? 0} XP
                </Text>

                <Text
                  style={styles.rewardLabel}
                >
                  Experience
                </Text>
              </View>
            </View>

            <View style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>
                🪙
              </Text>

              <View>
                <Text style={styles.rewardValue}>
                  +{mission.rewards?.coins ?? 0}
                </Text>

                <Text
                  style={styles.rewardLabel}
                >
                  Coins
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CLAIM FEEDBACK */}

        {claimMessage ? (
          <Text style={styles.claimMessage}>
            {claimMessage}
          </Text>
        ) : null}

        {/* START / CLAIM / COLLECTED */}

        {missionClaimed ? (
          <View style={styles.collectedBlock}>
            <View style={styles.collectedBadge}>
              <Text style={styles.collectedBadgeText}>
                ✓ Rewards collected
              </Text>
            </View>

            {nextMission ? (
              <Pressable
                style={({ pressed }) => [
                  styles.startButton,
                  styles.nextButton,
                  pressed && styles.startButtonPressed,
                ]}
                onPress={handleOpenNextMission}
              >
                <Text style={styles.startButtonText}>
                  Next Mission
                  {nextMissionModule ? ` • ${nextMissionModule.title}` : ''}
                </Text>

                <Text style={styles.startButtonArrow}>
                  →
                </Text>
              </Pressable>
            ) : (
              <>
                <Text style={styles.stageCompleteText}>
                  Every mission in this stage is complete. The next place unlocks as
                  soon as its missions arrive.
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.startButton,
                    pressed && styles.startButtonPressed,
                  ]}
                  onPress={() => {
                    console.log('All stage missions collected. Returning to the journey map.');
                    router.replace('/journey');
                  }}
                >
                  <Text style={styles.startButtonText}>
                    Back to Journey
                  </Text>

                  <Text style={styles.startButtonArrow}>
                    →
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              progress === 1 && { backgroundColor: '#10B981' }, // Make green when complete
              pressed && styles.startButtonPressed,
            ]}
            onPress={progress === 1 ? handleClaimRewards : handleStartMission}
            disabled={
              !mission.objectives ||
              mission.objectives.length === 0 ||
              isClaiming
            }
          >
            {isClaiming ? (
              <View style={styles.claimingRow}>
                <ActivityIndicator color="#FFFFFF" />

                <Text style={styles.startButtonText}>
                  Saving...
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.startButtonText}>
                  {progress === 1
                    ? 'Mission Complete!'
                    : 'Start Mission'}
                </Text>

                {progress !== 1 && (
                  <Text style={styles.startButtonArrow}>
                    →
                  </Text>
                )}
              </>
            )}
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  errorSmall: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },

  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#208AEF',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backIcon: {
    fontSize: 32,
    lineHeight: 34,
    color: '#1F2937',
  },

  headerText: {
    flex: 1,
  },

  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#208AEF',
    letterSpacing: 1,
  },

  countryText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },

  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },

  missionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  missionIconText: {
    fontSize: 36,
  },

  missionTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  missionDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },

  moduleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#208AEF',
    marginTop: 14,
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#208AEF',
  },

  section: {
    marginBottom: 24,
  },

  objectiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginTop: 10,
  },

  objectiveNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  objectiveNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#208AEF',
  },

  objectiveContent: {
    flex: 1,
    paddingRight: 8,
  },

  objectiveTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  subLessonText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
    marginTop: 4,
  },
  objectiveScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 4,
  },

  objectiveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  objectiveButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
  },

  rewardItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rewardIcon: {
    fontSize: 26,
    marginRight: 10,
  },

  rewardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  rewardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  startButton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: '#208AEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  startButtonPressed: {
    opacity: 0.8,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  startButtonArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
  },

  claimingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  claimMessage: {
    fontSize: 13,
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },

  collectedBlock: {
    marginTop: 4,
  },

  collectedBadge: {
    alignSelf: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },

  collectedBadgeText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '800',
  },

  nextButton: {
    backgroundColor: '#10B981',
  },

  stageCompleteText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
});