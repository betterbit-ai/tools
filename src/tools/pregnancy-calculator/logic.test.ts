import { describe, expect, it } from 'vitest';
import { addDays, calculatePregnancy, gestationalAgeForDays, isValidDate, normalizeDateInput } from './logic';

describe('pregnancy date validation', () => {
  it('accepts real leap dates and normalizes full-width Unicode date input', () => {
    expect(normalizeDateInput(' ２０２４－０２－２９ ')).toBe('2024-02-29');
    expect(isValidDate('２０２４－０２－２９')).toBe(true);
    expect(isValidDate('2024-02-29')).toBe(true);
  });

  it('rejects impossible, blank, emoji, and out-of-range dates', () => {
    expect(isValidDate('2025-02-29')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('2026-10-13👶')).toBe(false);
    expect(isValidDate('1899-12-31')).toBe(false);
  });
});

describe('calculatePregnancy', () => {
  const asOf = '2026-10-13';

  it('uses 280 days from LMP and adjusts the estimate by cycle length', () => {
    expect(calculatePregnancy({ method: 'lmp', date: '2026-01-01', cycleLength: 28, asOf })?.dueDate).toBe(
      '2026-10-08',
    );
    const adjusted = calculatePregnancy({ method: 'lmp', date: '2026-01-01', cycleLength: 32, asOf });
    expect(adjusted?.dueDate).toBe('2026-10-12');
    expect(adjusted?.estimatedConceptionDate).toBe('2026-01-19');
    expect(adjusted?.gestationalStartDate).toBe('2026-01-05');
  });

  it('uses 266 days from conception and the ACOG IVF transfer offsets', () => {
    expect(calculatePregnancy({ method: 'conception', date: '2026-01-15', asOf })?.dueDate).toBe('2026-10-08');
    expect(calculatePregnancy({ method: 'ivf', date: '2026-01-20', embryoAge: 3, asOf })?.dueDate).toBe('2026-10-10');
    expect(calculatePregnancy({ method: 'ivf', date: '2026-01-20', embryoAge: 5, asOf })?.dueDate).toBe('2026-10-08');
  });

  it('handles leap years, DST-safe calendar day math, and the trimester boundaries', () => {
    expect(addDays('2024-02-29', 280)).toBe('2024-12-05');
    expect(gestationalAgeForDays(97)).toMatchObject({ weeks: 13, remainingDays: 6, currentWeek: 14, trimester: 1 });
    expect(gestationalAgeForDays(98)).toMatchObject({ weeks: 14, remainingDays: 0, currentWeek: 15, trimester: 2 });
    expect(gestationalAgeForDays(196)).toMatchObject({ weeks: 28, remainingDays: 0, currentWeek: 29, trimester: 3 });
  });

  it('does not report a gestational age before a future starting date and rejects unsafe cycles', () => {
    const future = calculatePregnancy({ method: 'lmp', date: '2026-11-01', cycleLength: 28, asOf });
    expect(future?.gestationalAge).toBeNull();
    expect(calculatePregnancy({ method: 'lmp', date: '2026-01-01', cycleLength: 19, asOf })).toBeNull();
    expect(calculatePregnancy({ method: 'lmp', date: '2026-01-01', cycleLength: '２８', asOf })?.dueDate).toBe(
      '2026-10-08',
    );
  });
});
