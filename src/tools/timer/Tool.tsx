import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Kbd, Notice, NumberInput, Panel, Toggle, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  addTime,
  formatClock,
  idle,
  isTimerState,
  MAX_DURATION_MS,
  pause,
  remaining,
  settle,
  splitMs,
  start,
  toMs,
  type TimerState,
} from './logic';

const STATE_KEY = 'tools:timer:state';
const SOUND_KEY = 'tools:timer:sound';
const PRESET_MINUTES = [1, 3, 5, 10, 15, 25, 30, 60];
const ALARM_SECONDS = 30;
type AudioIssue = 'restored' | 'unavailable' | 'blocked' | null;

export default function Timer({ ui, preset }: ToolProps<UI>) {
  const presetMinutes = typeof preset?.minutes === 'number' ? preset.minutes : 5;
  const [state, setState] = useState<TimerState>(() => idle(toMs(0, presetMinutes, 0)));
  const [now, setNow] = useState(() => Date.now());
  const [sound, setSound] = useState(true);
  const [alarming, setAlarming] = useState(false);
  const [restored, setRestored] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [audioIssue, setAudioIssue] = useState<AudioIssue>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const alarmTimer = useRef<number | null>(null);
  const baseTitle = useRef('');
  const soundRef = useRef(sound);

  soundRef.current = sound;

  // Restore a running/paused timer after reload. Preset pages start fresh unless a timer is active.
  useEffect(() => {
    baseTitle.current = document.title;
    const soundEnabled = safeStorage.get(SOUND_KEY) !== 'off';
    try {
      const saved = JSON.parse(safeStorage.get(STATE_KEY) ?? 'null');
      if (isTimerState(saved) && (saved.status === 'running' || saved.status === 'paused')) {
        const t = Date.now();
        setState(settle(saved, t));
        setNow(t);
        if (soundEnabled) setAudioIssue('restored');
      }
    } catch {
      /* ignore corrupt state */
    }
    setSound(soundEnabled);
    setRestored(true);
    return () => {
      if (baseTitle.current) document.title = baseTitle.current;
      if (audio.current) void audio.current.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (!restored) return;
    safeStorage.set(STATE_KEY, JSON.stringify(state));
  }, [restored, state]);

  // Tick while running.
  useEffect(() => {
    if (state.status !== 'running') return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState((s) => settle(s, t));
    }, 200);
    return () => clearInterval(id);
  }, [state.status]);

  const stopAlarm = useCallback(() => {
    if (alarmTimer.current) clearInterval(alarmTimer.current);
    alarmTimer.current = null;
    setAlarming(false);
  }, []);

  // Fire alarm on completion.
  useEffect(() => {
    if (state.status !== 'done') return;
    setAlarming(true);
    if (!soundRef.current) return;
    const context = audio.current;
    if (!context || context.state !== 'running') {
      setAudioIssue(typeof window.AudioContext === 'undefined' ? 'unavailable' : 'blocked');
      return;
    }
    let count = 0;
    if (!beep(context)) {
      setAudioIssue('blocked');
      return;
    }
    alarmTimer.current = window.setInterval(() => {
      count++;
      if (count >= ALARM_SECONDS) return stopAlarm();
      if (context.state !== 'running' || !beep(context)) {
        setAudioIssue('blocked');
        stopAlarm();
      }
    }, 1000);
    return () => {
      if (alarmTimer.current) clearInterval(alarmTimer.current);
    };
  }, [state.status, stopAlarm]);

  const left = remaining(state, now);
  const clock = formatClock(left);

  // Tab title shows the countdown so it's visible from other tabs.
  useEffect(() => {
    if (!baseTitle.current) return;
    if (state.status === 'running' || state.status === 'paused') document.title = `${clock} · ${baseTitle.current}`;
    else if (state.status === 'done') document.title = `⏰ ${ui.timesUp} · ${baseTitle.current}`;
    else document.title = baseTitle.current;
  }, [clock, state.status, ui.timesUp]);

  const unlockAudio = useCallback(async (): Promise<AudioContext | null> => {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      setAudioIssue('unavailable');
      return null;
    }
    try {
      const context = (audio.current ??= new AudioContextConstructor());
      await context.resume();
      if (context.state !== 'running') {
        setAudioIssue('blocked');
        return null;
      }
      setAudioIssue(null);
      return context;
    } catch {
      setAudioIssue('blocked');
      return null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (soundRef.current) void unlockAudio();
    stopAlarm();
    const t = Date.now();
    setNow(t);
    setState((s) =>
      s.status === 'running' ? pause(s, t) : s.status === 'done' ? start(idle(s.durationMs), t) : start(s, t),
    );
  }, [stopAlarm, unlockAudio]);

  const reset = useCallback(() => {
    stopAlarm();
    setState((s) => idle(s.durationMs));
  }, [stopAlarm]);

  const setDuration = (ms: number) => {
    stopAlarm();
    setState(idle(ms));
  };

  const plusMinute = () => {
    if (sound) void unlockAudio();
    stopAlarm();
    const t = Date.now();
    setNow(t);
    setState((s) => addTime(s, 60_000, t));
  };

  const fullscreen = useCallback(async () => {
    const el = panelRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (el.requestFullscreen) await el.requestFullscreen();
      else setFullscreenError(true);
    } catch {
      setFullscreenError(true);
    }
  }, []);

  const testSound = async () => {
    const context = await unlockAudio();
    if (context && !beep(context)) setAudioIssue('blocked');
  };

  // Keyboard shortcuts (ignored while typing in inputs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'r' || e.key === 'R') reset();
      else if (e.key === 'f' || e.key === 'F') fullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, reset, fullscreen]);

  const editing = state.status === 'idle';
  const parts = splitMs(state.durationMs);
  const progress = state.durationMs ? 1 - left / state.durationMs : 0;

  return (
    <Panel class="overflow-hidden">
      <div
        ref={panelRef}
        class={cx(
          'flex flex-col items-center rounded-lg bg-surface py-6 transition-colors',
          '[&:fullscreen]:justify-center [&:fullscreen]:bg-bg',
          alarming && 'bg-danger-soft',
        )}
      >
        <div
          role="timer"
          aria-live="off"
          aria-label={clock}
          class={cx(
            'tabular font-semibold tracking-tight leading-none text-[clamp(4rem,18vw,10rem)] [:fullscreen_&]:text-[min(28vw,40vh)]',
            alarming ? 'text-danger animate-pulse' : state.status === 'paused' ? 'text-muted' : 'text-fg',
          )}
        >
          {clock}
        </div>

        <div class="mt-6 h-1.5 w-full max-w-md rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
          <div class="h-full bg-accent transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
        </div>

        {alarming && (
          <p class="mt-4 text-lg font-medium text-danger" role="alert">
            {ui.timesUp}
          </p>
        )}

        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={toggle} class="min-w-32">
            {state.status === 'running'
              ? ui.pause
              : state.status === 'paused'
                ? ui.resume
                : state.status === 'done'
                  ? ui.restart
                  : ui.start}
          </Button>
          <Button size="lg" onClick={reset} disabled={state.status === 'idle'}>
            {ui.reset}
          </Button>
          <Button size="lg" onClick={plusMinute} disabled={state.durationMs >= MAX_DURATION_MS}>
            {ui.plusMinute}
          </Button>
          <Button size="lg" variant="ghost" onClick={fullscreen} aria-label={ui.fullscreen}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
            <span class="hidden sm:inline">{ui.fullscreen}</span>
          </Button>
        </div>

        {fullscreenError && <Notice tone="danger">{ui.fullscreenUnavailable}</Notice>}
      </div>

      {audioIssue && (
        <div class="mt-4">
          <Notice tone={audioIssue === 'restored' ? 'info' : 'danger'}>
            {audioIssue === 'restored'
              ? ui.restoredSound
              : audioIssue === 'unavailable'
                ? ui.soundUnavailable
                : ui.soundBlocked}
          </Notice>
        </div>
      )}

      <div class="mt-6 border-t border-line pt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p class="text-sm font-medium text-fg mb-2">{ui.presets}</p>
          <div class="flex flex-wrap gap-2">
            {PRESET_MINUTES.map((m) => (
              <Button
                key={m}
                size="sm"
                onClick={() => setDuration(toMs(0, m, 0))}
                class={cx(state.durationMs === toMs(0, m, 0) && editing && 'border-accent text-accent')}
              >
                {ui.minutesShort.replace('{n}', String(m))}
              </Button>
            ))}
          </div>
        </div>
        <fieldset disabled={!editing} class="disabled:opacity-60">
          <legend class="text-sm font-medium text-fg mb-2">{ui.custom}</legend>
          <div class="flex gap-2">
            {(['h', 'm', 's'] as const).map((unit) => (
              <label key={unit} class="w-20">
                <span class="block text-xs text-muted mb-1">{ui[unit]}</span>
                <NumberInput
                  value={parts[unit]}
                  min={0}
                  max={unit === 'h' ? 99 : 59}
                  step={1}
                  onValue={(v) => {
                    const next = { ...parts, [unit]: v === '' ? 0 : v };
                    setDuration(toMs(next.h, next.m, next.s));
                  }}
                />
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <Toggle
          checked={sound}
          onChecked={(v) => {
            setSound(v);
            safeStorage.set(SOUND_KEY, v ? 'on' : 'off');
            if (v) void unlockAudio();
            else {
              setAudioIssue(null);
              stopAlarm();
            }
          }}
          label={ui.sound}
        />
        <Button size="sm" onClick={testSound} disabled={!sound}>
          {ui.testSound}
        </Button>
        <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            <Kbd>Space</Kbd> {ui.keyStart}
          </span>
          <span>
            <Kbd>R</Kbd> {ui.reset}
          </span>
          <span>
            <Kbd>F</Kbd> {ui.fullscreen}
          </span>
        </span>
      </div>
    </Panel>
  );
}

/** Short two-tone beep via Web Audio — no audio files to download. */
function beep(ctx: AudioContext): boolean {
  try {
    const t = ctx.currentTime;
    for (const [offset, freq] of [
      [0, 880],
      [0.18, 880],
      [0.36, 1175],
    ] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, t + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 0.16);
    }
    return true;
  } catch {
    return false;
  }
}
