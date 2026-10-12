/**
 * Pure clock formatting and saved-setting validation. The browser supplies the
 * current Date; this module never reads the clock or touches the DOM itself.
 */

export type ClockFormat = '12h' | '24h';

export interface ClockSettings {
  format: ClockFormat;
  showSeconds: boolean;
  showDate: boolean;
}

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  format: '24h',
  showSeconds: true,
  showDate: true,
};

export interface ClockDisplay {
  time: string;
  period: string | null;
  date: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Format local device time without depending on the user's UI language. */
export function formatTime(
  date: Date,
  format: ClockFormat,
  showSeconds: boolean,
): Pick<ClockDisplay, 'time' | 'period'> {
  if (Number.isNaN(date.getTime())) return { time: '--:--', period: null };

  const hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const seconds = showSeconds ? `:${pad(date.getSeconds())}` : '';

  if (format === '24h') return { time: `${pad(hours)}:${minutes}${seconds}`, period: null };

  const period = hours < 12 ? 'AM' : 'PM';
  const twelveHour = hours % 12 || 12;
  return { time: `${twelveHour}:${minutes}${seconds}`, period };
}

/** The date follows the chosen language's normal ordering and Unicode script. */
export function formatDate(date: Date, locale: string): string {
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(
    date,
  );
}

export function makeClockDisplay(date: Date, locale: string, settings: ClockSettings): ClockDisplay {
  return { ...formatTime(date, settings.format, settings.showSeconds), date: formatDate(date, locale) };
}

/** Minutes east of UTC become a readable UTC±HH:MM label. */
export function formatUtcOffset(minutesEast: number): string {
  if (!Number.isFinite(minutesEast)) return 'UTC';
  const sign = minutesEast >= 0 ? '+' : '-';
  const absolute = Math.abs(Math.trunc(minutesEast));
  return `UTC${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
}

/** Date#getTimezoneOffset has the opposite sign of the conventional UTC offset. */
export function utcOffsetFor(date: Date): string {
  if (Number.isNaN(date.getTime())) return 'UTC';
  return formatUtcOffset(-date.getTimezoneOffset());
}

export function isClockSettings(value: unknown): value is ClockSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as ClockSettings;
  return (
    (settings.format === '12h' || settings.format === '24h') &&
    typeof settings.showSeconds === 'boolean' &&
    typeof settings.showDate === 'boolean'
  );
}
