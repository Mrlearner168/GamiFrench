/**
 * Pronunciation transcription ladder - the single place the app turns a
 * recorded clip into text.
 *
 * Order (Option C: OS recognizer first, Whisper as the guarantee):
 *   1. Groq Whisper (online)   - highest accuracy, current production quality,
 *   2. OS on-device recognizer - instant + free + offline where supported,
 *   3. on-device Whisper       - guaranteed offline (needs the model/rebuild),
 *   4. deferred                - nothing worked offline: keep the clip and
 *                                re-grade it on the next sync.
 *
 * Every tier is best-effort: a failure logs and falls through, so the speaking
 * check always produces *something* rather than an error screen.
 *
 * Scoring is intentionally NOT done here - it stays in `services/pronunciation`
 * so the number is identical online and offline.
 */
import * as FileSystem from 'expo-file-system/legacy';

import { isOnlineSync } from '@/services/connectivity';
import {
  FRENCH_LOCALE,
  isOnDeviceTranscriptionAvailable,
  transcribeWithOnDevice,
} from '@/services/onDeviceAsr';
import { isWhisperAvailable, isModelReady, transcribeWithWhisper } from '@/services/whisperEngine';

export type TranscriptionEngine = 'groq' | 'on-device' | 'whisper' | 'deferred';

export type TranscriptionResult = {
  text: string | null;
  engine: TranscriptionEngine;
  /** True when the transcript came from an on-device (no-network) engine. */
  offline: boolean;
};

export type TranscribeOptions = {
  audioUri: string;
  /**
   * The target phrase. Accepted for callers but deliberately NOT sent to any
   * engine: hinting the expected answer biases the transcript toward it.
   */
  targetPhrase?: string;
  /** Force a specific tier order (used by the deferred upgrade, which is online). */
  preferOnline?: boolean;
};

const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

function groqApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_GROQ_API_KEY ?? process.env.GROQ_API_KEY;
}

/**
 * Transcribe one clip with Groq's Whisper endpoint. Throws when the request
 * fails so the ladder can move on to an offline tier.
 */
async function groqTranscribe(audioUri: string): Promise<string | null> {
  const apiKey = groqApiKey();
  if (!apiKey) throw new Error('Groq API key is missing.');

  const uploadResult = await FileSystem.uploadAsync(GROQ_TRANSCRIBE_URL, audioUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'file',
    headers: { Authorization: `Bearer ${apiKey}` },
    parameters: {
      model: 'whisper-large-v3-turbo',
      language: 'fr',
      // No `prompt`: passing the target sentence biased Whisper toward
      // returning it (on mumbled or near-silent clips it often echoed the
      // prompt back), which inflated pronunciation scores. Digits vs number
      // words are handled by the scorer (services/pronunciation.js).
    },
  });

  const data = JSON.parse(uploadResult.body);

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(data?.error?.message ?? 'Audio transcription failed.');
  }

  const text = typeof data?.text === 'string' ? data.text.trim() : '';
  return text || null;
}

/**
 * Turn a recorded clip into a transcript, choosing the best available engine.
 */
export async function transcribeClip({
  audioUri,
  preferOnline = true,
}: TranscribeOptions): Promise<TranscriptionResult> {
  const online = isOnlineSync();

  // 1. Online - Groq Whisper (best quality).
  if (preferOnline && online) {
    try {
      const text = await groqTranscribe(audioUri);
      if (text) return { text, engine: 'groq', offline: false };
    } catch (error) {
      console.log('[Transcription] Groq tier failed; falling back offline.', error);
    }
  }

  // 2. On-device OS recognizer (free, instant, offline where supported).
  if (isOnDeviceTranscriptionAvailable()) {
    try {
      const text = await transcribeWithOnDevice(audioUri, { locale: FRENCH_LOCALE });
      if (text) return { text, engine: 'on-device', offline: true };
    } catch (error) {
      console.log('[Transcription] on-device tier failed.', error);
    }
  }

  // 3. On-device Whisper (guaranteed offline). Only used once the model has
  //    been downloaded from Settings, so a lesson never triggers a surprise
  //    ~140 MB download over mobile data.
  if (isWhisperAvailable() && (await isModelReady())) {
    try {
      const text = await transcribeWithWhisper(audioUri, { language: 'fr' });
      if (text) return { text, engine: 'whisper', offline: true };
    } catch (error) {
      console.log('[Transcription] whisper tier failed.', error);
    }
  }

  // 4. Nothing produced text. The caller decides whether to defer.
  return { text: null, engine: 'deferred', offline: true };
}

/**
 * Copy a clip into the app's documents directory so it survives cache eviction
 * until the deferred attempt is re-graded on the next sync. Returns the durable
 * URI, or `null` when the copy failed.
 */
export async function persistClipForDeferred(
  audioUri: string,
  idempotencyKey: string
): Promise<string | null> {
  try {
    const directory = `${FileSystem.documentDirectory}speaking-pending/`;
    const info = await FileSystem.getInfoAsync(directory);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }

    const safeKey = String(idempotencyKey).replace(/[^a-z0-9-_]/gi, '_');
    const extension = audioUri.split('?')[0].split('.').pop() || 'm4a';
    const target = `${directory}${safeKey}.${extension}`;

    await FileSystem.copyAsync({ from: audioUri, to: target });
    return target;
  } catch (error) {
    console.log('[Transcription] failed to persist clip for deferred grading', error);
    return null;
  }
}
