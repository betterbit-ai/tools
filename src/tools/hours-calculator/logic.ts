/** Pure calculation helpers for hours-calculator — no DOM or Preact. */

const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export interface ShiftInput {
  start: string;
  end: string;
  breakMinutes: number;
}

export interface ShiftResult {
  grossMinutes: number;
  breakMinutes: number;
  netMinutes: number;
  overnight: boolean;
}

export interface WeekResult {
  grossMinutes: number;
  breakMinutes: number;
  netMinutes: number;
  workedDays: number;
  invalidDays: number;
}

/** Converts a strict native time-input value (`HH:mm`) into minutes after midnight. */
export function parseTime(value: string): number | null {
  const match = TIME_PATTERN.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

/** Formats a non-negative minute duration as `8h 05m`; durations may exceed one day. */
export function formatMinutes(minutes: number): string {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
  return `${Math.floor(safeMinutes / 60)}h ${String(safeMinutes % 60).padStart(2, '0')}m`;
}

/** Converts a minute duration to a payroll-friendly decimal-hours string. */
export function formatDecimalHours(minutes: number): string {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
  return (safeMinutes / 60).toFixed(2);
}

/**
 * Calculates one shift. An earlier end time is treated as an overnight finish;
 * equal start/end times are a zero-length shift rather than an assumed 24-hour shift.
 */
export function calculateShift(input: ShiftInput): ShiftResult | null {
  const start = parseTime(input.start);
  const end = parseTime(input.end);
  if (start === null || end === null || !Number.isInteger(input.breakMinutes) || input.breakMinutes < 0) return null;

  const overnight = end < start;
  const grossMinutes = (overnight ? end + 24 * 60 : end) - start;
  if (input.breakMinutes > grossMinutes) return null;

  return { grossMinutes, breakMinutes: input.breakMinutes, netMinutes: grossMinutes - input.breakMinutes, overnight };
}

/** Adds completed daily shifts; blank rows are ignored and invalid populated rows are reported. */
export function calculateWeek(shifts: ShiftInput[]): WeekResult {
  return shifts.reduce<WeekResult>(
    (total, shift) => {
      const blank = shift.start === '' && shift.end === '' && shift.breakMinutes === 0;
      if (blank) return total;

      const result = calculateShift(shift);
      if (!result) return { ...total, invalidDays: total.invalidDays + 1 };

      return {
        grossMinutes: total.grossMinutes + result.grossMinutes,
        breakMinutes: total.breakMinutes + result.breakMinutes,
        netMinutes: total.netMinutes + result.netMinutes,
        workedDays: total.workedDays + 1,
        invalidDays: total.invalidDays,
      };
    },
    { grossMinutes: 0, breakMinutes: 0, netMinutes: 0, workedDays: 0, invalidDays: 0 },
  );
}
