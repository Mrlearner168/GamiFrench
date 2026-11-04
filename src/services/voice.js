/**
 * Voice output coordinator for the whole app (map stops, lessons, replays).
 *
 * `expo-speech` is a fire-and-forget global engine: calling `Speech.speak`
 * twice queues both, and the only way to interrupt is `Speech.stop()`, which
 * cuts mid-word and leaves an audible click. Playing every line through this
 * module instead gives the lesson one voice at a time, in order, with the
 * duplicates dropped and the engine warm before the first word.
 *
 * Why it matters for the lesson:
 *   - one utterance at a time, so lines never talk over each other,
 *   - a natural pitch (the old 1.4 read as a cartoon), and a rate that the
 *     speaking stage can slow down for a beginner,
 *   - repeated taps on Listen are de-duplicated instead of stacking up,
 *   - `onBoundary` is translated into a *word index*, which is what lets the
 *     screen highlight the word being read instead of guessing with timers.
 *
 * The module is offline by design: it only ever talks to the OS engine, so a
 * device with no network speaks exactly as well as one with it.
 */
import * as Speech from 'expo-speech';

/**
 * Natural speaking pitch. Values above ~1.2 give French an unnatural,
 * cartoonish timbre because French vowel formants sit high already.
 */
export const NATURAL_PITCH = 1.0;

/** Readable cadence presets offered on the speaking stage. */
export const SPEECH_RATES = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.15,
};

/** Languages the lesson needs, so a missing voice can be reported. */
export const FRENCH_LOCALE = 'fr-FR';
export const ENGLISH_LOCALE = 'en-US';

/*
 * Length-based backstop.
 *
 * Some engines fire none of onDone/onStopped/onError (notably when a voice is
 * missing or the OS is busy), which would wedge the queue forever. The queue
 * therefore stops waiting after this estimate. It is deliberately generous so
 * it only ever fires for an engine that has genuinely gone quiet.
 */
const UTTERANCE_BASE_MS = 1200;
const UTTERANCE_MS_PER_CHAR = 85;
const UTTERANCE_MAX_MS = 20_000;

/*
 * Short pause between two consecutive utterances. Without it the engine cuts
 * straight from one line into the next with no gap, which is what makes a
 * lesson feel clipped rather than spoken.
 */
const INTER_UTTERANCE_GAP_MS = 140;

const frenchVoiceId = { current: null };
const englishVoiceId = { current: null };

/*
 * The voice list and the engine primer only need to run once per app run: the
 * OS keeps the voice loaded afterwards. Caching the promises means a node, a
 * lesson or a replay never pays the cold-start cost again.
 */
let voicesPromise = null;
let warmUpPromise = null;
let warm = false;

/** Resolve the platform voice list once and remember the ids we need. */
export function primeVoices() {
  if (!voicesPromise) voicesPromise = resolveVoices();
  return voicesPromise;
}

async function resolveVoices() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();

    const pick = (prefix) =>
      voices.find((voice) =>
        String(voice?.language ?? '')
          .toLowerCase()
          .startsWith(prefix)
      );

    frenchVoiceId.current = pick('fr')?.identifier ?? null;
    englishVoiceId.current = pick('en')?.identifier ?? null;
  } catch (error) {
    // A device that cannot list its voices can still speak with the default
    // one, so this is never fatal -- we just fall back to `language`.
    console.log('[Voice] could not resolve platform voices', error);
    // Let a later call try again instead of caching the failure.
    voicesPromise = null;
  }

  return {
    frenchVoiceId: frenchVoiceId.current,
    englishVoiceId: englishVoiceId.current,
  };
}

/**
 * Speak one short silent line to force the engine to load its voice.
 *
 * French is primed because the lesson material is French. Resolves as soon as
 * the engine reports the line finished, errors, or overruns `timeoutMs` --
 * whichever is first -- so a device without a TTS engine can never block the
 * screen.
 */
export function primeEngine({ timeoutMs = 2500 } = {}) {
  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      resolve();
    };

    const guard = setTimeout(finish, timeoutMs);

    try {
      Speech.speak('Bonjour', {
        language: FRENCH_LOCALE,
        voice: frenchVoiceId.current ?? undefined,
        volume: 0,
        rate: 1,
        onDone: finish,
        onStopped: finish,
        onError: finish,
      });
    } catch (error) {
      console.log('[Voice] engine primer failed', error);
      finish();
    }
  });
}

/**
 * Get the voice ready once for the whole app run.
 *
 * Started at app launch (root layout), so by the time the learner opens a
 * stop or a lesson the engine is already hot. Every later call shares the
 * same promise and resolves at once. Never rejects.
 */
export function warmUpVoice() {
  if (!warmUpPromise) {
    warmUpPromise = (async () => {
      await primeVoices();
      await primeEngine();
      warm = true;
    })().catch((error) => {
      console.log('[Voice] warm up failed', error);
      warm = true; // Speak with the defaults rather than block the lesson.
    });
  }
  return warmUpPromise;
}

/** Whether the engine is already warm (lets a screen skip its loader). */
export function isVoiceWarm() {
  return warm;
}

/**
 * Word index covering `charIndex` in `text`.
 *
 * Turns expo-speech's character offsets into the index the screen renders with,
 * so the highlight always lands on a real word boundary even when the engine
 * reports an offset mid-word.
 */
