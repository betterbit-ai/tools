import { describe, expect, it } from 'vitest';
import {
  CALENDAR_LIMITS,
  convertLunarToSolar,
  convertSolarToLunar,
  lunarBirthdayOccurrences,
  zodiacAnimal,
} from './logic';

describe('solar to Korean lunar conversion', () => {
  it('matches the KASI 2026 Seollal reference date and ganji', () => {
    const result = convertSolarToLunar('2026-02-17');
    expect(result).toMatchObject({
      ok: true,
      value: {
        lunar: { year: 2026, month: 1, day: 1, isLeapMonth: false },
        koreanGanji: '병오년 경인월 임술일',
        hanjaGanji: '丙午年 庚寅月 壬戌日',
        zodiac: 'horse',
      },
    });
  });

  it('detects a leap month', () => {
    const result = convertSolarToLunar('2023-04-05');
    expect(result).toMatchObject({
      ok: true,
      value: { lunar: { year: 2023, month: 2, day: 15, isLeapMonth: true } },
    });
  });

  it('rejects empty, malformed Unicode, impossible and out-of-range input', () => {
    expect(convertSolarToLunar('')).toEqual({ ok: false, error: 'empty' });
    expect(convertSolarToLunar('２０２６-０２-１７')).toEqual({ ok: false, error: 'format' });
    expect(convertSolarToLunar('2026-02-30')).toEqual({ ok: false, error: 'invalid' });
    expect(convertSolarToLunar('9999-12-31')).toEqual({ ok: false, error: 'out-of-range' });
  });

  it('accepts both supported solar boundaries', () => {
    expect(convertSolarToLunar(CALENDAR_LIMITS.solarMin).ok).toBe(true);
    expect(convertSolarToLunar(CALENDAR_LIMITS.solarMax).ok).toBe(true);
  });
});

describe('Korean lunar to solar conversion', () => {
  it('matches the official 2026 Chuseok date', () => {
    const result = convertLunarToSolar(2026, 8, 15, false);
    expect(result).toMatchObject({ ok: true, value: { solarIso: '2026-09-25', zodiac: 'horse' } });
  });

  it('distinguishes a regular month from the leap month with the same number', () => {
    expect(convertLunarToSolar(2023, 2, 15, false)).toMatchObject({
      ok: true,
      value: { solarIso: '2023-03-06' },
    });
    expect(convertLunarToSolar(2023, 2, 15, true)).toMatchObject({
      ok: true,
      value: { solarIso: '2023-04-05' },
    });
  });

  it('rejects empty, fractional, huge, and impossible leap-month dates', () => {
    expect(convertLunarToSolar('', 1, 1, false)).toEqual({ ok: false, error: 'empty' });
    expect(convertLunarToSolar(2026.5, 1, 1, false)).toEqual({ ok: false, error: 'format' });
    expect(convertLunarToSolar(Number.MAX_SAFE_INTEGER, 1, 1, false)).toEqual({
      ok: false,
      error: 'out-of-range',
    });
    expect(convertLunarToSolar(2026, 2, 30, false)).toEqual({ ok: false, error: 'invalid' });
    expect(convertLunarToSolar(2026, 2, 1, true)).toEqual({ ok: false, error: 'invalid' });
  });

  it('accepts both supported lunar boundaries and rejects dates beyond them', () => {
    expect(convertLunarToSolar(1900, 1, 1, false)).toMatchObject({
      ok: true,
      value: { solarIso: CALENDAR_LIMITS.solarMin },
    });
    expect(convertLunarToSolar(2050, 11, 18, false)).toMatchObject({
      ok: true,
      value: { solarIso: CALENDAR_LIMITS.solarMax },
    });
    expect(convertLunarToSolar(2050, 11, 19, false)).toEqual({ ok: false, error: 'out-of-range' });
  });
});

describe('annual lunar birthdays', () => {
  it('shows the 2026 and 2027 solar dates', () => {
    expect(lunarBirthdayOccurrences(8, 15, false)).toMatchObject([
      { lunarYear: 2026, solarIso: '2026-09-25', leapFallback: false, shortMonthFallback: false },
      { lunarYear: 2027, solarIso: '2027-09-15', leapFallback: false, shortMonthFallback: false },
    ]);
  });

  it('explains leap-month and short-month fallbacks', () => {
    expect(lunarBirthdayOccurrences(2, 30, true, [2026])).toEqual([
      expect.objectContaining({
        lunarYear: 2026,
        usedDay: 29,
        solarIso: '2026-04-16',
        usedLeapMonth: false,
        leapFallback: true,
        shortMonthFallback: true,
      }),
    ]);
  });
});

describe('zodiac', () => {
  it('uses the lunar year cycle, including 2026 Byeong-o horse year', () => {
    expect(zodiacAnimal(2026)).toBe('horse');
    expect(zodiacAnimal(2027)).toBe('goat');
  });
});
