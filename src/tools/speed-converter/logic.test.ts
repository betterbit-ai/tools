import { describe, expect, it } from 'vitest';
import {
  MAX_SPEED,
  SPEED_UNITS,
  convertSpeed,
  formatPace,
  isSpeedUnit,
  isSpeedInRange,
  isValidPace,
  paceSecondsFromSpeed,
  parseSpeedNumber,
  quickTable,
  speedFromPace,
  usesScientificNotation,
} from './logic';

describe('convertSpeed', () => {
  it('uses the exact mph and knot definitions', () => {
    expect(convertSpeed(1, 'mph', 'kmh')).toBeCloseTo(1.609344, 12);
    expect(convertSpeed(60, 'mph', 'kmh')).toBeCloseTo(96.56064, 12);
    expect(convertSpeed(1, 'knot', 'kmh')).toBeCloseTo(1.852, 12);
  });

  it('converts metres per second and round-trips every unit', () => {
    expect(convertSpeed(20, 'ms', 'kmh')).toBeCloseTo(72, 12);
    for (const from of SPEED_UNITS) {
      for (const to of SPEED_UNITS) {
        expect(convertSpeed(convertSpeed(123.456, from, to), to, from)).toBeCloseTo(123.456, 8);
      }
    }
  });

  it('keeps zero but rejects negative, non-finite, and oversized values', () => {
    expect(convertSpeed(0, 'kmh', 'mph')).toBe(0);
    expect(convertSpeed(-1, 'kmh', 'mph')).toBe(0);
    expect(convertSpeed(NaN, 'kmh', 'mph')).toBe(0);
    expect(convertSpeed(Infinity, 'kmh', 'mph')).toBe(0);
    expect(convertSpeed(MAX_SPEED + 1, 'kmh', 'mph')).toBe(0);
  });
});

describe('pace conversion', () => {
  it('converts a 5:00 min/km running pace to 12 km/h and 8:03 min/mi', () => {
    const speed = speedFromPace(5, 0, 'km');
    expect(convertSpeed(speed, 'ms', 'kmh')).toBeCloseTo(12, 12);
    expect(formatPace(paceSecondsFromSpeed(speed, 'ms', 'mi'))).toBe('8:03');
  });

  it('converts a 10:00 min/mi pace to km/h and min/km', () => {
    const speed = speedFromPace(10, 0, 'mi');
    expect(convertSpeed(speed, 'ms', 'kmh')).toBeCloseTo(9.656064, 12);
    expect(formatPace(paceSecondsFromSpeed(speed, 'ms', 'km'))).toBe('6:13');
  });

  it('rejects impossible pace fields and treats stopped speed as no pace', () => {
    expect(speedFromPace(0, 0, 'km')).toBe(0);
    expect(speedFromPace(4, 60, 'km')).toBe(0);
    expect(speedFromPace(-1, 30, 'mi')).toBe(0);
    expect(paceSecondsFromSpeed(0, 'kmh', 'km')).toBeNull();
    expect(formatPace(null)).toBe('—');
  });

  it('validates every pace field and rejects totals that overflow', () => {
    expect(isValidPace(5, 0)).toBe(true);
    expect(isValidPace(0, 1)).toBe(true);
    expect(isValidPace(0, 0)).toBe(false);
    expect(isValidPace(4.5, 0)).toBe(false);
    expect(isValidPace(4, 60)).toBe(false);
    expect(isValidPace(1e308, 0)).toBe(false);
    expect(speedFromPace(1e308, 0, 'km')).toBe(0);
  });

  it('rounds pace seconds and carries to the next minute', () => {
    expect(formatPace(299.5)).toBe('5:00');
    expect(formatPace(59.4)).toBe('0:59');
  });
});

describe('input and reference helpers', () => {
  it('normalizes valid grouped and full-width Korean keyboard digits', () => {
    expect(parseSpeedNumber('１２，３４５．６')).toBe(12345.6);
    expect(parseSpeedNumber('1,234.5')).toBe(1234.5);
    expect(parseSpeedNumber(' 60 ')).toBe(60);
    expect(parseSpeedNumber('.5')).toBe(0.5);
    expect(parseSpeedNumber('1e3')).toBe(1000);
  });

  it('distinguishes empty input from malformed and non-finite input', () => {
    expect(parseSpeedNumber('')).toBe('');
    expect(parseSpeedNumber('   ')).toBe('');
    expect(parseSpeedNumber('60 mph')).toBeNull();
    expect(parseSpeedNumber('시속 60')).toBeNull();
    expect(parseSpeedNumber('12,34')).toBeNull();
    expect(parseSpeedNumber('1e309')).toBeNull();
    expect(parseSpeedNumber('😀')).toBeNull();
  });

  it('checks the documented speed range separately from number syntax', () => {
    expect(isSpeedInRange(0)).toBe(true);
    expect(isSpeedInRange(MAX_SPEED)).toBe(true);
    expect(isSpeedInRange(-1)).toBe(false);
    expect(isSpeedInRange(MAX_SPEED + 1)).toBe(false);
    expect(isSpeedInRange(Infinity)).toBe(false);
  });

  it('uses scientific notation before a nonzero result would display as zero', () => {
    expect(usesScientificNotation(1e-7)).toBe(true);
    expect(usesScientificNotation(-1e-7)).toBe(true);
    expect(usesScientificNotation(1e-6)).toBe(false);
    expect(usesScientificNotation(1e12)).toBe(false);
    expect(usesScientificNotation(0)).toBe(false);
  });

  it('recognizes only its units and builds a table from every source unit', () => {
    expect(isSpeedUnit('mph')).toBe(true);
    expect(isSpeedUnit('mach')).toBe(false);
    expect(isSpeedUnit('')).toBe(false);
    for (const unit of SPEED_UNITS) {
      const rows = quickTable(unit, 'kmh');
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]?.result).toBeCloseTo(convertSpeed(rows[0]!.value, unit, 'kmh'), 12);
    }
  });
});
