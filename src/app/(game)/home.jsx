import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
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

import { getCountryTopics, getDefaultModuleId } from '@/data/lesson-catalog';
import { useAuth } from '@/store/auth-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');

const isSmallScreen = SCREEN_WIDTH < 380;
const isTablet = SCREEN_WIDTH >= 600;
/*
|--------------------------------------------------------------------------
| MAP SIZE
|--------------------------------------------------------------------------
*/
const MAP_WIDTH = SCREEN_WIDTH * 2.5;
const MAP_HEIGHT = SCREEN_HEIGHT;
/*
|--------------------------------------------------------------------------
| NODE SIZE
|--------------------------------------------------------------------------
*/
const MAX_NODE_SIZE = isSmallScreen
  ? 54
  : isTablet
    ? 76
    : 68;
const MIN_NODE_SIZE = isSmallScreen
  ? 22
  : isTablet
    ? 32
    : 28;
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
| NODES
|--------------------------------------------------------------------------
*/

const NODES = [
  {
    id: 1,
    topPercent: 0.68,
    leftPercent: 0.06,
    status: 'current',
    title: 'Canada',
    desc: 'North America',
    image: require('../../../assets/images/countries/canada.jpg'),
  },
  {
    id: 2,
    topPercent: 0.68,
    leftPercent: 0.24,
    status: 'Locked',
    title: 'Morocco',
    desc: 'North Africa',
    image: require('../../../assets/images/countries/morocco.jpg'),
  },
  {
    id: 3,
    topPercent: 0.59,
    leftPercent: 0.24,
    status: 'Locked',
    title: 'Ivory Coast',
    desc: 'West Africa',
    image: require('../../../assets/images/countries/ivory_coast.jpg'),
  },
  {
    id: 4,
    topPercent: 0.59,
    leftPercent: 0.42,
    status: 'Locked',
    title: 'Italy',
    desc: 'Europe',
    image: require('../../../assets/images/countries/italy.jpg'),
  },
  {
    id: 5,
    topPercent: 0.50,
    leftPercent: 0.42,
    status: 'Locked',
    title: 'Cameroon',
    desc: 'Central Africa',
    image: require('../../../assets/images/countries/cameroon.jpg'),
  },
  {
    id: 6,
    topPercent: 0.50,
    leftPercent: 0.59,
    status: 'Locked',
    title: 'Belgium',
    desc: 'Europe',
    image: require('../../../assets/images/countries/belgium.jpg'),
  },
  {
    id: 7,
    topPercent: 0.41,
    leftPercent: 0.59,
    status: 'Locked',
    title: 'Switzerland',
    desc: 'Europe',
    image: require('../../../assets/images/countries/switzerland.jpg'),
  },
  {
    id: 8,
    topPercent: 0.41,
    leftPercent: 0.77,
    status: 'Locked',
    title: 'Monaco',
    desc: 'Europe',
    image: require('../../../assets/images/countries/monaco.jpg'),
  },
  {
    id: 9,
    topPercent: 0.32,
    leftPercent: 0.77,
    status: 'Locked',
    title: 'Luxembourg',
    desc: 'Europe',
    image: require('../../../assets/images/countries/luxembourg.jpg'),
  },
  {
    id: 10,
    topPercent: 0.32,
    leftPercent: 0.90,
    status: 'Locked',
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
function getNodeX(node) {
  return MAP_WIDTH * node.leftPercent;
}
function getNodeY(node) {
  return MAP_HEIGHT * node.topPercent;
}
function getNodeSize(nodeIndex) {
  if (NODES.length <= 1) return MAX_NODE_SIZE;

  const currentIndex = NODES.findIndex(
    (node) => node.status === 'current',
  );
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
|--------------------------------------------------------------------------
| ROAD
|--------------------------------------------------------------------------
*/
function generateRoadPath() {
  if (!NODES.length) return '';
  let path = `M ${getNodeX(NODES[0])} ${getNodeY(NODES[0])}`;
  for (let i = 1; i < NODES.length; i += 1) {
    const previous = NODES[i - 1];
    const current = NODES[i];
    const x1 = getNodeX(previous);
    const y1 = getNodeY(previous);
    const x2 = getNodeX(current);
    const y2 = getNodeY(current);
    const midpoint = (y1 + y2) / 2;
    path += ` C ${x1} ${midpoint} ${x2} ${midpoint} ${x2} ${y2}`;
  }
  return path;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { session, authenticatedRequest } = useAuth();
  const [progress, setProgress] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | ANIMATION SHARED VALUES
  |--------------------------------------------------------------------------
  */
  const pulseScale = useSharedValue(1);
  const walkOffset = useSharedValue(0);
  const walkRotation = useSharedValue(0);

  const travelerBob = useSharedValue(0);
  const travelerSway = useSharedValue(0);
  const bubbleScale = useSharedValue(0.9);
  const bubbleOpacity = useSharedValue(0);

  /*
  |--------------------------------------------------------------------------
  | CURRENT PLACE
  |--------------------------------------------------------------------------
  */
  const currentPlaceNode = NODES.find(
    (node) => node.status === 'current',
  );
  const currentTopic = getCountryTopics(
    currentPlaceNode?.title || 'Canada',
    getDefaultModuleId(currentPlaceNode?.title || 'Canada'),
  )[0];
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

    // Stop previous speech if playing
    Speech.stop();

    const dialogueText = getTravelerDialogue(node);

    Speech.speak(dialogueText, {
      pitch: 1.0,
      rate: 1.05,
      language: 'en-US',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | PROFILE & ANIMATION INITIALIZATION
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let mounted = true;
    authenticatedRequest('/profile')
      .then((profile) => {
        if (mounted) {
          setProgress(profile.progress);
        }
      })
      .catch(() => {});

    // Pulse Animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    walkOffset.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 220, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 220, easing: Easing.inOut(Easing.ease) }),
        withTiming(-4, { duration: 220, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 220, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    walkRotation.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 220, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 440, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 220, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Traveler Walking Animation
    travelerBob.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 350, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 350, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    travelerSway.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    return () => {
      mounted = false;
      Speech.stop();
    };
  }, [
    authenticatedRequest,
    pulseScale,
    walkOffset,
    walkRotation,
    travelerBob,
    travelerSway,
  ]);

  // Bubble Animation
  useEffect(() => {
    bubbleOpacity.value = 0;
    bubbleScale.value = 0.9;

    bubbleOpacity.value = withTiming(1, { duration: 500 });
    bubbleScale.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.back(1.5)) 
    });
  }, [currentPlaceNode?.id, bubbleOpacity, bubbleScale]);

  /*
  |--------------------------------------------------------------------------
  | ROAD PATH
  |--------------------------------------------------------------------------
  */
  const roadPath = useMemo(() => {
    return generateRoadPath();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | ANIMATED STYLES
  |--------------------------------------------------------------------------
  */
  const pulsingStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${walkRotation.value}deg` },
    ],
  }));

  const travelerAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: travelerBob.value },
      { translateX: travelerSway.value },
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
      return;
    }

    const moduleId = getDefaultModuleId(node.title);

    router.push({
      pathname: '/lesson',
      params: {
        country: node.title,
        module: moduleId,
      },
    });
  };

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
    coins: 540,
    hearts: 5,
    streak: progress?.streak ?? 0,
  };

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
          <ScrollView
            horizontal
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={true}
            nestedScrollEnabled={true}
            directionalLockEnabled={true}
          >
            {/* =====================================================
                2.5x HORIZONTAL MAP
            ===================================================== */}
            <View
              style={[
                styles.mapScaleContainer,
                {
                  width: MAP_WIDTH,
                  height: MAP_HEIGHT,
                },
              ]}
            >
              {/* ===================================================
                  FULL MAP BACKGROUND
              =================================================== */}
              <View
                pointerEvents="none"
                style={[
                  styles.mapBackgroundLayer,
                  {
                    width: MAP_WIDTH,
                    height: MAP_HEIGHT,
                  },
                ]}
              >
                <Image
                  source={mapBackgroundImage}
                  style={[
                    styles.mapBackground,
                    {
                      width: MAP_WIDTH,
                      height: MAP_HEIGHT,
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

              {/* ===================================================
                  NODE + ROAD LAYER
              =================================================== */}
              <Animated.View
                style={[
                  styles.nodeLayer,
                  {
                    width: MAP_WIDTH,
                    height: MAP_HEIGHT,
                  },
                ]}
              >
                  {/* =================================================
                      ROAD
                  ================================================= */}
                  <View
                    pointerEvents="none"
                    style={StyleSheet.absoluteFill}
                  >
                    <Svg
                      width={MAP_WIDTH}
                      height={MAP_HEIGHT}
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
                    </Svg>
                  </View>

                  {/* =================================================
                      MISSION NODES
                  ================================================= */}
                  {NODES.map((node, nodeIndex) => {
                    const nodeX = getNodeX(node);
                    const nodeY = getNodeY(node);
                    const nodeSize = getNodeSize(nodeIndex);
                    const isCurrent = node.status === 'current';
                    const NodeContainer = isCurrent ? Animated.View : View;

                    return (
                      <View
                        key={node.id}
                        style={[
                          styles.nodeWrapper,
                          {
                            top: nodeY,
                            left: nodeX - 65,
                          },
                        ]}
                      >
                        {/* ==========================================
                            LESSON CARD
                        ========================================== */}
                        <View
                          style={[
                            styles.lessonCard,
                            isCurrent && styles.lessonCardCurrent,
                          ]}
                        >
                          {node.status !== 'Locked' && (
                            <Text
                              style={[
                                styles.statusText,
                                isCurrent
                                  ? styles.currentText
                                  : styles.completedText,
                              ]}
                            >
                              {isCurrent ? 'CURRENT' : 'COMPLETED'}
                            </Text>
                          )}
                          <Text
                            style={styles.lessonTitle}
                            numberOfLines={1}
                          >
                            {node.title}
                          </Text>
                          <Text
                            style={styles.lessonDescription}
                            numberOfLines={1}
                          >
                            {node.desc}
                          </Text>
                        </View>

                        {/* ==========================================
                            NODE BUTTON
                        ========================================== */}
                        <NodeContainer
                          style={isCurrent ? pulsingStyle : undefined}
                        >
                          <Pressable
                            onPress={() => handleNodePress(node)}
                            disabled={node.status === 'Locked'}
                            style={({ pressed }) => [
                              styles.nodeButton,
                              {
                                width: nodeSize,
                                height: nodeSize,
                                borderRadius: nodeSize / 2,
                              },
                              node.status === 'completed' &&
                                styles.nodeCompleted,
                              isCurrent && styles.nodeCurrent,
                              node.status === 'Locked' && styles.nodeLocked,
                              pressed &&
                                node.status !== 'Locked' &&
                                styles.nodePressed,
                            ]}
                          >
                            <ImageBackground
                              source={node.image}
                              style={[
                                styles.nodeImageBackground,
                                { backgroundColor: COLORS.gray },
                              ]}
                              imageStyle={[
                                styles.nodeImageStyle,
                                {
                                  borderRadius: nodeSize / 2 - 3,
                                  opacity: 0.65,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.nodeImageOverlay,
                                  node.status === 'Locked' &&
                                    styles.nodeImageOverlayLocked,
                                ]}
                              >
                                {node.status === 'Locked' ? (
                                  <Text style={styles.lockIcon}>🔒</Text>
                                ) : (
                                  <Text style={styles.nodeNumber}>
                                    {node.id}
                                  </Text>
                                )}
                              </View>
                            </ImageBackground>
                            {isCurrent && (
                              <View style={styles.currentDot} />
                            )}
                          </Pressable>
                        </NodeContainer>
                      </View>
                    );
                  })}

                  {/* =================================================
                      TRAVELER & TOUCHABLE SPEECH BUBBLE
                  ================================================= */}
                  {currentPlaceNode && (() => {
                    const nodeX = getNodeX(currentPlaceNode);
                    const nodeY = getNodeY(currentPlaceNode);

                    return (
                      <View
                        pointerEvents="box-none"
                        style={[
                          styles.travelerContainer,
                          {
                            left: nodeX - 65,
                            top: nodeY - 130,
                          },
                        ]}
                      >
                        <Animated.View style={bubbleAnimStyle}>
                          <Pressable
                            onPress={() => handleBubblePress(currentPlaceNode)}
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
                            <View style={styles.bubblePointer} />
                          </Pressable>
                        </Animated.View>

                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.travelerCharacter,
                            travelerAnimStyle,
                          ]}
                        >
                          <Text style={styles.travelerEmoji}>🚶‍➡️</Text>
                        </Animated.View>
                      </View>
                    );
                  })()}
              </Animated.View>
            </View>
          </ScrollView>
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
              <Text style={styles.avatarText}>👦🏽</Text>
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
              top: 80 + insets.top,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View journey progress"
            onPress={() => router.push('/journey')}
            style={({ pressed }) => [
              styles.progressPanel,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.progressCard}>
              <Text style={styles.cardHeading}>🗺️ Journey</Text>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFillBlue, { width: '30%' }]} />
              </View>
              <Text style={styles.progressPercentage}>30%</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View available missions and challenges"
            onPress={() => router.push('/mission')}
            style={({ pressed }) => [
              styles.progressPanel,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.progressCard}>
              <Text style={styles.cardHeading}>🎯 Missions</Text>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFillBlue, { width: '30%' }]} />
              </View>
              <Text style={styles.progressPercentage}>30%</Text>
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
              <Text style={styles.continueLabel}>CONTINUE LEARNING</Text>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {currentPlaceNode?.title || 'Ivory Coast'}
              </Text>
              <Text style={styles.continueMeta}>Module 1 • Lesson 3 / 10</Text>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/lesson',
                  params: {
                    country: currentPlaceNode?.title || 'Canada',
                    module: getDefaultModuleId(
                      currentPlaceNode?.title || 'Canada',
                    ),
                    topicId: currentTopic?.id,
                  },
                })
              }
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.continueButtonText}>▶</Text>
              <Text style={styles.continueButtonLabel}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| STAT COMPONENT
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 0,
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
    width: 130,
    alignItems: 'center',
    zIndex: 10,
  },
  lessonCard: {
    minWidth: isSmallScreen ? 105 : 120,
    maxWidth: isSmallScreen ? 130 : 150,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  lessonCardCurrent: {
    borderWidth: 2,
    borderColor: COLORS.blue,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  completedText: {
    color: COLORS.greenDark,
  },
  currentText: {
    color: COLORS.blueDark,
  },
  lessonTitle: {
    color: COLORS.dark,
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  lessonDescription: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  nodeButton: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderBottomWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  nodeImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeImageStyle: {},
  nodeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  nodeImageOverlayLocked: {
    backgroundColor: 'rgba(15,23,42,0.8)',
  },
  nodeCompleted: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.greenDark,
  },
  nodeCurrent: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blueDark,
    borderWidth: 4,
    borderBottomWidth: 7,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  nodeLocked: {
    backgroundColor: COLORS.gray,
    borderColor: COLORS.grayDark,
  },
  nodePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  nodeNumber: {
    color: COLORS.white,
    fontSize: isSmallScreen ? 18 : 21,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  lockIcon: {
    fontSize: isSmallScreen ? 16 : 19,
  },
  currentDot: {
    position: 'absolute',
    top: -5,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 10,
  },

  /*
  |--------------------------------------------------------------------------
  | TRAVELER & BUBBLE
  |--------------------------------------------------------------------------
  */
  travelerContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 80,
    width: 170,
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
    maxWidth: 170,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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
  bubblePointer: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.white,
  },
  travelerCharacter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerEmoji: {
    fontSize: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },

  /*
  |--------------------------------------------------------------------------
  | HUD
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | PROGRESS PANEL
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | CONTINUE CARD
  |--------------------------------------------------------------------------
  */
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