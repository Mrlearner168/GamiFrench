/**
 * "Buy a heart" offer for the out-of-hearts screen.
 *
 * The server owns coins, hearts and the price (5 coins for the first heart of
 * the day, then 10, 15, ...; it starts over each day), so this only shows what
 * the server reported and asks it to make the purchase.
 */
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { isColdStartError } from '@/services/apiClient';
import { sounds } from '@/services/sound';

/**
 * @param {object} props
 * @param {{ heartPrice?: number, coins?: number, hearts?: number, maxHearts?: number }} props.shop
 * @param {(path: string, options?: RequestInit) => Promise<any>} props.request authenticated request
 * @param {(result: object) => void} props.onBought called with the server's new hearts/coins/price
 */
export function HeartShop({ shop, request, onBought }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const price = Number(shop?.heartPrice);
  const coins = Number(shop?.coins ?? 0);
  const hearts = Number(shop?.hearts ?? 0);
  const maxHearts = Number(shop?.maxHearts ?? 5);

  // An older server sends no price: nothing to offer.
  if (!Number.isFinite(price) || hearts >= maxHearts) return null;

  const canAfford = coins >= price;

  const buy = async () => {
    if (busy || !canAfford) return;
    setBusy(true);
    setMessage(null);
    try {
      const result = await request('/hearts/purchase', { method: 'POST' });
      sounds.correct();
      onBought(result);
    } catch (error) {
      if (error?.code === 'NOT_ENOUGH_COINS' || error?.code === 'HEARTS_FULL') {
        // The server's numbers win (e.g. coins were spent on another device).
        onBought({ ...shop, ...(error.details ?? {}) });
        setMessage(error.message);
      } else if (isColdStartError(error)) {
        setMessage('Connect to the internet to buy a heart.');
      } else {
        setMessage(error?.message || 'The heart could not be bought. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Use your coins</Text>
      <Text style={styles.balance}>You have {coins} 🪙</Text>

      <TouchableOpacity
        style={[styles.button, !canAfford && styles.buttonDisabled]}
        activeOpacity={0.8}
        disabled={!canAfford || busy}
        onPress={buy}
        accessibilityRole="button"
        accessibilityLabel={`Buy one heart for ${price} coins`}
      >
        {busy ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Buy 1 ❤️ for {price} 🪙</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        {canAfford
          ? `Each heart today costs 5 coins more than the last. Tomorrow it is back to 5.`
          : `You need ${price - coins} more coins. Earn them from missions and challenges.`}
      </Text>

      {message ? <Text style={styles.error}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
  },
  title: { fontSize: 17, fontWeight: '900', color: '#9A3412' },
  balance: { fontSize: 15, color: '#7C2D12', marginTop: 4, marginBottom: 12 },
  button: {
    alignSelf: 'stretch',
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#FDBA74' },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  note: { fontSize: 13, lineHeight: 18, color: '#9A3412', textAlign: 'center', marginTop: 10 },
  error: { fontSize: 13, color: '#DC2626', textAlign: 'center', marginTop: 8 },
});
