import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WelcomeHero } from '@/components/welcome-hero';
import { lessonCatalog } from '@/data/lessons/catalog';
import { useAuth } from '@/store/auth-context';
import {
  confirmSessionWithServer,
  validateSessionLocally,
} from '@/services/tokenValidation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* Lesson counts and topics come from the course catalog, so they always match. */
const fromCatalog = (stage) => {
  const module = lessonCatalog.find((item) => item.id === stage.moduleId);
  const topics = module?.lessons ?? [];
  return {
    ...stage,
    lessonsCount: topics.reduce((total, topic) => total + (topic.subLessons?.length ?? 0), 0),
    topics: topics.map((topic) => topic.title),
  };
};

const PAGE_COUNT = 3;

const JOURNEY_STAGES = [
  {
    id: 1,
    title: 'Module 1',
    country: 'Canada',
    subtitle: 'French Foundations',
    description: 'Begin your global adventure in the snowy mountains of Quebec. Master basic sounds, introducing yourself, and greetings.',
    icon: '🍁',
    flag: '🇨🇦',
    color: '#EF4444',
    level: 'Pre-A1 Absolute Beginner',
    moduleId: 'module-1',
    questDesc: 'Meet local villagers in Canada and learn basic greeting terms. Earn your first stars and unlock the next country on the map!',
  },
  {
    id: 2,
    title: 'Module 2',
    country: 'Morocco',
    subtitle: 'Everyday French',
    description: 'Fly across the ocean to the colorful riads and markets of Morocco. Practice conversation, shopping, and directions.',
    icon: '🕌',
    flag: '🇲🇦',
    color: '#10B981',
    level: 'A1 Beginner',
    moduleId: 'module-2',
    questDesc: 'Navigate the busy souks of Marrakech to buy sweet mint tea and pastries using local everyday conversational French!',
  },
  {
    id: 3,
    title: 'Module 3',
    country: 'Ivory Coast',
    subtitle: 'Family & Home Life',
    description: 'Explore West Africa’s cultural heart in the Ivory Coast. Talk about your family, describe people, your home and where things are.',
    icon: '🌴',
    flag: '🇨🇮',
    color: '#F59E0B',
    level: 'A1 Advanced Beginner',
    moduleId: 'module-3',
    questDesc: 'Gather in Yamoussoukro with your new companions to exchange stories about your family tree and home life in clear sentences.',
  },
].map(fromCatalog);

