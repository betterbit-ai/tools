import { describe, expect, it } from 'vitest';
import {
  accuracy,
  buildSample,
  countStrokes,
  diff,
  englishTier,
  koreanTier,
  sampleWordCount,
  score,
  strokesForChar,
  strokesPerMinute,
  wordsPerMinute,
} from './logic';

describe('diff', () => {
  it('marks untyped characters as pending', () => {
    expect(diff('cat', '')).toEqual([
      { expected: 'c', status: 'pending' },
      { expected: 'a', status: 'pending' },
      { expected: 't', status: 'pending' },
    ]);
  });

  it('marks matching and mismatching characters', () => {
    expect(diff('cat', 'cop')).toEqual([
      { expected: 'c', status: 'correct' },
      { expected: 'a', status: 'incorrect' },
      { expected: 't', status: 'incorrect' },
    ]);
  });

  it('marks characters typed past the end of the target as extra', () => {
    const result = diff('hi', 'hi!');
    expect(result[2]).toEqual({ expected: '', status: 'extra' });
  });

  it('handles an empty target', () => {
    expect(diff('', '')).toEqual([]);
  });
});

describe('strokesForChar (2-벌식 keystroke count)', () => {
  it('counts a syllable with no final consonant as 초성+중성', () => {
    expect(strokesForChar('가')).toBe(2); // ㄱ + ㅏ
  });

  it('counts a syllable with a simple final consonant as +1', () => {
    expect(strokesForChar('각')).toBe(3); // ㄱ + ㅏ + ㄱ
  });

  it('counts a compound vowel (복합모음) as 2 strokes', () => {
    expect(strokesForChar('왜')).toBe(3); // ㅇ + (ㅗ+ㅐ)
  });

  it('counts a compound final consonant (겹받침) as 2 strokes', () => {
    expect(strokesForChar('닭')).toBe(4); // ㄷ + ㅏ + (ㄹ+ㄱ)
  });

  it('counts a tense (쌍자음) initial as a single stroke, per the current convention', () => {
    expect(strokesForChar('짱')).toBe(3); // ㅉ + ㅏ + ㅇ
  });

  it('counts any non-Hangul character as a single keystroke', () => {
    expect(strokesForChar(' ')).toBe(1);
    expect(strokesForChar('a')).toBe(1);
    expect(strokesForChar('!')).toBe(1);
    expect(strokesForChar('7')).toBe(1);
  });
});

describe('countStrokes', () => {
  it('sums strokes across a sentence, including spaces', () => {
    expect(countStrokes('가 각')).toBe(2 + 1 + 3);
  });

  it('returns 0 for an empty string', () => {
    expect(countStrokes('')).toBe(0);
  });
});

describe('wordsPerMinute / strokesPerMinute', () => {
  it('computes WPM using the 5-characters-per-word convention', () => {
    // 50 correct characters in 30s = 10 words in 0.5 min = 20 WPM.
    expect(wordsPerMinute(50, 30_000)).toBe(20);
  });

  it('computes CPM from strokes and elapsed time', () => {
    expect(strokesPerMinute(300, 60_000)).toBe(300);
    expect(strokesPerMinute(150, 30_000)).toBe(300);
  });

  it('returns 0 when no time has elapsed', () => {
    expect(wordsPerMinute(50, 0)).toBe(0);
    expect(strokesPerMinute(50, 0)).toBe(0);
  });
});

describe('accuracy', () => {
  it('computes a percentage with one decimal', () => {
    expect(accuracy(9, 10)).toBe(90);
    expect(accuracy(2, 3)).toBe(66.7);
  });

  it('defaults to 100 when nothing was typed', () => {
    expect(accuracy(0, 0)).toBe(100);
  });
});

describe('score', () => {
  it('scores perfect English typing', () => {
    const s = score('en', 'the cat sat', 'the cat sat', 60_000);
    expect(s.correctChars).toBe(11);
    expect(s.incorrectChars).toBe(0);
    expect(s.accuracy).toBe(100);
    expect(s.speed).toBe(wordsPerMinute(11, 60_000));
  });

  it('counts mistakes against accuracy but not against speed', () => {
    const s = score('en', 'the cat sat', 'the cot sat', 60_000);
    expect(s.incorrectChars).toBe(1);
    expect(s.correctChars).toBe(10);
    expect(s.accuracy).toBeCloseTo((10 / 11) * 100, 1);
  });

  it('scores Korean typing using jamo-level strokes', () => {
    const s = score('ko', '가 각', '가 각', 60_000);
    expect(s.correctChars).toBe(3);
    expect(s.speed).toBe(countStrokes('가 각'));
  });

  it('ignores untyped (pending) characters', () => {
    const s = score('en', 'hello world', 'hello', 10_000);
    expect(s.typedChars).toBe(5);
    expect(s.correctChars).toBe(5);
  });
});

describe('buildSample', () => {
  it('builds the requested number of space-separated words', () => {
    const sample = buildSample('en', 5, () => 0);
    expect(sample.split(' ')).toHaveLength(5);
  });

  it('returns an empty string for zero words', () => {
    expect(buildSample('en', 0)).toBe('');
  });

  it('is deterministic for a fixed rng', () => {
    const a = buildSample('ko', 10, () => 0.5);
    const b = buildSample('ko', 10, () => 0.5);
    expect(a).toBe(b);
  });
});

describe('sampleWordCount', () => {
  it('grows with duration and stays generous for fast typists', () => {
    expect(sampleWordCount(15)).toBeGreaterThan(0);
    expect(sampleWordCount(60)).toBeGreaterThan(sampleWordCount(15));
  });
});

describe('tiers', () => {
  it('buckets English WPM', () => {
    expect(englishTier(20)).toBe('beginner');
    expect(englishTier(40)).toBe('average');
    expect(englishTier(60)).toBe('good');
    expect(englishTier(100)).toBe('fast');
  });

  it('buckets Korean CPM', () => {
    expect(koreanTier(100)).toBe('beginner');
    expect(koreanTier(250)).toBe('average');
    expect(koreanTier(400)).toBe('fast');
    expect(koreanTier(550)).toBe('expert');
    expect(koreanTier(700)).toBe('master');
  });
});
