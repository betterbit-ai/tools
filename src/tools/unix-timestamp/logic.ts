/** Pure Unix timestamp parsing, conversion, and display helpers. */

export type TimestampUnit = 'auto' | 'seconds' | 'milliseconds';
export type DateTimeZone = 'utc' | 'local';

export interface TimestampConversion {
  unit: Exclude<TimestampUnit, 'auto'>;
  milliseconds: number;
  seconds: string;
  millisecondsText: string;
  iso: string;
}

export type TimestampParseResult =
  | { status: 'empty' }
  | { status: 'invalid'; reason: 'number' | 'range' }
  | { status: 'valid'; conversion: TimestampConversion };

const DATE_LIMIT_MS = 8_640_000_000_000_000n;
const INTEGER = /^[+-]?\d+$/;

/**
 * Detects the common Unix convention: values up to ten significant digits are
 * seconds, while longer values are milliseconds. An override remains available
 * because an 11-digit value is inherently ambiguous after the year 2286.
 */
export function detectUnit(value: string): Exclude<TimestampUnit, 'auto'> {
  const unsigned = value.replace(/^[+-]/, '').replace(/^0+(?=\d)/, '');
  return unsigned.length <= 10 ? 'seconds' : 'milliseconds';
}

/** Parses an integer timestamp exactly before handing a safe value to Date. */
export function parseTimestamp(input: string, requestedUnit: TimestampUnit = 'auto'): TimestampParseResult {
  const value = input.trim();
  if (!value) return { status: 'empty' };
  if (!INTEGER.test(value)) return { status: 'invalid', reason: 'number' };

  const unit = requestedUnit === 'auto' ? detectUnit(value) : requestedUnit;
  const raw = BigInt(value);
  const milliseconds = unit === 'seconds' ? raw * 1000n : raw;
  if (milliseconds < -DATE_LIMIT_MS || milliseconds > DATE_LIMIT_MS) {
    return { status: 'invalid', reason: 'range' };
  }

  const date = new Date(Number(milliseconds));
  if (Number.isNaN(date.getTime())) return { status: 'invalid', reason: 'range' };
  return {
    status: 'valid',
    conversion: {
      unit,
      milliseconds: Number(milliseconds),
      seconds: millisecondsToSeconds(milliseconds),
      millisecondsText: milliseconds.toString(),
      iso: date.toISOString(),
    },
  };
}

/** Converts exact milliseconds to a seconds string without floating-point rounding. */
export function millisecondsToSeconds(milliseconds: bigint): string {
  const sign = milliseconds < 0n ? '-' : '';
  const absolute = milliseconds < 0n ? -milliseconds : milliseconds;
  const whole = absolute / 1000n;
  const remainder = absolute % 1000n;
  if (remainder === 0n) return `${sign}${whole}`;
  return `${sign}${whole}.${remainder.toString().padStart(3, '0').replace(/0+$/, '')}`;
}

/** Strictly reads a datetime-local value as UTC or the device's local time. */
export function dateTimeToMilliseconds(value: string, zone: DateTimeZone): number | undefined {
  const match = /^(\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const [year, month, day, hour, minute] = [yearText, monthText, dayText, hourText, minuteText].map(Number);
  if (hour > 23 || minute > 59) return undefined;

  const date =
    zone === 'utc'
      ? new Date(Date.UTC(year, month - 1, day, hour, minute))
      : new Date(year, month - 1, day, hour, minute);
  const matches =
    zone === 'utc'
      ? date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day &&
        date.getUTCHours() === hour &&
        date.getUTCMinutes() === minute
      : date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        date.getHours() === hour &&
        date.getMinutes() === minute;
  return matches ? date.getTime() : undefined;
}

/** Formats an instant for a datetime-local input without relying on Date.parse. */
export function formatDateTimeInput(milliseconds: number, zone: DateTimeZone): string {
  const date = new Date(milliseconds);
  const [year, month, day, hour, minute] =
    zone === 'utc'
      ? [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes()]
      : [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatDisplayTime(milliseconds: number, locale: string, zone: DateTimeZone): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'medium',
    hourCycle: 'h23',
    timeZone: zone === 'utc' ? 'UTC' : undefined,
  }).format(new Date(milliseconds));
}
