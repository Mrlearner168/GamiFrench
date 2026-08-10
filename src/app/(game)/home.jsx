import { useRef } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get('window');

const isSmallScreen = SCREEN_WIDTH < 380;
const isTablet = SCREEN_WIDTH >= 600;

const MAP_HEIGHT = Math.max(1500, SCREEN_HEIGHT * 2);

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

const NODE_SIZE = isSmallScreen ? 62 : isTablet ? 82 : 70;

const COLORS = {
  white: '#FFFFFF',
  dark: '#172033',
  muted: '#667085',

  blue: '#3B82F6',
  blueDark: '#1D4ED8',

  green: '#22C55E',
  greenDark: '#15803D',

  gray: '#94A3B8',
  grayDark: '#475569',

  yellow: '#FACC15',

  background: '#86C440',
};

const PLAYER = {
  name: 'Traveler',
  level: 6,
  xp: 1280,
  maxXp: 1800,
  coins: 540,
  hearts: 5,
  streak: 4,
};

/*
|--------------------------------------------------------------------------
| JOURNEY NODES
|--------------------------------------------------------------------------
*/

const NODES = [
  {
    id: 1,
    top: MAP_HEIGHT - 220,
    left: 0.25,
    status: 'completed',
    title: 'The Village',
    desc: 'Greetings',
    lesson: 'Lesson 1',
  },

  {
    id: 2,
    top: MAP_HEIGHT - 460,
    left: 0.58,
    status: 'completed',
    title: 'Sunny Farm',
    desc: 'Numbers & Colors',
    lesson: 'Lesson 2',
  },

  {
    id: 3,
    top: MAP_HEIGHT - 700,
    left: 0.40,
    status: 'current',
    title: 'Green Forest',
    desc: 'Family Members',
    lesson: 'Lesson 3',
  },

  {
    id: 4,
    top: MAP_HEIGHT - 940,
    left: 0.68,
    status: 'locked',
    title: 'Small Town',
    desc: 'Daily Conversation',
    lesson: 'Lesson 4',
  },

  {
    id: 5,
    top: MAP_HEIGHT - 1170,
    left: 0.35,
    status: 'locked',
    title: 'French Market',
    desc: 'Shopping',
    lesson: 'Lesson 5',
  },

  {
    id: 6,
    top: MAP_HEIGHT - 1400,
    left: 0.70,
    status: 'locked',
    title: 'Royal Castle',
    desc: 'French Master',
    lesson: 'Final Mission',
  },
];

/*
|--------------------------------------------------------------------------
| ROAD COORDINATES
|--------------------------------------------------------------------------
*/

const getNodeX = (node) => {
  return SCREEN_WIDTH * node.left;
};

const generateRoadPath = () => {
  if (!NODES.length) {
    return '';
  }

  let path = `M ${getNodeX(NODES[0])} ${NODES[0].top}`;

  for (let i = 1; i < NODES.length; i++) {
    const previous = NODES[i - 1];
    const current = NODES[i];

    const x1 = getNodeX(previous);
    const y1 = previous.top;

    const x2 = getNodeX(current);
    const y2 = current.top;

    const midpoint = (y1 + y2) / 2;

    path += `
      C
      ${x1} ${midpoint}
      ${x2} ${midpoint}
      ${x2} ${y2}
    `;
  }

  return path;
};

