/**
 * Thin wrapper around expo-speech-recognition for the sub-lesson speaking
 * check. Keeps the French locale and start options in one place so the
 * sub-lesson screen only deals with intents (start/stop) and events.
 */
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export const FRENCH_LOCALE = 'fr-FR';

/** Whether the platform exposes a speech recognizer at all. */
export function isRecognitionAvailable() {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

/** Ask for microphone + speech-recognition permission. Resolves to a boolean. */
export async function requestRecognitionPermissions() {
  try {
    const response = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    return Boolean(response?.granted);
  } catch {
    return false;
  }
}

/** Start a single-utterance French recognition session with interim results. */
export function startFrenchRecognition() {
  ExpoSpeechRecognitionModule.start({
    lang: FRENCH_LOCALE,
    interimResults: true,
    continuous: false,
  });
}

/**
 * Stop listening while still allowing the in-flight utterance to produce a
 * final result (unlike abort(), which discards it).
 */
export function stopFrenchRecognition() {
  try {
    ExpoSpeechRecognitionModule.stop();
  } catch {
    // Stopping is best-effort; an already-stopped session is fine.
  }
}

/** Human-readable hint for the recognizer's error codes. */
export function messageForRecognitionError(code) {
  switch (code) {
    case 'not-allowed':
      return 'Microphone and speech recognition permission are needed to check your pronunciation.';
    case 'no-speech':
    case 'speech-timeout':
      return "We didn't hear anything. Tap the mic and say the phrase out loud.";
    case 'network':
      return 'Speech recognition needs a network connection. Check yours and try again.';
    case 'language-not-supported':
      return 'French speech recognition is not supported on this device.';
    case 'service-not-allowed':
      return 'Speech recognition is unavailable. Enable it in your device settings and retry.';
    case 'busy':
      return 'The recognizer is busy. Please try again in a moment.';
    default:
      return 'We could not score that attempt. Please try again.';
  }
}
