import { describe, expect, it } from 'vitest';
import { dayMatches, describeCron, formatRun, nextRuns, parseCron } from './logic';

const at = (iso: string, zone: 'local' | 'utc' = 'utc') => new Date(zone === 'utc' ? iso : iso);
const runs = (expression: string, fromIso: string, count = 5, zone: 'local' | 'utc' = 'utc') => {
  const parsed = parseCron(expression);
  return nextRuns(parsed, count, new Date(fromIso), zone).map((d) => formatRun(d, 'en', zone));
};

describe('parse', () => {
  it('parses the five fields', () => {
    const parsed = parseCron('0 9 * * 1-5');
    expect(parsed.ok).toBe(true);
    expect(parsed.hasSeconds).toBe(false);
    expect(parsed.fields.minute.values).toEqual([0]);
    expect(parsed.fields.hour.values).toEqual([9]);
    expect(parsed.fields.dayOfWeek.values).toEqual([1, 2, 3, 4, 5]);
  });

  it('accepts lists, ranges, steps and combined forms', () => {
    expect(parseCron('*/15 * * * *').fields.minute.values).toEqual([0, 15, 30, 45]);
    expect(parseCron('0 0 1,15 * *').fields.dayOfMonth.values).toEqual([1, 15]);
    expect(parseCron('0 9-17/2 * * *').fields.hour.values).toEqual([9, 11, 13, 15, 17]);
    expect(parseCron('5/20 * * * *').fields.minute.values).toEqual([5, 25, 45]);
    expect(parseCron('0 0 * * 0').fields.dayOfWeek.values).toEqual([0]);
    expect(parseCron('0 0 * * 7').fields.dayOfWeek.values).toEqual([0]);
  });

  it('reads month and weekday names and treats ? as *', () => {
    expect(parseCron('0 0 1 JAN-MAR *').fields.month.values).toEqual([1, 2, 3]);
    expect(parseCron('0 0 * * MON-FRI').fields.dayOfWeek.values).toEqual([1, 2, 3, 4, 5]);
    const question = parseCron('0 0 ? * MON');
    expect(question.ok).toBe(true);
    expect(question.fields.dayOfMonth.restricted).toBe(false);
  });

  it('expands @macros', () => {
    expect(parseCron('@daily').fields.hour.values).toEqual([0]);
    expect(parseCron('@hourly').fields.minute.values).toEqual([0]);
    expect(parseCron('@weekly').fields.dayOfWeek.values).toEqual([0]);
    expect(parseCron('@yearly').fields.month.values).toEqual([1]);
    expect(parseCron('@reboot').ok).toBe(false);
    expect(parseCron('@reboot').error?.code).toBe('reboot');
    expect(parseCron('@nonsense').error?.code).toBe('unknown-macro');
  });

  it('detects a seconds field when six fields are given', () => {
    const parsed = parseCron('*/10 * * * * *');
    expect(parsed.ok).toBe(true);
    expect(parsed.hasSeconds).toBe(true);
    expect(parsed.fields.second.values).toEqual([0, 10, 20, 30, 40, 50]);
  });

  it('rejects the mistakes that break a crontab', () => {
    expect(parseCron('0 9 * *').error?.code).toBe('too-few-fields');
    expect(parseCron('0 0 0 0 0 0 0').error?.code).toBe('too-many-fields');
    expect(parseCron('60 * * * *').error?.code).toBe('bad-value');
    expect(parseCron('0 24 * * *').error?.code).toBe('bad-value');
    expect(parseCron('0 0 0 * *').error?.code).toBe('bad-value');
    expect(parseCron('0 0 * 13 *').error?.code).toBe('bad-value');
    expect(parseCron('0 0 * * 8').error?.code).toBe('bad-value');
    expect(parseCron('*/0 * * * *').error?.code).toBe('step-zero');
    expect(parseCron('5-1 * * * *').error?.code).toBe('bad-range');
    expect(parseCron('0 9 * * 1-5-2').error?.code).toBe('bad-value');
    expect(parseCron('a * * * *').error?.code).toBe('bad-value');
    expect(parseCron('').error?.code).toBe('too-few-fields');
  });
});

