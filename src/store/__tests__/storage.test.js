/*
 * Platform-aware storage (`src/store/storage.ts`):
 *   - native platforms delegate to expo-secure-store, unchanged;
 *   - web persists to localStorage instead, because expo-secure-store has no
 *     web implementation (its calls throw there, which used to sign the
 *     learner out on every page reload and drop offline progress).
 */
const mockMemory = new Map();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => (mockMemory.has(key) ? mockMemory.get(key) : null)),
  setItemAsync: jest.fn(async (key, value) => {
    mockMemory.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key) => {
    mockMemory.delete(key);
  }),
}));

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { storageDelete, storageGet, storageSet } from '@/store/storage';

/** In-memory stand-in for window.localStorage on the web tests. */
function installFakeLocalStorage({ throwing = false } = {}) {
  const map = new Map();
  const fake = {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      if (throwing) throw new Error('quota exceeded');
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    value: fake,
    configurable: true,
    writable: true,
  });
  return {
    map,
    restore() {
      if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
      else delete globalThis.localStorage;
    },
  };
}

function usePlatform(os) {
  const original = Platform.OS;
  Platform.OS = os;
  return () => {
    Platform.OS = original;
  };
}

let restorePlatform;
let restoreStorage;

beforeEach(() => {
  jest.clearAllMocks();
  mockMemory.clear();
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  restorePlatform?.();
  restorePlatform = null;
  restoreStorage?.restore?.();
  restoreStorage = null;
  jest.restoreAllMocks();
});

describe('native platforms keep using expo-secure-store', () => {
  it('reads and writes through SecureStore', async () => {
    restorePlatform = usePlatform('ios');

    await storageSet('gamifrench.session', '{"token":1}');
    await expect(storageGet('gamifrench.session')).resolves.toBe('{"token":1}');
    await storageDelete('gamifrench.session');
    await expect(storageGet('gamifrench.session')).resolves.toBeNull();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('gamifrench.session', '{"token":1}');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('gamifrench.session');
  });

  it('does not touch localStorage', async () => {
    restorePlatform = usePlatform('ios');
    restoreStorage = installFakeLocalStorage();

    await storageSet('key', 'value');

    expect(restoreStorage.map.size).toBe(0);
    expect(mockMemory.get('key')).toBe('value');
  });
});

describe('web persists through localStorage', () => {
  it('keeps values across calls and removes them on delete', async () => {
    restorePlatform = usePlatform('web');
    restoreStorage = installFakeLocalStorage();

    await storageSet('gamifrench.session', '{"token":1}');
    await expect(storageGet('gamifrench.session')).resolves.toBe('{"token":1}');
    await storageDelete('gamifrench.session');
    await expect(storageGet('gamifrench.session')).resolves.toBeNull();
  });

  it('never calls expo-secure-store (which throws on web)', async () => {
    restorePlatform = usePlatform('web');
    restoreStorage = installFakeLocalStorage();

    await storageSet('key', 'value');
    await storageGet('key');
    await storageDelete('key');

    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('reads return null when localStorage is unavailable', async () => {
    restorePlatform = usePlatform('web');
    // No localStorage installed (e.g. a locked-down browser profile).
    await expect(storageGet('key')).resolves.toBeNull();
    await expect(storageSet('key', 'value')).resolves.toBeUndefined();
    await expect(storageDelete('key')).resolves.toBeUndefined();
  });

  it('a failing localStorage never rejects the caller', async () => {
    restorePlatform = usePlatform('web');
    restoreStorage = installFakeLocalStorage({ throwing: true });

    await expect(storageSet('key', 'value')).resolves.toBeUndefined();
    await expect(storageGet('key')).resolves.toBeNull();
  });
});