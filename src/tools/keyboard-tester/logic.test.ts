import { describe, expect, it } from 'vitest';
import {
  ALL_CODES,
  ARROW_CODES,
  classifyRollover,
  coveragePercent,
  detectChatter,
  formatHeldSeconds,
  isLikelyStuck,
  keyLabel,
  MAIN_ROWS,
  modifierLabel,
} from './logic';

describe('MAIN_ROWS / ALL_CODES', () => {
  it('has no duplicate codes across the whole board', () => {
    const codes = ALL_CODES;
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('includes the arrow cluster', () => {
    for (const code of ARROW_CODES) expect(ALL_CODES).toContain(code);
  });

  it('every row sums to a plausible keyboard width', () => {
    for (const r of MAIN_ROWS) {
      const width = r.reduce((sum, k) => sum + k.weight, 0);
      expect(width).toBeGreaterThan(10);
      expect(width).toBeLessThan(20);
    }
  });
});

describe('keyLabel', () => {
  it('shows the English letter for the en layout', () => {
    expect(keyLabel('en', 'KeyA')).toBe('A');
    expect(keyLabel('en', 'KeyQ')).toBe('Q');
  });

  it('shows the 2-set Hangul jamo for the ko layout', () => {
    expect(keyLabel('ko', 'KeyR')).toBe('ㄱ');
    expect(keyLabel('ko', 'KeyF')).toBe('ㄹ');
  });

  it('falls back to the shared English label for non-letter keys in ko', () => {
    expect(keyLabel('ko', 'Space')).toBe('Space');
    expect(keyLabel('ko', 'Digit1')).toBe('1');
  });

  it('falls back to the raw code for anything unmapped', () => {
    expect(keyLabel('en', 'NumpadEnter')).toBe('NumpadEnter');
  });

  it('labels every function key and digit', () => {
    expect(keyLabel('en', 'F1')).toBe('F1');
    expect(keyLabel('en', 'F12')).toBe('F12');
    expect(keyLabel('en', 'Digit0')).toBe('0');
  });
});

describe('modifierLabel', () => {
  it('returns null on non-mac platforms (keep Win/Ctrl/Alt from keyLabel)', () => {
    expect(modifierLabel('MetaLeft', false)).toBeNull();
    expect(modifierLabel('AltLeft', false)).toBeNull();
  });

  it('swaps in Mac glyphs for Meta/Alt/Control', () => {
    expect(modifierLabel('MetaLeft', true)).toBe('⌘');
    expect(modifierLabel('MetaRight', true)).toBe('⌘');
    expect(modifierLabel('AltLeft', true)).toBe('⌥');
    expect(modifierLabel('ControlRight', true)).toBe('⌃');
  });

  it('does not relabel ordinary keys on Mac', () => {
    expect(modifierLabel('KeyA', true)).toBeNull();
    expect(modifierLabel('Space', true)).toBeNull();
  });
});

describe('classifyRollover', () => {
  it('boundaries: 0 and 1 are single-key, 2 and 9 are partial, 10+ is full', () => {
    expect(classifyRollover(0)).toBe('single');
    expect(classifyRollover(1)).toBe('single');
    expect(classifyRollover(2)).toBe('partial');
    expect(classifyRollover(9)).toBe('partial');
    expect(classifyRollover(10)).toBe('full');
    expect(classifyRollover(20)).toBe('full');
  });

  it('does not call the common 6KRO ceiling "full" (6 keys alone does not prove NKRO)', () => {
    expect(classifyRollover(6)).toBe('partial');
  });
});

describe('detectChatter', () => {
  it('flags a second keydown on the same code arriving well inside the window', () => {
    const codes = detectChatter([
      { code: 'KeyA', type: 'down', t: 0 },
      { code: 'KeyA', type: 'up', t: 20 },
      { code: 'KeyA', type: 'down', t: 30 },
      { code: 'KeyA', type: 'up', t: 50 },
    ]);
    expect(codes).toEqual(['KeyA']);
  });

  it('does not flag a deliberate retap well outside the window', () => {
    const codes = detectChatter([
      { code: 'KeyA', type: 'down', t: 0 },
      { code: 'KeyA', type: 'up', t: 20 },
      { code: 'KeyA', type: 'down', t: 500 },
    ]);
    expect(codes).toEqual([]);
  });

  it('boundary: exactly windowMs apart is not chatter, one tick under is', () => {
    const windowMs = 60;
    expect(
      detectChatter(
        [
          { code: 'KeyA', type: 'down', t: 0 },
          { code: 'KeyA', type: 'down', t: windowMs },
        ],
        windowMs,
      ),
    ).toEqual([]);
    expect(
      detectChatter(
        [
          { code: 'KeyA', type: 'down', t: 0 },
          { code: 'KeyA', type: 'down', t: windowMs - 1 },
        ],
        windowMs,
      ),
    ).toEqual(['KeyA']);
  });

  it('keeps unrelated codes out of the result and does not cross-contaminate', () => {
    const codes = detectChatter([
      { code: 'KeyA', type: 'down', t: 0 },
      { code: 'KeyB', type: 'down', t: 5 },
      { code: 'KeyA', type: 'down', t: 1000 },
    ]);
    expect(codes).toEqual([]);
  });

  it('returns an empty list for an empty log', () => {
    expect(detectChatter([])).toEqual([]);
  });
});

describe('isLikelyStuck', () => {
  it('boundary: just under the threshold is not stuck, at the threshold it is', () => {
    expect(isLikelyStuck(4999, 5000)).toBe(false);
    expect(isLikelyStuck(5000, 5000)).toBe(true);
  });

  it('uses a 5s default threshold', () => {
    expect(isLikelyStuck(4000)).toBe(false);
    expect(isLikelyStuck(6000)).toBe(true);
  });
});

describe('formatHeldSeconds', () => {
  it('formats to one decimal place', () => {
    expect(formatHeldSeconds(0)).toBe('0.0s');
    expect(formatHeldSeconds(1234)).toBe('1.2s');
    expect(formatHeldSeconds(5000)).toBe('5.0s');
  });

  it('never goes negative', () => {
    expect(formatHeldSeconds(-500)).toBe('0.0s');
  });
});

describe('coveragePercent', () => {
  it('handles the empty board without dividing by zero', () => {
    expect(coveragePercent(0, 0)).toBe(0);
  });

  it('rounds to the nearest percent', () => {
    expect(coveragePercent(1, 3)).toBe(33);
    expect(coveragePercent(2, 3)).toBe(67);
  });

  it('caps at 100% even if more codes were seen than exist (defensive)', () => {
    expect(coveragePercent(999, 61)).toBe(100);
  });

  it('0 tested is 0%, full count is 100%', () => {
    expect(coveragePercent(0, 61)).toBe(0);
    expect(coveragePercent(61, 61)).toBe(100);
  });
});