describe('day rule', () => {
  it('ORs the two day fields when both are restricted', () => {
    const parsed = parseCron('0 0 13 * 5');
    expect(dayMatches(parsed, 13, 2)).toBe(true); // the 13th, whatever weekday it is
    expect(dayMatches(parsed, 20, 5)).toBe(true); // a Friday
    expect(dayMatches(parsed, 16, 1)).toBe(false); // neither the 13th nor a Friday
  });

  it('treats a field that starts with * as unrestricted, as Vixie cron does', () => {
    const parsed = parseCron('0 0 */2 * 1');
    expect(parsed.fields.dayOfMonth.restricted).toBe(false);
    expect(dayMatches(parsed, 2, 1)).toBe(true);
    expect(dayMatches(parsed, 2, 2)).toBe(false);
  });
});

describe('next runs', () => {
  it('lists weekdays at 09:00 and skips the weekend', () => {
    // 2026-11-28 is a Saturday.
    expect(runs('0 9 * * 1-5', '2026-11-28T12:00:00Z', 5)).toEqual([
      'Mon, 30 Nov 2026, 09:00',
      'Tue, 01 Dec 2026, 09:00',
      'Wed, 02 Dec 2026, 09:00',
      'Thu, 03 Dec 2026, 09:00',
      'Fri, 04 Dec 2026, 09:00',
    ]);
  });

  it('finds the next minute for a stepped minute field', () => {
    expect(runs('*/15 * * * *', '2026-11-28T12:07:00Z', 3)).toEqual([
      'Sat, 28 Nov 2026, 12:15',
      'Sat, 28 Nov 2026, 12:30',
      'Sat, 28 Nov 2026, 12:45',
    ]);
  });

  it('honours seconds when the expression has them', () => {
    expect(runs('*/30 * * * * *', '2026-11-28T12:00:10Z', 3)).toEqual([
      'Sat, 28 Nov 2026, 12:00:30',
      'Sat, 28 Nov 2026, 12:01',
      'Sat, 28 Nov 2026, 12:01:30',
    ]);
  });

  it('skips a 29 February until the next leap year', () => {
    expect(runs('0 0 29 2 *', '2026-11-28T00:00:00Z', 1)).toEqual(['Tue, 29 Feb 2028, 00:00']);
  });

  it('runs on every 13th and every Friday for "0 0 13 * 5"', () => {
    expect(runs('0 0 13 * 5', '2026-11-30T00:00:00Z', 4)).toEqual([
      'Fri, 04 Dec 2026, 00:00',
      'Fri, 11 Dec 2026, 00:00',
      'Sun, 13 Dec 2026, 00:00',
      'Fri, 18 Dec 2026, 00:00',
    ]);
  });

  it('returns nothing for an impossible date', () => {
    expect(nextRuns(parseCron('0 0 30 2 *'), 3, new Date('2026-01-01T00:00:00Z'), 'utc')).toEqual([]);
  });

  it('returns nothing for an invalid expression', () => {
    expect(nextRuns(parseCron('nope'), 3, new Date('2026-01-01T00:00:00Z'), 'utc')).toEqual([]);
  });

  it('works in the local zone too', () => {
    const local = nextRuns(parseCron('0 9 * * *'), 1, new Date('2026-11-28T12:00:00Z'), 'local');
    expect(local).toHaveLength(1);
    expect(local[0].getHours()).toBe(9);
  });
});

describe('description', () => {
  const d = (expression: string, locale: 'en' | 'ko' = 'en') => describeCron(parseCron(expression), locale);

  it('describes the common expressions in English', () => {
    expect(d('* * * * *')).toBe('Every minute');
    expect(d('*/15 * * * *')).toBe('Every 15 minutes');
    expect(d('30 9 1 * *')).toBe('At 09:30, on day 1 of the month');
    expect(d('0 9 * * 1-5')).toBe('At 09:00, on Mon–Fri');
    expect(d('0 0 1 1 *')).toBe('At 00:00, on day 1 of the month in Jan');
  });

  it('describes the common expressions in Korean', () => {
    expect(d('* * * * *', 'ko')).toBe('매분');
    expect(d('*/15 * * * *', 'ko')).toBe('15분마다');
    expect(d('0 9 * * 1-5', 'ko')).toBe('09:00에 월~금에');
    expect(d('30 18 * * 5', 'ko')).toContain('18:30');
  });

  it('describes an invalid expression as empty', () => {
    expect(d('nope')).toBe('');
  });
});

describe('formatRun', () => {
  it('formats in UTC and local', () => {
    const date = new Date('2026-11-30T00:00:00Z');
    expect(formatRun(date, 'en', 'utc')).toContain('30 Nov 2026');
    expect(formatRun(date, 'ko', 'utc')).toContain('2026');
  });
});
