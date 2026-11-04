/**
 * Chunked JSON storage on top of SecureStore.
 *
 * SecureStore is capped at roughly 2 KB per value on Android (the platform
 * warns and can silently drop larger writes). The offline queue and the device
 * mirrors legitimately outgrow that - a learner who plays a whole module
 * offline queues many operations - so this helper splits a JSON payload across
 * several SecureStore values and reassembles it on read.
 *
 * A value written the old way (one plain SecureStore item) is still read back
 * correctly, so existing queues migrate with no extra step. Values that fit in
 * a single chunk keep using the original key, which avoids a needless manifest.
 *
 * Note: SecureStore keys may only contain alphanumerics, ".", "-" and "_", so
 * chunk keys use "-cN" / "-chunks" rather than a colon.
 */
import * as SecureStore from 'expo-secure-store';

/** Characters per SecureStore value (comfortably under the ~2 KB limit). */
const CHUNK_SIZE = 1500;

const chunkKey = (key: string, index: number) => `${key}-c${index}`;
const manifestKey = (key: string) => `${key}-chunks`;

async function deleteChunks(key: string): Promise<void> {
  try {
    const manifest = await SecureStore.getItemAsync(manifestKey(key));
    if (!manifest) return;

    const count = Number(manifest) || 0;
    for (let index = 0; index < count; index += 1) {
      await SecureStore.deleteItemAsync(chunkKey(key, index));
    }
    await SecureStore.deleteItemAsync(manifestKey(key));
  } catch (error) {
    console.log(`[LocalStore] deleteChunks failed for ${key}`, error);
  }
}

/** Read and parse a JSON value, transparently handling chunked or legacy data. */
export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const manifest = await SecureStore.getItemAsync(manifestKey(key));

    if (manifest) {
      const count = Number(manifest) || 0;
      let raw = '';
      for (let index = 0; index < count; index += 1) {
        const part = await SecureStore.getItemAsync(chunkKey(key, index));
        if (part == null) return fallback;
        raw += part;
      }
      return JSON.parse(raw) as T;
    }

    const single = await SecureStore.getItemAsync(key);
    return single ? (JSON.parse(single) as T) : fallback;
  } catch (error) {
    console.log(`[LocalStore] readJson failed for ${key}`, error);
    return fallback;
  }
}

/** Serialize and persist a value, splitting it across chunks when needed. */
export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    const raw = JSON.stringify(value);

    if (raw.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, raw);
      await deleteChunks(key);
      return;
    }

    const chunks: string[] = [];
    for (let index = 0; index < raw.length; index += CHUNK_SIZE) {
      chunks.push(raw.slice(index, index + CHUNK_SIZE));
    }

    await SecureStore.setItemAsync(manifestKey(key), String(chunks.length));
    for (let index = 0; index < chunks.length; index += 1) {
      await SecureStore.setItemAsync(chunkKey(key, index), chunks[index]);
    }

    // Drop any stale single-value copy from a previous small write.
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log(`[LocalStore] writeJson failed for ${key}`, error);
  }
}

/** Remove both the plain value and any chunks/manifest for a key. */
export async function removeJson(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
    await deleteChunks(key);
  } catch (error) {
    console.log(`[LocalStore] removeJson failed for ${key}`, error);
  }
}
