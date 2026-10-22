import KoreanLunarCalendar from 'korean-lunar-calendar';

/**
 * The converter deliberately exposes the modern range we can verify against KASI.
 * Keep range and annual birthday defaults together when the official tables advance.
 */
export const CALENDAR_LIMITS = {
  solarMin: '1900-01-31',
  solarMax: '2050-12-31',
  lunarMin: '1900-01-01',
  lunarMax: '2050-11-18',
  lunarMinYear: 1900,
  lunarMaxYear: 2050,
  birthdayYears: [2026, 2027] as const,
} as const;

export type ZodiacAnimal =
  'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';

export type ConversionError = 'empty' | 'format' | 'invalid' | 'out-of-range';

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface LunarDate extends CalendarDate {
  isLeapMonth: boolean;
}

export interface ConversionValue {
  solar: CalendarDate;
  lunar: LunarDate;
  solarIso: string;
  koreanGanji: string;
  hanjaGanji: string;
  zodiac: ZodiacAnimal;
}

export type ConversionResult = { ok: true; value: ConversionValue } | { ok: false; error: ConversionError };

export interface BirthdayOccurrence {
  lunarYear: number;
  requestedDay: number;
  usedDay: number;
  solar: CalendarDate;
  solarIso: string;
  usedLeapMonth: boolean;
  leapFallback: boolean;
  shortMonthFallback: boolean;
}

const ZODIAC: ZodiacAnimal[] = [
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig',
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function integer(value: number | ''): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : null;
}

function makeValue(calendar: KoreanLunarCalendar): ConversionValue {
  const solar = calendar.getSolarCalendar();
  const lunar = calendar.getLunarCalendar();
  const korean = calendar.getKoreanGapja();
  const hanja = calendar.getChineseGapja();
  return {
    solar: { year: solar.year, month: solar.month, day: solar.day },
    lunar: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      isLeapMonth: lunar.intercalation === true,
    },
    solarIso: formatIsoDate(solar.year, solar.month, solar.day),
    koreanGanji: `${korean.year} ${korean.month} ${korean.day}`,
    hanjaGanji: `${hanja.year} ${hanja.month} ${hanja.day}`,
    zodiac: zodiacAnimal(lunar.year),
  };
}

export function formatIsoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function zodiacAnimal(lunarYear: number): ZodiacAnimal {
  return ZODIAC[(((lunarYear - 4) % 12) + 12) % 12];
}

export function convertSolarToLunar(isoDate: string): ConversionResult {
  if (!isoDate) return { ok: false, error: 'empty' };
  const match = ISO_DATE.exec(isoDate);
  if (!match) return { ok: false, error: 'format' };
  if (isoDate < CALENDAR_LIMITS.solarMin || isoDate > CALENDAR_LIMITS.solarMax) {
    return { ok: false, error: 'out-of-range' };
  }

  const calendar = new KoreanLunarCalendar();
  const valid = calendar.setSolarDate(Number(match[1]), Number(match[2]), Number(match[3]));
  return valid ? { ok: true, value: makeValue(calendar) } : { ok: false, error: 'invalid' };
}

export function convertLunarToSolar(
  yearValue: number | '',
  monthValue: number | '',
  dayValue: number | '',
  isLeapMonth: boolean,
): ConversionResult {
  if (yearValue === '' || monthValue === '' || dayValue === '') return { ok: false, error: 'empty' };
  const year = integer(yearValue);
  const month = integer(monthValue);
  const day = integer(dayValue);
  if (year === null || month === null || day === null) return { ok: false, error: 'format' };
  if (month < 1 || month > 12 || day < 1 || day > 30) return { ok: false, error: 'invalid' };
  const lunarIso = formatIsoDate(year, month, day);
  if (lunarIso < CALENDAR_LIMITS.lunarMin || lunarIso > CALENDAR_LIMITS.lunarMax) {
    return { ok: false, error: 'out-of-range' };
  }

  const calendar = new KoreanLunarCalendar();
  const valid = calendar.setLunarDate(year, month, day, isLeapMonth);
  return valid ? { ok: true, value: makeValue(calendar) } : { ok: false, error: 'invalid' };
}

/**
 * Returns annual solar dates for a lunar birthday. A leap-month birthday uses
 * that leap month when it exists and the regular month otherwise. Day 30 falls
 * back to day 29 in a short lunar month; both adjustments are explicit in the result.
 */
export function lunarBirthdayOccurrences(
  month: number,
  day: number,
  isLeapMonth: boolean,
  years: readonly number[] = CALENDAR_LIMITS.birthdayYears,
): BirthdayOccurrence[] {
  return years.flatMap((year) => {
    const attempts: { day: number; leap: boolean; leapFallback: boolean; shortMonthFallback: boolean }[] = [];
    if (isLeapMonth) {
      attempts.push({ day, leap: true, leapFallback: false, shortMonthFallback: false });
      if (day === 30) attempts.push({ day: 29, leap: true, leapFallback: false, shortMonthFallback: true });
    }
    attempts.push({ day, leap: false, leapFallback: isLeapMonth, shortMonthFallback: false });
    if (day === 30) attempts.push({ day: 29, leap: false, leapFallback: isLeapMonth, shortMonthFallback: true });

    for (const attempt of attempts) {
      const calendar = new KoreanLunarCalendar();
      if (!calendar.setLunarDate(year, month, attempt.day, attempt.leap)) continue;
      const solar = calendar.getSolarCalendar();
      return [
        {
          lunarYear: year,
          requestedDay: day,
          usedDay: attempt.day,
          solar: { year: solar.year, month: solar.month, day: solar.day },
          solarIso: formatIsoDate(solar.year, solar.month, solar.day),
          usedLeapMonth: attempt.leap,
          leapFallback: attempt.leapFallback,
          shortMonthFallback: attempt.shortMonthFallback,
        },
      ];
    }
    return [];
  });
}
