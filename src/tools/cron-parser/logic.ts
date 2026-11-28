/**
 * Pure logic for cron-parser — no DOM, no Preact.
 *
 * Follows the classic Vixie cron rules (crontab(5)): five fields in the order minute hour
 * day-of-month month day-of-week, 0 and 7 both Sunday, English month and weekday names, @macros,
 * and — the rule most tools get wrong — day-of-month and day-of-week are ORed when both are
 * restricted, while a field that begins with * counts as unrestricted.
 * A sixth field at the front adds seconds (Spring, Quartz-style), which the parser detects.
 */
import type { Locale } from '../../i18n/locales';

export type FieldName = 'second' | 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

export type CronError =
  | 'too-few-fields'
  | 'too-many-fields'
  | 'out-of-range'
  | 'bad-value'
  | 'bad-range'
  | 'step-zero'
  | 'unknown-macro'
  | 'reboot';

export interface Field {
  values: number[];
  restricted: boolean;
  raw: string;
}

export interface ParsedCron {
  ok: boolean;
  expression: string;
  hasSeconds: boolean;
  fields: Record<FieldName, Field>;
  error?: { field: FieldName; code: CronError; value: string };
}

const RANGES: Record<FieldName, [number, number]> = {
  second: [0, 59],
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 6],
};

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const emptyField = (raw = '*'): Field => ({
  values: [],
  restricted: raw.startsWith('*') ? false : true,
  raw,
});

const parseValue = (token: string, field: FieldName): number | null => {
  let value: number | null = null;
  if (/^\d+$/.test(token)) value = Number(token);
  else if (field === 'month') {
    const at = MONTH_NAMES.indexOf(token.toUpperCase().slice(0, 3));
    if (at >= 0) value = at + 1;
  } else if (field === 'dayOfWeek') {
    const at = DAY_NAMES.indexOf(token.toUpperCase().slice(0, 3));
    if (at >= 0) value = at;
  }
  if (value === null) return null;
  const [min, max] = RANGES[field];
  if (field === 'dayOfWeek' && value === 7) value = 0;
  if (value < min || value > max) return null;
  return value;
};

const parseField = (raw: string, field: FieldName): Field | CronError => {
  const [min, max] = RANGES[field];
  const values = new Set<number>();
  if (raw === '?' || raw === '*') {
    for (let v = min; v <= max; v++) values.add(v);
    return { values: [...values].sort((a, b) => a - b), restricted: false, raw };
  }

  for (const part of raw.split(',')) {
    if (!part) return 'bad-value';
    const [base, stepText] = part.split('/');
    let step = 1;
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText)) return 'bad-value';
      step = Number(stepText);
      if (step === 0) return 'step-zero';
    }

    let start: number;
    let end: number;
    if (base === '*') {
      start = min;
      end = max;
    } else if (base.includes('-')) {
      const range = base.split('-');
      if (range.length !== 2) return 'bad-value';
      const [a, b] = range;
      const from = parseValue(a, field);
      const to = parseValue(b, field);
      if (from === null || to === null) return 'bad-value';
      if (from > to) return 'bad-range';
      start = from;
      end = to;
    } else {
      const single = parseValue(base, field);
      if (single === null) return 'bad-value';
      start = single;
      // "5/20" means "from 5, every 20, to the end of the field" in Vixie cron.
      end = stepText === undefined ? single : max;
    }

    for (let v = start; v <= end; v += step) values.add(v);
  }

  if (!values.size) return 'bad-value';
  return { values: [...values].sort((a, b) => a - b), restricted: !raw.startsWith('*'), raw };
};

