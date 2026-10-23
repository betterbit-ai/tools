import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, NumberInput, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import {
  DEFAULT_SETTINGS,
  clampVolume,
  formatFrequency,
  settingsFromUnknown,
  type Channel,
  type SpeakerSettings,
} from './logic';
import { getAudioContext, playChannelTone, playSweep, type Playback } from './speaker';
import type { UI } from './content';

const SETTINGS_KEY = 'tools:speaker-test:settings';
type PlaybackMode = Channel | 'sweep' | null;

export default function SpeakerTest({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<SpeakerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<PlaybackMode>(null);
  const [frequency, setFrequency] = useState(20);
  const [audioError, setAudioError] = useState(false);
  const context = useRef<AudioContext | null>(null);
  const playback = useRef<Playback | null>(null);
  const playbackGeneration = useRef(0);

  useEffect(() => {
    try {
      setSettings(settingsFromUnknown(JSON.parse(safeStorage.get(SETTINGS_KEY) ?? 'null')));
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    safeStorage.set(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const stop = useCallback(() => {
    playbackGeneration.current += 1;
    playback.current?.stop();
    playback.current = null;
    setMode(null);
    setFrequency(20);
  }, []);

  useEffect(() => stop, [stop]);

  const startChannel = useCallback(
    async (channel: Channel) => {
      stop();
      const generation = playbackGeneration.current;
      setAudioError(false);
      try {
        context.current = await getAudioContext(context.current);
        if (generation !== playbackGeneration.current) return;
        playback.current = playChannelTone(context.current, settings.volume, channel);
        setMode(channel);
      } catch {
        setAudioError(true);
      }
    },
    [settings.volume, stop],
  );

  const startSweep = useCallback(async () => {
    stop();
    const generation = playbackGeneration.current;
    setAudioError(false);
    try {
      context.current = await getAudioContext(context.current);
      if (generation !== playbackGeneration.current) return;
      setMode('sweep');
      playback.current = playSweep(context.current, settings.volume, settings.sweepSeconds, setFrequency, () => {
        if (generation !== playbackGeneration.current) return;
        playback.current = null;
        setMode(null);
      });
    } catch {
      setAudioError(true);
    }
  }, [settings.sweepSeconds, settings.volume, stop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key === 'l' || event.key === 'L') {
        event.preventDefault();
        void startChannel('left');
      } else if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        void startChannel('center');
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        void startChannel('right');
      } else if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        void startSweep();
      } else if (event.key === 'Escape') {
        stop();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [startChannel, startSweep, stop]);

  const status =
    mode === 'left'
      ? ui.playingLeft
      : mode === 'center'
        ? ui.playingCenter
        : mode === 'right'
          ? ui.playingRight
          : mode === 'sweep'
            ? ui.sweeping
            : ui.ready;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex min-w-0 flex-col gap-5">
          <Notice>{ui.localOnly}</Notice>
          <div>
            <h2 class="text-sm font-medium text-fg">{ui.channelCheck}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">{ui.channelHint}</p>
            <div class="mt-3 grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => void startChannel('left')}>
                {ui.left}
              </Button>
              <Button variant="secondary" onClick={() => void startChannel('center')}>
                {ui.center}
              </Button>
              <Button variant="secondary" onClick={() => void startChannel('right')}>
                {ui.right}
              </Button>
            </div>
          </div>

          <div class="border-t border-line pt-5">
            <h2 class="text-sm font-medium text-fg">{ui.sweep}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">{ui.sweepHint}</p>
            <div class="mt-3 flex flex-wrap items-end gap-3">
              <Field label={ui.duration}>
                <Segmented
                  label={ui.duration}
                  value={String(settings.sweepSeconds)}
                  onValue={(sweepSeconds) =>
                    setSettings((current) => ({ ...current, sweepSeconds: Number(sweepSeconds) }))
                  }
                  options={[10, 20, 40].map((seconds) => ({
                    value: String(seconds),
                    label: `${seconds} ${ui.seconds}`,
                  }))}
                  disabled={mode === 'sweep'}
                />
              </Field>
              <Button variant="primary" onClick={() => void startSweep()}>
                {ui.startSweep}
              </Button>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <Field label={ui.volume} hint={ui.volumeHint}>
            <div class="flex items-center gap-2">
              <NumberInput
                value={settings.volume}
                min={1}
                max={50}
                onValue={(volume) =>
                  setSettings((current) => ({
                    ...current,
                    volume: clampVolume(volume === '' ? DEFAULT_SETTINGS.volume : volume),
                  }))
                }
              />
              <span class="text-sm text-muted">{ui.percent}</span>
            </div>
          </Field>
          <Stat
            label={ui.currentFrequency}
            value={formatFrequency(frequency, ui.hertz, ui.kilohertz)}
            emphasis={mode === 'sweep'}
          />
          <p class="min-h-12 text-sm leading-6 text-muted" aria-live="polite">
            {status}
          </p>
          <Button variant="danger" disabled={mode === null} onClick={stop}>
            {ui.stop}
          </Button>
          {audioError && <Notice tone="danger">{ui.audioUnavailable}</Notice>}
          <Notice>{ui.safety}</Notice>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-subtle">
        <span>
          <Kbd>L / B / R</Kbd> {ui.shortcutChannel}
        </span>
        <span>
          <Kbd>S</Kbd> {ui.shortcutSweep}
        </span>
        <span>
          <Kbd>Esc</Kbd> {ui.shortcutStop}
        </span>
      </div>
    </Panel>
  );
}