export default function Welcome() {
  const router = useRouter();
  const { session, isLoading, authenticatedRequest, ensureFreshSession, signOut } = useAuth();

  /*
   * Access control for this screen.
   *
   * `(game)/_layout` only checks that *a* session exists, which is not enough:
   * a stored session can hold an expired, truncated or hand-edited access
   * token, and the welcome screen is where the learner's name and the whole
   * journey map are first rendered. So the token is validated in two stages
   * (see `services/tokenValidation.ts`):
   *
   *   1. `validateSessionLocally` runs synchronously on mount - structural JWT
   *      check plus `type`/`sub`/`exp` claims, no network, no UI delay. A
   *      failure here can never be recovered from, so the visitor is signed
   *      out and sent back to the login screen.
   *   2. `confirmSessionWithServer` does one `GET /auth/me` against the
   *      constant path `/auth/me` so the server checks the signature. A 401
   *      has already been through the refresh-token path by then.
   *
   * The screen renders a spinner instead of its content until the gate resolves,
   * so no learner data is ever painted for an unauthorized visitor. The gate is
   * skipped entirely when the app is offline, keeping the offline-first flow.
   */
  const [gateState, setGateState] = useState('checking');

  useEffect(() => {
    if (isLoading) return;

    // No session at all: nothing to validate, hand them back to login.
    if (!session) {
      console.log('[Welcome] no session; redirecting to login');
      router.replace('/(auth)/login');
      return;
    }

    // Stage 1 - offline, synchronous, cheap.
    const local = validateSessionLocally(session);
    // An expired access token is normal after the app sat idle: it is renewed
    // with the refresh token in stage 2, so only a broken token signs out here.
    const recoverable = !local.valid && local.reason === 'expired' && Boolean(session.refreshToken);
    if (!local.valid && !recoverable) {
      // console.warn('[Welcome] local token validation failed', local.reason, local.detail);
      console.warn('Your session has ended. Please sign in again.');
      signOut().finally(() => router.replace('/(auth)/login'));
      return;
    }

    let cancelled = false;

    // Stage 2 - authoritative, one round-trip on the constant `/auth/me` path.
    confirmSessionWithServer(authenticatedRequest, session).then((result) => {
      if (cancelled) return;

      if (result.ok) {
        setGateState('granted');
        return;
      }

      // Offline-first: the app keeps working from local storage, so a device
      // that cannot reach the server keeps the stage-1 validated session.
      if (result.reason === 'offline') {
        setGateState('granted');
        return;
      }

      // console.warn('[Welcome] session rejected by the server', result.reason, result.status);
      console.warn('We could not confirm your session. Please sign in again.');
      signOut().finally(() => router.replace('/(auth)/login'));
    });

    return () => {
      cancelled = true;
    };
  }, [session, isLoading, authenticatedRequest, signOut, router]);

  const name = session?.user?.firstName ?? 'Adventurer';

  const [selectedStageId, setSelectedStageId] = useState(1);

  // Paged, non-scrolling layout.
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLastPage = page === PAGE_COUNT - 1;
  const goNext = () => {
    setDirection(1);
    setPage((current) => Math.min(PAGE_COUNT - 1, current + 1));
  };
  const goBack = () => {
    setDirection(-1);
    setPage((current) => Math.max(0, current - 1));
  };
  // Short phones get a smaller animated scene so page 1 still fits.
  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 760;
  const selectedStage = JOURNEY_STAGES.find((s) => s.id === selectedStageId) || JOURNEY_STAGES[0];

  // Pulsing animation for the button
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    buttonScale.set(withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    ));
  }, [buttonScale]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = async () => {
    // The access token may have expired while the learner was reading the
    // syllabus; renew it instead of sending them back to the login screen.
    const fresh = await ensureFreshSession();
    if (!fresh) {
      console.warn('Your session has ended. Please sign in again.');
      router.replace('/(auth)/login');
      return;
    }

    router.replace('/home');
  };

  if (gateState !== 'granted') {
    return (
      <View style={styles.gateContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.gateText}>Verifying your journey pass…</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../../assets/images/background/background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.container}>
          {/*
            Three pages, each sized to fit the screen without scrolling. The
            bottom bar (dots, Back, Next / Start) stays in place.
          */}
          <View style={styles.pageArea}>
            <Animated.View
              key={page}
              entering={(direction > 0 ? SlideInRight : SlideInLeft).duration(360)}
              exiting={(direction > 0 ? SlideOutLeft : SlideOutRight).duration(260)}
              style={styles.page}
            >
              {page === 0 ? (
                <View style={styles.pageCenter}>
                  <WelcomeHero name={name} compact={compact} />
            {/* Subtitle Card */}
            <Animated.View 
              entering={FadeInDown.delay(200).duration(800)}
              style={styles.heroCard}
            >
              <Text style={styles.subtitle}>
                Your French world journey begins now. Travel across countries, interact with characters, complete quests, and master speaking!
              </Text>
              <View style={styles.statsBadgeRow}>
                <View style={styles.statsBadge}>
                  <Text style={styles.statsBadgeLabel}>RANK</Text>
                  <Text style={styles.statsBadgeValue}>Level 1</Text>
                </View>
                <View style={[styles.statsBadge, { borderColor: 'rgba(59, 130, 246, 0.4)' }]}>
                  <Text style={styles.statsBadgeLabel}>MAP STAGES</Text>
                  <Text style={styles.statsBadgeValue}>10 Countries</Text>
                </View>
              </View>
            </Animated.View>

                </View>
              ) : null}

              {page === 1 ? (
                <View style={styles.pageCenter}>
            {/* Dynamic Map Explorer */}
            <Animated.View 
              entering={FadeInUp.delay(350).duration(800)} 
              style={styles.mapPreview}
            >
              <View style={styles.mapHeader}>
                <View>
                  <Text style={styles.mapHeading}>Syllabus Explorer</Text>
                  <Text style={styles.mapSubheading}>Tap a country to view its topics</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3 WORLD STAGES</Text>
                </View>
              </View>
              
              <View style={styles.stagesContainer}>
                {JOURNEY_STAGES.map((stage, index) => {
                  const isSelected = stage.id === selectedStageId;
                  const activeColor = stage.color;

                  return (
                    <View key={stage.id} style={styles.stageWrapper}>
                      <Pressable 
                        onPress={() => setSelectedStageId(stage.id)}
                        style={({ pressed }) => [
                          styles.stageRow,
                          isSelected && [styles.stageRowSelected, { borderColor: activeColor }],
                          pressed && { opacity: 0.9 }
                        ]}
                      >
                        <View style={[
                          styles.stageMarker, 
                          { 
                            backgroundColor: isSelected ? activeColor : 'rgba(30, 41, 59, 0.6)', 
                            borderColor: activeColor 
                          }
                        ]}>
                          <Text style={styles.stageIcon}>{stage.icon}</Text>
                        </View>

                        <View style={styles.stageDetails}>
                          <View style={styles.stageHeaderRow}>
                            <Text style={[styles.stageTitle, { color: activeColor }]}>
                              {stage.title} • {stage.country} {stage.flag}
                            </Text>
                            <View style={styles.lessonsCountBadge}>
                              <Text style={styles.lessonsCountText}>{stage.lessonsCount} LESSONS</Text>
                            </View>
                          </View>
                          
                          {/* Collapsed rows stay one line so the page fits one screen. */}
                          <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
                          {isSelected ? (
                            <Text style={styles.stageDesc} numberOfLines={3}>
                              {stage.description}
                            </Text>
                          ) : null}

                          {/* Expanded interactive content */}
                          {isSelected && (
                            <Animated.View 
                              entering={FadeInDown.duration(400)}
                              style={styles.expandedContent}
                            >
                              <Text style={styles.syllabusTitle}>Syllabus Highlights:</Text>
                              <View style={styles.topicsGrid}>
                                {stage.topics.map((topic, i) => (
                                  <View key={i} style={[styles.topicBadge, { borderColor: activeColor + '40', backgroundColor: activeColor + '10' }]}>
                                    <View style={[styles.bulletPoint, { backgroundColor: activeColor }]} />
                                    <Text style={styles.topicText}>{topic}</Text>
                                  </View>
                                ))}
                              </View>
                            </Animated.View>
                          )}
                        </View>
                      </Pressable>

                      {index < JOURNEY_STAGES.length - 1 && (
                        <View style={[
                          styles.connector, 
                          { backgroundColor: isSelected ? activeColor : 'rgba(255, 255, 255, 0.1)' }
                        ]} />
                      )}
                    </View>
                  );
                })}
              </View>
            </Animated.View>

                </View>
              ) : null}

              {page === 2 ? (
                <View style={styles.pageCenter}>
                  <Animated.Text entering={FadeInDown.duration(500)} style={styles.pageEmoji}>🧳</Animated.Text>
                  <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.pageTitle}>
                    Ready, {name}?
                  </Animated.Text>
            {/* RPG Quest Board Scroll Box */}
            <Animated.View 
              entering={FadeInUp.delay(500).duration(800)} 
              style={[
                styles.questCard, 
                { 
                  borderColor: selectedStage.color + '50', 
                  backgroundColor: selectedStage.color + '0C' 
                }
              ]}
              layout={Layout.springify()}
            >
              <View style={[styles.questHeaderBadge, { backgroundColor: selectedStage.color }]}>
                <Text style={styles.questHeaderBadgeText}> ACTIVE QUEST: TRAVEL TO {selectedStage.country.toUpperCase()} </Text>
              </View>
              <View style={styles.questContentRow}>
                <View style={[styles.questIconCircle, { backgroundColor: selectedStage.color + '20' }]}>
                  <Text style={styles.questEmoji}>⚔️</Text>
                </View>
                <View style={styles.questDetails}>
                  <Text style={[styles.questTitle, { color: selectedStage.color }]}>{selectedStage.subtitle}</Text>
                  <Text style={styles.questInstructions}>
                    {selectedStage.questDesc}
                  </Text>
                </View>
              </View>
            </Animated.View>

                  <Text style={styles.footerNote}>All other stages unlock progressively as you earn stars</Text>
                </View>
              ) : null}
            </Animated.View>
          </View>

          {/* Bottom bar: progress dots, Back, Next / Start */}
          <View style={styles.bottomBar}>
            <View style={styles.dots} accessibilityLabel={`Page ${page + 1} of ${PAGE_COUNT}`}>
              {Array.from({ length: PAGE_COUNT }, (_, index) => (
                <View key={index} style={[styles.dot, index === page && styles.dotActive]} />
              ))}
            </View>

            <View style={styles.navRow}>
              {page > 0 ? (
                <Pressable
                  onPress={goBack}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.backButtonText}>‹ Back</Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={isLastPage ? handleContinue : goNext}
                accessibilityRole="button"
                accessibilityLabel={isLastPage ? 'Start your journey in Canada' : 'Next'}
                style={styles.nextPressable}
              >
                <Animated.View style={[styles.primaryButton, animatedButtonStyle]}>
                  <Text style={styles.primaryButtonText}>
                    {isLastPage ? `Start Journey ${JOURNEY_STAGES[0].flag}` : 'Next'}
                  </Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </Animated.View>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  gateText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 30, 0.82)',
  },
  container: {
    flex: 1,
  },
  pageArea: {
    flex: 1,
    overflow: 'hidden',
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  pageEmoji: {
    fontSize: 56,
    textAlign: 'center',
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FDE047',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '800',
  },
  nextPressable: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    gap: 16,
  },
  avatarCrest: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  crestFlagBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0F172A',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  flagText: {
    fontSize: 11,
  },
  headerTextContainer: {
    flex: 1,
  },
  eyebrow: { 
    color: '#60A5FA', 
    fontSize: 12, 
    fontWeight: '900', 
    letterSpacing: 2, 
    marginBottom: 2,
  },
  title: { 
    color: '#FFFFFF', 
    fontSize: 32, 
    fontWeight: '900', 
    lineHeight: 36,
  },
  heroCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  subtitle: { 
    color: '#CBD5E1', 
    fontSize: 15, 
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 16,
  },
  statsBadgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsBadge: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statsBadgeLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statsBadgeValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  mapPreview: { 
    backgroundColor: 'rgba(15, 23, 42, 0.75)', 
    borderRadius: 28, 
    padding: 14, 
    marginBottom: 0, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapHeading: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '900',
  },
  mapSubheading: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeText: {
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '900',
  },
  stagesContainer: {
    paddingLeft: 4,
  },
  stageWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  stageRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 12, 
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1.5,
    borderColor: 'transparent',
    transition: 'all 0.3s ease',
  },
  stageRowSelected: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  stageMarker: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 2,
    marginTop: 2,
  },
  stageIcon: { 
    fontSize: 22,
  },
  connector: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 2.5,
    height: 12,
    zIndex: 1,
  },
  stageDetails: { 
    flex: 1,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageTitle: { 
    fontSize: 12, 
    fontWeight: '900', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonsCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lessonsCountText: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '800',
  },
  stageSubtitle: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '800',
    marginBottom: 4,
  },
  stageDesc: { 
    color: '#94A3B8', 
    fontSize: 12, 
    lineHeight: 16,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  syllabusTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  bulletPoint: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },
  topicText: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '600',
  },
  questCard: { 
    borderWidth: 1.5,
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  questHeaderBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  questHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  questContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 14,
  },
  questIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questEmoji: {
    fontSize: 20,
  },
  questDetails: {
    flex: 1,
  },
  questTitle: { 
    fontSize: 14, 
    fontWeight: '900', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  questInstructions: { 
    color: '#E2E8F0', 
    fontSize: 13, 
    lineHeight: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  primaryButton: { 
    width: SCREEN_WIDTH - 40,
    height: 60, 
    borderRadius: 20, 
    backgroundColor: '#3B82F6', 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '900',
    marginRight: 10,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  footerNote: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  }
});
