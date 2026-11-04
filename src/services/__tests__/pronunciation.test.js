/**
 * The pronunciation score must be identical online and offline, so these tests
 * lock the deterministic maths the speaking check relies on.
 */
import {
  SPEAKING_THRESHOLD,
  normalizeForScoring,
  scorePronunciation,
  tokenize,
} from '@/services/pronunciation';

describe('normalizeForScoring', () => {
  it('lowercases, folds accents and drops punctuation', () => {
    expect(normalizeForScoring('Ça va, très bien!')).toBe('ca va tres bien');
  });

  it('collapses repeated whitespace', () => {
    expect(normalizeForScoring('  Bonjour   le   monde  ')).toBe('bonjour le monde');
  });
});

describe('tokenize', () => {
  it('splits a phrase into normalized words', () => {
    expect(tokenize('Bonjour, le monde !')).toEqual(['bonjour', 'le', 'monde']);
  });

  it('returns an empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('scorePronunciation', () => {
  it('gives 100 for an exact match', () => {
    const result = scorePronunciation('Bonjour', 'Bonjour');
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('ignores accents and case', () => {
    expect(scorePronunciation('Ça va', 'ca va').score).toBe(100);
  });

  it('scores 0 when nothing was heard', () => {
    const result = scorePronunciation('Bonjour', '');
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('partially credits a missing word', () => {
    const result = scorePronunciation('Comment allez-vous', 'comment allez');
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  it('uses the shared threshold to decide passing', () => {
    const result = scorePronunciation('Merci beaucoup', 'merci beaucoup');
    expect(result.passed).toBe(result.score >= SPEAKING_THRESHOLD);
  });

  it('reports the matched and missed words for the UI chips', () => {
    const result = scorePronunciation('un deux trois', 'un trois');
    expect(result.matchedWords).toEqual(expect.arrayContaining(['un', 'trois']));
    expect(result.missedWords).toEqual(['deux']);
  });

  it('scores single-word Learn Try targets (e.g. example "ami")', () => {
    const exact = scorePronunciation('ami', 'ami');
    expect(exact.score).toBe(100);

    const near = scorePronunciation('ami', 'amis');
    expect(near.score).toBeGreaterThan(0);
    expect(near.score).toBeLessThan(100);
  });
});
