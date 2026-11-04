import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { getChallengeCycle } from '@/data/challenges/challengeCatalog';
import { sounds } from '@/services/sound';
import { ENGLISH_LOCALE, speak, stopAll as stopAllSpeech } from '@/services/voice';
import { getCountryForModule, getCountryTopics, getDefaultModuleId, getModuleLabel, lessonCatalog } from '@/data/lessons/catalog';
import { missionCatalog } from '@/data/lessons/missionCatalog';
import { isNodeComplete, isMissionComplete } from '@/data/lessons/nodeProgress';
import { getModuleLearningTarget } from '@/data/lessons/nextTarget';
import { getReasonCopy } from '@/services/recommendations';
import { NODE_PASS_PERCENTAGE } from '@/services/scoring';
import { useDailyResetTimer } from '@/hooks/use-challenge-timer';
import { useAuth } from '@/store/auth-context';
import { buildDailyOverview, loadChallengeState } from '@/store/challenge-progress';
import {
  applyServerProgress,
  claimedMissionsFromServer,
  getObjectiveCompletion,
  getTopicProgress,
  isMissionClaimed,
  loadClaimedMissions,
  loadLastPlayedTopic,
  loadLessonProgress,
  loadModuleQuizResults,
  mergeClaimedMissions,
} from '@/store/lesson-progress';
import { getStartupAssessment, hasStartupAssessment } from '@/store/profile-cache';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');

const isSmallScreen = SCREEN_WIDTH < 380;
const isTablet = SCREEN_WIDTH >= 600;

/*
|--------------------------------------------------------------------------
| MAP SIZE
|--------------------------------------------------------------------------
| The map is a static, non-scrolling surface that fills the whole screen.
| Nodes are positioned inside a vertical "band" that starts below the HUD /
| progress cards and ends above the "Continue" card (see getMapLayout), so the
| whole journey is always visible without any horizontal or vertical scroll.
*/
const MAP_WIDTH = SCREEN_WIDTH;
const MAP_HEIGHT = SCREEN_HEIGHT;

/*
|--------------------------------------------------------------------------
| MAP SAFE AREA (dynamic, computed per insets)
|--------------------------------------------------------------------------
| Heights reserved by the floating chrome on top of the map.
*/
const PROGRESS_ROW_TOP = 80;
const PROGRESS_ROW_HEIGHT = 74;
const CONTINUE_CARD_HEIGHT = 82;
const MAP_SIDE_PADDING = 8;

const PROGRESS_COUNTRY = 'Canada';

/*
|--------------------------------------------------------------------------
| NODE SIZE
|--------------------------------------------------------------------------
| Every stop is a single "pill": the circular flag on one side and the
| country label on the other. Keeping the whole stop in ONE box of a fixed
| height is what makes five rows of stops fit on a screen with no scrolling.
*/
const MAX_NODE_SIZE = isSmallScreen
  ? 44
  : isTablet
    ? 62
    : 54;
const MIN_NODE_SIZE = isSmallScreen
  ? 26
  : isTablet
    ? 34
    : 30;

/* Pill box (the 18 leaves room for the 3px "current" border on every side). */
const NODE_PILL_WIDTH = isSmallScreen
  ? 140
  : isTablet
    ? 210
    : 164;
const NODE_PILL_HEIGHT = MAX_NODE_SIZE + 18;

/*
|--------------------------------------------------------------------------
| MAP ROWS
|--------------------------------------------------------------------------
| The map is a serpentine of NODE_ROWS rows (two stops per row). This drives
| the auto-advance: when a stop is finished the map slides down by one row so
| the finished row falls behind the player, and it slides back up if the
| current stop ever moves backwards.
*/
const NODE_ROWS = 5;
const NODE_ROW_STEP = 0.8 / (NODE_ROWS - 1);
const NODE_BOTTOM_ROW = 0.9;                    // topPercent of the closest row
const MAP_ADVANCE_DURATION = 620;

/* Pills on the right half of the screen are mirrored (flag on the right), so
 * the road always runs along the outside of the map. This is the distance
 * between the centre of a pill and the centre of its circle. */
const NODE_PILL_PADDING = 6;
const NODE_ANCHOR_OFFSET =
  NODE_PILL_WIDTH / 2 - NODE_PILL_PADDING - MAX_NODE_SIZE / 2;

/*
|--------------------------------------------------------------------------
| PERSPECTIVE (distance view)
|--------------------------------------------------------------------------
| The map is seen from an angle: the stops at the top of the screen are far
| away and drawn smaller, the ones at the bottom are close and drawn bigger.
| A stop depth of 1 is the size of a bottom stop.
*/
const MIN_NODE_DEPTH = 0.58;
const MAX_NODE_DEPTH = 1;
/* < 1 pushes the growth towards the bottom of the screen (closer to us). */
const NODE_DEPTH_CURVE = 0.8;
/* Minimum road left visible between two rows of stops. */
const MIN_ROAD_GAP = 6;

/* Traveler + speech bubble metrics (used to anchor the bubble). */
const TRAVELER_WIDTH = 170;
const TRAVELER_CHARACTER_HEIGHT = 46;
const BUBBLE_MIN_SPACE = TRAVELER_CHARACTER_HEIGHT + 118;
/* The traveler box is this wide so its centre can sit exactly on the icon. */
const TRAVELER_ICON_WIDTH = 44;
/* Bubble pointer (triangle) size and the minimum gap to the bubble corners. */
const BUBBLE_POINTER_SIZE = 12;
const BUBBLE_POINTER_INSET = 14;
/* How long the speech bubble stays open before it tucks itself away. */
const BUBBLE_AUTO_HIDE_MS = 5000;

/*
|--------------------------------------------------------------------------
| COLORS
|--------------------------------------------------------------------------
*/
const COLORS = {
  white: '#FFFFFF',
  dark: '#0F172A',
  muted: '#94A3B8',
  blue: '#3B82F6',
  blueDark: '#1E3A8A',
  green: '#10B981',
  greenDark: '#047857',
  gray: '#475569',
  grayDark: '#1E293B',
  yellow: '#F59E0B',
  background: '#000000',
};

