/**
 * Star bands and XP must match the server so the reward shown offline equals
 * the reward the server stores for the same percentage.
 */
import {
  PASSING_PERCENTAGE,
  SUBLESSON_XP_PER_STAR,
  clampScore,
  isPassingScore,
  starsForScore,
  sublessonXpForScore,
} from '@/services/scoring';

describe('clampScore', () => {
  it.each([
    [-10, 0],
    [0, 0],
    [42.4, 42],
    [42.6, 43],
    [100, 100],
    [150, 100],
    ['65', 65],
    [undefined, 0],
  ])('clamps %p to %p', (input, expected) => {
    expect(clampScore(input)).toBe(expected);
  });
});

describe('starsForScore', () => {
  it.each([
    [100, 3],
    [90, 3],
    [89, 2],
    [75, 2],
    [74, 1],
    [50, 1],
    [49, 0],
    [0, 0],
  ])('maps %i%% to %i star(s)', (score, stars) => {
    expect(starsForScore(score)).toBe(stars);
  });
});

describe('sublessonXpForScore', () => {
  it('pays 10 XP per star', () => {
    expect(sublessonXpForScore(100)).toBe(3 * SUBLESSON_XP_PER_STAR);
    expect(sublessonXpForScore(75)).toBe(2 * SUBLESSON_XP_PER_STAR);
    expect(sublessonXpForScore(10)).toBe(0);
  });
});

describe('isPassingScore', () => {
  it('passes at or above the shared passing percentage', () => {
    expect(isPassingScore(PASSING_PERCENTAGE)).toBe(true);
    expect(isPassingScore(PASSING_PERCENTAGE - 1)).toBe(false);
  });
});
