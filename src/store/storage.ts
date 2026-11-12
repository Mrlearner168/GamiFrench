/**
 * Platform-aware key-value storage.
 *
 * `expo-secure-store` is where this app keeps its secrets on a device
 * (session tokens, offline mirrors, preferences), but it has NO web
 * implementation — on web its calls throw `TypeError` and every value is
 * lost on a page reload (the learner was signed out on every refresh and
 * offline progress vanished). On web this module persists to
 * `window.localStorage` instead.
 *
 * Trade-off: localStorage is readable by any script running on the page,
 * unlike the Keychain/Keystore. That is the standard trade every web app
 * makes; without it there is no persistence on web at all.
 *
 * Error contract: web storage failures (privacy modes, quota) are logged and
 * swallowed — persistence is best-effort, matching the callers' own
 * best-effort try/catches. Native calls are delegated untouched, so platform
 * errors surface to callers exactly as before.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Read at call time so tests can swap the platform. */
const isWeb = () => Platform.OS === 'web';

function webStore(): KeyValueStore | null {
  try {
    return (globalThis as { localStorage?: KeyValueStore }).localStorage ?? null;
  } catch {
    // Accessing localStorage can throw in some privacy modes.
    return null;
  }
}

export async function storageGet(key: string): Promise<string | null> {
  if (!isWeb()) return SecureStore.getItemAsync(key);
  try {
    return webStore()?.getItem(key) ?? null;
  } catch (error) {
    console.log('[Storage] web read failed', error);
    return null;
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (!isWeb()) return SecureStore.setItemAsync(key, value);
  try {
    webStore()?.setItem(key, value);
  } catch (error) {
    console.log('[Storage] web write failed', error);
  }
}

export async function storageDelete(key: string): Promise<void> {
  if (!isWeb()) return SecureStore.deleteItemAsync(key);
  try {
    webStore()?.removeItem(key);
  } catch (error) {
    console.log('[Storage] web delete failed', error);
  }
}