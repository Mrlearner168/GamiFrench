/**
 * Pronunciation scoring for the sub-lesson speaking check.
 *
 * The learner's speech is transcribed by the system recognizer (fr-FR) and
 * compared against the target phrase with a deterministic, symmetric text
 * comparison -- no opaque model, so the number shown is reproducible:
 *
 *   wordAccuracy = order-aware alignment of heard words onto target words,
 *                  each pair credited by its spelling similarity, divided by
 *                  the target length plus half a point per extra word heard
 *   charAccuracy = 1 - charLevenshtein(target, heard) / max(len(target), len(heard))
 *   score        = round(100 * (0.85 * wordAccuracy + 0.15 * charAccuracy))
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

/*
 * Words dominate: whole-sentence character similarity is lenient (one wrong
 * word in a short sentence still shares most letters), so it only nudges.
 */
const WORD_WEIGHT = 0.85;
const CHAR_WEIGHT = 0.15;

/*
 * Per-word credit. Two words whose spelling similarity is at or below
 * WORD_FLOOR are treated as different words ("bonjour"/"bonsoir" = 0.71 ->
 * 0.43 credit, "sous"/"sur" -> 0); above it credit rises linearly to 1.
 */
const WORD_FLOOR = 0.5;

/** Each heard word that matches nothing costs half a target word. */
const EXTRA_WORD_PENALTY = 0.5;

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

const UNITS = [
  'zero', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix sept', 'dix huit', 'dix neuf',
];

const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** 0-99 in French words (hyphens written as spaces, as tokenize() does). */
function belowHundred(value) {
  if (value < 20) return UNITS[value];

  const tens = Math.floor(value / 10);
  const units = value % 10;

  // 70-79 = soixante + 10..19, 90-99 = quatre-vingt + 10..19.
  if (tens === 7) {
    return units === 1 ? 'soixante et onze' : `soixante ${UNITS[10 + units]}`;
  }
  if (tens === 9) return `quatre vingt ${UNITS[10 + units]}`;
  if (tens === 8) return units === 0 ? 'quatre vingts' : `quatre vingt ${UNITS[units]}`;

  if (units === 0) return TENS[tens];
  if (units === 1) return `${TENS[tens]} et un`;
  return `${TENS[tens]} ${UNITS[units]}`;
}

/** Written form of 0-999 in French, enough for every number a lesson card shows. */
export function numberToFrenchWords(value) {
  if (!Number.isInteger(value) || value < 0 || value > 999) return null;

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  if (!hundreds) return belowHundred(remainder);

  // "deux cents" takes an "s" only when nothing follows it.
  const head = hundreds === 1 ? 'cent' : `${UNITS[hundreds]} cent${remainder === 0 ? 's' : ''}`;
  return remainder === 0 ? head : `${head} ${belowHundred(remainder)}`;
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
    .replace(/\bqu'/g, 'que ')
    .replace(/\b([cdjlmnst])'(?=[a-z])/g, '$1e ')
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

  // Only fold a silent ending off words long enough to keep a stem, so the
  // one-letter forms "d"/"t" never collapse to "" and match each other.
  // (No nasal folding: "comment" /kɔmɑ̃/ and "comme" /kɔm/ sound different.)
  const trimSilent = (word) => (word.length >= 3 ? word.replace(/[sxdt]$/, '') : word);
  if (trimSilent(targetWord) === trimSilent(heardWord)) return 0.95;

  return similarity(
    [...trimSilent(targetWord)],
    [...trimSilent(heardWord)]
  );
}

/** Credit 0..1 for one aligned pair; 0 at or below WORD_FLOOR similarity. */
function wordCredit(targetWord, heardWord) {
  const value = wordSimilarity(targetWord, heardWord);
  if (value >= 1) return 1;
  return Math.max(0, (value - WORD_FLOOR) / (1 - WORD_FLOOR));
}

/**
 * Order-aware alignment of heard words onto target words.
 *
 * A weighted longest-common-subsequence: each target word pairs with at most
 * one heard word, pairs keep the sentence order, and each pair earns its
 * `wordCredit`. The right words in a scrambled order, or a different word
 * that merely shares letters, no longer pass, while one slightly mis-heard
 * word still only costs a little.
 */
function matchWords(targetTokens, heardTokens) {
  const rows = targetTokens.length;
  const cols = heardTokens.length;
  const credit = targetTokens.map((t) => heardTokens.map((h) => wordCredit(t, h)));

  const best = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  for (let i = 1; i <= rows; i += 1) {
    for (let j = 1; j <= cols; j += 1) {
      best[i][j] = Math.max(
        best[i - 1][j],
        best[i][j - 1],
        best[i - 1][j - 1] + credit[i - 1][j - 1]
      );
    }
  }

  // Walk back to recover which heard word each target word took.
  const pairedWith = new Array(rows).fill(null);
  const usedHeard = new Array(cols).fill(false);
  let i = rows;
  let j = cols;
  while (i > 0 && j > 0) {
    const pairValue = credit[i - 1][j - 1];
    if (pairValue > 0 && best[i][j] === best[i - 1][j - 1] + pairValue) {
      pairedWith[i - 1] = j - 1;
      usedHeard[j - 1] = true;
      i -= 1;
      j -= 1;
    } else if (best[i][j] === best[i - 1][j]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  const matched = [];
  const missed = [];
  const pairs = targetTokens.map((targetWord, index) => {
    const heardIndex = pairedWith[index];
    if (heardIndex === null) {
      missed.push(targetWord);
      return { targetWord, heardWord: null, similarity: 0 };
    }
    matched.push(targetWord);
    return {
      targetWord,
      heardWord: heardTokens[heardIndex],
      similarity: credit[index][heardIndex],
    };
  });

  const extra = heardTokens.filter((_, index) => !usedHeard[index]);

  return { matched, missed, extra, pairs, total: best[rows][cols] };
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
   * Word accuracy is the in-order alignment credit over the target length,
   * with extra heard words counted against it: one slightly mis-heard word
   * costs a little, while scrambling the order or padding the answer with
   * unrelated words does not pass.
   */
  const wordAccuracy = targetTokens.length
    ? words.total / (targetTokens.length + EXTRA_WORD_PENALTY * words.extra.length)
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
