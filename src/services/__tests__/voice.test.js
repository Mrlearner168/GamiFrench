/**
 * The voice service must warm the engine once per app run and let a tap play
 * at once, so these tests drive it against a fake expo-speech engine.
 */
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getAvailableVoicesAsync: jest.fn(async () => [
    { identifier: 'fr-voice', language: 'fr-FR' },
    { identifier: 'en-voice', language: 'en-US' },
  ]),
}));

const flush = () => new Promise((resolve) => setImmediate(resolve));

function loadVoice() {
  let voice;
  let Speech;
  jest.isolateModules(() => {
    Speech = require('expo-speech');
    voice = require('@/services/voice');
  });
  return { voice, Speech };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('warmUpVoice', () => {
  it('lists voices and primes the engine only once per app run', async () => {
    const { voice, Speech } = loadVoice();
    // The silent primer finishes straight away.
    Speech.speak.mockImplementation((_text, options) => options.onDone?.());

    expect(voice.isVoiceWarm()).toBe(false);
    await Promise.all([voice.warmUpVoice(), voice.warmUpVoice()]);
    await voice.warmUpVoice();

    expect(voice.isVoiceWarm()).toBe(true);
    expect(Speech.getAvailableVoicesAsync).toHaveBeenCalledTimes(1);
    expect(Speech.speak).toHaveBeenCalledTimes(1);
    expect(Speech.speak.mock.calls[0][1]).toMatchObject({ volume: 0, voice: 'fr-voice' });
  });

  it('still counts as warm when the engine never answers', async () => {
    jest.useFakeTimers();
    try {
      const { voice } = loadVoice();
      const done = voice.warmUpVoice();
      await Promise.resolve();
      await Promise.resolve();
      jest.advanceTimersByTime(3000);
      await done;
      expect(voice.isVoiceWarm()).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('speak with cutIn', () => {
  it('stops the playing line and starts the new one immediately', async () => {
    const { voice, Speech } = loadVoice();

    const first = voice.speak('Bonjour');
    expect(Speech.speak).toHaveBeenCalledTimes(1);

    voice.speak('Merci', { cutIn: true });

    expect(Speech.stop).toHaveBeenCalledTimes(1);
    expect(Speech.speak).toHaveBeenCalledTimes(2);
    expect(Speech.speak.mock.calls[1][0]).toBe('Merci');
    await expect(first).resolves.toBeUndefined();
  });

  it('replays the same line from the start instead of ignoring the tap', () => {
    const { voice, Speech } = loadVoice();

    voice.speak('Bonjour');
    voice.speak('Bonjour', { cutIn: true });

    expect(Speech.stop).toHaveBeenCalledTimes(1);
    expect(Speech.speak).toHaveBeenCalledTimes(2);
  });

  it('ignores a late onStopped from the line that was cut', async () => {
    const { voice, Speech } = loadVoice();

    voice.speak('Bonjour');
    const oldOptions = Speech.speak.mock.calls[0][1];

    let secondDone = false;
    voice.speak('Merci', { cutIn: true }).then(() => {
      secondDone = true;
    });

    // The engine reports the first line as stopped after the second started.
    oldOptions.onStopped();
    await flush();
    expect(secondDone).toBe(false);
    expect(voice.isSpeaking()).toBe(true);

    Speech.speak.mock.calls[1][1].onDone();
    await flush();
    expect(secondDone).toBe(true);
  });

  it('without cutIn, a second line waits its turn', () => {
    const { voice, Speech } = loadVoice();

    voice.speak('Bonjour');
    voice.speak('Merci');

    expect(Speech.speak).toHaveBeenCalledTimes(1);
    expect(Speech.stop).not.toHaveBeenCalled();
  });
});
