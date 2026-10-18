/** Pure state helpers for the nine full-screen colour fields. */

export const TEST_COLORS = ['white', 'black', 'red', 'green', 'blue', 'gray', 'cyan', 'magenta', 'yellow'] as const;
export type TestColor = (typeof TEST_COLORS)[number];

export const AUTO_CYCLE_INTERVALS = [2, 3, 5, 10] as const;
export type AutoCycleInterval = (typeof AUTO_CYCLE_INTERVALS)[number];

export function isTestColor(value: unknown): value is TestColor {
  return typeof value === 'string' && TEST_COLORS.includes(value as TestColor);
}

export function colorIndex(color: TestColor): number {
  return TEST_COLORS.indexOf(color);
}

/** Moves through the palette in either direction, wrapping at both ends. */
export function moveColor(color: TestColor, direction: 1 | -1): TestColor {
  const length = TEST_COLORS.length;
  return TEST_COLORS[(colorIndex(color) + direction + length) % length];
}

/** Accept only selectable integer dwell times; malformed stored data gets the safe default. */
export function toAutoCycleInterval(value: unknown, fallback: AutoCycleInterval = 3): AutoCycleInterval {
  return typeof value === 'number' && AUTO_CYCLE_INTERVALS.includes(value as AutoCycleInterval)
    ? (value as AutoCycleInterval)
    : fallback;
}

/** Human-readable position for the visual field and assistive announcement. */
export function colorPosition(color: TestColor): { current: number; total: number } {
  return { current: colorIndex(color) + 1, total: TEST_COLORS.length };
}
