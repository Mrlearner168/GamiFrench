/**
 * The transcription ladder is what makes the speaking check work offline, so
 * these tests pin the tier order and the deferred fallback.
 */
jest.mock('@/services/connectivity', () => ({
  isOnlineSync: jest.fn(),
}));

jest.mock('@/services/onDeviceAsr', () => ({
  FRENCH_LOCALE: 'fr-FR',
  isOnDeviceTranscriptionAvailable: jest.fn(),
  transcribeWithOnDevice: jest.fn(),
}));

jest.mock('@/services/whisperEngine', () => ({
  isWhisperAvailable: jest.fn(),
  isModelReady: jest.fn(),
  transcribeWithWhisper: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  uploadAsync: jest.fn(),
  FileSystemUploadType: { MULTIPART: 'multipart' },
}));

import * as FileSystem from 'expo-file-system/legacy';

import { isOnlineSync } from '@/services/connectivity';
import {
  isOnDeviceTranscriptionAvailable,
  transcribeWithOnDevice,
} from '@/services/onDeviceAsr';
import { persistClipForDeferred, transcribeClip } from '@/services/transcription';
import {
  isModelReady,
  isWhisperAvailable,
  transcribeWithWhisper,
} from '@/services/whisperEngine';

const OFFLINE = { audioUri: 'file:///clip.m4a', targetPhrase: 'Bonjour' };

beforeEach(() => {
  jest.clearAllMocks();

  // The Groq tier refuses to run without a key; provide one for the online path.
  if (!process.env.EXPO_PUBLIC_GROQ_API_KEY) {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-groq-key';
  }

  // Defaults: offline, no on-device engine, no whisper model.
  isOnlineSync.mockReturnValue(false);
  isOnDeviceTranscriptionAvailable.mockReturnValue(false);
  isWhisperAvailable.mockReturnValue(false);
  isModelReady.mockResolvedValue(false);
});

it('prefers Groq when online', async () => {
  isOnlineSync.mockReturnValue(true);
  FileSystem.uploadAsync.mockResolvedValue({
    status: 200,
    body: JSON.stringify({ text: 'bonjour' }),
  });

  const result = await transcribeClip(OFFLINE);

  expect(result.engine).toBe('groq');
  expect(result.text).toBe('bonjour');
  expect(result.offline).toBe(false);
});

it('falls back to the on-device recognizer when Groq fails', async () => {
  isOnlineSync.mockReturnValue(true);
  FileSystem.uploadAsync.mockResolvedValue({
    status: 500,
    body: JSON.stringify({ error: { message: 'boom' } }),
  });
  isOnDeviceTranscriptionAvailable.mockReturnValue(true);
  transcribeWithOnDevice.mockResolvedValue('bonjour');

  const result = await transcribeClip(OFFLINE);

  expect(result.engine).toBe('on-device');
  expect(result.offline).toBe(true);
});

it('uses the Whisper tier only once its model is downloaded', async () => {
  isWhisperAvailable.mockReturnValue(true);
  isModelReady.mockResolvedValue(true);
  transcribeWithWhisper.mockResolvedValue('bonjour');

  const result = await transcribeClip(OFFLINE);

  expect(result.engine).toBe('whisper');
  expect(transcribeWithWhisper).toHaveBeenCalledTimes(1);
});

it('skips Whisper when its model is not downloaded yet', async () => {
  isWhisperAvailable.mockReturnValue(true);
  isModelReady.mockResolvedValue(false);

  const result = await transcribeClip(OFFLINE);

  expect(transcribeWithWhisper).not.toHaveBeenCalled();
  expect(result.engine).toBe('deferred');
});

it('defers when no tier can produce text', async () => {
  const result = await transcribeClip(OFFLINE);

  expect(result.text).toBeNull();
  expect(result.engine).toBe('deferred');
});

it('persists a clip into the documents directory for deferred grading', async () => {
  FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
  FileSystem.copyAsync.mockResolvedValue(undefined);

  const uri = await persistClipForDeferred('file:///clip.m4a', 'm1-l1-alphabet:123');

  expect(FileSystem.copyAsync).toHaveBeenCalledWith({
    from: 'file:///clip.m4a',
    to: 'file:///docs/speaking-pending/m1-l1-alphabet_123.m4a',
  });
  expect(uri).toBe('file:///docs/speaking-pending/m1-l1-alphabet_123.m4a');
});
