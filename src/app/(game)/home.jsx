import { router } from 'expo-router';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

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
| ZOOM
|--------------------------------------------------------------------------
|
| 0.6 = zoomed out
| 1.0 = normal size
| 2.5 = zoomed in
|
*/

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;

/*
|--------------------------------------------------------------------------
| NODE SIZE
|--------------------------------------------------------------------------
*/

const NODE_SIZE = isSmallScreen
  ? 40
  : isTablet
    ? 62
    : 56;

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
    topPercent: 0.70,
    leftPercent: 0.10,
    status: 'completed',
    title: 'Canada',
    desc: 'North America',
    image: require('../../../assets/images/countries/canada.jpg'),
  },
  {
    id: 2,
    topPercent: 0.67,
    leftPercent: 0.20,
    status: 'completed',
    title: 'Morocco',
    desc: 'North Africa',
    image: require('../../../assets/images/countries/morocco.jpg'),
  },
  {
    id: 3,
    topPercent: 0.64,
    leftPercent: 0.32,
    status: 'current',
    title: 'Ivory Coast',
    desc: 'West Africa',
    image: require('../../../assets/images/countries/ivory_coast.jpg'),
  },
  {
    id: 4,
    topPercent: 0.61,
    leftPercent: 0.45,
    status: 'locked',
    title: 'Italy',
    desc: 'Europe',
    image: require('../../../assets/images/countries/italy.jpg'),
  },
  {
    id: 5,
    topPercent: 0.58,
    leftPercent: 0.60,
    status: 'locked',
    title: 'Cameroon',
    desc: 'Central Africa',
    image: require('../../../assets/images/countries/cameroon.jpg'),
  },
  {
    id: 6,
    topPercent: 0.55,
    leftPercent: 0.72,
    status: 'locked',
    title: 'Belgium',
    desc: 'Europe',
    image: require('../../../assets/images/countries/belgium.jpg'),
  },
  {
    id: 7,
    topPercent: 0.52,
    leftPercent: 0.80,
    status: 'locked',
    title: 'Switzerland',
    desc: 'Europe',
    image: require('../../../assets/images/countries/switzerland.jpg'),
  },
  {
    id: 8,
    topPercent: 0.40,
    leftPercent: 0.85,
    status: 'locked',
    title: 'Monaco',
    desc: 'Europe',
    image: require('../../../assets/images/countries/monaco.jpg'),
  },
  {
    id: 9,
    topPercent: 0.30,
    leftPercent: 0.90,
    status: 'locked',
    title: 'Luxembourg',
    desc: 'Europe',
    image: require('../../../assets/images/countries/luxembourg.jpg'),
  },
  {
    id: 10,
    topPercent: 0.20,
    leftPercent: 0.93,
    status: 'locked',
    title: 'France',
    desc: 'Europe',
    image: require('../../../assets/images/countries/france.jpg'),
  },
];
/*
|--------------------------------------------------------------------------
| NODE POSITION
|--------------------------------------------------------------------------
*/
function getNodeX(node) {
  return MAP_WIDTH * node.leftPercent;
}
function getNodeY(node) {
  return MAP_HEIGHT * node.topPercent;
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
  | ZOOM VALUES
  |--------------------------------------------------------------------------
  */
  const zoom = useSharedValue(1);
  const savedZoom = useSharedValue(1);
  /*
  |--------------------------------------------------------------------------
  | CURRENT NODE PULSE
  |--------------------------------------------------------------------------
  */
  const pulseScale = useSharedValue(1);
  /*
  |--------------------------------------------------------------------------
  | PROFILE
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
    /*
    |--------------------------------------------------------------------------
    | CURRENT NODE PULSE
    |--------------------------------------------------------------------------
    */
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
    return () => {
      mounted = false;
    };
  }, [authenticatedRequest, pulseScale]);
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
  | PINCH ZOOM
  |--------------------------------------------------------------------------
  |
  | Rotation is disabled.
  |
  | Minimum: 0.6x
  | Normal: 1.0x
  | Maximum: 2.5x
  |
  */
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedZoom.value = zoom.value;
    })
    .onUpdate((event) => {
      const nextZoom =
        savedZoom.value * event.scale;
      zoom.value = Math.min(
        Math.max(nextZoom, MIN_ZOOM),
        MAX_ZOOM,
      );
    })
    .onEnd(() => {
      zoom.value = withSpring(
        Math.min(
          Math.max(zoom.value, MIN_ZOOM),
          MAX_ZOOM,
        ),
        {
          damping: 15,
          stiffness: 100,
        },
      );
    });
  /*
  |--------------------------------------------------------------------------
  | NODE GESTURE
  |--------------------------------------------------------------------------
  |
  | Pinch zoom only.
  | No rotation.
  |
  */
  const nodeGesture = pinchGesture;
  /*
  |--------------------------------------------------------------------------
  | NODE ZOOM ANIMATION
  |--------------------------------------------------------------------------
  */
  const nodeLayerAnimatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: zoom.value,
        },
      ],
    }));
  /*
  |--------------------------------------------------------------------------
  | CURRENT NODE PULSE
  |--------------------------------------------------------------------------
  */
  const pulsingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pulseScale.value,
      },
    ],
  }));
  /*
  |--------------------------------------------------------------------------
  | NODE PRESS
  |--------------------------------------------------------------------------
  */
  const handleNodePress = (node) => {
    if (node.status === 'locked') {
      return;
    }
    router.push({
      pathname: '/lesson',
      params: {
        id: String(node.id),
      },
    });
  };
  /*
  |--------------------------------------------------------------------------
  | PLAYER
  |--------------------------------------------------------------------------
  */
  const player = {
    name:
      session?.user?.displayName ??
      'Traveler',
    level:
      progress?.level ?? 1,
    xp:
      progress?.xp ?? 0,
    maxXp: 1800,
    coins: 540,
    hearts: 5,
    streak:
      progress?.streak ?? 0,
  };
  /*
  |--------------------------------------------------------------------------
  | CURRENT PLACE
  |--------------------------------------------------------------------------
  */
  const currentPlaceNode = NODES.find(
    (node) => node.status === 'current',
  );
  const mapBackgroundImage =
    currentPlaceNode
      ? currentPlaceNode.image
      : require('../../../assets/images/background/background.png');
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
                  resizeMode="stretch"
                />
                <View
                  pointerEvents="none"
                  style={styles.darkOverlay}
                />
              </View>
              {/* ===================================================
                  NODE + ROAD LAYER
              =================================================== */}
              <GestureDetector gesture={nodeGesture}>
                <Animated.View
                  style={[
                    styles.nodeLayer,
                    {
                      width: MAP_WIDTH,
                      height: MAP_HEIGHT,
                    },
                    nodeLayerAnimatedStyle,
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
                      JOURNEY NODES
                  ================================================= */}
                  {NODES.map((node) => {
                    const nodeX =
                      getNodeX(node);
                    const nodeY =
                      getNodeY(node);
                    const isCurrent =
                      node.status === 'current';
                    const NodeContainer =
                      isCurrent
                        ? Animated.View
                        : View;
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
                            isCurrent &&
                              styles.lessonCardCurrent,
                          ]}
                        >
                          {node.status !== 'locked' && (
                            <Text
                              style={[
                                styles.statusText,
                                isCurrent
                                  ? styles.currentText
                                  : styles.completedText,
                              ]}
                            >
                              {isCurrent
                                ? 'CURRENT'
                                : 'COMPLETED'}
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
                          style={
                            isCurrent
                              ? pulsingStyle
                              : undefined
                          }
                        >
                          <Pressable
                            onPress={() =>
                              handleNodePress(node)
                            }
                            disabled={
                              node.status === 'locked'
                            }
                            style={({ pressed }) => [
                              styles.nodeButton,
                              node.status === 'completed' &&
                                styles.nodeCompleted,
                              isCurrent &&
                                styles.nodeCurrent,
                              node.status === 'locked' &&
                                styles.nodeLocked,
                              pressed &&
                                node.status !== 'locked' &&
                                styles.nodePressed,
                            ]}
                          >
                            <ImageBackground
                              source={node.image}
                              style={
                                styles.nodeImageBackground
                              }
                              imageStyle={
                                styles.nodeImageStyle
                              }
                            >
                              <View
                                style={[
                                  styles.nodeImageOverlay,
                                  node.status === 'locked' &&
                                    styles.nodeImageOverlayLocked,
                                ]}
                              >
                                {node.status === 'locked' ? (
                                  <Text
                                    style={styles.lockIcon}
                                  >
                                    🔒
                                  </Text>
                                ) : (
                                  <Text
                                    style={styles.nodeNumber}
                                  >
                                    {node.id}
                                  </Text>
                                )}
                              </View>
                            </ImageBackground>
                            {isCurrent && (
                              <View
                                style={styles.currentDot}
                              />
                            )}
                          </Pressable>
                        </NodeContainer>
                      </View>
                    );
                  })}
                </Animated.View>
              </GestureDetector>
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
              top:
                Math.max(
                  insets.top,
                  10,
                ),
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push('/profile')
            }
            style={({ pressed }) => [
              styles.profileArea,
              pressed &&
                styles.profilePressed,
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                👦🏽
              </Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.greeting}>
                Bonjour,
              </Text>
              <Text
                style={styles.playerName}
                numberOfLines={1}
              >
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
            <Stat
              icon="🪙"
              value={player.coins}
            />
            <Stat
              icon="🔥"
              value={player.streak}
            />
            <Stat
              icon="❤️"
              value={player.hearts}
            />
          </View>
        </View>
        {/* =========================================================
            PROGRESS PANEL
        ========================================================= */}
        <View
          style={[
            styles.progressPanel,
            {
              top:
                110 +
                insets.top,
            },
          ]}
        >
          <View style={styles.progressCard}>
            <Text style={styles.cardHeading}>
              🗺️ Journey
            </Text>
            <View
              style={
                styles.progressBackground
              }
            >
              <View
                style={[
                  styles.progressFillBlue,
                  {
                    width: '30%',
                  },
                ]}
              />
            </View>
            <Text
              style={
                styles.progressPercentage
              }
            >
              30%
            </Text>
          </View>
        </View>
        {/* =========================================================
            CONTINUE CARD
        ========================================================= */}
        <View
          style={[
            styles.continueContainer,
            {
              bottom:
                16 +
                insets.bottom,
            },
          ]}
        >
          <View style={styles.continueCard}>
            <View style={styles.continueInfo}>
              <Text
                style={
                  styles.continueLabel
                }
              >
                CONTINUE LEARNING
              </Text>
              <Text
                style={
                  styles.continueTitle
                }
                numberOfLines={1}
              >
                {currentPlaceNode?.title ||
                  'Ivory Coast'}
              </Text>
              <Text
                style={
                  styles.continueMeta
                }
              >
                Module 1 • Lesson 3 / 10
              </Text>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    '/lesson',
                  params: {
                    id:
                      currentPlaceNode
                        ? String(
                            currentPlaceNode.id,
                          )
                        : '3',
                  },
                })
              }
              style={({ pressed }) => [
                styles.continueButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.continueButtonText
                }
              >
                ▶
              </Text>
              <Text
                style={
                  styles.continueButtonLabel
                }
              >
                Continue
              </Text>
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
function Stat({
  icon,
  value,
  sub,
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>
        {icon}
      </Text>
      <View>
        <Text style={styles.statValue}>
          {value}
        </Text>
        {sub ? (
          <Text style={styles.statSub}>
            {sub}
          </Text>
        ) : null}
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
    backgroundColor:
      COLORS.background,
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
  /*
  |--------------------------------------------------------------------------
  | BACKGROUND
  |--------------------------------------------------------------------------
  */
  mapBackgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor:
      COLORS.background,
    overflow: 'hidden',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(15, 23, 42, 0.65)',
  },
  /*
  |--------------------------------------------------------------------------
  | NODE LAYER
  |--------------------------------------------------------------------------
  */
  nodeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  /*
  |--------------------------------------------------------------------------
  | NODE
  |--------------------------------------------------------------------------
  */
  nodeWrapper: {
    position: 'absolute',
    width: 130,
    alignItems: 'center',
    zIndex: 10,
  },
  lessonCard: {
    minWidth: isSmallScreen
      ? 105
      : 120,
    maxWidth: isSmallScreen
      ? 130
      : 150,
    backgroundColor:
      'rgba(255,255,255,0.95)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 5,
    shadowColor:
      '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  lessonCardCurrent: {
    borderWidth: 2,
    borderColor:
      COLORS.blue,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  completedText: {
    color:
      COLORS.greenDark,
  },
  currentText: {
    color:
      COLORS.blueDark,
  },
  lessonTitle: {
    color:
      COLORS.dark,
    fontSize: isSmallScreen
      ? 12
      : 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  lessonDescription: {
    color:
      COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },

  /*
  |--------------------------------------------------------------------------
  | NODE BUTTON
  |--------------------------------------------------------------------------
  */
  nodeButton: {
    width:
      NODE_SIZE,
    height:
      NODE_SIZE,
    borderRadius:
      NODE_SIZE / 2,
    overflow: 'hidden',
    alignItems:
      'center',
    justifyContent:
      'center',
    borderWidth: 3,
    borderBottomWidth: 6,
    shadowColor:
      '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  nodeImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent:
      'center',
    alignItems:
      'center',
  },
  nodeImageStyle: {
    borderRadius:
      NODE_SIZE / 2 - 3,
  },
  nodeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent:
      'center',
    alignItems:
      'center',
    backgroundColor:
      'rgba(0,0,0,0.4)',
  },
  nodeImageOverlayLocked: {
    backgroundColor:
      'rgba(15,23,42,0.8)',
  },
  nodeCompleted: {
    backgroundColor:
      COLORS.green,
    borderColor:
      COLORS.greenDark,
  },
  nodeCurrent: {
    backgroundColor:
      COLORS.blue,
    borderColor:
      COLORS.blueDark,
    borderWidth: 4,
    borderBottomWidth: 7,
    shadowColor:
      COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  nodeLocked: {
    backgroundColor:
      COLORS.gray,
    borderColor:
      COLORS.grayDark,
  },
  nodePressed: {
    opacity: 0.85,
    transform: [
      {
        scale: 0.95,
      },
    ],
  },
  nodeNumber: {
    color:
      COLORS.white,
    fontSize: isSmallScreen
      ? 18
      : 21,
    fontWeight: '900',
    textShadowColor:
      'rgba(0,0,0,0.5)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 3,
  },
  lockIcon: {
    fontSize: isSmallScreen
      ? 16
      : 19,
  },
  currentDot: {
    position: 'absolute',
    top: -5,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor:
      COLORS.yellow,
    borderWidth: 2,
    borderColor:
      COLORS.white,
    zIndex: 10,
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
    backgroundColor:
      'rgba(255,255,255,0.88)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    shadowColor:
      '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
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
    width: isSmallScreen
      ? 38
      : 46,
    height: isSmallScreen
      ? 38
      : 46,
    borderRadius: 25,
    backgroundColor:
      '#DBEAFE',
    alignItems:
      'center',
    justifyContent:
      'center',
    borderWidth: 2,
    borderColor:
      COLORS.blue,
  },
  avatarText: {
    fontSize: isSmallScreen
      ? 19
      : 23,
  },
  profileText: {
    marginLeft: 10,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 10,
    color:
      COLORS.muted,
    fontWeight: '700',
    textTransform:
      'uppercase',
  },
  playerName: {
    fontSize: isSmallScreen
      ? 14
      : 16,
    color:
      COLORS.dark,
    fontWeight: '900',
  },
  statsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallScreen
      ? 6
      : 10,
    flexShrink: 0,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: isSmallScreen
      ? 14
      : 17,
    marginRight: 2,
  },
  statValue: {
    color:
      COLORS.dark,
    fontSize: isSmallScreen
      ? 12
      : 14,
    fontWeight: '900',
  },
  statSub: {
    color:
      COLORS.muted,
    fontSize: 8,
    fontWeight: '700',
  },
  /*
  |--------------------------------------------------------------------------
  | PROGRESS PANEL
  |--------------------------------------------------------------------------
  */
  progressPanel: {
    position: 'absolute',
    left: 14,
    gap: 8,
    zIndex: 10,
  },
  progressCard: {
    width: isSmallScreen
      ? 135
      : 150,
    backgroundColor:
      'rgba(255,255,255,0.92)',
    padding: 12,
    borderRadius: 18,
    shadowColor:
      '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeading: {
    color:
      COLORS.dark,
    fontSize: isSmallScreen
      ? 11
      : 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor:
      '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFillBlue: {
    height: '100%',
    backgroundColor:
      COLORS.blue,
    borderRadius: 5,
  },
  progressPercentage: {
    color:
      COLORS.blueDark,
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
    backgroundColor:
      'rgba(255,255,255,0.98)',
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    shadowColor:
      '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  continueInfo: {
    flex: 1,
    marginRight: 10,
  },
  continueLabel: {
    color:
      COLORS.blue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform:
      'uppercase',
  },
  continueTitle: {
    color:
      COLORS.dark,
    fontSize: isSmallScreen
      ? 16
      : 19,
    fontWeight: '900',
    marginTop: 4,
  },
  continueMeta: {
    color:
      COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor:
      '#3B82F6',
    minWidth: isSmallScreen
      ? 85
      : 100,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderColor:
      '#1D4ED8',
  },
  continueButtonText: {
    color:
      COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  continueButtonLabel: {
    color:
      COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  buttonPressed: {
    transform: [
      {
        translateY: 3,
      },
    ],
    borderBottomWidth: 2,
  },
});