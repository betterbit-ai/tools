/** Pure Pomodoro state and task helpers. Time is based on an absolute end time. */

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  rounds: 4,
};
export const MAX_MINUTES = 180;
export const MAX_ROUNDS = 12;
export const MAX_TASK_LENGTH = 120;
export const MAX_SESSIONS = 100;

export type Phase = 'focus' | 'shortBreak' | 'longBreak';
export type PomodoroStatus = 'idle' | 'running' | 'paused';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  rounds: number;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export interface SessionRecord {
  id: number;
  task: string;
  completedAt: number;
  durationMs: number;
}

export interface PomodoroState {
  status: PomodoroStatus;
  phase: Phase;
  endAt: number | null;
  pausedRemainingMs: number | null;
  completedFocus: number;
  tasks: Task[];
  selectedTaskId: string | null;
  sessions: SessionRecord[];
  lastCompletedPhase: Phase | null;
  settings: PomodoroSettings;
}

export function clampSettings(input: Partial<PomodoroSettings>): PomodoroSettings {
  const minute = (value: number | undefined, fallback: number) =>
    Math.max(1, Math.min(MAX_MINUTES, Math.round(Number.isFinite(value) ? (value as number) : fallback)));
  return {
    focusMinutes: minute(input.focusMinutes, DEFAULT_SETTINGS.focusMinutes),
    shortBreakMinutes: minute(input.shortBreakMinutes, DEFAULT_SETTINGS.shortBreakMinutes),
    longBreakMinutes: minute(input.longBreakMinutes, DEFAULT_SETTINGS.longBreakMinutes),
    rounds: Math.max(1, Math.min(MAX_ROUNDS, Math.round(Number.isFinite(input.rounds) ? (input.rounds as number) : 4))),
  };
}

export function idle(settings: PomodoroSettings = DEFAULT_SETTINGS): PomodoroState {
  return {
    status: 'idle',
    phase: 'focus',
    endAt: null,
    pausedRemainingMs: null,
    completedFocus: 0,
    tasks: [],
    selectedTaskId: null,
    sessions: [],
    lastCompletedPhase: null,
    settings: clampSettings(settings),
  };
}

export function phaseDurationMs(phase: Phase, settings: PomodoroSettings): number {
  const minutes =
    phase === 'focus'
      ? settings.focusMinutes
      : phase === 'shortBreak'
        ? settings.shortBreakMinutes
        : settings.longBreakMinutes;
  return minutes * 60_000;
}

export function remaining(state: PomodoroState, now: number): number {
  if (state.status === 'paused')
    return Math.max(0, state.pausedRemainingMs ?? phaseDurationMs(state.phase, state.settings));
  if (state.status === 'running') return Math.max(0, (state.endAt ?? now) - now);
  return phaseDurationMs(state.phase, state.settings);
}

