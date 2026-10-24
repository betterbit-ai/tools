import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Kbd, Notice, NumberInput, Panel, Stat } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import type { ToolProps } from '../types';
import { AudioCutterError, loadMp3, makeMp3Clip, type LoadedMp3 } from './audio';
import type { UI } from './content';
import { clipFilename, formatTimestamp, normalizeClipRange, type ClipRange } from './logic';

const RINGTONE_SECONDS = 30;

function drawWaveform(canvas: HTMLCanvasElement, values: number[], range: ClipRange, duration: number): void {
  const width = Math.max(1, canvas.clientWidth);
  const height = Math.max(1, canvas.clientHeight);
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext('2d');
  if (!context) return;
  context.scale(ratio, ratio);
  const style = getComputedStyle(document.documentElement);
  const surface = style.getPropertyValue('--surface-2');
  const muted = style.getPropertyValue('--muted');
  const accent = style.getPropertyValue('--accent');
  const accentSoft = style.getPropertyValue('--accent-soft');
  context.fillStyle = surface;
  context.fillRect(0, 0, width, height);
  const startX = (range.start / duration) * width;
  const endX = (range.end / duration) * width;
  context.fillStyle = accentSoft;
  context.fillRect(startX, 0, Math.max(0, endX - startX), height);
  const columnWidth = width / values.length;
  for (let index = 0; index < values.length; index++) {
    const x = Math.floor(index * columnWidth);
    const peak = Math.max(1, values[index] * height * 0.82);
    const selected = x >= startX && x <= endX;
    context.fillStyle = selected ? accent : muted;
    context.fillRect(x, (height - peak) / 2, Math.max(1, Math.ceil(columnWidth - 1)), peak);
  }
  context.fillStyle = accent;
  context.fillRect(Math.floor(startX), 0, 2, height);
  context.fillRect(Math.floor(endX) - 2, 0, 2, height);
}