export function parseCron(expression: string, forceSeconds?: boolean): ParsedCron {
  const trimmed = expression.trim().replace(/\s+/g, ' ');
  const fields: Record<FieldName, Field> = {
    second: emptyField('0'),
    minute: emptyField(),
    hour: emptyField(),
    dayOfMonth: emptyField(),
    month: emptyField(),
    dayOfWeek: emptyField(),
  };
  const fail = (field: FieldName, code: CronError, value = trimmed): ParsedCron => ({
    ok: false,
    expression: trimmed,
    hasSeconds: false,
    fields,
    error: { field, code, value },
  });

  if (!trimmed) return fail('minute', 'too-few-fields');
  if (trimmed.startsWith('@')) {
    const macro = MACROS[trimmed.toLowerCase()];
    if (!macro) {
      return fail('minute', trimmed.toLowerCase() === '@reboot' ? 'reboot' : 'unknown-macro', trimmed);
    }
    const parsed = parseCron(macro, false);
    return { ...parsed, expression: trimmed };
  }

  const parts = trimmed.split(' ');
  if (parts.length < 5) return fail('minute', 'too-few-fields');
  if (parts.length > 6) return fail('minute', 'too-many-fields');

  const hasSeconds = parts.length === 6 || forceSeconds === true;
  const order: FieldName[] = hasSeconds
    ? ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']
    : ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  const offset = hasSeconds ? 0 : -1;

  for (let i = 0; i < order.length; i++) {
    const field = order[i];
    const raw = parts[i];
    const parsed = parseField(raw, field);
    if (typeof parsed === 'string') return fail(field, parsed, raw);
    fields[field] = parsed;
  }

  if (!hasSeconds) {
    fields.second = { values: [0], restricted: false, raw: '0' };
  }

  return { ok: true, expression: trimmed, hasSeconds, fields };
}

/** Vixie cron: when both day fields are restricted, a day matches if either one matches. */
export function dayMatches(parsed: ParsedCron, dayOfMonth: number, dayOfWeek: number): boolean {
  const dom = parsed.fields.dayOfMonth;
  const dow = parsed.fields.dayOfWeek;
  const domOk = dom.values.includes(dayOfMonth);
  const dowOk = dow.values.includes(dayOfWeek);
  if (dom.restricted && dow.restricted) return domOk || dowOk;
  if (dom.restricted) return domOk;
  if (dow.restricted) return dowOk;
  return true;
}

export type Zone = 'local' | 'utc';

interface Parts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number;
}

const partsOf = (date: Date, zone: Zone): Parts =>
  zone === 'utc'
    ? {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds(),
        dayOfWeek: date.getUTCDay(),
      }
    : {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        dayOfWeek: date.getDay(),
      };

const makeDate = (p: Parts, zone: Zone): Date =>
  zone === 'utc'
    ? new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second))
    : new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);

/** Does the date still read the same after construction? A skipped hour (DST) does not. */
const roundTrips = (date: Date, p: Parts, zone: Zone): boolean => {
  const back = partsOf(date, zone);
  return back.hour === p.hour && back.minute === p.minute && back.day === p.day;
};

const SEARCH_DAYS = 366 * 5;

/**
 * The next `count` times the expression fires, after `from`. Days are scanned first (so an
 * impossible date such as 30 February costs one cheap check per day), then the matching hours,
 * minutes and seconds of that day.
 */
