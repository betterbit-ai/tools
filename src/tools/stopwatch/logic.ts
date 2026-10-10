/**
 * Pure stopwatch state and export helpers. Elapsed time is derived from an
 * absolute timestamp, never from render ticks, so background tabs cannot
 * introduce drift.
 */

export type StopwatchStatus = 'idle' | 'running' | 'paused';

export interface Lap {
  totalMs: number;
  lapMs: number;
}

export interface StopwatchState {
  status: StopwatchStatus;
  /** Elapsed time at `startedAt`, or the final elapsed time when not running. */
  elapsedMs: number;
  /** Epoch milliseconds at which the current run/resume began. */
  startedAt: number | null;
  laps: Lap[];
}

/** The largest displayable reading: 999:59:59.999. */
export const MAX_STOPWATCH_MS = 999 * 3_600_000 + 59 * 60_000 + 59_999;

const clampElapsed = (ms: number) => Math.max(0, Math.min(MAX_STOPWATCH_MS, Math.round(ms)));

export function idle(): StopwatchState {
  return { status: 'idle', elapsedMs: 0, startedAt: null, laps: [] };
}

export function elapsed(state: StopwatchState, now: number): number {
  if (state.status !== 'running') return clampElapsed(state.elapsedMs);
  return clampElapsed(state.elapsedMs + Math.max(0, now - (state.startedAt ?? now)));
}

export function start(state: StopwatchState, now: number): StopwatchState {
  if (state.status === 'running' || elapsed(state, now) >= MAX_STOPWATCH_MS) return state;
  return { ...state, status: 'running', startedAt: now };
}

export function pause(state: StopwatchState, now: number): StopwatchState {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', elapsedMs: elapsed(state, now), startedAt: null };
}

/** Add a lap without stopping the stopwatch. Laps remain in chronological order. */
export function addLap(state: StopwatchState, now: number): StopwatchState {
  if (state.status !== 'running') return state;
  const totalMs = elapsed(state, now);
  const previousTotal = state.laps.at(-1)?.totalMs ?? 0;
  return { ...state, laps: [...state.laps, { totalMs, lapMs: totalMs - previousTotal }] };
}

export function reset(): StopwatchState {
  return idle();
}

/** Stop at the display maximum rather than wrapping to zero. */
export function settle(state: StopwatchState, now: number): StopwatchState {
  if (state.status === 'running' && elapsed(state, now) >= MAX_STOPWATCH_MS) {
    return { ...state, status: 'paused', elapsedMs: MAX_STOPWATCH_MS, startedAt: null };
  }
  return state;
}

/** Format as H:MM:SS.mmm, keeping hours unambiguous even after one hour. */
export function formatStopwatch(ms: number): string {
  const total = clampElapsed(ms);
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1_000);
  const milliseconds = total % 1_000;
  const pad = (value: number, length = 2) => String(value).padStart(length, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Create a UTF-8-safe CSV whose headers can be localized by the UI. */
export function lapsToCsv(laps: Lap[], headers: [string, string, string]): string {
  const rows = [headers.map(escapeCsv).join(',')];
  for (const [index, lap] of laps.entries()) {
    rows.push([index + 1, formatStopwatch(lap.lapMs), formatStopwatch(lap.totalMs)].map(escapeCsv).join(','));
  }
  return `${rows.join('\r\n')}\r\n`;
}

export function isStopwatchState(value: unknown): value is StopwatchState {
  if (!value || typeof value !== 'object') return false;
  const state = value as StopwatchState;
  if (!['idle', 'running', 'paused'].includes(state.status)) return false;
  if (!Number.isFinite(state.elapsedMs) || state.elapsedMs < 0 || state.elapsedMs > MAX_STOPWATCH_MS) return false;
  if (state.startedAt !== null && !Number.isFinite(state.startedAt)) return false;
  if (state.status === 'running' ? state.startedAt === null : state.startedAt !== null) return false;
  return (
    Array.isArray(state.laps) &&
    state.laps.every(
      (lap) =>
        lap &&
        typeof lap === 'object' &&
        Number.isFinite(lap.totalMs) &&
        Number.isFinite(lap.lapMs) &&
        lap.totalMs >= 0 &&
        lap.lapMs >= 0 &&
        lap.totalMs <= MAX_STOPWATCH_MS,
    )
  );
}
