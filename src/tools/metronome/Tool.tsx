import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, NumberInput, Panel, Segmented, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import { MetronomeAudioEngine, supportsMetronomeAudio } from './audio';
import type { UI } from './content';
import {
  DEFAULT_SETTINGS,
  MAX_BPM,
  MIN_BPM,
  clampBpm,
  clampVolume,
  settingsFromUnknown,
  tapTempo,
  type MetronomeSettings,
} from './logic';

const SETTINGS_KEY = 'tools:metronome:settings';
const TAP_GAP_MS = 2_000;
type AudioError = 'unsupported' | 'blocked';

export default function Metronome({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<MetronomeSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [audioError, setAudioError] = useState<AudioError | null>(null);
  const audio = useRef<MetronomeAudioEngine | null>(null);
  const visualFrame = useRef<number | null>(null);
  const runningRef = useRef(false);
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
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    safeStorage.set(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, settingsLoaded]);

  const stop = useCallback(() => {
    startGeneration.current += 1;
    startPending.current = false;
    if (visualFrame.current !== null) cancelAnimationFrame(visualFrame.current);
    visualFrame.current = null;
    audio.current?.stop();
    runningRef.current = false;
    setRunning(false);
    setCurrentBeat(0);
  }, []);

  const start = useCallback(async () => {
    if (runningRef.current || startPending.current) return;
    const startToken = ++startGeneration.current;
    startPending.current = true;
    setAudioError(null);
    if (!supportsMetronomeAudio()) {
      startPending.current = false;
      setAudioError('unsupported');
      return;
    }

    try {
      const engine = (audio.current ??= new MetronomeAudioEngine());
      await engine.start(settingsRef.current);
      if (startToken !== startGeneration.current) {
        engine.stop();
        return;
      }
      startPending.current = false;
      runningRef.current = true;
      setRunning(true);
      const paintBeat = () => {
        setCurrentBeat(engine.currentBeat());
        visualFrame.current = requestAnimationFrame(paintBeat);
      };
      paintBeat();
    } catch {
      startPending.current = false;
      stop();
      setAudioError('blocked');
    }
  }, [stop]);

  const toggle = useCallback(() => {
    if (runningRef.current) stop();
    else void start();
  }, [start, stop]);

  const updateSettings = (next: Partial<MetronomeSettings>) => {
    setSettings((previous) => ({
      bpm: clampBpm(next.bpm ?? previous.bpm),
      beatsPerBar: next.beatsPerBar ?? previous.beatsPerBar,
      volume: clampVolume(next.volume ?? previous.volume),
    }));
  };

  useEffect(() => {
    if (!running) return;
    try {
      audio.current?.update(settings);
    } catch {
      stop();
      setAudioError('blocked');
    }
  }, [running, settings, stop]);

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
        target.closest('input, textarea, select, button, [role="button"], [role="radio"], [contenteditable]') ||
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

  useEffect(
    () => () => {
      stop();
      const engine = audio.current;
      audio.current = null;
      void engine?.destroy();
    },
    [stop],
  );

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
          <Notice tone="danger">{audioError === 'unsupported' ? ui.audioUnsupported : ui.audioBlocked}</Notice>
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
