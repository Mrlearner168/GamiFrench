/**
 * Tier-1 offline transcription: the operating system's own speech recognizer.
 *
 * Uses `expo-speech-recognition` (already a dependency) to transcribe a saved
 * clip with the OS *on-device* model, so the speaking check can be graded with
 * no network at all. This only works where the platform actually ships an
 * on-device model for the target language (Android 12+ with the locale
 * installed, iOS with on-device dictation). When it is unavailable the caller
 * falls through to the whisper.rn tier (see whisperEngine.ts).
 *
 * Everything is defensive: a platform without the API, or an engine that
 * rejects the file, resolves to `null` instead of throwing, so the ladder keeps
 * descending.
 */
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export const FRENCH_LOCALE = 'fr-FR';

type EventSubscription = { remove: () => void };

let cachedSupport: boolean | null = null;

/** Whether the OS recognises speech at all. */
function recognitionAvailable(): boolean {
  try {
    return Boolean(ExpoSpeechRecognitionModule?.isRecognitionAvailable?.());
  } catch {
    return false;
  }
}

/** Whether the OS exposes an *on-device* (offline) recognizer. */
export function supportsOnDeviceTranscription(): boolean {
  if (cachedSupport !== null) return cachedSupport;

  try {
    cachedSupport = Boolean(ExpoSpeechRecognitionModule?.supportsOnDeviceRecognition?.());
  } catch {
    cachedSupport = false;
  }

  return cachedSupport;
}

/** True when the on-device tier can be attempted at all. */
export function isOnDeviceTranscriptionAvailable(): boolean {
  return recognitionAvailable() && supportsOnDeviceTranscription();
}

/**
 * Whether the offline model for a locale is already installed. Unknown results
 * optimistically return `true` so we still attempt the recognizer rather than
 * skipping a device that would have worked.
 */
export async function isLocaleInstalled(locale = FRENCH_LOCALE): Promise<boolean> {
  try {
    const mod = ExpoSpeechRecognitionModule as unknown as {
      getSupportedLocales?: (options?: unknown) => Promise<{
        installedLocales?: string[];
      }>;
    };
    if (!mod.getSupportedLocales) return true;

    const result = await mod.getSupportedLocales();
    const installed = result?.installedLocales ?? [];
    if (!installed.length) return true;

    const language = locale.slice(0, 2).toLowerCase();
    return installed.some((entry) => entry?.toLowerCase().startsWith(language));
  } catch {
    return true;
  }
}

/**
 * Ask Android to fetch the on-device model for a locale. A no-op on platforms
 * without the API (iOS ships the model with the OS).
 */
export async function ensureOfflineModel(locale = FRENCH_LOCALE): Promise<void> {
  try {
    const mod = ExpoSpeechRecognitionModule as unknown as {
      androidTriggerOfflineModelDownload?: (options: { locale: string }) => Promise<unknown>;
    };
    await mod.androidTriggerOfflineModelDownload?.({ locale });
  } catch (error) {
    console.log('[OnDeviceAsr] offline model download unavailable', error);
  }
}

type TranscribeOptions = {
  locale?: string;
  timeoutMs?: number;
};

/**
 * Transcribe a saved audio clip with the OS on-device recognizer.
 *
 * Resolves with the transcript, or `null` when the engine errors, times out or
 * hears nothing. The recognizer is always aborted and its listeners removed, so
 * a failure can never leave the microphone or event bus in a bad state.
 */
export function transcribeWithOnDevice(
  uri: string,
  { locale = FRENCH_LOCALE, timeoutMs = 20_000 }: TranscribeOptions = {}
): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    let transcript = '';
    const subscriptions: EventSubscription[] = [];

    const cleanup = () => {
      subscriptions.forEach((subscription) => {
        try {
          subscription.remove();
        } catch {
          // Already removed; nothing to do.
        }
      });
      try {
        ExpoSpeechRecognitionModule.abort?.();
      } catch {
        // Aborting a finished session is fine.
      }
    };

    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve(value && value.length ? value : null);
    };

    const timer = setTimeout(() => finish(transcript.trim()), timeoutMs);

    try {
      subscriptions.push(
        ExpoSpeechRecognitionModule.addListener('result', (event: {
          isFinal?: boolean;
          results?: { transcript?: string }[];
        }) => {
          const text = event?.results?.[0]?.transcript;
          if (typeof text === 'string' && text.length) transcript = text;
          if (event?.isFinal) finish(transcript.trim());
        })
      );
      subscriptions.push(
        ExpoSpeechRecognitionModule.addListener('error', () => finish(transcript.trim()))
      );
      subscriptions.push(
        ExpoSpeechRecognitionModule.addListener('end', () => finish(transcript.trim()))
      );

      ExpoSpeechRecognitionModule.start({
        // `audioSource` transcribes an existing clip instead of the microphone.
        audioSource: { uri },
        lang: locale,
        interimResults: true,
        continuous: false,
        // Force the offline model; if it is missing the engine emits an error
        // and we fall through to whisper.rn.
        requiresOnDeviceRecognition: true,
      } as never);
    } catch (error) {
      console.log('[OnDeviceAsr] could not start file transcription', error);
      finish(null);
    }
  });
}
