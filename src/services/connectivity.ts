/**
 * Connectivity detection for the offline-first flow.
 *
 * The app uses `expo-network` to know whether the device is online so it can
 * (a) pick the right pronunciation-transcription engine and (b) flush the
 * pending-sync queue the moment the connection comes back.
 *
 * `expo-network` is loaded behind a guarded `require`: an existing development
 * build that predates the module must not crash. When it is unavailable we
 * report an unknown/optimistic status (`online: true`) and let real request
 * failures (see `isOfflineError` in apiClient) mark the device offline instead.
 */
import { useSyncExternalStore } from 'react';

type NetworkState = {
  isConnected?: boolean | null;
  isInternetReachable?: boolean | null;
  type?: string | null;
};

type NetworkModule = {
  getNetworkStateAsync: () => Promise<NetworkState>;
  addNetworkStateListener?: (
    listener: (state: NetworkState) => void
  ) => { remove: () => void };
};

let Network: NetworkModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Network = require('expo-network') as NetworkModule;
} catch (error) {
  console.log('[Connectivity] expo-network unavailable; assuming always online.', error);
}

/** Reflects what the device believes about its connection right now. */
export type ConnectivityStatus = {
  /** True when we are confident the device can reach the internet. */
  online: boolean;
  /** Raw reachability flag from the platform (online when unknown). */
  reachable: boolean;
  /** False when no connectivity provider is installed (status is a guess). */
  known: boolean;
  type: string | null;
};

const OPTIMISTIC: ConnectivityStatus = {
  online: true,
  reachable: true,
  known: false,
  type: null,
};

let currentStatus: ConnectivityStatus = OPTIMISTIC;
const listeners = new Set<(status: ConnectivityStatus) => void>();

function deriveStatus(state: NetworkState | null | undefined): ConnectivityStatus {
  // `null`/`undefined` means "unknown" on several platforms, so only an
  // explicit `false` counts as offline. That keeps a false "offline" from
  // hiding working connectivity and stalling the sync queue.
  const connected = state?.isConnected !== false;
  const reachable = state?.isInternetReachable !== false;

  return {
    online: connected && reachable,
    reachable,
    known: true,
    type: state?.type ?? null,
  };
}

function emit(status: ConnectivityStatus) {
  currentStatus = status;
  listeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      console.log('[Connectivity] listener threw', error);
    }
  });
}

/** Read the platform connectivity state once. */
export async function readNetworkStatus(): Promise<ConnectivityStatus> {
  if (!Network?.getNetworkStateAsync) return OPTIMISTIC;

  try {
    return deriveStatus(await Network.getNetworkStateAsync());
  } catch (error) {
    console.log('[Connectivity] getNetworkStateAsync failed', error);
    return OPTIMISTIC;
  }
}

/** The last known status without hitting the platform. */
export function getConnectivityStatus(): ConnectivityStatus {
  return currentStatus;
}

/** Convenience boolean for non-React callers (e.g. services). */
export function isOnlineSync(): boolean {
  return currentStatus.online;
}

/** Subscribe to every status change. Returns an unsubscribe function. */
export function subscribeToConnectivity(
  listener: (status: ConnectivityStatus) => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Fires only on an offline -> online transition, which is exactly when the
 * sync engine should replay the queue.
 */
export function subscribeToReconnect(listener: () => void): () => void {
  let wasOnline = currentStatus.online;

  return subscribeToConnectivity((status) => {
    if (status.online && !wasOnline) {
      listener();
    }
    wasOnline = status.online;
  });
}

let monitorStarted = false;

/**
 * Start watching connectivity: one immediate read, a platform listener when
 * available, and a slow poll as a safety net for platforms whose listener is
 * unreliable. Idempotent; the returned function stops the monitor.
 */
export function startConnectivityMonitor(): () => void {
  if (monitorStarted) return () => {};
  monitorStarted = true;

  readNetworkStatus().then(emit);

  let subscription: { remove: () => void } | null = null;
  if (Network?.addNetworkStateListener) {
    try {
      subscription = Network.addNetworkStateListener((state) => emit(deriveStatus(state)));
    } catch (error) {
      console.log('[Connectivity] addNetworkStateListener failed', error);
    }
  }

  const timer = setInterval(() => {
    readNetworkStatus().then(emit);
  }, 20_000);

  return () => {
    monitorStarted = false;
    if (subscription) subscription.remove();
    clearInterval(timer);
  };
}

/**
 * React hook that re-renders whenever connectivity changes.
 *
 * Uses `useSyncExternalStore` so the hook subscribes to this module's singleton
 * directly, instead of calling `setState` synchronously inside an effect (which
 * the React rules reject as a cascading render).
 */
function subscribeToStatus(callback: () => void): () => void {
  return subscribeToConnectivity(() => callback());
}

export function useNetworkStatus(): ConnectivityStatus {
  return useSyncExternalStore(subscribeToStatus, getConnectivityStatus, getConnectivityStatus);
}