/*
|--------------------------------------------------------------------------
| NODES (Cleaned up hardcoded status)
|--------------------------------------------------------------------------
| The map is a 5-row serpentine: two nodes per row, alternating sides, so
| every stop is reachable inside a single screen without scrolling.
|  - leftPercent / topPercent are relative to the visible map band
|    (see getMapLayout), NOT to the raw screen size.
*/
const NODES = [
  {
    id: 1,
    topPercent: 0.90,
    leftPercent: 0.26,
    title: 'Canada',
    desc: 'North America',
    image: require('../../../assets/images/countries/canada.jpg'),
  },
  {
    id: 2,
    topPercent: 0.90,
    leftPercent: 0.74,
    title: 'Morocco',
    desc: 'North Africa',
    image: require('../../../assets/images/countries/morocco.jpg'),
  },
  {
    id: 3,
    topPercent: 0.70,
    leftPercent: 0.74,
    title: 'Ivory Coast',
    desc: 'West Africa',
    image: require('../../../assets/images/countries/ivory_coast.jpg'),
  },
  {
    id: 4,
    topPercent: 0.70,
    leftPercent: 0.26,
    title: 'Italy',
    desc: 'Europe',
    image: require('../../../assets/images/countries/italy.jpg'),
  },
  {
    id: 5,
    topPercent: 0.50,
    leftPercent: 0.26,
    title: 'Cameroon',
    desc: 'Central Africa',
    image: require('../../../assets/images/countries/cameroon.jpg'),
  },
  {
    id: 6,
    topPercent: 0.50,
    leftPercent: 0.74,
    title: 'Belgium',
    desc: 'Europe',
    image: require('../../../assets/images/countries/belgium.jpg'),
  },
  {
    id: 7,
    topPercent: 0.30,
    leftPercent: 0.74,
    title: 'Switzerland',
    desc: 'Europe',
    image: require('../../../assets/images/countries/switzerland.jpg'),
  },
  {
    id: 8,
    topPercent: 0.30,
    leftPercent: 0.26,
    title: 'Monaco',
    desc: 'Europe',
    image: require('../../../assets/images/countries/monaco.jpg'),
  },
  {
    id: 9,
    topPercent: 0.10,
    leftPercent: 0.26,
    title: 'Luxembourg',
    desc: 'Europe',
    image: require('../../../assets/images/countries/luxembourg.jpg'),
  },
  {
    id: 10,
    topPercent: 0.10,
    leftPercent: 0.74,
    title: 'France',
    desc: 'Europe',
    image: require('../../../assets/images/countries/france.jpg'),
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

/**
 * Vertical band of the screen that is actually free for the map nodes: it
 * starts right below the progress cards and stops right above the
 * "Continue" card. Everything is laid out inside that band so the map never
 * needs to scroll.
 *
 * All values are in the same coordinate space as the map layer, which lives
 * inside a SafeAreaView (top inset already removed).
 */
function getMapLayout(insets) {
  const topInset = Math.max(insets?.top ?? 0, 10);
  const bottomInset = Math.max(insets?.bottom ?? 0, 0);

  // Bottom of the progress cards, which are positioned with
  // `PROGRESS_ROW_TOP + insets.top`.
  const top = PROGRESS_ROW_TOP + topInset + PROGRESS_ROW_HEIGHT + 10;
  // The SafeAreaView only removes the top inset, so this is the map height.
  const contentHeight = MAP_HEIGHT - topInset;
  const bottom = contentHeight - (bottomInset + CONTINUE_CARD_HEIGHT + 10);

  // Guard against very short screens / large insets so the band never
  // collapses to zero.
  const height = Math.max(220, bottom - top);

  /* Five rows share the band: shrink the stops a little when the band is
   * short so neighbouring rows never touch. The deepest pair of rows (the two
   * closest to the player) sets the maximum scale. */
  const rowSpacing = (height * 0.8) / 4;
  const scale = Math.min(
    isTablet ? 1.12 : 1.02,
    Math.max(0.5, (rowSpacing - MIN_ROAD_GAP) / (getMaxRowDepth() * NODE_PILL_HEIGHT)),
  );

  return {
    top,
    bottom: top + height,
    height,
    contentHeight,
    width: MAP_WIDTH,
    scale,
  };
}

function getNodeX(node, layout) {
  return layout.width * node.leftPercent;
}
function getNodeY(node, layout) {
  return layout.top + layout.height * node.topPercent;
}
/*
 * How many rows the map has to slide down so the current stop sits on the
 * closest row. 0 = the map is at its original place, and it grows every time
 * the player finishes a row, which pushes the finished stops behind him.
 */
function getNodeRowShift(node) {
  if (!node) return 0;
  const rows = Math.round(
    (NODE_BOTTOM_ROW - node.topPercent) / NODE_ROW_STEP,
  );
  return Math.max(0, Math.min(NODE_ROWS - 1, rows));
}
/* Position of a stop inside the map band, once the map has slid. */
function getShiftedTopPercent(node, rowShift) {
  return node.topPercent + rowShift * NODE_ROW_STEP;
}
/*
 * Perspective: 1 at the bottom of the screen (close to the player) down to
 * MIN_NODE_DEPTH at the top (far away). Drives the size of every stop.
 */
function getNodeDepth(topPercent) {
  const clamped = Math.max(0, Math.min(MAX_NODE_DEPTH, topPercent));
  return (
    MIN_NODE_DEPTH +
    (MAX_NODE_DEPTH - MIN_NODE_DEPTH) *
      Math.pow(clamped, NODE_DEPTH_CURVE)
  );
}
/* Depth of a stop on screen: it gets closer (bigger) as the map advances. */
function getNodeShiftedDepth(node, rowShift) {
  return getNodeDepth(getShiftedTopPercent(node, rowShift));
}
/* Deepest average of two consecutive stops: used to fit the rows on screen. */
function getMaxRowDepth() {
  let max = 0;
  for (let i = 1; i < NODES.length; i += 1) {
    const pair =
      (getNodeDepth(NODES[i - 1].topPercent) +
        getNodeDepth(NODES[i].topPercent)) /
      2;
    if (pair > max) max = pair;
  }
  return max || MAX_NODE_DEPTH;
}
/* Is the pill mirrored (circle on the right side of the pill)? */
function isNodeMirrored(node) {
  return node.leftPercent > 0.5;
}
/* X of the circle inside the pill: the road connects the circles, not the
 * middle of the pills, so the path stays visible between two stops. */
function getNodeAnchorX(node, layout, depth) {
  const offset = NODE_ANCHOR_OFFSET * layout.scale * depth;
  return getNodeX(node, layout) + (isNodeMirrored(node) ? offset : -offset);
}
/* Keeps absolutely positioned boxes (traveler bubble) inside the screen. */
function clampX(value, boxWidth, containerWidth = MAP_WIDTH) {
  return Math.max(
    MAP_SIDE_PADDING,
    Math.min(containerWidth - boxWidth - MAP_SIDE_PADDING, value),
  );
}
function getNodeSize(nodeIndex, currentIndex) {
  if (NODES.length <= 1) return MAX_NODE_SIZE;
  if (currentIndex === -1) return MAX_NODE_SIZE;

  const distance = Math.abs(nodeIndex - currentIndex);
  const spread = Math.max(1, NODES.length / 2);
  const proximity = Math.max(0, 1 - distance / spread);
  const scaledSize =
    MIN_NODE_SIZE +
    (MAX_NODE_SIZE - MIN_NODE_SIZE) * (0.45 + proximity * 0.55);

  return Math.round(scaledSize);
}
function getFlagEmoji(countryTitle) {
  const flags = {
    'Canada': '🇨🇦',
    'Morocco': '🇲🇦',
    'Ivory Coast': '🇨🇮',
    'Italy': '🇮🇹',
    'Cameroon': '🇨🇲',
    'Belgium': '🇧🇪',
    'Switzerland': '🇨🇭',
    'Monaco': '🇲🇨',
    'Luxembourg': '🇱🇺',
    'France': '🇫🇷',
  };
  return flags[countryTitle] || '📍';
}

function getTravelerDialogue(node) {
  if (!node) return 'Keep walking... my feet hurt!';
  const quotes = {
    1: 'Day one! Cold weather, big adventure, and a moose. Worth freezing for! HAHAHA',
    2: 'From snow to desert! Now I just need to convince a camel to be my tour guide.HEHEHE',
    3: 'Amazing views and incredible cocoa. Tired feet, happy traveler! Keep going!',
    4: 'Running on no sleep, but pizza is keeping me alive. Priorities!',
    5: 'The hike is tough, but every step feels like an adventure. Explorer mode: ON!',
    6: 'We made it! Mission: find the perfect waffle. This is serious business!',
    7: 'The climb hurts, but the views make every step worth it. Keep going!',
    8: 'Tired, but those yachts are keeping me motivated. Maybe one day!',
    9: 'Small country, big history. We are almost there. Keep pushing!',
    10: 'We made it! Journey complete. Time for a croissant and a well-earned celebration!',
  };
  return quotes[node.id] || `Arrived at ${node.title}! I need a nap...`;
}

/*
 * Overall mission progress across the whole catalog, computed from real
 * lesson progress. Returns { percent, completed, total }:
 *  - a mission counts as completed when it is claimed OR every objective's
 *    own target sub-lesson is completed;
 *  - percent counts the objectives whose target sub-lesson is done, so the bar
 *    moves as the player advances inside the current mission.
 */
function computeMissionProgress(catalog, progress, claimed) {
  const total = catalog?.length ?? 0;
  if (!total) return { percent: 0, completed: 0, total: 0 };

  let completed = 0;
  let objectiveSum = 0;
  let objectiveCount = 0;

  for (const mission of catalog) {
    if (isMissionClaimed(mission.id, claimed)) {
      completed += 1;
      const objectives = mission.objectives?.length ?? 0;
      objectiveSum += objectives;
      objectiveCount += objectives;
      continue;
    }

    if (!mission?.objectives?.length) continue;

    const missionCountry =
      getCountryForModule(mission.moduleId) || PROGRESS_COUNTRY;

    let missionRatioSum = 0;
    let missionObjectiveCount = 0;

    for (const objective of mission.objectives) {
      const completion = getObjectiveCompletion(
        progress,
        missionCountry,
        objective.targetId,
      );

      if (!completion.found || completion.result?.subLesson == null) continue;

      /*
       * An objective targets ONE sub-lesson, so it is scored on that
       * sub-lesson alone. Measuring the whole topic (as this used to) made an
       * objective look unfinished until every sibling sub-lesson was done,
       * which is what kept the mission - and therefore the map node - stuck.
       */
      missionObjectiveCount += 1;
      missionRatioSum += completion.completed ? 1 : 0;
    }

    const objectivesDone = isMissionComplete(
      mission,
      progress,
      missionCountry,
      claimed,
    );

    if (objectivesDone) completed += 1;
    objectiveSum += missionRatioSum;
    objectiveCount += missionObjectiveCount;
  }

  const percent =
    objectiveCount > 0
      ? Math.min(100, Math.round((objectiveSum / objectiveCount) * 100))
      : 0;

  return { percent, completed, total };
}

/*
|--------------------------------------------------------------------------
| ROAD
|--------------------------------------------------------------------------
*/
/**
 * Road between the circles, drawn in the map design coordinates: the whole
 * node layer is translated by the animated map offset, so the path always
 * stays glued to its stops. `rowShift` only matters for the horizontal
 * anchors, which follow the depth a stop has once the map has slid.
 */
function generateRoadPath(layout, rowShift, stopCount = NODES.length) {
  if (!NODES.length) return '';
  let path = `M ${getNodeAnchorX(NODES[0], layout, getNodeShiftedDepth(NODES[0], rowShift))} ${getNodeY(NODES[0], layout)}`;
  for (let i = 1; i < Math.min(stopCount, NODES.length); i += 1) {
    const previous = NODES[i - 1];

    const current = NODES[i];
    const x1 = getNodeAnchorX(previous, layout, getNodeShiftedDepth(previous, rowShift));
    const y1 = getNodeY(previous, layout);
    const x2 = getNodeAnchorX(current, layout, getNodeShiftedDepth(current, rowShift));
    const y2 = getNodeY(current, layout);
    const midpoint = (y1 + y2) / 2;
    path += ` C ${x1} ${midpoint} ${x2} ${midpoint} ${x2} ${y2}`;
  }
  return path;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { session, authenticatedRequest } = useAuth();
  const [progress, setProgress] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [claimedMissions, setClaimedMissions] = useState([]);
  // Best final-quiz score per module: a stop completes only at 80%+.
  const [quizResults, setQuizResults] = useState(null);
  const [lastPlayedTopic, setLastPlayedTopic] = useState(null);
  const [startupAssessments, setStartupAssessments] = useState({});

  /*
   * Daily challenge summary for the "Challenges" button: cleared/total and
   * the real completion percentage (no hardcoded values).
   */
  const [challengeOverview, setChallengeOverview] = useState(null);

  /*
   * Live countdown until the next daily challenge set (local midnight),
   * displayed right next to the Challenges button.
   */
  const challengeCountdown = useDailyResetTimer();

  /*
  |--------------------------------------------------------------------------
  | ANIMATION SHARED VALUES
  |--------------------------------------------------------------------------
  */
  const pulseScale = useSharedValue(1);

  const bubbleScale = useSharedValue(0.9);
  const bubbleOpacity = useSharedValue(0);

  /*
  |--------------------------------------------------------------------------
  | PLACES
  |--------------------------------------------------------------------------
  */
  const places = useMemo(() => {
    const withCompletion = NODES.map((node) => {
      const moduleId = getDefaultModuleId(node.title);
      const startup = startupAssessments[moduleId] ?? null;
      const startupTaken = Boolean(startup?.takenAt);
      const topics = getCountryTopics(node.title, moduleId) ?? [];
      const lessonsDone = topics.filter((topic) => {
        const p = getTopicProgress(lessonProgress, node.title, topic);
        return p.total > 0 && p.count >= p.total;
      }).length;

      return {
        ...node,
        moduleId,
        lessonsDone,
        lessonsTotal: topics.length,
        startupTaken,
        startupAssessment: startup,
        isCompleted: isNodeComplete(
          node.title,
          lessonProgress,
          claimedMissions,
          quizResults,
        ),
      };
    });

    const currentIndex = withCompletion.findIndex((node) => !node.isCompleted);

    return withCompletion.map((node, index) => ({
      ...node,
      status: node.isCompleted
        ? 'completed'
        : index === currentIndex
          ? 'current'
          : 'Locked',
    }));
  }, [lessonProgress, claimedMissions, startupAssessments, quizResults]);

  const currentPlaceIndex = places.findIndex(
    (node) => node.status === 'current',
  );
  const currentPlaceNode = places.find(
    (node) => node.status === 'current',
  );
  const mapBackgroundImage =
    currentPlaceNode
      ? currentPlaceNode.image
      : require('../../../assets/images/background/background.png');

  /*
  |--------------------------------------------------------------------------
  | FUNNY VOICE SPEECH HANDLER
  |--------------------------------------------------------------------------
  */
  const handleBubblePress = (node) => {
    if (!node) return;

    // Shared voice service: the engine is already warm and the English voice
    // already resolved, and cutIn replaces any line still playing.
    speak(getTravelerDialogue(node), {
      pitch: 1.4, // Higher pitch for a small/young sound
      rate: 1.05,  // Slightly faster cadence
      language: ENGLISH_LOCALE,
      cutIn: true,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const refreshProgress = async () => {
        const storedClaims = await loadClaimedMissions();
        const lastPlayed = await loadLastPlayedTopic();

        /*
         * Today's challenge set and the matching progress are read from the
         * local challenge store (see src/store/challenge-progress.js).
         */
        const storedChallengeState = await loadChallengeState();
        const challengeCycle = getChallengeCycle();

        try {
          const serverProgress = await authenticatedRequest('/progress');

          if (mounted) {
            setProgress(serverProgress);

            /*
             * Fold the server completions into the device mirror before
             * reading it back. `mergeServerContentIntoLocal` buckets every
             * sub-lesson under the country of its own module, so Morocco,
             * Italy, ... each keep their own list instead of everything
             * piling up under Canada (see the PROGRESS_COUNTRY note below).
             */
            await applyServerProgress(serverProgress);
            setLessonProgress(await loadLessonProgress());
            setChallengeOverview(
              buildDailyOverview(storedChallengeState, challengeCycle, {
                streak: Number(serverProgress.streak) || 0,
              })
            );
            setClaimedMissions(
              mergeClaimedMissions(
                claimedMissionsFromServer(serverProgress.lessons),
                storedClaims
              )
            );
            setLastPlayedTopic(lastPlayed);
            setQuizResults({ ...(await loadModuleQuizResults()) });

            /* Load startup assessments for all modules (local cache, works offline). */
            const startup = {};
            for (const mod of lessonCatalog) {
              try {
                const a = await getStartupAssessment(mod.id);
                if (a) startup[mod.id] = a;
              } catch {
                // Ignore per-module load failures.
              }
            }
            setStartupAssessments(startup);
          }
        } catch (error) {
          console.log('Failed to load server home progress:', error);
          if (mounted) {
            /*
             * The device mirror is additive and never over-reports (see
             * mergeServerContentIntoLocal), so it is safe to show even when the
             * server could not be reached. Falling back to the local list is
             * what lets a player who finished a module offline still walk past
             * that stop instead of being pushed back to the beginning.
             */
            setLessonProgress(await loadLessonProgress());
            setClaimedMissions(storedClaims);
            setLastPlayedTopic(lastPlayed);
            setQuizResults({ ...(await loadModuleQuizResults()) });

            /* Load startup assessments for all modules (local cache, works offline). */
            const startup = {};
            for (const mod of lessonCatalog) {
              try {
                const a = await getStartupAssessment(mod.id);
                if (a) startup[mod.id] = a;
              } catch {
                // Ignore per-module load failures.
              }
            }
            setStartupAssessments(startup);
            setChallengeOverview(
              buildDailyOverview(storedChallengeState, challengeCycle)
            );
          }
        }
      };

      refreshProgress();

      return () => {
        mounted = false;
      };
    }, [authenticatedRequest]),
  );

  /*
  |--------------------------------------------------------------------------
  | ANIMATION INITIALIZATION
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    return () => {
      stopAllSpeech();
    };
  }, [pulseScale]);

  /*
   * The bubble opens when the traveler reaches a stop, then tucks itself away
   * so it never hides the next stop on the map. Tapping the traveler brings it
   * back; tapping the bubble (voice) keeps it open a little longer.
   */
  const [bubbleDismissedFor, setBubbleDismissedFor] = useState(null);
  const [bubbleTick, setBubbleTick] = useState(0);
  const bubbleVisible =
    Boolean(currentPlaceNode) && bubbleDismissedFor !== currentPlaceNode.id;

  useEffect(() => {
    if (!bubbleVisible) return;

    bubbleOpacity.value = 0;
    bubbleScale.value = 0.9;

    bubbleOpacity.value = withTiming(1, { duration: 500 });
    bubbleScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.5))
    });
  }, [bubbleVisible, currentPlaceNode?.id, bubbleOpacity, bubbleScale]);

  useEffect(() => {
    if (!bubbleVisible) return undefined;

    const nodeId = currentPlaceNode?.id;
    const fade = setTimeout(() => {
      bubbleOpacity.value = withTiming(0, { duration: 250 });
    }, BUBBLE_AUTO_HIDE_MS);
    const hide = setTimeout(
      () => setBubbleDismissedFor(nodeId),
      BUBBLE_AUTO_HIDE_MS + 260,
    );

    return () => {
      clearTimeout(fade);
      clearTimeout(hide);
    };
  }, [bubbleVisible, currentPlaceNode?.id, bubbleTick, bubbleOpacity]);

  /*
  |--------------------------------------------------------------------------
  | MAP LAYOUT + AUTO ADVANCE
  |--------------------------------------------------------------------------
  | Vertical band of the screen that is free for the nodes (between the
  | progress cards and the "Continue" card). Everything on the map is
  | positioned inside this band, which is what makes the screen scroll-free.
  */
  const mapLayout = useMemo(() => getMapLayout(insets), [insets]);

  /*
   * The map advances by itself: every time the current stop changes row, the
   * whole map slides down one row so the finished row falls behind the
   * player. If the current stop ever moves back, the map slides back up to
   * its original place.
   */
  const mapRowShift = useMemo(
    () => getNodeRowShift(currentPlaceNode),
    [currentPlaceNode],
  );
  const mapOffset = useSharedValue(mapRowShift);

  useEffect(() => {
    if (mapOffset.value === mapRowShift) return;
    mapOffset.value = withTiming(mapRowShift, {
      duration: MAP_ADVANCE_DURATION,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [mapRowShift, mapOffset]);

  /*
  |--------------------------------------------------------------------------
  | ROAD PATH
  |--------------------------------------------------------------------------
  */
  const roadPath = useMemo(() => {
    return generateRoadPath(mapLayout, mapRowShift);
  }, [mapLayout, mapRowShift]);

  /* The stretch already travelled: from the first stop up to the current one. */
  const travelledPath = useMemo(() => {
    const reached = currentPlaceIndex === -1 ? NODES.length : currentPlaceIndex + 1;
    return reached > 1 ? generateRoadPath(mapLayout, mapRowShift, reached) : '';
  }, [mapLayout, mapRowShift, currentPlaceIndex]);

  /*
  |--------------------------------------------------------------------------
  | ANIMATED STYLES
  |--------------------------------------------------------------------------
  */
  const pulsingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  /* The auto-advance: the whole node layer (road + stops + traveler) slides
   * down by one row every time the current stop moves forward. */
  const mapAdvanceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: mapOffset.value * mapLayout.height * NODE_ROW_STEP,
      },
    ],
  }));

  const bubbleAnimStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ scale: bubbleScale.value }],
  }));

  /*
  |--------------------------------------------------------------------------
  | NODE PRESS
  |--------------------------------------------------------------------------
  */
  const handleNodePress = (node) => {
    if (node.status === 'Locked') {
      sounds.tap();
      return;
    }

    sounds.whoosh();
    const moduleId = getDefaultModuleId(node.title);
    const country = node.title;
    const startupTaken = Boolean(node.startupTaken);
    const startup = node.startupAssessment;

    // Determine whether every topic of this module is fully completed.
    const topics = getCountryTopics(country, moduleId) ?? [];
    let allTopicsComplete = true;
    for (const topic of topics) {
      const progress = getTopicProgress(lessonProgress, country, topic);
      if (progress.total === 0 || progress.count < progress.total) {
        allTopicsComplete = false;
        break;
      }
    }

    if (!startupTaken) {
      // Startup diagnostic not taken yet — take it first.
      router.push({
        pathname: '/quiz',
        params: { mode: 'startup', country, module: moduleId },
      });
    } else if (!allTopicsComplete) {
      // Startup taken, topics incomplete — start personalized lessons.
      router.push({
        pathname: '/lesson',
        params: { country, module: moduleId },
      });
    } else {
      // Startup taken, all topics complete — take the final assessment.
      router.push({
        pathname: '/quiz',
        params: { mode: 'final', country, module: moduleId },
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CALCULATE ACTIVE MISSION
  |--------------------------------------------------------------------------
  */
  const currentMissionId = useMemo(() => {
    if (!missionCatalog?.length) return 'mission-1';
    if (!lessonProgress && !claimedMissions.length) return 'mission-1';

    for (const mission of missionCatalog) {
      if (isMissionClaimed(mission.id, claimedMissions)) {
        continue;
      }

      const missionCountry = getCountryForModule(mission.moduleId) || PROGRESS_COUNTRY;

      // Same rule the map uses, so the "Continue" card and the node highlight
      // can never point at different missions.
      if (!isMissionComplete(mission, lessonProgress, missionCountry, claimedMissions)) {
        return String(mission.id);
      }
    }

    return String(missionCatalog[missionCatalog.length - 1].id);
  }, [lessonProgress, claimedMissions]);

  /*
  |--------------------------------------------------------------------------
  | MISSION PROGRESS (real values, no hardcoded percentages)
  |--------------------------------------------------------------------------
  */
  const missionProgress = useMemo(
    () =>
      computeMissionProgress(missionCatalog, lessonProgress, claimedMissions),
    [lessonProgress, claimedMissions],
  );

  const currentMissionCountry = useMemo(() => {
    const mission = missionCatalog.find((item) => item.id === currentMissionId);
    return mission ? getCountryForModule(mission.moduleId) : PROGRESS_COUNTRY;
  }, [currentMissionId]);

  /*
   * CONTINUE CARD: one personalized next step for the current map node,
   * following the same order as a node press: placement check first, then
   * the engine's recommended lesson, then the final assessment.
   */
  const continueCard = useMemo(() => {
    const country = currentPlaceNode?.title || currentMissionCountry;
    const moduleId = currentPlaceNode?.moduleId || getDefaultModuleId(country);
    const moduleLabel = getModuleLabel(country, moduleId) || 'Module 1';
    const startupAssessment = startupAssessments[moduleId] ?? null;

    if (!startupAssessment?.takenAt) {
      return {
        label: 'START WITH A QUICK CHECK',
        title: `${country} placement check`,
        meta: 'Tailors your lessons to you',
        button: 'Start',
        route: { pathname: '/quiz', params: { mode: 'startup', country, module: moduleId } },
      };
    }

    const target = getModuleLearningTarget({
      country,
      moduleId,
      lessonProgress,
      lastPlayedTopic,
      startupAssessment,
    });

    if (!target) {
      return {
        label: 'CONTINUE LEARNING',
        title: country,
        meta: moduleLabel,
        button: 'Open',
        route: { pathname: '/lesson', params: { country, module: moduleId } },
      };
    }

    if (target.moduleComplete) {
      return {
        label: 'FINAL ASSESSMENT',
        title: `${country} final quiz`,
        meta: `Score ${NODE_PASS_PERCENTAGE}% to unlock the next stop`,
        button: 'Quiz',
        route: { pathname: '/quiz', params: { mode: 'final', country, module: moduleId } },
      };
    }

    const copy = getReasonCopy(target.topicReason);
    const step = Math.min(target.completedSubLessons + 1, target.totalSubLessons || 1);

    return {
      label: target.topicReason === 'resume'
        ? 'CONTINUE LEARNING'
        : (copy?.label ?? 'Continue learning').toUpperCase(),
      title: target.topicTitle,
      meta: `${moduleLabel} • ${step} / ${target.totalSubLessons}`,
      button: target.completedSubLessons > 0 ? 'Continue' : 'Start',
      route: {
        pathname: '/sublesson',
        params: {
          country,
          module: moduleId,
          topicId: target.topicId,
          subLessonIndex: String(target.subLessonIndex),
        },
      },
    };
  }, [currentPlaceNode, currentMissionCountry, lessonProgress, lastPlayedTopic, startupAssessments]);
  /*
  |--------------------------------------------------------------------------
  | PLAYER
  |--------------------------------------------------------------------------
  */
  const player = {
    name: session?.user?.displayName ?? 'Traveler',
    level: progress?.level ?? 1,
    xp: progress?.xp ?? 0,
    maxXp: 1800,
    coins: progress?.coins ?? 0,
    hearts: progress?.hearts ?? 5,
    streak: progress?.streak ?? 0,
  };

  // Avatar depends on the player's gender (falls back to male).
  const avatarEmoji = session?.user?.gender === 'female' ? '👧🏽' : '👦🏽';
  // The traveler on the map nodes follows the same gender (falls back to male).
  const travelerEmoji =
    session?.user?.gender === 'female' ? '🚶🏽‍♀️‍➡️' : '🚶🏽‍➡️';

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        {/* =========================================================
            MAP
        ========================================================= */}
        <View style={styles.mapArea}>
          <View
            style={[
              styles.mapScaleContainer,
              {
                width: mapLayout.width,
                height: mapLayout.contentHeight,
              },
            ]}
          >
          <View
            pointerEvents="none"
            style={[
              styles.mapBackgroundLayer,
              {
                width: mapLayout.width,
                height: mapLayout.contentHeight,
              },
            ]}
          >
            <Image
              source={mapBackgroundImage}
              style={[
                styles.mapBackground,
                {
                  width: mapLayout.width,
                  height: mapLayout.contentHeight,
                },
              ]}
              resizeMode="cover"
              blurRadius={3}
            />
            <View
              pointerEvents="none"
              style={styles.darkOverlay}
            />
          </View>

          <Animated.View
            style={[
              styles.nodeLayer,
              {
                width: mapLayout.width,
                height: mapLayout.contentHeight,
              },
              mapAdvanceStyle,
            ]}
          >
              <View
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
              >
                <Svg
                  width={mapLayout.width}
                  height={mapLayout.contentHeight}
                >
                  <Path
                    d={roadPath}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={20}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d={roadPath}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d={roadPath}
                    fill="none"
                    stroke={COLORS.blue}
                    strokeWidth={3}
                    strokeDasharray="12 14"
                    strokeLinecap="round"
                  />
                  {!!travelledPath && (
                    <Path
                      d={travelledPath}
                      fill="none"
                      stroke={COLORS.green}
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </Svg>
              </View>

              {places.map((node, nodeIndex) => {
                const nodeX = getNodeX(node, mapLayout);
                const nodeY = getNodeY(node, mapLayout);
                const nodeSize = getNodeSize(nodeIndex, currentPlaceIndex);
                const isCurrent = node.status === 'current';
                const isCompleted = node.status === 'completed';
                const isLocked = node.status === 'Locked';
                const mirrored = isNodeMirrored(node);
                /* Perspective: small far away (top), big close to us (bottom).
                 * The depth follows the shifted position, so a stop grows as
                 * the map advances towards it. */
                const depth = getNodeShiftedDepth(node, mapRowShift);
                const NodeContainer = isCurrent ? Animated.View : View;

                return (
                  <View
                    key={node.id}
                    style={[
                      styles.nodeWrapper,
                      {
                        top: nodeY - NODE_PILL_HEIGHT / 2,
                        left: nodeX - NODE_PILL_WIDTH / 2,
                        transform: [{ scale: mapLayout.scale * depth }],
                      },
                    ]}
                  >
                    <NodeContainer
                      style={isCurrent ? pulsingStyle : undefined}
                    >
                      <Pressable
                        onPress={() => handleNodePress(node)}
                        disabled={isLocked}
                        accessibilityRole="button"
                        accessibilityLabel={`${node.title}, ${
                          isCurrent ? 'current stop' : isCompleted ? 'completed' : 'locked'
                        }`}
                        style={({ pressed }) => [
                          styles.nodePill,
                          {
                            width: NODE_PILL_WIDTH,
                            height: NODE_PILL_HEIGHT,
                          },
                          mirrored && styles.nodePillMirrored,
                          node.status === 'completed' &&
                            styles.nodePillCompleted,
                          isCurrent && styles.nodePillCurrent,
                          node.status === 'Locked' && styles.nodePillLocked,
                          pressed &&
                            node.status !== 'Locked' &&
                            styles.nodePressed,
                        ]}
                      >
                        <View style={styles.nodeCircle}>
                          <ImageBackground
                            source={node.image}
                            style={[
                              styles.nodeImageBackground,
                              {
                                width: nodeSize,
                                height: nodeSize,
                                borderRadius: nodeSize / 2,
                                backgroundColor: COLORS.gray,
                              },
                              isCompleted && styles.nodeCompleted,
                              isCurrent && styles.nodeCurrent,
                              isLocked && styles.nodeLocked,
                            ]}
                            imageStyle={[
                              styles.nodeImageStyle,
                              { borderRadius: nodeSize / 2 - 3 },
                            ]}
                          >
                            {isLocked && (
                              <View style={styles.nodeImageOverlayLocked} />
                            )}
                          </ImageBackground>
                          {/* Status badge on the photo: done / stop number / locked. */}
                          <View
                            style={[
                              styles.nodeBadge,
                              isCompleted && styles.nodeBadgeCompleted,
                              isCurrent && styles.nodeBadgeCurrent,
                              isLocked && styles.nodeBadgeLocked,
                            ]}
                          >
                            <Text
                              style={[
                                styles.nodeBadgeText,
                                isLocked && styles.nodeBadgeTextLocked,
                              ]}
                            >
                              {isCompleted ? '✓' : isLocked ? '🔒' : node.id}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.nodePillInfo,
                            mirrored && styles.nodePillInfoMirrored,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              isCurrent && styles.currentText,
                              isCompleted && styles.completedText,
                              isLocked && styles.lockedText,
                              mirrored && styles.textRight,
                            ]}
                            numberOfLines={1}
                          >
                            {isCurrent
                              ? 'YOU ARE HERE'
                              : isCompleted
                                ? 'COMPLETED'
                                : `STOP ${node.id}`}
                          </Text>
                          <Text
                            style={[
                              styles.lessonTitle,
                              isLocked && styles.lessonTitleLocked,
                              mirrored && styles.textRight,
                            ]}
                            numberOfLines={1}
                          >
                            {node.title}
                          </Text>
                          {isCurrent && node.lessonsTotal > 0 ? (
                            <View
                              style={styles.nodeProgress}
                              accessibilityLabel={`${node.lessonsDone} of ${node.lessonsTotal} lessons done`}
                            >
                              <View style={styles.nodeProgressTrack}>
                                <View
                                  style={[
                                    styles.nodeProgressFill,
                                    {
                                      width: `${Math.max(
                                        6,
                                        (node.lessonsDone / node.lessonsTotal) * 100,
                                      )}%`,
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={styles.nodeProgressText}>
                                {node.lessonsDone}/{node.lessonsTotal}
                              </Text>
                            </View>
                          ) : (
                            <Text
                              style={[
                                styles.lessonDescription,
                                isLocked && styles.lessonDescriptionLocked,
                                mirrored && styles.textRight,
                              ]}
                              numberOfLines={1}
                            >
                              {node.desc}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    </NodeContainer>
                  </View>
                );
              })}

              {currentPlaceNode && (() => {
                const currentDepth = getNodeShiftedDepth(
                  currentPlaceNode,
                  mapRowShift,
                );
                /* The traveler stands on the circle of the current stop. */
                const nodeX = getNodeAnchorX(
                  currentPlaceNode,
                  mapLayout,
                  currentDepth,
                );
                const nodeY = getNodeY(currentPlaceNode, mapLayout);

                /* The traveler stands right on top of its stop. The bubble
                 * goes above him, or below him when there is not enough room
                 * left inside the map band (top rows). */
                const pillHalfHeight =
                  (NODE_PILL_HEIGHT * mapLayout.scale * currentDepth) / 2;
                /* The traveler is drawn at the same depth as his stop. */
                const travelerScale = mapLayout.scale * currentDepth;
                const characterBottom = nodeY - pillHalfHeight - 4;
                const bubbleBelow =
                  characterBottom - mapLayout.top < BUBBLE_MIN_SPACE;

                /* Only the bubble is kept inside the screen: the traveler stays
                 * right over the stop icon and the pointer slides along the
                 * bubble edge so it always points at him. */
                const containerLeft = clampX(
                  nodeX - TRAVELER_WIDTH / 2,
                  TRAVELER_WIDTH,
                );
                const iconOffset = nodeX - containerLeft;
                const pointerLeft = Math.max(
                  BUBBLE_POINTER_INSET,
                  Math.min(
                    TRAVELER_WIDTH - BUBBLE_POINTER_INSET - BUBBLE_POINTER_SIZE,
                    iconOffset - BUBBLE_POINTER_SIZE / 2,
                  ),
                );

                const bubble = (
                  <Animated.View
                    style={[
                      bubbleAnimStyle,
                      bubbleBelow && styles.bubbleStacked,
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        setBubbleTick((tick) => tick + 1);
                        handleBubblePress(currentPlaceNode);
                      }}
                      style={({ pressed }) => [
                        styles.speechBubble,
                        pressed && styles.speechBubblePressed,
                      ]}
                    >
                      <Text style={styles.speechTextHeader}>
                        <Text style={styles.speechTextHighlight}>
                          {currentPlaceNode.title}{' '}
                          {getFlagEmoji(currentPlaceNode.title)}
                        </Text>
                      </Text>
                      <Text style={styles.speechText}>
                        {getTravelerDialogue(currentPlaceNode)}
                      </Text>
                      <Text style={styles.tapAudioHint}>🔊 Tap voice!</Text>
                      <View
                        style={[
                          bubbleBelow
                            ? styles.bubblePointerUp
                            : styles.bubblePointerDown,
                          { left: pointerLeft },
                        ]}
                      />
                    </Pressable>
                  </Animated.View>
                );

                const character = (
                  <Pressable
                    onPress={() => {
                      sounds.tap();
                      setBubbleDismissedFor(
                        bubbleVisible ? currentPlaceNode.id : null,
                      );
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      bubbleVisible ? 'Hide travel note' : 'Show travel note'
                    }
                    hitSlop={8}
                    style={[
                      styles.travelerCharacter,
                      {
                        marginLeft: iconOffset - TRAVELER_ICON_WIDTH / 2,
                        transform: [{ scale: travelerScale }],
                      },
                    ]}
                  >
                    <Text style={styles.travelerEmoji}>
                      {travelerEmoji}
                    </Text>
                    {!bubbleVisible && (
                      <View style={styles.travelerHint}>
                        <Text style={styles.travelerHintText}>💬</Text>
                      </View>
                    )}
                  </Pressable>
                );

                return (
                  <View
                    pointerEvents="box-none"
                    style={[
                      styles.travelerContainer,
                      {
                        left: containerLeft,
                        ...(bubbleBelow
                          ? {
                            top:
                              characterBottom -
                              TRAVELER_CHARACTER_HEIGHT,
                          }
                          : {
                            bottom:
                              mapLayout.contentHeight - characterBottom,
                          }),
                      },
                    ]}
                  >
                    {bubbleBelow ? character : bubbleVisible && bubble}
                    {bubbleBelow ? bubbleVisible && bubble : character}
                  </View>
                );
              })()}
          </Animated.View>
        </View>
        </View>

        {/* =========================================================
            TOP HUD
        ========================================================= */}
        <View
          style={[
            styles.topHud,
            {
              top: Math.max(insets.top, 10),
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [
              styles.profileArea,
              pressed && styles.profilePressed,
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarEmoji}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.playerName} numberOfLines={1}>
                {player.name}
              </Text>
            </View>
          </Pressable>
          <View style={styles.statsArea}>
            <Stat
              icon="⭐"
              value={`Lv.${player.level}`}
              sub={`${player.xp}/${player.maxXp}`}
            />
            <Stat icon="🪙" value={player.coins} />
            <Stat icon="🔥" value={player.streak} />
            <Stat icon="❤️" value={player.hearts} />
          </View>
        </View>

        {/* =========================================================
            PROGRESS PANEL
        ========================================================= */}
        <View
          style={[
            styles.progressRow,
            {
              top: PROGRESS_ROW_TOP + insets.top,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View today's challenges. New set in ${challengeCountdown.text}.`}
            onPress={() => router.push('/challenge')}
            style={({ pressed }) => [
              styles.progressPanel,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.progressCard}>
              <View style={styles.cardHeadingRow}>
                <Text
                  style={styles.cardHeading}
                  numberOfLines={1}
                >
                  🗺️ Challenges
                </Text>
                <View
                  accessible
                  accessibilityLabel={`New challenges in ${challengeCountdown.text}`}
                  style={styles.timerPill}
                >
                  <Text style={styles.timerPillText}>
                    ⏳ {challengeCountdown.text}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFillBlue,
                    { width: `${challengeOverview?.percent ?? 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {challengeOverview
                  ? `${challengeOverview.completed}/${challengeOverview.total} cleared`
                  : 'Daily quest'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View available missions and challenges"
            onPress={() => {
              router.push({
                pathname: '/journey',
                params: {
                  missionId: currentMissionId,
                  country: currentMissionCountry,
                },
              });
            }}
            style={({ pressed }) => [
              styles.progressPanel,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.progressCard}>
              <Text style={styles.cardHeading}>🎯 Missions</Text>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFillBlue,
                    { width: `${missionProgress.percent}%` },
                  ]}
                />
              </View>
              <Text
                accessible
                accessibilityLabel={`${missionProgress.completed} of ${missionProgress.total} missions completed`}
                style={styles.progressPercentage}
              >
                {missionProgress.total > 0
                  ? `${missionProgress.completed}/${missionProgress.total} • ${missionProgress.percent}%`
                  : '0%'}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* =========================================================
            CONTINUE CARD
        ========================================================= */}
        <View
          style={[
            styles.continueContainer,
            {
              bottom: 10 + insets.bottom,
            },
          ]}
        >
          <View style={styles.continueCard}>
            <View style={styles.continueInfo}>
              <Text style={styles.continueLabel} numberOfLines={1}>
                {continueCard.label}
              </Text>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {continueCard.title}
              </Text>
              <Text style={styles.continueMeta} numberOfLines={1}>
                {continueCard.meta}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                sounds.whoosh();
                router.push(continueCard.route);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${continueCard.button}: ${continueCard.title}`}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.continueButtonText}>▶</Text>
              <Text style={styles.continueButtonLabel}>{continueCard.button}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ icon, value, sub }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  mapArea: {
    flex: 1,
    overflow: 'hidden',
  },
  mapScaleContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  mapBackgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  nodeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nodeWrapper: {
    position: 'absolute',
    width: NODE_PILL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  nodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: NODE_PILL_PADDING,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'rgba(226,232,240,1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 6,
  },
  nodePillMirrored: {
    flexDirection: 'row-reverse',
  },
  /* Every stop shares the same white pill; the state shows in the border,
   * the badge and the label colour only. */
  nodePillCompleted: {
    borderColor: COLORS.green,
  },
  nodePillCurrent: {
    borderWidth: 3,
    borderColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 12,
  },
  nodePillLocked: {
    borderColor: '#CBD5E1',
  },
  nodeCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodePillInfo: {
    flex: 1,
    marginLeft: NODE_PILL_PADDING,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nodePillInfoMirrored: {
    marginLeft: 0,
    marginRight: NODE_PILL_PADDING,
  },
  textRight: {
    textAlign: 'right',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 1,
    textAlign: 'left',
  },
  completedText: {
    color: COLORS.greenDark,
  },
  currentText: {
    color: COLORS.blue,
  },
  lockedText: {
    color: '#94A3B8',
  },
  lessonTitle: {
    color: COLORS.dark,
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '900',
    textAlign: 'left',
  },
  lessonTitleLocked: {
    color: '#475569',
  },
  lessonDescription: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'left',
  },
  lessonDescriptionLocked: {
    color: '#94A3B8',
  },
  nodeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  nodeProgressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  nodeProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.blue,
  },
  nodeProgressText: {
    marginLeft: 5,
    color: COLORS.blueDark,
    fontSize: 9,
    fontWeight: '900',
  },
  nodeImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeImageStyle: {},
  nodeImageOverlayLocked: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  nodeCompleted: {
    borderWidth: 3,
    borderColor: COLORS.green,
  },
  nodeCurrent: {
    borderWidth: 3,
    borderColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  nodeLocked: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  nodePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  nodeBadge: {
    position: 'absolute',
    bottom: -3,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 10,
  },
  nodeBadgeCompleted: {
    backgroundColor: COLORS.green,
  },
  nodeBadgeCurrent: {
    backgroundColor: COLORS.yellow,
  },
  nodeBadgeLocked: {
    backgroundColor: '#64748B',
  },
  nodeBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  nodeBadgeTextLocked: {
    fontSize: 9,
  },
  travelerContainer: {
    position: 'absolute',
    alignItems: 'flex-start',
    zIndex: 80,
    width: TRAVELER_WIDTH,
  },
  speechBubble: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 8,
    alignItems: 'center',
    width: TRAVELER_WIDTH,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  /* Used when the bubble has to render under the traveler (top rows). */
  bubbleStacked: {
    marginTop: 8,
  },
  speechBubblePressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#F8FAFC',
  },
  speechTextHeader: {
    marginBottom: 3,
    textAlign: 'center',
  },
  speechText: {
    color: COLORS.dark,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
  speechTextHighlight: {
    color: COLORS.blueDark,
    fontSize: 11,
    fontWeight: '900',
  },
  tapAudioHint: {
    fontSize: 8,
    color: COLORS.blue,
    fontWeight: '800',
    marginTop: 4,
  },
  /* Two separate pointers (no `undefined` overrides, which web keeps). Their
   * `left` is set inline so the tip points at the traveler. */
  bubblePointerDown: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: BUBBLE_POINTER_SIZE / 2,
    borderRightWidth: BUBBLE_POINTER_SIZE / 2,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.white,
  },
  /* Flipped pointer for the bubble rendered under the traveler. */
  bubblePointerUp: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: BUBBLE_POINTER_SIZE / 2,
    borderRightWidth: BUBBLE_POINTER_SIZE / 2,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.white,
  },
  travelerCharacter: {
    width: TRAVELER_ICON_WIDTH,
    height: TRAVELER_CHARACTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerEmoji: {
    fontSize: 34,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  /* Small "tap me" cue shown while the speech bubble is tucked away. */
  travelerHint: {
    position: 'absolute',
    top: -6,
    right: -14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  travelerHintText: {
    fontSize: 12,
  },
  topHud: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  profileArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8,
  },
  profilePressed: {
    opacity: 0.75,
  },
  avatar: {
    width: isSmallScreen ? 38 : 46,
    height: isSmallScreen ? 38 : 46,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  avatarText: {
    fontSize: isSmallScreen ? 19 : 23,
  },
  profileText: {
    marginLeft: 10,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  playerName: {
    fontSize: isSmallScreen ? 14 : 16,
    color: COLORS.dark,
    fontWeight: '900',
  },
  statsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen ? 6 : 10,
    flexShrink: 0,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: isSmallScreen ? 14 : 17,
    marginRight: 2,
  },
  statValue: {
    color: COLORS.dark,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '900',
  },
  statSub: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '700',
  },
  progressPanel: {
    flex: 1,
  },
  progressRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
  },
  progressCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeading: {
    color: COLORS.dark,
    fontSize: isSmallScreen ? 11 : 13,
    fontWeight: '900',
    marginBottom: 8,
    flexShrink: 1,
  },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  timerPillText: {
    color: COLORS.blueDark,
    fontSize: isSmallScreen ? 9 : 10,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFillBlue: {
    height: '100%',
    backgroundColor: COLORS.blue,
    borderRadius: 5,
  },
  progressPercentage: {
    color: COLORS.blueDark,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 6,
  },
  continueContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
  },
  continueCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 22,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  continueInfo: {
    flex: 1,
    marginRight: 10,
  },
  continueLabel: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  continueTitle: {
    color: COLORS.dark,
    fontSize: isSmallScreen ? 16 : 19,
    fontWeight: '900',
    marginTop: 4,
  },
  continueMeta: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    minWidth: isSmallScreen ? 85 : 100,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderColor: '#1D4ED8',
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  continueButtonLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  buttonPressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 2,
  },
});