export default function Home() {
  const insets = useSafeAreaInsets();

  const scrollY = useRef(
    new Animated.Value(0)
  ).current;

  /*
  |--------------------------------------------------------------------------
  | ZOOM STATE
  |--------------------------------------------------------------------------
  */

  const scale = useSharedValue(1);

  const savedScale = useSharedValue(1);

  /*
  |--------------------------------------------------------------------------
  | PAN STATE
  |--------------------------------------------------------------------------
  */

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  /*
  |--------------------------------------------------------------------------
  | PINCH GESTURE
  |--------------------------------------------------------------------------
  */

  const pinchGesture = Gesture.Pinch()

    .onStart(() => {
      savedScale.value = scale.value;
    })

    .onUpdate((event) => {
      let nextScale =
        savedScale.value * event.scale;

      if (nextScale < MIN_ZOOM) {
        nextScale = MIN_ZOOM;
      }

      if (nextScale > MAX_ZOOM) {
        nextScale = MAX_ZOOM;
      }

      scale.value = nextScale;
    })

    .onEnd(() => {
      if (scale.value < MIN_ZOOM) {
        scale.value = withSpring(MIN_ZOOM);
      }

      if (scale.value > MAX_ZOOM) {
        scale.value = withSpring(MAX_ZOOM);
      }
    });

  /*
  |--------------------------------------------------------------------------
  | PAN GESTURE
  |--------------------------------------------------------------------------
  */

  const panGesture = Gesture.Pan()

    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })

    .onUpdate((event) => {
      /*
       * Allow map movement only while zoomed.
       */

      if (scale.value <= 1) {
        translateX.value = 0;
        translateY.value = 0;
        return;
      }

      translateX.value =
        savedTranslateX.value + event.translationX;

      translateY.value =
        savedTranslateY.value + event.translationY;
    });

  /*
  |--------------------------------------------------------------------------
  | COMBINE PINCH + PAN
  |--------------------------------------------------------------------------
  */

  const mapGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture
  );

  /*
  |--------------------------------------------------------------------------
  | MAP ANIMATION
  |--------------------------------------------------------------------------
  */

  const mapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
        {
          scale: scale.value,
        },
      ],
    };
  });

  /*
  |--------------------------------------------------------------------------
  | ZOOM CONTROLS
  |--------------------------------------------------------------------------
  */

  const zoomIn = () => {
    scale.value = withSpring(
      Math.min(scale.value + 0.25, MAX_ZOOM)
    );
  };

  const zoomOut = () => {
    scale.value = withSpring(
      Math.max(scale.value - 0.25, MIN_ZOOM)
    );

    if (scale.value <= 1) {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  };

  const resetZoom = () => {
    scale.value = withSpring(1);

    translateX.value = withSpring(0);

    translateY.value = withSpring(0);
  };

  /*
  |--------------------------------------------------------------------------
  | NODE PRESS
  |--------------------------------------------------------------------------
  */

  const handleNodePress = (node) => {
    if (node.status === 'locked') {
      return;
    }

    console.log('Opening lesson:', node.lesson);
  };

  const roadPath = generateRoadPath();

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>

        {/* =========================================================
            MAP AREA
        ========================================================= */}

        <GestureDetector gesture={mapGesture}>

          <View style={styles.mapGestureArea}>

            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              bounces={true}
              scrollEventThrottle={16}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom:
                    200 + insets.bottom,
                },
              ]}
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: scrollY,
                      },
                    },
                  },
                ],
                {
                  useNativeDriver: true,
                }
              )}
            >

              <Animated.View
                style={[
                  styles.zoomLayer,
                  mapAnimatedStyle,
                ]}
              >

                <ImageBackground
                  source={require('../../../assets/images/background/background.png')}
                  style={[
                    styles.mapBackground,
                    {
                      height: MAP_HEIGHT,
                    },
                  ]}
                  resizeMode="cover"
                >

                  {/* =================================================
                      ROAD
                  ================================================= */}

                  <View
                    pointerEvents="none"
                    style={StyleSheet.absoluteFill}
                  >

                    <Svg
                      width={SCREEN_WIDTH}
                      height={MAP_HEIGHT}
                    >

                      {/* ROAD SHADOW */}

                      <Path
                        d={roadPath}
                        fill="none"
                        stroke="rgba(0,0,0,0.18)"
                        strokeWidth={26}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* ROAD */}

                      <Path
                        d={roadPath}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={17}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* ROAD CENTER */}

                      <Path
                        d={roadPath}
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth={5}
                        strokeDasharray="22 18"
                        strokeLinecap="round"
                      />

                    </Svg>

                  </View>

                  {/* =================================================
                      NODES
                  ================================================= */}

                  {NODES.map((node) => {

                    const nodeX = getNodeX(node);

                    const nodeScale =
                      scrollY.interpolate({

                        inputRange: [
                          node.top - SCREEN_HEIGHT,

                          node.top -
                            SCREEN_HEIGHT * 0.55,

                          node.top,

                          node.top + 250,
                        ],

                        outputRange: [
                          0.75,
                          1.08,
                          1,
                          0.92,
                        ],

                        extrapolate: 'clamp',
                      });

                    return (
                      <Animated.View
                        key={node.id}
                        style={[
                          styles.nodeWrapper,

                          {
                            top: node.top,

                            left: nodeX - 80,

                            transform: [
                              {
                                scale:
                                  nodeScale,
                              },
                            ],
                          },
                        ]}
                      >

                        {/* =================================================
                            LESSON CARD
                        ================================================= */}

                        <View
                          style={[
                            styles.lessonCard,

                            node.status === 'current' &&
                              styles.lessonCardCurrent,
                          ]}
                        >

                          {node.status !== 'locked' && (
                            <Text
                              style={[
                                styles.statusText,

                                node.status ===
                                'current'
                                  ? styles.currentText
                                  : styles.completedText,
                              ]}
                            >
                              {node.status ===
                              'current'
                                ? 'CURRENT'
                                : 'COMPLETED'}
                            </Text>
                          )}

                          <Text
                            style={
                              styles.lessonTitle
                            }
                            numberOfLines={1}
                          >
                            {node.title}
                          </Text>

                          <Text
                            style={
                              styles.lessonDescription
                            }
                            numberOfLines={1}
                          >
                            {node.desc}
                          </Text>

                        </View>

                        {/* =================================================
                            NODE BUTTON
                        ================================================= */}

                        <Pressable
                          onPress={() =>
                            handleNodePress(node)
                          }
                          disabled={
                            node.status ===
                            'locked'
                          }
                          style={({
                            pressed,
                          }) => [

                            styles.nodeButton,

                            node.status ===
                            'completed' &&
                              styles.nodeCompleted,

                            node.status ===
                            'current' &&
                              styles.nodeCurrent,

                            node.status ===
                            'locked' &&
                              styles.nodeLocked,

                            pressed &&
                              node.status !==
                              'locked' &&
                              styles.nodePressed,
                          ]}
                        >

                          {node.status ===
                          'locked' ? (

                            <Text
                              style={
                                styles.lockIcon
                              }
                            >
                              🔒
                            </Text>

                          ) : (

                            <Text
                              style={
                                styles.nodeNumber
                              }
                            >
                              {node.id}
                            </Text>

                          )}

                          {node.status ===
                            'current' && (
                            <View
                              style={
                                styles.currentDot
                              }
                            />
                          )}

                        </Pressable>

                      </Animated.View>
                    );
                  })}

                </ImageBackground>

              </Animated.View>

            </Animated.ScrollView>

          </View>

        </GestureDetector>

        {/* =========================================================
            ZOOM CONTROLS
        ========================================================= */}

        <View style={styles.zoomControls}>

          <Pressable
            onPress={zoomIn}
            style={({ pressed }) => [
              styles.zoomButton,
              pressed &&
                styles.zoomButtonPressed,
            ]}
          >
            <Text style={styles.zoomText}>
              +
            </Text>
          </Pressable>

          <Pressable
            onPress={resetZoom}
            style={({ pressed }) => [
              styles.zoomButton,
              pressed &&
                styles.zoomButtonPressed,
            ]}
          >
            <Text style={styles.resetText}>
              ⛶
            </Text>
          </Pressable>

          <Pressable
            onPress={zoomOut}
            style={({ pressed }) => [
              styles.zoomButton,
              pressed &&
                styles.zoomButtonPressed,
            ]}
          >
            <Text style={styles.zoomText}>
              −
            </Text>
          </Pressable>

        </View>

        {/* =========================================================
            TOP PLAYER HUD
        ========================================================= */}

        <View
          style={[
            styles.topHud,
            {
              top: Math.max(
                insets.top,
                8
              ),
            },
          ]}
        >

          <View style={styles.profileArea}>

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
                {PLAYER.name}
              </Text>

            </View>

          </View>

          <View style={styles.statsArea}>

            <Stat
              icon="⭐"
              value={`Lv.${PLAYER.level}`}
              sub={`${PLAYER.xp}/${PLAYER.maxXp}`}
            />

            <Stat
              icon="🪙"
              value={PLAYER.coins}
            />

            <Stat
              icon="🔥"
              value={PLAYER.streak}
            />

            <Stat
              icon="❤️"
              value={PLAYER.hearts}
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
                100 +
                insets.top,
            },
          ]}
        >

          <View style={styles.progressCard}>

            <Text style={styles.cardHeading}>
              🎯 Today's Goal
            </Text>

            <Text style={styles.cardSmallText}>
              Complete 1 lesson
            </Text>

            <View
              style={
                styles.progressBackground
              }
            >

              <View
                style={[
                  styles.progressFill,
                  {
                    width: '100%',
                  },
                ]}
              />

            </View>

            <Text
              style={styles.completedGoal}
            >
              ✓ Complete
            </Text>

          </View>

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

          <View
            style={styles.continueCard}
          >

            <View
              style={styles.continueInfo}
            >

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
                Green Forest
              </Text>

              <Text
                style={
                  styles.continueMeta
                }
              >
                Module 1 • Lesson 3 / 5
              </Text>

            </View>

            <Pressable
              onPress={() =>
                console.log(
                  'Continue Learning'
                )
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

        {sub && (
          <Text style={styles.statSub}>
            {sub}
          </Text>
        )}

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

  mapGestureArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  zoomLayer: {
    transformOrigin: 'center',
  },

  mapBackground: {
    width: SCREEN_WIDTH,
  },

  /*
  |--------------------------------------------------------------------------
  | ZOOM CONTROLS
  |--------------------------------------------------------------------------
  */

  zoomControls: {
    position: 'absolute',

    right: 12,

    top: SCREEN_HEIGHT * 0.42,

    backgroundColor:
      'rgba(255,255,255,0.95)',

    borderRadius: 16,

    overflow: 'hidden',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.18,

    shadowRadius: 7,

    elevation: 7,
  },

  zoomButton: {
    width: 44,

    height: 44,

    alignItems: 'center',

    justifyContent: 'center',

    borderBottomWidth: 1,

    borderBottomColor: '#E5E7EB',
  },

  zoomButtonPressed: {
    backgroundColor: '#E5E7EB',
  },

  zoomText: {
    color: COLORS.dark,

    fontSize: 28,

    fontWeight: '700',

    lineHeight: 30,
  },

  resetText: {
    color: COLORS.blueDark,

    fontSize: 18,

    fontWeight: '900',
  },

  /*
  |--------------------------------------------------------------------------
  | NODES
  |--------------------------------------------------------------------------
  */

  nodeWrapper: {
    position: 'absolute',

    width: 160,

    alignItems: 'center',
  },

  lessonCard: {
    minWidth:
      isSmallScreen ? 115 : 135,

    maxWidth:
      isSmallScreen ? 145 : 170,

    backgroundColor:
      'rgba(255,255,255,0.96)',

    paddingHorizontal: 10,

    paddingVertical: 8,

    borderRadius: 14,

    alignItems: 'center',

    marginBottom: 10,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.16,

    shadowRadius: 5,

    elevation: 5,
  },

  lessonCardCurrent: {
    borderWidth: 2,

    borderColor: COLORS.blue,
  },

  statusText: {
    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 0.6,

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

    fontSize:
      isSmallScreen ? 12 : 14,

    fontWeight: '900',

    textAlign: 'center',
  },

  lessonDescription: {
    color: COLORS.muted,

    fontSize:
      isSmallScreen ? 9 : 10,

    fontWeight: '600',

    marginTop: 2,

    textAlign: 'center',
  },

  nodeButton: {
    width: NODE_SIZE,

    height: NODE_SIZE,

    borderRadius:
      NODE_SIZE / 2,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 4,

    borderBottomWidth: 9,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.22,

    shadowRadius: 5,

    elevation: 7,
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

    borderWidth: 5,

    borderBottomWidth: 10,
  },

  nodeLocked: {
    backgroundColor:
      COLORS.gray,

    borderColor:
      COLORS.grayDark,
  },

  nodePressed: {
    transform: [
      {
        scale: 0.92,
      },
    ],
  },

  nodeNumber: {
    color: COLORS.white,

    fontSize:
      isSmallScreen ? 24 : 28,

    fontWeight: '900',
  },

  lockIcon: {
    fontSize:
      isSmallScreen ? 20 : 25,
  },

  currentDot: {
    position: 'absolute',

    top: -5,

    right: 0,

    width: 15,

    height: 15,

    borderRadius: 8,

    backgroundColor:
      COLORS.yellow,

    borderWidth: 2,

    borderColor:
      COLORS.white,
  },

  /*
  |--------------------------------------------------------------------------
  | TOP HUD
  |--------------------------------------------------------------------------
  */

  topHud: {
    position: 'absolute',

    left: 10,

    right: 10,

    backgroundColor:
      'rgba(255,255,255,0.97)',

    borderRadius: 20,

    paddingHorizontal: 10,

    paddingVertical: 9,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.15,

    shadowRadius: 8,

    elevation: 8,
  },

  profileArea: {
    flexDirection: 'row',

    alignItems: 'center',

    flexShrink: 1,

    marginRight: 8,
  },

  avatar: {
    width:
      isSmallScreen ? 38 : 46,

    height:
      isSmallScreen ? 38 : 46,

    borderRadius: 25,

    backgroundColor:
      '#DBEAFE',

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 2,

    borderColor:
      COLORS.blue,
  },

  avatarText: {
    fontSize:
      isSmallScreen ? 19 : 23,
  },

  profileText: {
    marginLeft: 7,

    flexShrink: 1,
  },

  greeting: {
    fontSize: 10,

    color: COLORS.muted,

    fontWeight: '600',
  },

  playerName: {
    fontSize:
      isSmallScreen ? 13 : 16,

    color: COLORS.dark,

    fontWeight: '900',
  },

  statsArea: {
    flexDirection: 'row',

    alignItems: 'center',

    gap:
      isSmallScreen ? 5 : 10,

    flexShrink: 0,
  },

  stat: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  statIcon: {
    fontSize:
      isSmallScreen ? 14 : 17,

    marginRight: 2,
  },

  statValue: {
    color: COLORS.dark,

    fontSize:
      isSmallScreen ? 11 : 13,

    fontWeight: '900',
  },

  statSub: {
    color: COLORS.muted,

    fontSize: 7,

    fontWeight: '700',
  },

  /*
  |--------------------------------------------------------------------------
  | PROGRESS
  |--------------------------------------------------------------------------
  */

  progressPanel: {
    position: 'absolute',

    left: 10,

    gap: 8,
  },

  progressCard: {
    width:
      isSmallScreen ? 135 : 155,

    backgroundColor:
      'rgba(255,255,255,0.95)',

    padding: 11,

    borderRadius: 16,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.12,

    shadowRadius: 6,

    elevation: 5,
  },

  cardHeading: {
    color: COLORS.dark,

    fontSize:
      isSmallScreen ? 11 : 12,

    fontWeight: '900',

    marginBottom: 4,
  },

  cardSmallText: {
    color: COLORS.muted,

    fontSize: 9,

    fontWeight: '600',

    marginBottom: 6,
  },

  progressBackground: {
    height: 8,

    backgroundColor:
      '#E5E7EB',

    borderRadius: 5,

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    backgroundColor:
      COLORS.green,

    borderRadius: 5,
  },

  progressFillBlue: {
    height: '100%',

    backgroundColor:
      COLORS.blue,

    borderRadius: 5,
  },

  completedGoal: {
    color:
      COLORS.greenDark,

    fontSize: 9,

    fontWeight: '900',

    marginTop: 5,
  },

  progressPercentage: {
    color:
      COLORS.blueDark,

    fontSize: 10,

    fontWeight: '900',

    textAlign: 'right',

    marginTop: 4,
  },

  /*
  |--------------------------------------------------------------------------
  | CONTINUE CARD
  |--------------------------------------------------------------------------
  */

  continueContainer: {
    position: 'absolute',

    left: 10,

    right: 10,
  },

  continueCard: {
    backgroundColor:
      'rgba(255,255,255,0.98)',

    borderRadius: 20,

    padding: 12,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    borderWidth: 2,

    borderColor:
      COLORS.blueDark,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.2,

    shadowRadius: 10,

    elevation: 10,
  },

  continueInfo: {
    flex: 1,

    marginRight: 10,
  },

  continueLabel: {
    color:
      COLORS.blueDark,

    fontSize: 9,

    fontWeight: '900',

    letterSpacing: 0.7,
  },

  continueTitle: {
    color: COLORS.dark,

    fontSize:
      isSmallScreen ? 15 : 17,

    fontWeight: '900',

    marginTop: 2,
  },

  continueMeta: {
    color: COLORS.muted,

    fontSize: 10,

    fontWeight: '600',

    marginTop: 2,
  },

  continueButton: {
    backgroundColor:
      '#65A30D',

    minWidth:
      isSmallScreen ? 80 : 100,

    paddingVertical: 11,

    paddingHorizontal: 12,

    borderRadius: 14,

    alignItems: 'center',

    borderBottomWidth: 5,

    borderColor:
      '#4D7C0F',
  },

  continueButtonText: {
    color: COLORS.white,

    fontSize: 14,

    fontWeight: '900',
  },

  continueButtonLabel: {
    color: COLORS.white,

    fontSize: 11,

    fontWeight: '900',

    marginTop: 1,
  },

  buttonPressed: {
    transform: [
      {
        translateY: 2,
      },
    ],

    borderBottomWidth: 3,
  },
});