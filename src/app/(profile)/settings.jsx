import { isOfflineError } from '@/services/apiClient';
import { SettingSwitchRow } from '@/components/toggle-switch';
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
import { useAuth } from '@/store/auth-context';
import { readSettingsCache, saveSettingsCache } from '@/store/profile-cache';
import { useSync } from '@/store/sync-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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

  useEffect(() => {
    isModelReady(DEFAULT_MODEL.name).then(setModelReady);
    loadSoundEnabled().then((value) => setSoundOn(value));
    loadMusicEnabled().then((value) => setMusicOn(value));
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
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Signed in as</Text>
              <Text style={styles.preferenceSubtitle}>
                {session?.user?.displayName ?? 'Traveler'} · {session?.user?.email ?? 'No email on file'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.preferenceRow} activeOpacity={0.8}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Privacy</Text>
              <Text style={styles.preferenceSubtitle}>Manage data and app permissions.</Text>
            </View>
            <Text style={styles.preferenceValue}>Public</Text>
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