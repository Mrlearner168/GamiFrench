import { isOfflineError } from '@/services/apiClient';
import { SettingSwitchRow } from '@/components/toggle-switch';
import { openPrivacyPolicy } from '@/components/privacy-policy-link';
import {
  hasStoredAudioChoice,
  isMusicEnabled,
  isSoundEnabled,
  loadMusicEnabled,
  loadSoundEnabled,
  setMusicEnabled,
  setSoundEnabled,
  sounds,
  syncMusicEnabledFromServer,
  syncSoundEnabledFromServer,
} from '@/services/sound';
import { DEFAULT_MODEL, ensureModel, isModelReady, isWhisperAvailable } from '@/services/whisperEngine';
import {
    hasReminderPermission,
    isReminderSupported,
    loadReminderPrefs,
    setReminderTime,
    setRemindersEnabled,
} from '@/services/dailyReminder';
import { REMINDER_TIMES, reminderTime } from '@/services/reminder-messages';
import { useAuth } from '@/store/auth-context';
import { readSettingsCache, saveSettingsCache } from '@/store/profile-cache';
import { useSync } from '@/store/sync-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const [preferences, setPreferences] = useState([]);
  const [error, setError] = useState('');
  const { session, authenticatedRequest, signOut } = useAuth();
  const { online, syncing, pendingCount, lastSyncedAt, syncNow } = useSync();

  /*
   * Offline speech model (used by the Whisper fallback tier). Downloading is
   * explicit here so the app never pulls ~140 MB in the middle of a lesson.
   */
  const [modelReady, setModelReady] = useState(false);
  const [modelBusy, setModelBusy] = useState(false);
  const whisperAvailable = isWhisperAvailable();

  /* Game sound effects: local mute switch, seeded from the device + server. */
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  /* Background music: separate ambience switch. */
  const [musicOn, setMusicOn] = useState(isMusicEnabled());

  /* Daily improvement reminders (local notifications on this device). */
  const [reminderOn, setReminderOn] = useState(true);
  const [reminderTimeId, setReminderTimeId] = useState('evening');
  const [reminderAllowed, setReminderAllowed] = useState(true);
  const reminderName = session?.user?.displayName ?? '';

  useEffect(() => {
    isModelReady(DEFAULT_MODEL.name).then(setModelReady);
    loadSoundEnabled().then((value) => setSoundOn(value));
    loadMusicEnabled().then((value) => setMusicOn(value));
    if (isReminderSupported) {
        loadReminderPrefs().then((prefs) => {
            setReminderOn(prefs.enabled);
            setReminderTimeId(prefs.timeId);
        });
        hasReminderPermission().then(setReminderAllowed);
    }
  }, []);

  const downloadModel = async () => {
    setModelBusy(true);
    try {
      await ensureModel();
      setModelReady(await isModelReady(DEFAULT_MODEL.name));
    } finally {
      setModelBusy(false);
    }
  };

  /*
   * Save a switch on the server too (best effort): this device keeps its own
   * choice either way, and an offline change is pushed the next time Settings
   * opens online (see the load effect below).
   */
  const saveAudioOnServer = (changes) => {
    authenticatedRequest('/settings', {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }).catch((saveError) => console.log('[Settings] audio not saved on the server yet:', saveError));
  };

  const toggleSound = async (next = !soundOn) => {
    setSoundOn(next);
    await setSoundEnabled(next);
    // Play a confirmation blip only when turning sound back on.
    if (next) sounds.tap();
    saveAudioOnServer({ soundEnabled: next });
  };

  const toggleMusic = async (next = !musicOn) => {
    setMusicOn(next);
    await setMusicEnabled(next);
    saveAudioOnServer({ musicEnabled: next });
  };

  useEffect(() => {
    async function load() {
      try {
        const json = await authenticatedRequest('/settings');
        setPreferences(json.preferences || []);
        setError('');
        saveSettingsCache(json.preferences || []);
        /*
         * Audio: the choice made on THIS device wins (it used to be overwritten
         * by the server copy, which turned sound back on after muting). A device
         * that never chose adopts the server value; a device choice the server
         * does not have yet (made offline) is pushed up.
         */
        const serverAudio = json.audio ?? {};
        const pending = {};
        if (typeof serverAudio.soundEnabled === 'boolean') {
          if (await hasStoredAudioChoice('sound')) {
            if (serverAudio.soundEnabled !== isSoundEnabled()) pending.soundEnabled = isSoundEnabled();
          } else {
            await syncSoundEnabledFromServer(serverAudio.soundEnabled);
            setSoundOn(serverAudio.soundEnabled);
          }
        }
        if (typeof serverAudio.musicEnabled === 'boolean') {
          if (await hasStoredAudioChoice('music')) {
            if (serverAudio.musicEnabled !== isMusicEnabled()) pending.musicEnabled = isMusicEnabled();
          } else {
            await syncMusicEnabledFromServer(serverAudio.musicEnabled);
            setMusicOn(serverAudio.musicEnabled);
          }
        }
        if (Object.keys(pending).length) saveAudioOnServer(pending);
      } catch (err) {
        /*
         * The preferences only change on the server, so the copy stored on this
         * device stays valid: serve it instead of an error when the network is
         * unreachable. A 4xx/5xx is a real answer and still surfaces.
         */
        if (isOfflineError(err)) {
          const cached = await readSettingsCache();
          if (!cached.length) {
            setError('Your settings are not available offline yet. Reconnect once to save them.');
            return;
          }

          setPreferences(cached);
          setError('');
          console.log('[Settings] offline; showing cached preferences.');
          return;
        }

        setError('Unable to load your settings.');
      }
    }
    load();
    // saveAudioOnServer only wraps authenticatedRequest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedRequest]);

  // The audio switches below replace the server's read-only "Audio cues" row.
  const otherPreferences = preferences.filter((item) => item.key !== 'audio');

  const toggleReminder = async (next) => {
    setReminderOn(next);
    try {
        const result = await setRemindersEnabled(next, { name: reminderName });
        setReminderAllowed(result.permission);
    } catch (err) {
        console.log('[Settings] reminder toggle failed', err);
    }
  };

  const chooseReminderTime = async (timeId) => {
    setReminderTimeId(timeId);
    try {
        await setReminderTime(timeId, { name: reminderName });
    } catch (err) {
        console.log('[Settings] reminder time failed', err);
    }
  };

  const chosenReminder = reminderTime(reminderTimeId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {router.canGoBack?.() ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
              onPress={() => {
                sounds.tap();
                router.back();
              }}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>‹ Back</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>
            Configure your learning experience and app preferences.
          </Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sound</Text>
          <SettingSwitchRow
            icon={soundOn ? '🔊' : '🔇'}
            title="Game sounds"
            description="Correct / wrong chimes, taps, stars and celebration fanfares."
            value={soundOn}
            onChange={toggleSound}
          />
          <SettingSwitchRow
            icon={musicOn ? '🎵' : '🔕'}
            title="Background music"
            description="Gentle looping ambience behind lessons and menus."
            value={musicOn}
            onChange={toggleMusic}
            last
          />
          <Text style={styles.soundNote}>
            French pronunciation audio in lessons always plays, so you can hear every word.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Daily reminders</Text>
          {isReminderSupported ? (
            <>
              <SettingSwitchRow
                icon={reminderOn ? '🔔' : '🔕'}
                title="Daily improvement nudge"
                description="A fun daily reminder to keep your streak and French growing."
                value={reminderOn}
                onChange={toggleReminder}
                last
              />
              {reminderOn ? (
                <>
                  <Text style={styles.reminderLabel}>Remind me at</Text>
                  <View style={styles.reminderChips}>
                    {REMINDER_TIMES.map((time) => {
                      const selected = time.id === reminderTimeId;
                      return (
                        <Pressable
                          key={time.id}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          onPress={() => chooseReminderTime(time.id)}
                          style={[styles.reminderChip, selected && styles.reminderChipSelected]}
                        >
                          <Text style={[styles.reminderChipLabel, selected && styles.reminderChipTextSelected]}>
                            {time.label}
                          </Text>
                          <Text style={[styles.reminderChipTime, selected && styles.reminderChipTextSelected]}>
                            {`${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {reminderAllowed ? (
                    <Text style={styles.soundNote}>
                      Next nudge around {String(chosenReminder.hour).padStart(2, '0')}:
                      {String(chosenReminder.minute).padStart(2, '0')} — skipped on days you already practised.
                    </Text>
                  ) : (
                    <View style={styles.reminderBlocked}>
                      <Text style={styles.reminderBlockedText}>
                        Notifications are turned off for GamiFrench on this phone.
                      </Text>
                      <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
                        <Text style={styles.reminderBlockedLink}>Open phone settings</Text>
                      </Pressable>
                    </View>
                  )}
                </>
              ) : null}
            </>
          ) : (
            <Text style={styles.soundNote}>Daily reminders are available in the Android and iOS app.</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {otherPreferences.map((item) => (
            <View key={item.key} style={styles.preferenceRow}>
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>{item.title}</Text>
                <Text style={styles.preferenceSubtitle}>{item.description}</Text>
              </View>
              <Text style={styles.preferenceValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Offline &amp; sync</Text>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Connection</Text>
              <Text style={styles.preferenceSubtitle}>
                {online
                  ? 'Online — progress syncs automatically.'
                  : 'Offline — progress is saved on this device.'}
              </Text>
            </View>
            <Text style={styles.preferenceValue}>
              {syncing ? 'Syncing…' : online ? 'Online' : 'Offline'}
            </Text>
          </View>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Waiting to sync</Text>
              <Text style={styles.preferenceSubtitle}>
                {lastSyncedAt
                  ? `Last synced ${new Date(lastSyncedAt).toLocaleString()}`
                  : 'Not synced yet.'}
              </Text>
            </View>
            <Text style={styles.preferenceValue}>{pendingCount}</Text>
          </View>
          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.8}
            disabled={!online || syncing}
            onPress={syncNow}
          >
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Sync now</Text>
              <Text style={styles.preferenceSubtitle}>
                Push local progress and pull the latest from the server.
              </Text>
            </View>
            <Text style={styles.preferenceValue}>{syncing ? '…' : '↻'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.8}
            disabled={!whisperAvailable || modelBusy || modelReady}
            onPress={downloadModel}
          >
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Offline speech model</Text>
              <Text style={styles.preferenceSubtitle}>
                {!whisperAvailable
                  ? 'Unavailable in this build. Install whisper.rn and rebuild for guaranteed offline scoring.'
                  : modelReady
                    ? 'Downloaded — your speech can be scored with no connection.'
                    : `Not downloaded (~${DEFAULT_MODEL.approxMb} MB). Wi-Fi recommended.`}
              </Text>
            </View>
            <Text style={styles.preferenceValue}>
              {modelBusy ? '…' : modelReady ? 'Ready' : 'Download'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          {session?.user?.role === 'teacher' ? (
            <TouchableOpacity
              style={styles.preferenceRow}
              activeOpacity={0.8}
              onPress={() => {
                sounds.tap();
                router.push('/share-teacher-code');
              }}
              accessibilityRole="button"
              accessibilityLabel="Open share teacher code screen"
            >
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Your teacher code</Text>
                <Text style={styles.preferenceSubtitle}>
                  Show, copy or rotate the shareable code students type on the
                  register screen.
                </Text>
              </View>
              <Text style={styles.preferenceValue}>Open</Text>
            </TouchableOpacity>
          ) : null}
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Signed in as</Text>
              <Text style={styles.preferenceSubtitle}>
                {session?.user?.displayName ?? 'Traveler'} · {session?.user?.email ?? 'No email on file'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.8}
            onPress={() => {
              sounds.tap();
              openPrivacyPolicy();
            }}
            accessibilityRole="link"
            accessibilityLabel="Open the GamiFrench privacy policy"
          >
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Privacy Policy</Text>
              <Text style={styles.preferenceSubtitle}>
                How your data is collected, used and shared. Opens in your
                browser.
              </Text>
            </View>
            <Text style={styles.preferenceValue}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.8}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>App version</Text>
              <Text style={styles.preferenceSubtitle}>Current release details.</Text>
            </View>
            <Text style={styles.preferenceValue}>1.0.0</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8} onPress={signOut} accessibilityRole="button">
          <Text style={styles.signOutButtonText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 18,
  },
  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 10,
    marginBottom: 6,
  },
  backLinkText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  pageSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#58616E',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  preferenceText: {
    flex: 1,
    paddingRight: 10,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  preferenceSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  reminderLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  reminderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderChip: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D8DEE9',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 76,
  },
  reminderChipSelected: {
    borderColor: '#1476D4',
    backgroundColor: '#1476D4',
  },
  reminderChipLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#182133',
  },
  reminderChipTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reminderChipTextSelected: {
    color: '#FFFFFF',
  },
  reminderBlocked: {
    marginTop: 12,
    backgroundColor: '#FFF8E6',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  reminderBlockedText: {
    fontSize: 13,
    color: '#8A5A00',
    lineHeight: 18,
  },
  reminderBlockedLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1476D4',
  },
  soundNote: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  preferenceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    marginTop: 12,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  error: {
    color: '#B42318',
    marginBottom: 12,
  },
});