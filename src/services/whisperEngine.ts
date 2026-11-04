/**
 * Tier-2 offline transcription: on-device Whisper via whisper.rn (whisper.cpp).
 *
 * This is the guarantee tier - it runs entirely on the phone and works on any
 * device that can install the (large) model, independent of whether the OS
 * ships its own offline recognizer.
 *
 * Requirements / caveats:
 *   - `whisper.rn` is a native module and must be installed + the app rebuilt
 *     (`npm install whisper.rn` then a new dev/production build).
 *   - whisper.cpp decodes **16 kHz mono PCM/WAV**. A compressed clip (m4a/aac)
 *     is not guaranteed to decode; the speaking screen prefers a WAV preset
 *     when the whisper tier is expected, otherwise the tier simply falls
 *     through to the deferred queue.
 *
 * The module is `require`d lazily and defensively so a build without it keeps
 * working (the ladder just skips this tier).
 */
import * as FileSystem from 'expo-file-system/legacy';

const MODEL_DIR_NAME = 'whisper-models';

type ModelSpec = { name: string; url: string; approxMb: number };

/** Multilingual base model: good French accuracy at a reasonable size. */
export const DEFAULT_MODEL: ModelSpec = {
  name: 'ggml-base.bin',
  url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
  approxMb: 142,
};

type WhisperModule = {
  initWhisper: (options: { filePath: string }) => Promise<WhisperContext>;
};

type WhisperContext = {
  transcribe: (
    filePath: string,
    options?: Record<string, unknown>
  ) => { promise?: Promise<{ result?: string | { text?: string } }> } | Promise<{ result?: string | { text?: string } }>;
};

let whisperModule: WhisperModule | null | undefined;

function loadWhisperModule(): WhisperModule | null {
  if (whisperModule !== undefined) return whisperModule;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    whisperModule = require('whisper.rn') as WhisperModule;
  } catch (error) {
    console.log('[Whisper] whisper.rn not installed; offline Whisper tier disabled.', error);
    whisperModule = null;
  }

  return whisperModule;
}

/** True when the native module is present and usable. */
export function isWhisperAvailable(): boolean {
  return Boolean(loadWhisperModule()?.initWhisper);
}

function modelDirectory(): string {
  return `${FileSystem.documentDirectory}${MODEL_DIR_NAME}/`;
}

/** Absolute path of a model file inside the app's documents directory. */
export function modelUri(name = DEFAULT_MODEL.name): string {
  return `${modelDirectory()}${name}`;
}

/** Whether the model file has already been downloaded. */
export async function isModelReady(name = DEFAULT_MODEL.name): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(modelUri(name));
    return Boolean(info.exists);
  } catch {
    return false;
  }
}

/**
 * Download the Whisper model once (Wi-Fi recommended - it is ~140 MB). Returns
 * the local file path, or `null` when the download could not be completed.
 */
export async function ensureModel(
  onProgress?: (ratio: number) => void,
  spec: ModelSpec = DEFAULT_MODEL
): Promise<string | null> {
  try {
    if (await isModelReady(spec.name)) return modelUri(spec.name);

    const directory = modelDirectory();
    const info = await FileSystem.getInfoAsync(directory);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }

    const download = FileSystem.createDownloadResumable(
      spec.url,
      modelUri(spec.name),
      {},
      (progress) => {
        if (onProgress && progress.totalBytesExpectedToWrite > 0) {
          onProgress(progress.totalBytesWritten / progress.totalBytesExpectedToWrite);
        }
      }
    );

    const result = await download.downloadAsync();
    return result?.uri ?? modelUri(spec.name);
  } catch (error) {
    console.log('[Whisper] model download failed', error);
    return null;
  }
}

let contextPromise: Promise<WhisperContext> | null = null;

async function getContext(): Promise<WhisperContext> {
  if (!contextPromise) {
    contextPromise = (async () => {
      const mod = loadWhisperModule();
      if (!mod?.initWhisper) throw new Error('whisper.rn is not available.');

      const uri = await ensureModel();
      if (!uri) throw new Error('Whisper model could not be prepared.');

      return mod.initWhisper({ filePath: uri });
    })().catch((error) => {
      contextPromise = null;
      throw error;
    });
  }

  return contextPromise;
}

type WhisperTranscribeOptions = { language?: string; timeoutMs?: number };

/** Transcribe a clip on-device with Whisper. Resolves to text or `null`. */
export async function transcribeWithWhisper(
  audioUri: string,
  { language = 'fr' }: WhisperTranscribeOptions = {}
): Promise<string | null> {
  try {
    const context = await getContext();
    const call = context.transcribe(audioUri, {
      language,
      translate: false,
      // Greedy decoding keeps it fast and deterministic for short phrases.
      temperature: 0,
    });

    const output = (await ('promise' in call ? call.promise : call)) as
      | { result?: string | { text?: string } }
      | undefined;

    const result = output?.result;
    const text =
      typeof result === 'string' ? result : typeof result?.text === 'string' ? result.text : '';

    return text.trim() || null;
  } catch (error) {
    console.log('[Whisper] transcription failed', error);
    return null;
  }
}

/** Release the loaded model (e.g. from the settings screen to free memory). */
export function releaseWhisperContext() {
  contextPromise = null;
}
