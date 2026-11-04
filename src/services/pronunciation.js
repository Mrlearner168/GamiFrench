/**
 * Pronunciation scoring for the sub-lesson speaking check.
 *
 * The learner's speech is transcribed by the system recognizer (fr-FR) and
 * compared against the target phrase with a deterministic, symmetric text
 * comparison -- no opaque model, so the number shown is reproducible:
 *
 *   wordAccuracy = 1 - wordLevenshtein(target, heard) / max(len(target), len(heard))
 *   charAccuracy = 1 - charLevenshtein(target, heard) / max(len(target), len(heard))
 *   score        = round(100 * (0.7 * wordAccuracy + 0.3 * charAccuracy))
 *
 * Both texts are normalized first (lowercased, French accents folded,
 * punctuation dropped) so "Ça va" and "ca va" compare equal. Word accuracy
 * dominates because getting the words right matters more than exact spelling,
 * while character accuracy rewards close mispronunciations the recognizer
 * still rendered nearly right.
 *
 * The recognizer confidence (0..1, or -1 when unavailable) is reported
 * separately as metadata and never mutates the score.
 */

/** Minimum score (0-100) required to finish the speaking check. */
export const SPEAKING_THRESHOLD = 70;

/*
 * Topic-level blend of quiz accuracy and pronunciation accuracy. These MUST
 * match QUIZ_WEIGHT / SPEAKING_WEIGHT in Backend/services/topic_result_service.py
 * so the number the app displays always equals the number the server stores.
 */
export const QUIZ_WEIGHT = 0.6;
export const SPEAKING_WEIGHT = 0.4;

const WORD_WEIGHT = 0.7;
const CHAR_WEIGHT = 0.3;

