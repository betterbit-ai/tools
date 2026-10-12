import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, NumberInput, Panel, Segmented, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_SETTINGS,
  MAX_BPM,
  MIN_BPM,
  clampBpm,
  clampVolume,
  secondsPerBeat,
  settingsFromUnknown,
  tapTempo,
  type MetronomeSettings,
} from './logic';

const SETTINGS_KEY = 'tools:metronome:settings';
const TAP_GAP_MS = 2_000;
const LOOK_AHEAD_SECONDS = 0.1;
const SCHEDULER_INTERVAL_MS = 25;

interface Scheduler {
  beatIndex: number;
  intervalId: number | null;
  nextNoteTime: number;
}

export default function Metronome({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<MetronomeSettings>(DEFAULT_SETTINGS);
  const [running, setRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const scheduler = useRef<Scheduler | null>(null);
  const settingsRef = useRef(settings);
  const taps = useRef<number[]>([]);
  const startGeneration = useRef(0);
  const startPending = useRef(false);

  settingsRef.current = settings;

  useEffect(() => {
    try {
      setSettings(settingsFromUnknown(JSON.parse(safeStorage.get(SETTINGS_KEY) ?? 'null')));
    } catch {
      // Keep the useful default if storage is unavailable or corrupt.
    }
  }, []);

  useEffect(() => {
    safeStorage.set(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const stop = useCallback(() => {
    startGeneration.current += 1;
    startPending.current = false;
    const active = scheduler.current;
    if (active) {
      if (active.intervalId !== null) clearInterval(active.intervalId);
      scheduler.current = null;
    }
    setRunning(false);
    setCurrentBeat(0);
  }, []);

  const scheduleClick = useCallback((ctx: AudioContext, when: number, accent: boolean, volume: number) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const peak = Math.max(0.0001, (volume / 100) * (accent ? 0.28 : 0.2));
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(accent ? 1_320 : 880, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(when);
    oscillator.stop(when + 0.05);
  }, []);

  const start = useCallback(async () => {
    if (scheduler.current || startPending.current) return;
    const startToken = ++startGeneration.current;
    startPending.current = true;
    setAudioError(false);
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      startPending.current = false;
      setAudioError(true);
      return;
    }

    try {
      const ctx = (audio.current ??= new AudioContextConstructor());
      await ctx.resume();
      if (startToken !== startGeneration.current) return;
      const active: Scheduler = {
        beatIndex: 0,
        intervalId: null,
        nextNoteTime: ctx.currentTime + 0.05,
      };
      scheduler.current = active;
      startPending.current = false;
      setRunning(true);

      const tick = () => {
        const now = ctx.currentTime;
        while (active.nextNoteTime < now + LOOK_AHEAD_SECONDS) {
          const current = settingsRef.current;
          const beat = (active.beatIndex % current.beatsPerBar) + 1;
          scheduleClick(ctx, active.nextNoteTime, beat === 1, current.volume);
          window.setTimeout(
            () => {
              if (scheduler.current === active) setCurrentBeat(beat);
            },
            Math.max(0, (active.nextNoteTime - now) * 1_000),
          );
          active.nextNoteTime += secondsPerBeat(current.bpm);
          active.beatIndex += 1;
        }
      };
      tick();
      active.intervalId = window.setInterval(tick, SCHEDULER_INTERVAL_MS);
    } catch {
      startPending.current = false;
      stop();
      setAudioError(true);
    }
  }, [scheduleClick, stop]);

  const toggle = useCallback(() => {
    if (running) stop();
    else void start();
  }, [running, start, stop]);

  const updateSettings = (next: Partial<MetronomeSettings>) => {
    setSettings((previous) => ({
      bpm: clampBpm(next.bpm ?? previous.bpm),
      beatsPerBar: next.beatsPerBar ?? previous.beatsPerBar,
      volume: clampVolume(next.volume ?? previous.volume),
    }));
  };

  const tap = useCallback(() => {
    const now = Date.now();
    const previous = taps.current;
    const next = previous.length && now - previous.at(-1)! > TAP_GAP_MS ? [now] : [...previous, now].slice(-8);
    taps.current = next;
    setTapCount(next.length);
    const bpm = tapTempo(next);
    if (bpm !== null) updateSettings({ bpm });
  }, []);

  const reset = () => {
    stop();
    taps.current = [];
    setTapCount(0);
    setSettings(DEFAULT_SETTINGS);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.code === 'Space') {
        event.preventDefault();
        toggle();
      } else if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        tap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tap, toggle]);

  useEffect(() => stop, [stop]);

  const beatOptions = [
    { value: '2', label: ui.twoFour },
    { value: '3', label: ui.threeFour },
    { value: '4', label: ui.fourFour },
    { value: '6', label: ui.sixEight },
  ];

  return (
    <Panel class="overflow-hidden">
      <div class="flex flex-col items-center rounded-lg bg-surface py-6">
        <p class="text-sm font-medium text-muted">{running ? ui.playing : ui.ready}</p>
        <div class="mt-2 flex items-baseline gap-2">
          <output class="tabular text-[clamp(4rem,18vw,8rem)] font-semibold leading-none tracking-tight text-fg">
            {settings.bpm}
          </output>
          <span class="text-lg font-medium text-muted">{ui.bpm}</span>
        </div>

        <div
          class="mt-6 flex flex-wrap justify-center gap-2"
          aria-label={ui.beatOf
            .replace('{current}', String(currentBeat || 1))
            .replace('{total}', String(settings.beatsPerBar))}
          aria-live="off"
        >
          {Array.from({ length: settings.beatsPerBar }, (_, index) => {
            const beat = index + 1;
            return (
              <span
                key={beat}
                class={cx(
                  'flex size-9 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                  currentBeat === beat
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-line bg-surface-2 text-muted',
                )}
              >
                {beat}
              </span>
            );
          })}
        </div>

        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={toggle} class="min-w-32">
            {running ? ui.stop : ui.start}
          </Button>
          <Button size="lg" onClick={tap}>
            {ui.tap}
          </Button>
          <Button size="lg" onClick={reset}>
            {ui.reset}
          </Button>
        </div>
        <p class="mt-3 text-xs text-subtle" aria-live="polite">
          {ui.tapHint.replace('{n}', String(tapCount))}
        </p>
      </div>

      {audioError && (
        <div class="mt-4">
          <Notice tone="danger">{ui.audioUnavailable}</Notice>
        </div>
      )}

      <div class="mt-6 grid gap-5 border-t border-line pt-6 md:grid-cols-2">
        <Field label={ui.tempo} hint={ui.tempoHint}>
          <div class="flex gap-2">
            <Button size="md" aria-label={ui.decreaseTempo} onClick={() => updateSettings({ bpm: settings.bpm - 1 })}>
              −
            </Button>
            <NumberInput
              value={settings.bpm}
              min={MIN_BPM}
              max={MAX_BPM}
              step={1}
              aria-label={ui.tempo}
              onValue={(value) => updateSettings({ bpm: value === '' ? MIN_BPM : value })}
            />
            <Button size="md" aria-label={ui.increaseTempo} onClick={() => updateSettings({ bpm: settings.bpm + 1 })}>
              +
            </Button>
          </div>
        </Field>

        <Field label={ui.volume} hint={ui.volumeHint}>
          <NumberInput
            value={settings.volume}
            min={0}
            max={100}
            step={1}
            aria-label={ui.volume}
            onValue={(value) => updateSettings({ volume: value === '' ? 0 : value })}
          />
        </Field>

        <div class="md:col-span-2">
          <p class="mb-1.5 text-sm font-medium text-fg">{ui.timeSignature}</p>
          <Segmented
            label={ui.timeSignature}
            value={String(settings.beatsPerBar)}
            onValue={(value) => updateSettings({ beatsPerBar: Number(value) })}
            options={beatOptions}
          />
          <p class="mt-1 text-xs text-subtle">{ui.timeSignatureHint}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
        <span>
          <Kbd>Space</Kbd> {running ? ui.stop : ui.start}
        </span>
        <span>
          <Kbd>T</Kbd> {ui.tap}
        </span>
      </div>
    </Panel>
  );
}