export default function AudioCutter({ ui, preset }: ToolProps<UI>) {
  const ringtonePreset = preset?.ringtone === true;
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedMp3 | null>(null);
  const [range, setRange] = useState<ClipRange>({ start: 0, end: 0 });
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<'unsupported' | 'decode' | 'range' | 'playback' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rangeRef = useRef(range);
  rangeRef.current = range;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && loaded) drawWaveform(canvas, loaded.waveform, range, loaded.duration);
  }, [loaded, range]);

  useEffect(() => {
    if (!file) return;
    const source = URL.createObjectURL(file);
    const player = new Audio(source);
    const onTime = () => {
      if (player.currentTime >= rangeRef.current.end) {
        player.pause();
        player.currentTime = rangeRef.current.start;
        setPlaying(false);
      }
    };
    const onEnded = () => setPlaying(false);
    player.addEventListener('timeupdate', onTime);
    player.addEventListener('ended', onEnded);
    audioRef.current = player;
    return () => {
      player.pause();
      player.removeEventListener('timeupdate', onTime);
      player.removeEventListener('ended', onEnded);
      URL.revokeObjectURL(source);
      if (audioRef.current === player) audioRef.current = null;
    };
  }, [file]);

  const updateRange = useCallback(
    (next: ClipRange) => {
      setRange((current) => {
        if (!loaded) return current;
        return normalizeClipRange(loaded.duration, next);
      });
    },
    [loaded],
  );

  const selectRingtone = useCallback(() => {
    if (!loaded) return;
    updateRange({ start: 0, end: Math.min(RINGTONE_SECONDS, loaded.duration) });
  }, [loaded, updateRange]);

  const loadFile = useCallback(
    async (nextFile: File) => {
      setLoading(true);
      setError(null);
      setPlaying(false);
      try {
        const nextLoaded = await loadMp3(nextFile);
        setFile(nextFile);
        setLoaded(nextLoaded);
        setRange({
          start: 0,
          end: ringtonePreset ? Math.min(RINGTONE_SECONDS, nextLoaded.duration) : nextLoaded.duration,
        });
      } catch (loadError) {
        setFile(null);
        setLoaded(null);
        setRange({ start: 0, end: 0 });
        setError(loadError instanceof AudioCutterError ? 'unsupported' : 'decode');
      } finally {
        setLoading(false);
      }
    },
    [ringtonePreset],
  );

  const chooseFiles = useCallback(
    (files: File[]) => {
      if (files[0]) void loadFile(files[0]);
    },
    [loadFile],
  );

  const togglePreview = useCallback(async () => {
    const player = audioRef.current;
    if (!player || !loaded) return;
    if (playing) {
      player.pause();
      setPlaying(false);
      return;
    }
    try {
      player.currentTime = range.start;
      await player.play();
      setPlaying(true);
      setError(null);
    } catch {
      setError('playback');
    }
  }, [loaded, playing, range.start]);

  const download = useCallback(() => {
    if (!loaded || !file || range.end <= range.start) {
      setError('range');
      return;
    }
    try {
      downloadBlob(makeMp3Clip(loaded.bytes, range), clipFilename(file.name));
      setError(null);
    } catch {
      setError('range');
    }
  }, [file, loaded, range]);

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
      if (event.code === 'Space' && loaded) {
        event.preventDefault();
        void togglePreview();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loaded, togglePreview]);

  const waveformClick = (event: MouseEvent) => {
    if (!loaded || !canvasRef.current) return;
    const box = canvasRef.current.getBoundingClientRect();
    const time = Math.min(loaded.duration, Math.max(0, ((event.clientX - box.left) / box.width) * loaded.duration));
    if (Math.abs(time - range.start) <= Math.abs(time - range.end))
      updateRange({ start: Math.min(time, range.end), end: range.end });
    else updateRange({ start: range.start, end: Math.max(range.start, time) });
  };

  const clear = () => {
    audioRef.current?.pause();
    setFile(null);
    setLoaded(null);
    setRange({ start: 0, end: 0 });
    setPlaying(false);
    setError(null);
  };

  return (
    <Panel>
      {!loaded ? (
        <>
          <Dropzone
            accept="audio/mpeg,.mp3"
            onFiles={chooseFiles}
            title={loading ? ui.loading : ui.dropTitle}
            hint={ui.dropHint}
          />
          <div class="mt-4">
            <Notice>{ui.privacy}</Notice>
          </div>
          {error && (
            <div class="mt-4">
              <Notice tone="danger">{error === 'unsupported' ? ui.unsupported : ui.decodeFailed}</Notice>
            </div>
          )}
        </>
      ) : (
        <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div class="min-w-0">
            <p class="mb-2 text-sm font-medium text-fg">{file?.name}</p>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={ui.waveform}
              onClick={waveformClick}
              class="h-40 w-full cursor-crosshair rounded-md border border-line"
            />
            <p class="mt-2 text-xs text-subtle">{ui.waveformHint}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => void togglePreview()}>{playing ? ui.stopPreview : ui.preview}</Button>
              <Button onClick={selectRingtone}>{ui.ringtone}</Button>
              <Button variant="ghost" onClick={clear}>
                {ui.clear}
              </Button>
            </div>
            <p class="mt-3 text-xs text-subtle">
              {ui.shortcutHint} <Kbd>Space</Kbd>
            </p>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3" aria-live="polite">
              <Stat label={ui.sourceDuration} value={formatTimestamp(loaded.duration)} />
              <Stat label={ui.clipDuration} value={formatTimestamp(range.end - range.start)} emphasis />
            </div>
            <Field label={ui.start} hint={ui.timeHint}>
              <NumberInput
                min={0}
                max={loaded.duration}
                step={0.01}
                value={range.start}
                onValue={(value) =>
                  typeof value === 'number' && updateRange({ start: value, end: Math.max(value, range.end) })
                }
              />
            </Field>
            <Field label={ui.end} hint={ui.frameHint}>
              <NumberInput
                min={0}
                max={loaded.duration}
                step={0.01}
                value={range.end}
                onValue={(value) =>
                  typeof value === 'number' && updateRange({ start: Math.min(range.start, value), end: value })
                }
              />
            </Field>
            <Button variant="primary" size="lg" class="w-full" onClick={download} disabled={range.end <= range.start}>
              {ui.download}
            </Button>
            <p class="text-xs text-subtle">{ui.losslessNote}</p>
            {error && (
              <Notice tone="danger">
                {error === 'playback' ? ui.playbackFailed : error === 'range' ? ui.rangeError : ui.decodeFailed}
              </Notice>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