export function wordIndexFromCharIndex(text, charIndex) {
  const source = String(text ?? '');
  const target = Math.max(0, Math.min(source.length, Number(charIndex) || 0));

  let index = 0;

  for (let position = 0; position < source.length; position += 1) {
    if (/\s/.test(source[position])) continue;
    if (position === target) return index;
    index += 1;
  }

  return Math.max(0, index);
}
let current = null;
let pending = [];

/**
 * Resolve `job` if it is still the one playing, then move the queue along.
 *
 * Bound to its own job: when a line is cut short, the engine reports
 * onStopped for it a moment later, by which time the next line may already be
 * playing. Checking the job keeps that late callback from ending the new line.
 */
function settleJob(job) {
  if (!current || current !== job) return;

  const { resolve, timer } = current;
  current = null;

  if (timer) clearTimeout(timer);
  resolve();

  if (pending.length) {
    setTimeout(pump, INTER_UTTERANCE_GAP_MS);
  }
}

function estimateDuration(text, rate) {
  const length = String(text ?? '').length;
  const scaled = (UTTERANCE_BASE_MS + length * UTTERANCE_MS_PER_CHAR) / (rate || 1);
  return Math.min(UTTERANCE_MAX_MS, scaled);
}

/** Start the next queued utterance, if the engine is free. */
function pump() {
  if (current || pending.length === 0) return;

  const job = pending.shift();
  current = job;

  const settle = () => settleJob(job);
  const timer = setTimeout(settle, estimateDuration(job.text, job.rate));
  current.timer = timer;

  const handleBoundary = (event) => {
    if (!job.onWord) return;

    const index = wordIndexFromCharIndex(job.text, event?.charIndex);
    try {
      job.onWord(index);
    } catch (error) {
      console.log('[Voice] word highlight callback failed', error);
    }
  };

  try {
    Speech.speak(job.text, {
      language: job.language,
      voice: job.voice ?? undefined,
      pitch: job.pitch,
      rate: job.rate,
      onBoundary: job.onWord ? handleBoundary : undefined,
      onDone: settle,
      onStopped: settle,
      onError: (error) => {
        console.log('[Voice] utterance failed', error);
        settle();
      },
    });

    job.onStart?.();
  } catch (error) {
    console.log('[Voice] could not speak text', error);
    settle();
  }
}

/** Silence the line that is playing right now and drop the queue. */
function cutCurrent() {
  pending = [];

  if (current) {
    const job = current;
    current = null;
    if (job.timer) clearTimeout(job.timer);
    job.resolve();
  }

  try {
    Speech.stop();
  } catch {
    // Stopping an idle engine is fine.
  }
}

/**
 * Speak `text`, queued behind anything already playing.
 *
 * Options:
 *   language  'fr-FR' (default) or 'en-US'
 *   rate      SPEECH_RATES value; defaults to normal
 *   pitch     defaults to NATURAL_PITCH
 *   onWord    called with a word index as the engine reads along
 *   onStart   called once the engine accepts the line
 *   interrupt drop anything still queued (used when the learner skips ahead)
 *   cutIn     stop whatever is playing and start this line right now (used for
 *             taps: Listen / replay / a new card), so the learner never waits
 *             behind an older line. Tapping the line that is playing restarts
 *             it from the beginning.
 *   dedupe    ignore the call when this exact text is already playing (default
 *             true, so hammering Listen does not build a backlog). Ignored with
 *             cutIn.
 *
 * Always resolves, never rejects: the screen must keep moving even on a device
 * with no usable voice.
 */
export function speak(text, options = {}) {
  const content = String(text ?? '').trim();

  if (!content) return Promise.resolve();

  if (options.cutIn) {
    cutCurrent();
  } else {
    if (options.interrupt) pending = [];

    // Re-tapping Listen on the same line should not queue a copy.
    const alreadyPlaying =
      current?.text === content || pending.some((job) => job.text === content);

    if (alreadyPlaying && options.dedupe !== false) {
      return current ? current.promise : Promise.resolve();
    }
  }

  const language = options.language ?? FRENCH_LOCALE;
  const rate = options.rate ?? SPEECH_RATES.normal;

  // Resolves when this line finishes, is cut off, or overruns its backstop.
  let resolveJob;
  const promise = new Promise((inner) => {
    resolveJob = inner;
  });

  pending.push({
    text: content,
    language,
    voice:
      options.voice ??
      (language.startsWith('fr') ? frenchVoiceId.current : englishVoiceId.current),
    rate,
    pitch: options.pitch ?? NATURAL_PITCH,
    onWord: options.onWord ?? null,
    onStart: options.onStart ?? null,
    resolve: resolveJob,
    promise,
  });

  pump();

  return promise;
}

/**
 * Speak a short sequence back to back, in order, without gaps of dead air.
 *
 * `steps` is `[{ text, language?, rate? }]`. Blank lines are skipped, so a
 * missing translation cannot stall the run.
 */
export async function speakSequence(steps = []) {
  for (const step of steps) {
    const text = String(step?.text ?? '').trim();
    if (!text) continue;

    await speak(text, {
      language: step.language,
      rate: step.rate,
      pitch: step.pitch,
      dedupe: false,
      interrupt: step.interrupt ?? false,
    });
  }
}

/**
 * Stop the current line and clear anything queued.
 *
 * Used on navigation only -- interrupting mid-word is what sounds rough, so
 * normal progress through a card lets the queue finish on its own.
 */
export function stopAll() {
  cutCurrent();
}

/** Whether anything is speaking or waiting to speak. Useful for UI states. */
export function isSpeaking() {
  return current !== null || pending.length > 0;
}