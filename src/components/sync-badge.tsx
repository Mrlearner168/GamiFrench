/**
 * Small, honest sync indicator.
 *
 * Shows one of three states:
 *   - "Synced"            everything is on the server and the queue is empty,
 *   - "N waiting to sync" there are queued operations but no connection yet,
 *   - "Syncing..."        a push/pull cycle is running right now.
 *
 * It is intentionally lightweight (a pill) so it can sit in the game header
 * without disturbing the existing layout.
 */
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useSync } from '@/store/sync-context';

export function SyncBadge() {
  const { syncing, online, pendingCount } = useSync();

  if (syncing) {
    return (
      <View style={[styles.pill, styles.syncing]}>
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text style={styles.text}>Syncing...</Text>
      </View>
    );
  }

  if (!online) {
    return (
      <View style={[styles.pill, styles.offline]}>
        <Text style={styles.dot}>●</Text>
        <Text style={styles.text}>
          {pendingCount > 0
            ? `Offline · ${pendingCount} to sync`
            : 'Offline mode'}
        </Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <View style={[styles.pill, styles.pending]}>
        <Text style={styles.dot}>●</Text>
        <Text style={styles.text}>{pendingCount} waiting to sync</Text>
      </View>
    );
  }

  return (
    <View style={[styles.pill, styles.synced]}>
      <Text style={styles.dot}>✓</Text>
      <Text style={styles.text}>Synced</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  syncing: { backgroundColor: '#208AEF' },
  offline: { backgroundColor: '#8A8F99' },
  pending: { backgroundColor: '#E0A800' },
  synced: { backgroundColor: '#2E9E5B' },
  dot: { color: '#FFFFFF', fontSize: 10 },
  text: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});