/** Lowercase, fold accents, drop punctuation, collapse whitespace. */
export function normalizeForScoring(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // The French ligatures do not decompose under NFD, so fold them by hand.
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalized word tokens of a phrase. */
export function tokenize(text) {
  const normalized = normalizeForScoring(text);
  return normalized ? normalized.split(' ') : [];
}

/** Levenshtein edit distance over any two arrays compared by equality. */
function editDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitution
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** 0..1 similarity of two token/char arrays (1 = identical). */
function similarity(a, b) {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - editDistance(a, b) / longest;
}

/*
 * FRENCH EQUIVALENCES
 *
 * A French speaker is not wrong for saying "je ai" instead of "j'ai", or for
 * answering "cinq" when the card shows "5". The recognizer faithfully returns
 * what was said, so without these rules the local score punishes correct
 * French. Handling them here -- in the deterministic scorer -- is what makes
 * the offline number agree with the online LLM-refined one instead of
 * collapsing to a near-zero purely because nobody has signal.
 */

/** Digits, including French thousands separator, to their written words. */
const DIGIT_WORDS = [
  'zero',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
];

/**
 * Written form of 0-999 in French, enough for every number a lesson card shows.
 * Handles the "quatre-vingt-dix" style where it is cheap and falls back to the
 * plain concatenation otherwise, which the phonetic pass still compares fairly.
 */
function numberToFrenchWords(value) {
  if (value < 0 || value > 999) return null;

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  const parts = [];

  if (hundreds) {
    parts.push(hundreds === 1 ? 'cent' : `${DIGIT_WORDS[hundreds]} cent`);
    if (remainder === 0 && hundreds > 1) parts.push('s');
  }

  if (remainder === 0) return parts.join(' ');

  if (remainder < 20) {
    parts.push(DIGIT_WORDS[remainder]);
  } else {
    const tens = Math.floor(remainder / 10);
    const units = remainder % 10;

    const tensWord = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'][tens];
    parts.push(tensWord);
    if (units === 1) parts.push('et un');
    else if (units) parts.push(DIGIT_WORDS[units]);
  }

  return parts.join(' ').trim();
}

/**
 * Rewrite bare numbers into French words and undo the two elisions that change
 * what is actually pronounced. "J'ai" is heard as "je ai", and a trailing
 * "s"/"x"/"d" is silent, so they are folded away on both sides of the compare.
 */
export function normalizeFrenchPhrase(text) {
  const digitsExpanded = String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\b(\d{1,3})\b/g, (match, digits) =>
      numberToFrenchWords(Number(digits)) ?? match
    );

  return digitsExpanded
    // "j'ai" -> "je ai", "l'eau" -> "le eau", "qu'est" -> "que est", etc.
    .replace(/\b([cdjlmnstqu])([aeiouy])'/g, '$1e $2')
    .replace(/\bqu'/g, 'que ')
    .replace(/\bqu\(/g, 'que ')
    // "qu'est-ce que" -> "que est ce que"
    .replace(/que ce/g, 'que est ce');
}

/**
 * Compare one target word against one heard word, 0..1.
 *
 * A plain equality check is far too strict for speech: it ignores the silent
 * endings, so "amis"/"ami" and "grands"/"grand" would both score zero. Ending
 * in the canonical French silent letters is therefore free.
 */
function wordSimilarity(targetWord, heardWord) {
  if (targetWord === heardWord) return 1;
  if (!targetWord || !heardWord) return 0;

  const trimSilent = (word) => word.replace(/[sxdt]$/, '');
  if (trimSilent(targetWord) === trimSilent(heardWord)) return 0.95;

  // "comment" vs "comme": a trailing "nt"/"n" is not audible in French.
  const trimNasal = (word) => word.replace(/n[ts]?$/, '');
  if (trimNasal(targetWord) === trimNasal(heardWord) && trimNasal(targetWord).length >= 4) {
    return 0.92;
  }

  return similarity(
    [...trimSilent(targetWord)],
    [...trimSilent(heardWord)]
  );
}

/**
 * Best-match alignment of heard words onto target words.
 *
 * The previous implementation only accepted exact hits, so one slightly
 * mis-heard word in a sentence dropped the whole score. Each target word now
 * claims its closest unused heard word and earns partial credit, and any
 * residue is reported as extra words.
 */
function matchWords(targetTokens, heardTokens) {
  const remaining = heardTokens.map((word, index) => ({ word, index }));
  const matched = [];
  const missed = [];
  const pairs = [];

  targetTokens.forEach((targetWord) => {
    let best = null;
    let bestScore = 0;

    remaining.forEach((candidate) => {
      const value = wordSimilarity(targetWord, candidate.word);
      if (value > bestScore) {
        bestScore = value;
        best = candidate;
      }
    });

    // Below this the words are unrelated and counting it as "heard" would
    // inflate the score for someone who said something else entirely.
    if (best && bestScore >= 0.6) {
      remaining.splice(remaining.indexOf(best), 1);
      matched.push(targetWord);
      pairs.push({ targetWord, heardWord: best.word, similarity: bestScore });
    } else {
      missed.push(targetWord);
      pairs.push({ targetWord, heardWord: null, similarity: 0 });
    }
  });

  const extra = remaining.map((entry) => entry.word);

  return { matched, missed, extra, pairs };
}

/**
 * Grade one recognition attempt against the target phrase.
 *
 * Returns the 0-100 `score`, the intermediate `wordAccuracy` /
 * `charAccuracy` values, per-word match details for the UI, and the
 * recognizer `confidence` (null when unavailable).
 */
export function scorePronunciation(target, transcript, { confidence = null } = {}) {
  // Both sides go through the French-aware pass first, so digits, elisions and
  // the ligatures cannot cost a learner marks for saying real French.
  const targetTokens = tokenize(normalizeFrenchPhrase(target));
  const heardTokens = tokenize(normalizeFrenchPhrase(transcript));

  const words = matchWords(targetTokens, heardTokens);

  /*
   * Word accuracy is now the mean per-word similarity of the best alignment
   * rather than a raw token edit distance. That is what makes a single
   * slightly mis-heard word cost a little, instead of collapsing the whole
   * sentence the way a strict set comparison did.
   */
  const wordAccuracy = targetTokens.length
    ? words.pairs.reduce((total, pair) => total + pair.similarity, 0) / targetTokens.length
    : 0;

  const charAccuracy = similarity(
    [...normalizeForScoring(normalizeFrenchPhrase(target))],
    [...normalizeForScoring(normalizeFrenchPhrase(transcript))]
  );

  const heardAnything = heardTokens.length > 0;

  const score = heardAnything
    ? Math.max(0, Math.min(100, Math.round(100 * (WORD_WEIGHT * wordAccuracy + CHAR_WEIGHT * charAccuracy))))
    : 0;

  const safeConfidence = Number.isFinite(confidence) && confidence >= 0
    ? Math.max(0, Math.min(1, confidence))
    : null;

  return {
    score,
    wordAccuracy: Math.round(wordAccuracy * 100),
    charAccuracy: Math.round(charAccuracy * 100),
    matchedWords: words.matched,
    missedWords: words.missed,
    extraWords: words.extra,
    targetWords: targetTokens,
    /**
     * Per-word detail for the feedback chips: how closely each target word was
     * heard, and what the recognizer actually returned for it.
     */
    wordMatches: words.pairs,
    transcript: String(transcript ?? ''),
    confidence: safeConfidence,
    passed: score >= SPEAKING_THRESHOLD,
  };
}
