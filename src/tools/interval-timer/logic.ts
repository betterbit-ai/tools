/**
 * Pure interval-timer state machine. Each phase is measured from an absolute
 * end timestamp, so a throttled or backgrounded browser tab cannot accumulate
 * one-second-tick drift.
 */

export const MAX_SECONDS = 3 * 60 * 60;
export const MAX_ROUNDS = 99;

export type Phase = 'ready' | 'work' | 'rest' | 'done';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

export interface IntervalSettings {
  prepSeconds: number;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
}

export interface IntervalTimerState {
  status: TimerStatus;
  settings: IntervalSettings;
  phase: Phase;
  /** One-indexed during work and rest; zero during an optional ready phase. */
  round: number;
  /** Epoch milliseconds when the active phase ends while running. */
  endAt: number | null;
  /** Remaining time captured when paused. */
  pausedRemainingMs: number | null;
}

export const DEFAULT_SETTINGS: IntervalSettings = {
  prepSeconds: 5,
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
};

export function sanitizeSettings(value: Partial<IntervalSettings>): IntervalSettings {
  return {
    prepSeconds: clampSeconds(value.prepSeconds ?? DEFAULT_SETTINGS.prepSeconds, 0),
    workSeconds: clampSeconds(value.workSeconds ?? DEFAULT_SETTINGS.workSeconds, 1),
    restSeconds: clampSeconds(value.restSeconds ?? DEFAULT_SETTINGS.restSeconds, 0),
    rounds: clampInt(value.rounds ?? DEFAULT_SETTINGS.rounds, 1, MAX_ROUNDS),
  };
}

export function idle(settings: IntervalSettings): IntervalTimerState {
  const safeSettings = sanitizeSettings(settings);
  const hasPrep = safeSettings.prepSeconds > 0;
  return {
    status: 'idle',
    settings: safeSettings,
    phase: hasPrep ? 'ready' : 'work',
    round: hasPrep ? 0 : 1,
    endAt: null,
    pausedRemainingMs: null,
  };
}

export function remainingMs(state: IntervalTimerState, now: number): number {
  if (state.status === 'running') return Math.max(0, (state.endAt ?? now) - now);
  if (state.status === 'paused') return state.pausedRemainingMs ?? 0;
  if (state.status === 'done') return 0;
  return phaseSeconds(state.phase, state.settings) * 1000;
}

/** Total from tapping start through the final rest interval. */
export function totalSeconds(settings: IntervalSettings): number {
  const safeSettings = sanitizeSettings(settings);
  return safeSettings.prepSeconds + safeSettings.rounds * (safeSettings.workSeconds + safeSettings.restSeconds);
}

export function formatClock(ms: number): string {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(remainder)}` : `${pad(minutes)}:${pad(remainder)}`;
}

export function start(state: IntervalTimerState, now: number): IntervalTimerState {
  if (state.status === 'running') return state;
  if (state.status === 'done') return start(idle(state.settings), now);
  const remaining =
    state.status === 'paused' ? (state.pausedRemainingMs ?? 0) : phaseSeconds(state.phase, state.settings) * 1000;
  return { ...state, status: 'running', endAt: now + remaining, pausedRemainingMs: null };
}

export function pause(state: IntervalTimerState, now: number): IntervalTimerState {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', endAt: null, pausedRemainingMs: remainingMs(state, now) };
}

/** Move to the following phase, preserving the scheduled time boundary. */
export function advance(state: IntervalTimerState, boundary: number): IntervalTimerState {
  if (state.status !== 'running') return state;
  const { phase, round, settings } = state;
  let nextPhase: Phase;
  let nextRound = round;

  if (phase === 'ready') {
    nextPhase = 'work';
    nextRound = 1;
  } else if (phase === 'work') {
    nextPhase = 'rest';
  } else if (phase === 'rest' && round < settings.rounds) {
    nextPhase = 'work';
    nextRound = round + 1;
  } else {
    return { ...state, status: 'done', phase: 'done', round: settings.rounds, endAt: null, pausedRemainingMs: null };
  }

  return {
    ...state,
    phase: nextPhase,
    round: nextRound,
    endAt: boundary + phaseSeconds(nextPhase, settings) * 1000,
  };
}

/** Catches up through every elapsed phase after a delayed browser callback. */
export function settle(state: IntervalTimerState, now: number): IntervalTimerState {
  let next = state;
  let guard = 0;
  while (next.status === 'running' && (next.endAt ?? Infinity) <= now && guard++ < MAX_ROUNDS * 3 + 3) {
    next = advance(next, next.endAt ?? now);
  }
  return next;
}

export function isIntervalTimerState(value: unknown): value is IntervalTimerState {
  if (!value || typeof value !== 'object') return false;
  const state = value as IntervalTimerState;
  if (!['idle', 'running', 'paused', 'done'].includes(state.status)) return false;
  if (!['ready', 'work', 'rest', 'done'].includes(state.phase)) return false;
  if (!isSettings(state.settings) || !Number.isInteger(state.round) || state.round < 0 || state.round > MAX_ROUNDS)
    return false;
  if (state.status === 'running')
    return typeof state.endAt === 'number' && Number.isFinite(state.endAt) && state.pausedRemainingMs === null;
  if (state.status === 'paused') return state.endAt === null && isMilliseconds(state.pausedRemainingMs);
  return state.endAt === null && state.pausedRemainingMs === null;
}

function phaseSeconds(phase: Phase, settings: IntervalSettings): number {
  if (phase === 'ready') return settings.prepSeconds;
  if (phase === 'work') return settings.workSeconds;
  if (phase === 'rest') return settings.restSeconds;
  return 0;
}

function clampSeconds(value: number, min: number): number {
  return clampInt(value, min, MAX_SECONDS);
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function isSettings(value: unknown): value is IntervalSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as IntervalSettings;
  return (
    isIntegerInRange(settings.prepSeconds, 0, MAX_SECONDS) &&
    isIntegerInRange(settings.workSeconds, 1, MAX_SECONDS) &&
    isIntegerInRange(settings.restSeconds, 0, MAX_SECONDS) &&
    isIntegerInRange(settings.rounds, 1, MAX_ROUNDS)
  );
}

function isMilliseconds(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_SECONDS * 1000;
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}
