import { describe, expect, it } from 'vitest';
import { AUTO_CYCLE_INTERVALS, colorPosition, isTestColor, moveColor, TEST_COLORS, toAutoCycleInterval } from './logic';

describe('dead-pixel-test', () => {
  it('keeps the complete nine-colour diagnostic order', () => {
    expect(TEST_COLORS).toEqual(['white', 'black', 'red', 'green', 'blue', 'gray', 'cyan', 'magenta', 'yellow']);
    expect(colorPosition('white')).toEqual({ current: 1, total: 9 });
    expect(colorPosition('yellow')).toEqual({ current: 9, total: 9 });
  });

  it('moves forward and backward across both palette boundaries', () => {
    expect(moveColor('white', -1)).toBe('yellow');
    expect(moveColor('yellow', 1)).toBe('white');
    expect(moveColor('green', 1)).toBe('blue');
    expect(moveColor('green', -1)).toBe('red');
  });

  it('accepts only known colour identifiers, including rejecting Unicode and emoji input', () => {
    expect(isTestColor('cyan')).toBe(true);
    expect(isTestColor('')).toBe(false);
    expect(isTestColor('white ')).toBe(false);
    expect(isTestColor('흰색')).toBe(false);
    expect(isTestColor('🟨')).toBe(false);
    expect(isTestColor(null)).toBe(false);
  });

  it('keeps stored auto-cycle timing within its selectable boundaries', () => {
    expect(AUTO_CYCLE_INTERVALS).toEqual([2, 3, 5, 10]);
    expect(toAutoCycleInterval(2)).toBe(2);
    expect(toAutoCycleInterval(10)).toBe(10);
    expect(toAutoCycleInterval(0)).toBe(3);
    expect(toAutoCycleInterval(2.5)).toBe(3);
    expect(toAutoCycleInterval(Number.POSITIVE_INFINITY)).toBe(3);
    expect(toAutoCycleInterval('5')).toBe(3);
    expect(toAutoCycleInterval('3초')).toBe(3);
  });

  it('uses an explicitly supplied valid fallback for malformed values', () => {
    expect(toAutoCycleInterval(undefined, 5)).toBe(5);
  });
});
