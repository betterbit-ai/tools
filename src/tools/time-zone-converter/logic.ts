/** Pure time-zone conversion helpers. They use the browser's IANA/Intl data, not a fixed offset table. */

import type { Locale } from '../../i18n/locales';

export interface City {
  zone: string;
  en: string;
  ko: string;
  countryEn: string;
  countryKo: string;
  aliases: string[];
}

/** Popular cities plus Korean and English search aliases. Any valid IANA zone can also be entered. */
const cityRows: [string, string, string, string, string, string[]][] = [
  ['Asia/Seoul', 'Seoul', '서울', 'South Korea', '대한민국', ['korea', 'korea standard time', 'kst']],
  ['Asia/Tokyo', 'Tokyo', '도쿄', 'Japan', '일본', ['japan', 'jst']],
  ['Asia/Shanghai', 'Shanghai', '상하이', 'China', '중국', ['beijing', '베이징', 'china', 'cst']],
  ['Asia/Hong_Kong', 'Hong Kong', '홍콩', 'Hong Kong', '홍콩', ['hongkong']],
  ['Asia/Singapore', 'Singapore', '싱가포르', 'Singapore', '싱가포르', ['sgt']],
  ['Asia/Bangkok', 'Bangkok', '방콕', 'Thailand', '태국', ['thailand']],
  ['Asia/Kolkata', 'Mumbai', '뭄바이', 'India', '인도', ['delhi', '뉴델리', 'india', 'ist']],
  ['Asia/Dubai', 'Dubai', '두바이', 'United Arab Emirates', '아랍에미리트', ['uae']],
  ['Asia/Jakarta', 'Jakarta', '자카르타', 'Indonesia', '인도네시아', []],
  ['Asia/Manila', 'Manila', '마닐라', 'Philippines', '필리핀', []],
  ['America/New_York', 'New York', '뉴욕', 'United States', '미국', ['nyc', 'eastern', 'est', 'edt']],
  ['America/Los_Angeles', 'Los Angeles', '로스앤젤레스', 'United States', '미국', ['la', 'pacific', 'pst', 'pdt']],
  ['America/Chicago', 'Chicago', '시카고', 'United States', '미국', ['central', 'cst', 'cdt']],
  ['America/Denver', 'Denver', '덴버', 'United States', '미국', ['mountain', 'mst', 'mdt']],
  ['America/Toronto', 'Toronto', '토론토', 'Canada', '캐나다', []],
  ['America/Vancouver', 'Vancouver', '밴쿠버', 'Canada', '캐나다', []],
  ['Pacific/Honolulu', 'Honolulu', '호놀룰루', 'United States', '미국', ['hawaii', '하와이', 'hst']],
  ['America/Sao_Paulo', 'São Paulo', '상파울루', 'Brazil', '브라질', ['sao paulo']],
  ['Europe/London', 'London', '런던', 'United Kingdom', '영국', ['uk', 'britain', 'gmt', 'bst']],
  ['Europe/Paris', 'Paris', '파리', 'France', '프랑스', []],
  ['Europe/Berlin', 'Berlin', '베를린', 'Germany', '독일', []],
  ['Europe/Madrid', 'Madrid', '마드리드', 'Spain', '스페인', []],
  ['Europe/Rome', 'Rome', '로마', 'Italy', '이탈리아', []],
  ['Europe/Amsterdam', 'Amsterdam', '암스테르담', 'Netherlands', '네덜란드', []],
  ['Europe/Moscow', 'Moscow', '모스크바', 'Russia', '러시아', []],
  ['Africa/Cairo', 'Cairo', '카이로', 'Egypt', '이집트', []],
  ['Africa/Johannesburg', 'Johannesburg', '요하네스버그', 'South Africa', '남아프리카공화국', []],
  ['Australia/Sydney', 'Sydney', '시드니', 'Australia', '오스트레일리아', ['aest', 'aedt']],
  ['Australia/Perth', 'Perth', '퍼스', 'Australia', '오스트레일리아', []],
  ['Pacific/Auckland', 'Auckland', '오클랜드', 'New Zealand', '뉴질랜드', []],
  ['Pacific/Guam', 'Guam', '괌', 'Guam', '괌', ['saipan', '사이판']],
];

export const CITIES: City[] = cityRows.map(([zone, en, ko, countryEn, countryKo, aliases]) => ({
  zone,
  en,
  ko,
  countryEn,
  countryKo,
  aliases,
}));

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export type LocalTimeStatus = 'valid' | 'ambiguous' | 'nonexistent' | 'invalid';

export interface LocalTimeResolution {
  status: LocalTimeStatus;
  /** The earlier instant when a clock repeats. */
  instant?: number;
  alternatives: number[];
}

function normalized(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/[\s_\-/]+/g, ' ')
    .trim();
}

export function cityLabel(city: City, locale: Locale): string {
  const cityName = locale === 'ko' ? city.ko : city.en;
  const country = locale === 'ko' ? city.countryKo : city.countryEn;
  return `${cityName}, ${country} — ${city.zone}`;
}

