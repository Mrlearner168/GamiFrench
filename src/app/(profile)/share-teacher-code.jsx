import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { teacherService } from '@/services/teacherService';
import { sounds } from '@/services/sound';
import { useAuth } from '@/store/auth-context';


/**
 * Teacher's "share my class code" screen.
 *
 * Two jobs:
 *   1. Make ``teacher_code`` discoverable so a teacher can read it aloud,
 *      screenshot it, or paste a flyer for a whole class without leaving
 *      the app.
 *   2. Provide a regen path: once a code has been shown publicly, the
 *      teacher rotates it and the previously-issued copies stop working
 *      for future ``POST /api/v1/auth/register`` calls that supplied it.
 *
 * The new code is written back to ``session.user.teacherCode`` so the rest
 * of the app reads the fresh value without a re-login.
 */
export default function ShareTeacherCode() {
  const { session, applySession, authenticatedRequest } = useAuth();
  const [busyRegenerate, setBusyRegenerate] = useState(false);
  const [busyRefresh, setBusyRefresh] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isTeacher = session?.user?.role === 'teacher';
  const code = session?.user?.teacherCode ?? null;

  async function copyCode() {
    if (!code) return;
    try {
      // ``Share.share`` is built into React Native, so the screen works on
      // every platform Expo supports without taking a dependency on
      // ``expo-clipboard``. The teacher can pick "Copy" from the share
      // sheet on Android / iOS or copy the value directly in the message
      // preview.
      await Share.share(
        { message: code, title: 'Your GamiFrench teacher code' },
        { dialogTitle: 'Share your teacher code' },
      );
      sounds.tap();
    } catch (copyError) {
      console.log('[ShareTeacherCode] share failed', copyError);
      setErrorMessage('Could not open the share sheet on this device.');
    }
  }

  async function refreshFromServer() {
    setBusyRefresh(true);
    setErrorMessage('');
    try {
      const fresh = await authenticatedRequest('/auth/me');
      if (!session || !fresh || typeof fresh.teacherCode === 'undefined') {
        return;
      }
      await applySession({
        ...session,
        user: { ...session.user, teacherCode: fresh.teacherCode ?? null },
      });
      sounds.tap();
    } catch (err) {
      console.log('[ShareTeacherCode] refresh failed', err);
      setErrorMessage(err?.message || 'Could not refresh from the server.');
    } finally {
      setBusyRefresh(false);
    }
  }

  function confirmRegenerate() {
    Alert.alert(
      'Issue a new code?',
      'Your old code stops working for new students immediately. Students already in your class are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Issue new code', style: 'destructive', onPress: regenerate },
      ],
    );
  }

  async function regenerate() {
    if (!session) return;
    setBusyRegenerate(true);
    setErrorMessage('');
    try {
      const next = await teacherService.regenerateMyCode();
      await applySession({
        ...session,
        user: { ...session.user, teacherCode: next },
      });
      sounds.tap();
      Alert.alert('New code issued', `${next} is your new shareable code.`);
    } catch (err) {
      console.log('[ShareTeacherCode] regenerate failed', err);
      setErrorMessage(err?.message || 'Could not issue a new code right now.');
    } finally {
      setBusyRegenerate(false);
    }
  }
if (!isTeacher) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Share your class code</Text>
          <Text style={styles.subtitle}>
            Only teacher accounts can share a class code. Sign in as a
            teacher to manage yours.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/(auth)/login')}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Go to login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          {router.canGoBack?.() ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => {
                sounds.tap();
                router.back();
              }}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>‹ Back</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.title}>Share with your students</Text>
          <Text style={styles.subtitle}>
            Hand this code to students on the registration screen. They type
            it into the “Teacher code” field and your class list grows by one.
          </Text>
        </View>

        {errorMessage ? (
          <Text style={styles.error} accessibilityRole="alert">
            {errorMessage}
          </Text>
        ) : null}

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your teacher code</Text>
          {code ? (
            <Text style={styles.codeValue} selectable>
              {code}
            </Text>
          ) : (
            <View style={styles.codePlaceholder}>
              <Text style={styles.codePlaceholderText}>
                No code has been issued yet. Tap “Issue new code” below to
                generate one.
              </Text>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share teacher code"
            onPress={copyCode}
            disabled={!code}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              !code && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>Share with students</Text>
          </Pressable>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Need a new code?</Text>
          <Text style={styles.actionsCopy}>
            Generate a new code if the old one became too publicly visible.
            Your previous code stops working for new students right away —
            learners already in your class keep their progress.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Issue a fresh teacher code"
            onPress={confirmRegenerate}
            disabled={busyRegenerate}
            style={({ pressed }) => [
              styles.warningButton,
              pressed && styles.pressed,
              busyRegenerate && styles.disabledButton,
            ]}
          >
            {busyRegenerate ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.warningButtonText}>Issue new code</Text>
            )}
          </Pressable>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={refreshFromServer}
            disabled={busyRefresh}
            style={styles.secondaryLinkButton}
          >
            {busyRefresh ? (
              <ActivityIndicator color="#1476D4" />
            ) : (
              <Text style={styles.secondaryLinkText}>Refresh from server</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 20, paddingBottom: 36, flexGrow: 1 },
  header: { marginBottom: 18 },
  backLink: { alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 10, marginBottom: 6 },
  backLinkText: { color: '#2563EB', fontSize: 15, fontWeight: '700' },
  title: { fontSize: 30, fontWeight: '800', color: '#1E3A8A' },
  subtitle: { marginTop: 8, fontSize: 15, color: '#58616E', lineHeight: 22 },
  error: { color: '#B42318', marginBottom: 12, fontWeight: '600' },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 13,
    color: '#58616E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  codeValue: {
    marginTop: 12,
    marginBottom: 18,
    fontFamily: 'Courier',
    fontSize: 44,
    fontWeight: '800',
    color: '#1476D4',
    letterSpacing: 6,
  },
  codePlaceholder: { marginTop: 12, marginBottom: 18, paddingVertical: 16 },
  codePlaceholderText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#647084',
    lineHeight: 20,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    marginBottom: 16,
  },
  actionsTitle: { fontSize: 18, fontWeight: '800', color: '#1E3A8A', marginBottom: 8 },
  actionsCopy: { fontSize: 14, color: '#58616E', lineHeight: 20, marginBottom: 14 },
  primaryButton: {
    backgroundColor: '#1476D4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.4,
  },
  warningButton: {
    backgroundColor: '#D9534F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    marginBottom: 8,
  },
  warningButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  secondaryButton: {
    margin: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  secondaryButtonText: { color: '#1476D4', fontWeight: '800', fontSize: 15 },
  secondaryLinkButton: { paddingVertical: 8, alignItems: 'center' },
  secondaryLinkText: { color: '#1476D4', fontWeight: '700', fontSize: 13 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabledButton: { backgroundColor: '#A0C4E8' },
});



