/**
 * Chunked JSON storage on top of `@/store/storage`.
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
import { storageDelete, storageGet, storageSet } from '@/store/storage';

/** Characters per storage value (comfortably under the ~2 KB limit). */
const CHUNK_SIZE = 1500;

const chunkKey = (key: string, index: number) => `${key}-c${index}`;
const manifestKey = (key: string) => `${key}-chunks`;

async function deleteChunks(key: string): Promise<void> {
  try {
    const manifest = await storageGet(manifestKey(key));
    if (!manifest) return;

    const count = Number(manifest) || 0;
    for (let index = 0; index < count; index += 1) {
      await storageDelete(chunkKey(key, index));
    }
    await storageDelete(manifestKey(key));
  } catch (error) {
    console.log(`[LocalStore] deleteChunks failed for ${key}`, error);
  }
}

/** Read and parse a JSON value, transparently handling chunked or legacy data. */
export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const manifest = await storageGet(manifestKey(key));

    if (manifest) {
      const count = Number(manifest) || 0;
      let raw = '';
      for (let index = 0; index < count; index += 1) {
        const part = await storageGet(chunkKey(key, index));
        if (part == null) return fallback;
        raw += part;
      }
      return JSON.parse(raw) as T;
    }

    const single = await storageGet(key);
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
      await storageSet(key, raw);
      await deleteChunks(key);
      return;
    }

    const chunks: string[] = [];
    for (let index = 0; index < raw.length; index += CHUNK_SIZE) {
      chunks.push(raw.slice(index, index + CHUNK_SIZE));
    }

    await storageSet(manifestKey(key), String(chunks.length));
    for (let index = 0; index < chunks.length; index += 1) {
      await storageSet(chunkKey(key, index), chunks[index]);
    }

    // Drop any stale single-value copy from a previous small write.
    await storageDelete(key);
  } catch (error) {
    console.log(`[LocalStore] writeJson failed for ${key}`, error);
  }
}

/** Remove both the plain value and any chunks/manifest for a key. */
export async function removeJson(key: string): Promise<void> {
  try {
    await storageDelete(key);
    await deleteChunks(key);
  } catch (error) {
    console.log(`[LocalStore] removeJson failed for ${key}`, error);
  }
}