export function nextRuns(parsed: ParsedCron, count: number, from: Date, zone: Zone = 'local'): Date[] {
  const out: Date[] = [];
  if (!parsed.ok || count <= 0) return out;
  const start = partsOf(from, zone);
  const hours = parsed.fields.hour.values;
  const minutes = parsed.fields.minute.values;
  const seconds = parsed.hasSeconds && parsed.fields.second.values.length < 60 ? parsed.fields.second.values : [0];

  for (let dayOffset = 0; dayOffset < SEARCH_DAYS && out.length < count; dayOffset++) {
    const probe = makeDate({ ...start, hour: 12, minute: 0, second: 0 }, zone);
    if (dayOffset > 0) {
      if (zone === 'utc') probe.setUTCDate(probe.getUTCDate() + dayOffset);
      else probe.setDate(probe.getDate() + dayOffset);
    } else {
      if (zone === 'utc') probe.setUTCDate(probe.getUTCDate());
      else probe.setDate(probe.getDate());
    }
    const day = partsOf(probe, zone);
    if (!parsed.fields.month.values.includes(day.month)) continue;
    if (!dayMatches(parsed, day.day, day.dayOfWeek)) continue;

    for (const hour of hours) {
      if (dayOffset === 0 && hour < start.hour) continue;
      for (const minute of minutes) {
        if (dayOffset === 0 && hour === start.hour && minute < start.minute) continue;
        for (const second of seconds) {
          if (dayOffset === 0 && hour === start.hour && minute === start.minute && second <= start.second) continue;
          const candidate: Parts = {
            year: day.year,
            month: day.month,
            day: day.day,
            hour,
            minute,
            second,
            dayOfWeek: day.dayOfWeek,
          };
          const date = makeDate(candidate, zone);
          if (date.getTime() <= from.getTime()) continue;
          if (!roundTrips(date, candidate, zone)) continue;
          out.push(date);
          if (out.length >= count) return out;
        }
      }
    }
  }
  return out;
}

/* ───────────────────────── description ───────────────────────── */

interface Words {
  everyMinute: string;
  everyHour: string;
  at: (time: string) => string;
  everyNMinutes: (n: number) => string;
  everyNHours: (n: number) => string;
  on: (days: string) => string;
  onDayOfMonth: (days: string) => string;
  inMonths: (months: string) => string;
  or: string;
  and: string;
  secondsAt: (second: string) => string;
}

const words: Record<Locale, Words> = {
  en: {
    everyMinute: 'Every minute',
    everyHour: 'Every hour',
    at: (time) => `At ${time}`,
    everyNMinutes: (n) => `Every ${n} minutes`,
    everyNHours: (n) => `Every ${n} hours`,
    on: (days) => `on ${days}`,
    onDayOfMonth: (days) => `on day ${days} of the month`,
    inMonths: (months) => `in ${months}`,
    or: 'or',
    and: 'and',
    secondsAt: (second) => `at second ${second}`,
  },
  ko: {
    everyMinute: '매분',
    everyHour: '매시간',
    at: (time) => `${time}에`,
    everyNMinutes: (n) => `${n}분마다`,
    everyNHours: (n) => `${n}시간마다`,
    on: (days) => `${days}에`,
    onDayOfMonth: (days) => `매월 ${days}일`,
    inMonths: (months) => `${months}에`,
    or: '또는',
    and: '그리고',
    secondsAt: (second) => `${second}초에`,
  },
};

const listJoin = (items: string[], locale: Locale, conjunction: 'and' | 'or'): string => {
  if (items.length <= 1) return items[0] ?? '';
  const word = conjunction === 'or' ? (locale === 'ko' ? '또는' : 'or') : locale === 'ko' ? '그리고' : 'and';
  if (items.length === 2) return `${items[0]}${locale === 'ko' ? ' ' : ', '}${word} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}${locale === 'ko' ? ', ' : `, ${word} `}${items.at(-1)}`;
};

const timeText = (hour: number, minute: number, second: number, locale: Locale, withSeconds: boolean): string => {
  const date = new Date(Date.UTC(2026, 0, 1, hour, minute, second));
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
};

const weekdayName = (value: number, locale: Locale): string => {
  const date = new Date(Date.UTC(2026, 0, 4 + value)); // 2026-01-04 is a Sunday
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', { weekday: 'short', timeZone: 'UTC' }).format(
    date,
  );
};

const monthName = (value: number, locale: Locale): string => {
  const date = new Date(Date.UTC(2026, value - 1, 1));
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', { month: 'short', timeZone: 'UTC' }).format(date);
};

/** Is this field a plain step from the minimum, such as star-slash-15, with no other restriction? */
const stepOf = (field: Field, min: number, max: number): number | null => {
  const match = /^\*\/(\d+)$/.exec(field.raw);
  if (!match) return null;
  const step = Number(match[1]);
  if (step <= 1) return null;
  const values = field.values;
  if (values.length !== Math.floor((max - min) / step) + 1) return null;
  return step;
};