export function searchCities(query: string, locale: Locale, limit = 8): City[] {
  const term = normalized(query);
  if (!term) return CITIES.slice(0, limit);
  return CITIES.filter((city) => {
    const haystack = normalized(
      [city.zone, city.en, city.ko, city.countryEn, city.countryKo, ...city.aliases, cityLabel(city, locale)].join(' '),
    );
    return haystack.includes(term);
  }).slice(0, limit);
}

export function cityFromInput(value: string, locale: Locale): City | undefined {
  const input = normalized(value);
  return CITIES.find((city) => normalized(cityLabel(city, locale)) === input || normalized(city.zone) === input);
}

export function isTimeZone(value: string): boolean {
  // Accept named IANA zones (and UTC), not ambiguous abbreviations such as EST.
  if (value !== 'UTC' && !value.includes('/')) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const partsOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
};
const partsFormatters = new Map<string, Intl.DateTimeFormat>();

/** Returns numerical wall-clock fields for an instant in an IANA zone. */
export function zonedParts(instant: number, timeZone: string): ZonedParts {
  const values: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {};
  let formatter = partsFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', { ...partsOptions, timeZone });
    partsFormatters.set(timeZone, formatter);
  }
  for (const part of formatter.formatToParts(new Date(instant))) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }
  return {
    year: values.year!,
    month: values.month!,
    day: values.day!,
    hour: values.hour!,
    minute: values.minute!,
    second: values.second!,
  };
}

export function formatDateInput(parts: Pick<ZonedParts, 'year' | 'month' | 'day'>): string {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function formatTimeInput(parts: Pick<ZonedParts, 'hour' | 'minute'>): string {
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

/** Calendar-day shift between a source date input and a converted zoned date. */
export function calendarDayDifference(
  sourceDate: string,
  target: Pick<ZonedParts, 'year' | 'month' | 'day'>,
): number | undefined {
  const source = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(sourceDate)?.slice(1).map(Number);
  if (!source) return undefined;
  return Math.round(
    (Date.UTC(target.year, target.month - 1, target.day) - Date.UTC(source[0], source[1] - 1, source[2])) / 86_400_000,
  );
}

function parseLocal(date: string, time: string): ZonedParts | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)?.slice(1).map(Number);
  const clock = /^(\d{2}):(\d{2})$/.exec(time)?.slice(1).map(Number);
  if (!match || !clock) return undefined;
  const [year, month, day] = match;
  const [hour, minute] = clock;
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    return undefined;
  }
  return { year, month, day, hour, minute, second: 0 };
}

function sameWallTime(a: ZonedParts, b: ZonedParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day && a.hour === b.hour && a.minute === b.minute;
}

/** Offset in milliseconds at one precise instant, including DST. */
export function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = zonedParts(instant, timeZone);
  const wallAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return wallAsUtc - Math.floor(instant / 1000) * 1000;
}

/**
 * Resolves a local wall time without assuming a constant UTC offset. On autumn
 * clock repeats the first occurrence is selected and both possibilities remain available.
 */
export function resolveLocalTime(date: string, time: string, timeZone: string): LocalTimeResolution {
  const requested = parseLocal(date, time);
  if (!requested || !isTimeZone(timeZone)) return { status: 'invalid', alternatives: [] };
  const guess = Date.UTC(requested.year, requested.month - 1, requested.day, requested.hour, requested.minute);
  const offsets = new Set<number>();
  for (let delta = -36; delta <= 36; delta += 1) offsets.add(zoneOffsetMs(guess + delta * 3_600_000, timeZone));
  const alternatives = [...offsets]
    .map((offset) => guess - offset)
    .filter((instant) => sameWallTime(zonedParts(instant, timeZone), requested))
    .sort((a, b) => a - b);
  if (!alternatives.length) return { status: 'nonexistent', alternatives: [] };
  return { status: alternatives.length > 1 ? 'ambiguous' : 'valid', instant: alternatives[0], alternatives };
}

export function formatOffset(offsetMs: number): string {
  const sign = offsetMs < 0 ? '−' : '+';
  const totalMinutes = Math.round(Math.abs(offsetMs) / 60_000);
  return `UTC${sign}${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

export function formatDateTime(instant: number, timeZone: string, locale: Locale, hourCycle: '12' | '24'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'short',
    hourCycle: hourCycle === '24' ? 'h23' : 'h12',
  }).format(new Date(instant));
}

export function timeZoneAbbreviation(instant: number, timeZone: string, locale: Locale): string {
  const part = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' })
    .formatToParts(new Date(instant))
    .find((item) => item.type === 'timeZoneName');
  return part?.value ?? timeZone;
}

/** True when the selected instant is within 36 hours of an offset transition in this zone. */
export function isNearOffsetTransition(instant: number, timeZone: string): boolean {
  const nowOffset = zoneOffsetMs(instant, timeZone);
  for (let delta = -36; delta <= 36; delta += 1) {
    if (zoneOffsetMs(instant + delta * 3_600_000, timeZone) !== nowOffset) return true;
  }
  return false;
}
