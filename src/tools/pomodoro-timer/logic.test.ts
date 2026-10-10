import { describe, expect, it } from 'vitest';
import {
  MAX_MINUTES,
  addTask,
  choosePhase,
  clampSettings,
  countToday,
  formatClock,
  idle,
  isPomodoroState,
  nextPhase,
  normalizeTask,
  pause,
  remaining,
  settle,
  start,
  updateSettings,
} from './logic';

describe('Pomodoro timing', () => {
  it('uses an absolute end time and preserves paused time', () => {
    const running = start(idle(), 1_000);
    expect(remaining(running, 61_000)).toBe(24 * 60_000);
    const paused = pause(running, 61_000);
    expect(remaining(paused, 999_999)).toBe(24 * 60_000);
  });

  it('alternates focus, short breaks and a long break after the configured round', () => {
    let state = updateSettings(idle(), { focusMinutes: 1, shortBreakMinutes: 1, longBreakMinutes: 2, rounds: 2 });
    state = settle(start(state, 0), 60_000);
    expect(state.phase).toBe('shortBreak');
    state = settle(start(state, 60_000), 120_000);
    expect(state.phase).toBe('focus');
    state = settle(start(state, 120_000), 180_000);
    expect(state.phase).toBe('longBreak');
    expect(state.sessions).toHaveLength(2);
    expect(nextPhase('focus', 4, 4)).toBe('longBreak');
  });

  it('stores a completed focus record with its selected task but not breaks', () => {
    let state = addTask(idle(), 'one', '  한국어 계획 🧠  ');
    state = updateSettings(state, { focusMinutes: 1 });
    state = settle(start(state, 0), 60_000);
    expect(state.sessions[0]).toMatchObject({ task: '한국어 계획 🧠', durationMs: 60_000 });
    state = choosePhase(state, 'shortBreak');
    expect(settle(start(state, 60_000), 6 * 60_000).sessions).toHaveLength(1);
  });
});

describe('Pomodoro settings and tasks', () => {
  it('clamps settings at the supported boundaries', () => {
    expect(clampSettings({ focusMinutes: 0, shortBreakMinutes: 999, rounds: 99 })).toMatchObject({
      focusMinutes: 1,
      shortBreakMinutes: MAX_MINUTES,
      rounds: 12,
    });
  });

  it('normalizes empty, unicode and very long task text', () => {
    expect(normalizeTask('  여러\n\t공백 😀  ')).toBe('여러 공백 😀');
    expect(normalizeTask('')).toBe('');
    expect([...normalizeTask('가'.repeat(200))]).toHaveLength(120);
  });

  it('counts only records from the local calendar day', () => {
    const now = new Date(2026, 9, 11, 12).getTime();
    expect(
      countToday(
        [
          { id: 1, task: '', durationMs: 60_000, completedAt: now },
          { id: 2, task: '', durationMs: 60_000, completedAt: now - 86_400_000 },
        ],
        now,
      ),
    ).toBe(1);
  });

  it('formats boundary values and rejects malformed saved state', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(1)).toBe('00:01');
    expect(formatClock(65_000)).toBe('01:05');
    expect(isPomodoroState(start(idle(), 123))).toBe(true);
    expect(isPomodoroState({ ...idle(), status: 'running', endAt: null })).toBe(false);
  });
});