export function describeCron(parsed: ParsedCron, locale: Locale): string {
  if (!parsed.ok) return '';
  const w = words[locale];
  const { minute, hour, dayOfMonth, month, dayOfWeek, second } = parsed.fields;

  const allHours = hour.values.length === 24;
  const allMinutes = minute.values.length === 60;
  let text: string;

  const minuteStep = stepOf(minute, 0, 59);
  const hourStep = stepOf(hour, 0, 23);

  if (allHours && allMinutes && (!parsed.hasSeconds || second.values.length === 60)) {
    text = w.everyMinute;
  } else if (minuteStep && allHours) {
    text = w.everyNMinutes(minuteStep);
  } else if (hourStep && minute.values.length === 1) {
    text = `${w.everyNHours(hourStep)}${locale === 'ko' ? ' ' : ' at '}${locale === 'ko' ? `${minute.values[0]}분` : `:${String(minute.values[0]).padStart(2, '0')}`}`;
  } else if (allMinutes && hour.values.length === 1) {
    text = locale === 'ko' ? `${hour.values[0]}시에 매분` : `Every minute during hour ${hour.values[0]}`;
  } else if (hour.values.length * minute.values.length <= 6) {
    const times = hour.values.flatMap((h) =>
      minute.values.map((m) =>
        timeText(
          h,
          m,
          parsed.hasSeconds && second.values.length < 60 ? second.values[0] : 0,
          locale,
          parsed.hasSeconds && second.values.length < 60,
        ),
      ),
    );
    text = w.at(listJoin(times, locale, 'and'));
  } else {
    text = w.at(
      listJoin(
        hour.values.slice(0, 6).map((h) => timeText(h, minute.values[0] ?? 0, 0, locale, false)),
        locale,
        'and',
      ),
    );
  }

  if (parsed.hasSeconds && second.values.length === 1) {
    text += `${locale === 'ko' ? ' ' : ', '}${w.secondsAt(String(second.values[0]))}`;
  }

  const dayClauses: string[] = [];
  if (dayOfWeek.restricted) {
    const names = dayOfWeek.values.map((v) => weekdayName(v, locale));
    const consecutive =
      dayOfWeek.values.length > 1 && dayOfWeek.values.every((v, i, arr) => i === 0 || v === arr[i - 1] + 1);
    const label =
      consecutive && dayOfWeek.values.length > 2
        ? locale === 'ko'
          ? `${names[0]}~${names.at(-1)}`
          : `${names[0]}–${names.at(-1)}`
        : listJoin(names, locale, 'and');
    dayClauses.push(w.on(label));
  }
  if (dayOfMonth.restricted) {
    dayClauses.push(w.onDayOfMonth(listJoin(dayOfMonth.values.map(String), locale, 'and')));
  }

  let dayText = dayClauses.join(` ${w.or} `);
  if (month.restricted) {
    const monthsText = w.inMonths(
      listJoin(
        month.values.map((v) => monthName(v, locale)),
        locale,
        'and',
      ),
    );
    dayText = dayText ? `${dayText} ${monthsText}` : monthsText;
  }
  if (dayText) text += `${locale === 'ko' ? ' ' : ', '}${dayText}`;

  return text;
}

/** A run time written for the chosen zone, e.g. "Mon, 30 Nov 2026 09:30" / "2026. 11. 30. (월) 09:30". */
export function formatRun(date: Date, locale: Locale, zone: Zone): string {
  const seconds = zone === 'utc' ? date.getUTCSeconds() : date.getSeconds();
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' } : {}),
    hour12: false,
    timeZone: zone === 'utc' ? 'UTC' : undefined,
  }).format(date);
}

/** The IANA zone the browser is in, for the label under the list. */
export function localZoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time';
  } catch {
    return 'local time';
  }
}
