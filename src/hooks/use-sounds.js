import { useCallback, useEffect, useState } from 'react';

import {
  isSoundEnabled,
  loadSoundEnabled,
  preloadSounds,
  setSoundEnabled,
  sounds,
} from '@/services/sound';

/**
 * `useSounds()` — game audio for any screen.
 *
 * - Preloads all SFX on first mount so the first tap is instant.
 * - Exposes `play(name)` plus named helpers (`playCorrect()`, ...),
 *   and the global mute state (`muted`, `toggleMuted()`).
 *
 * Usage:
 *   const { playCorrect, playWrong } = useSounds();
 *   onAnswer(ok ? playCorrect() : playWrong());
 */
export function useSounds() {
  const [muted, setMuted] = useState(!isSoundEnabled());

  useEffect(() => {
    let active = true;
    preloadSounds();
    loadSoundEnabled().then((value) => {
      if (active) setMuted(!value);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleMuted = useCallback(async () => {
    const nextEnabled = !isSoundEnabled();
    await setSoundEnabled(nextEnabled);
    setMuted(!nextEnabled);
    if (nextEnabled) sounds.tap();
    return !nextEnabled;
  }, []);

  const play = useCallback((name) => {
    const fn = sounds[name];
    if (typeof fn === 'function') fn();
  }, []);

  return {
    muted,
    toggleMuted,
    play,
    sounds,
    playCorrect: sounds.correct,
    playWrong: sounds.wrong,
    playTap: sounds.tap,
    playPop: sounds.pop,
    playWhoosh: sounds.whoosh,
    playStar: sounds.star,
    playLevelUp: sounds.levelup,
    playReward: sounds.reward,
    playStreak: sounds.streak,
    playComplete: sounds.complete,
    playListen: sounds.listen,
    playGreat: sounds.great,
  };
}

export default useSounds;