export function formatClock(ms: number): string {
  const seconds = Math.ceil(Math.max(0, ms) / 1_000);
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function start(state: PomodoroState, now: number): PomodoroState {
  if (state.status === 'running') return state;
  return {
    ...state,
    status: 'running',
    endAt: now + remaining(state, now),
    pausedRemainingMs: null,
    lastCompletedPhase: null,
  };
}

export function pause(state: PomodoroState, now: number): PomodoroState {
  if (state.status !== 'running') return state;
  return { ...state, status: 'paused', endAt: null, pausedRemainingMs: remaining(state, now) };
}

export function reset(state: PomodoroState): PomodoroState {
  return { ...state, status: 'idle', endAt: null, pausedRemainingMs: null, lastCompletedPhase: null };
}

export function choosePhase(state: PomodoroState, phase: Phase): PomodoroState {
  return { ...state, phase, status: 'idle', endAt: null, pausedRemainingMs: null, lastCompletedPhase: null };
}

export function updateSettings(state: PomodoroState, settings: Partial<PomodoroSettings>): PomodoroState {
  return { ...reset(state), settings: clampSettings({ ...state.settings, ...settings }) };
}

export function nextPhase(phase: Phase, completedFocus: number, rounds: number): Phase {
  if (phase !== 'focus') return 'focus';
  return completedFocus % rounds === 0 ? 'longBreak' : 'shortBreak';
}

/** Finish the current interval and prepare the following one without counting display ticks. */
export function settle(state: PomodoroState, now: number): PomodoroState {
  if (state.status !== 'running' || remaining(state, now) > 0) return state;
  const finished = state.phase;
  const completedFocus = state.completedFocus + (finished === 'focus' ? 1 : 0);
  const task = state.tasks.find((entry) => entry.id === state.selectedTaskId)?.title ?? '';
  const record: SessionRecord | null =
    finished === 'focus'
      ? { id: now, task, completedAt: now, durationMs: phaseDurationMs('focus', state.settings) }
      : null;
  return {
    ...state,
    status: 'idle',
    phase: nextPhase(finished, completedFocus, state.settings.rounds),
    endAt: null,
    pausedRemainingMs: null,
    completedFocus,
    sessions: record ? [...state.sessions, record].slice(-MAX_SESSIONS) : state.sessions,
    lastCompletedPhase: finished,
  };
}

export function skip(state: PomodoroState): PomodoroState {
  return {
    ...state,
    status: 'idle',
    phase: nextPhase(state.phase, state.completedFocus, state.settings.rounds),
    endAt: null,
    pausedRemainingMs: null,
    lastCompletedPhase: null,
  };
}

export function normalizeTask(value: string): string {
  return value.trim().replace(/\s+/gu, ' ').slice(0, MAX_TASK_LENGTH);
}

export function addTask(state: PomodoroState, id: string, title: string): PomodoroState {
  const normalized = normalizeTask(title);
  if (!normalized || state.tasks.some((task) => task.id === id)) return state;
  const task = { id, title: normalized, done: false };
  return { ...state, tasks: [...state.tasks, task], selectedTaskId: state.selectedTaskId ?? id };
}

export function toggleTask(state: PomodoroState, id: string): PomodoroState {
  return { ...state, tasks: state.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)) };
}

export function removeTask(state: PomodoroState, id: string): PomodoroState {
  const tasks = state.tasks.filter((task) => task.id !== id);
  return {
    ...state,
    tasks,
    selectedTaskId: state.selectedTaskId === id ? (tasks[0]?.id ?? null) : state.selectedTaskId,
  };
}

export function selectTask(state: PomodoroState, id: string | null): PomodoroState {
  return { ...state, selectedTaskId: id && state.tasks.some((task) => task.id === id) ? id : null };
}

export function countToday(sessions: SessionRecord[], now: number): number {
  const day = new Date(now).toDateString();
  return sessions.filter((session) => new Date(session.completedAt).toDateString() === day).length;
}

export function isPomodoroState(value: unknown): value is PomodoroState {
  if (!value || typeof value !== 'object') return false;
  const state = value as PomodoroState;
  if (
    !['idle', 'running', 'paused'].includes(state.status) ||
    !['focus', 'shortBreak', 'longBreak'].includes(state.phase)
  )
    return false;
  if (!state.settings || JSON.stringify(clampSettings(state.settings)) !== JSON.stringify(state.settings)) return false;
  if (state.status === 'running' ? !Number.isFinite(state.endAt) : state.endAt !== null) return false;
  if (
    state.status === 'paused'
      ? !Number.isFinite(state.pausedRemainingMs) || state.pausedRemainingMs! < 0
      : state.pausedRemainingMs !== null
  )
    return false;
  return (
    Number.isInteger(state.completedFocus) &&
    state.completedFocus >= 0 &&
    Array.isArray(state.tasks) &&
    state.tasks.every(
      (task) =>
        task &&
        typeof task.id === 'string' &&
        normalizeTask(task.title) === task.title &&
        typeof task.done === 'boolean',
    ) &&
    Array.isArray(state.sessions) &&
    state.sessions.length <= MAX_SESSIONS &&
    state.sessions.every(
      (session) =>
        session &&
        Number.isFinite(session.id) &&
        typeof session.task === 'string' &&
        Number.isFinite(session.completedAt) &&
        Number.isFinite(session.durationMs) &&
        session.durationMs > 0,
    ) &&
    (state.selectedTaskId === null || state.tasks.some((task) => task.id === state.selectedTaskId)) &&
    (state.lastCompletedPhase === null || ['focus', 'shortBreak', 'longBreak'].includes(state.lastCompletedPhase))
  );
}
