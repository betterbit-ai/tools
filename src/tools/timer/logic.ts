/**
 * Countdown timer math. Time is tracked as an absolute end timestamp, not by
 * counting ticks, so the timer stays exact when the tab is throttled or asleep.
 */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

export interface TimerState {
  status: TimerStatus;
  /** Total configured duration. */
  durationMs: number;
  /** Epoch ms when a running timer hits zero. */
  endAt: number | null;
  /** Remaining time while paused. */
  pausedRemainingMs: number | null;
}

export const MAX_DURATION_MS = 100 * 3600 * 1000 - 1000;

export function toMs(h: number, m: number, s: number): number {
  const total = ((h || 0) * 3600 + (m || 0) * 60 + (s || 0)) * 1000;
  return Math.max(0, Math.min(MAX_DURATION_MS, Math.round(total)));
}

export function splitMs(ms: number): { h: number; m: number; s: number } {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

/** Clock display. Rounds up so "0:00" only shows when time is actually up. */
export function formatClock(ms: number): string {
  const { h, m, s } = splitMs(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function idle(durationMs: number): TimerState {
  return { status: 'idle', durationMs, endAt: null, pausedRemainingMs: null };
}

export function remaining(state: TimerState, now: number): number {
  switch (state.status) {
    case 'idle':
      return state.durationMs;
    case 'running':
      return Math.max(0, (state.endAt ?? now) - now);
    case 'paused':
      return state.pausedRemainingMs ?? state.durationMs;
    case 'done':
      return 0;
  }
}

export function start(state: TimerState, now: number): TimerState {
  if (state.status === 'running' || state.durationMs <= 0) return state;
  const left = state.status === 'paused' ? remaining(state, now) : state.durationMs;
  return { ...state, status: 'running', endAt: now + left, pausedRemainingMs: null };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', endAt: null, pausedRemainingMs: remaining(state, now) };
}

/** Add time to whatever state the timer is in (used by "+1 min"). */
export function addTime(state: TimerState, ms: number, now: number): TimerState {
  switch (state.status) {
    case 'running':
      return { ...state, endAt: (state.endAt ?? now) + ms, durationMs: state.durationMs + ms };
    case 'paused':
      return { ...state, pausedRemainingMs: (state.pausedRemainingMs ?? 0) + ms, durationMs: state.durationMs + ms };
    case 'done':
      return { status: 'running', durationMs: ms, endAt: now + ms, pausedRemainingMs: null };
    case 'idle':
      return idle(Math.min(MAX_DURATION_MS, state.durationMs + ms));
  }
}

/** Returns the done state if a running timer has expired, otherwise the same state. */
export function settle(state: TimerState, now: number): TimerState {
  if (state.status === 'running' && remaining(state, now) <= 0) {
    return { ...state, status: 'done', endAt: null };
  }
  return state;
}

export function isTimerState(v: unknown): v is TimerState {
  if (!v || typeof v !== 'object') return false;
  const s = v as TimerState;
  return ['idle', 'running', 'paused', 'done'].includes(s.status) && typeof s.durationMs === 'number';
}
