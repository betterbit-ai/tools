import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Kbd, Notice, NumberInput, Panel, Segmented, Stat } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { decodeVideoAudio, encodeVideoAudio, VideoAudioError, type DecodedVideoAudio } from './convert';
import {
  estimatedMp3Bytes,
  formatTimestamp,
  MP3_BITRATES,
  mp3Filename,
  normalizeBitrate,
  normalizeTimeRange,
  type Mp3Bitrate,
  type TimeRange,
} from './logic';

const SETTINGS_KEY = 'tools:video-to-mp3:bitrate';

function savedBitrate(): Mp3Bitrate {
  return normalizeBitrate(Number(safeStorage.get(SETTINGS_KEY)));
}

export default function VideoToMp3({ ui }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<DecodedVideoAudio | null>(null);
  const [range, setRange] = useState<TimeRange>({ start: 0, end: 0 });
  const [bitrate, setBitrate] = useState<Mp3Bitrate>(savedBitrate);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'encoding'>('idle');
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [error, setError] = useState<'decode' | 'range' | 'encode' | null>(null);
  const requestRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => safeStorage.set(SETTINGS_KEY, String(bitrate)), [bitrate]);
  useEffect(() => () => result && URL.revokeObjectURL(result.url), [result]);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const clearResult = useCallback(() => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  }, []);

  const chooseFiles = useCallback(
    async (files: File[]) => {
      const next = files[0];
      if (!next) return;
      const request = ++requestRef.current;
      clearResult();
      setError(null);
      setFile(null);
      setDecoded(null);
      setStatus('loading');
      try {
        const audio = await decodeVideoAudio(next);
        if (request !== requestRef.current) return;
        setFile(next);
        setDecoded(audio);
        setRange({ start: 0, end: audio.duration });
        setStatus('ready');
      } catch {
        if (request !== requestRef.current) return;
        setStatus('idle');
        setError('decode');
      }
    },
    [clearResult],
  );

  const clear = useCallback(() => {
    requestRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    clearResult();
    setFile(null);
    setDecoded(null);
    setRange({ start: 0, end: 0 });
    setError(null);
    setStatus('idle');
  }, [clearResult]);

  const cancelEncoding = useCallback(() => {
    requestRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setError(null);
    setStatus('ready');
  }, []);

  const updateRange = useCallback(
    (key: keyof TimeRange, value: number | '') => {
      clearResult();
      setError(null);
      setRange((current) => ({ ...current, [key]: typeof value === 'number' ? value : 0 }));
    },
    [clearResult],
  );

  const convert = useCallback(async () => {
    if (!decoded || !file) return;
    const selected = normalizeTimeRange(decoded.duration, range);
    if (selected.end <= selected.start) {
      setError('range');
      return;
    }
    const request = ++requestRef.current;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    clearResult();
    setError(null);
    setStatus('encoding');
    try {
      const blob = await encodeVideoAudio(decoded, selected, bitrate, { signal: controller.signal });
      if (request !== requestRef.current) return;
      setResult({ blob, url: URL.createObjectURL(blob), name: mp3Filename(file.name) });
      setStatus('ready');
    } catch (caught) {
      if (request !== requestRef.current) return;
      setStatus('ready');
      setError(caught instanceof VideoAudioError && caught.message === 'empty-range' ? 'range' : 'encode');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [bitrate, clearResult, decoded, file, range]);

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
      if (event.key.toLowerCase() === 'e' && status === 'ready' && decoded) {
        event.preventDefault();
        void convert();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [convert, decoded, status]);

  const selected = decoded ? normalizeTimeRange(decoded.duration, range) : null;
  const seconds = selected ? selected.end - selected.start : 0;
  const estimated = estimatedMp3Bytes(seconds, bitrate);

  return (
    <Panel>
      {!decoded || !file ? (
        <div class="space-y-4">
          <Dropzone
            accept="video/*,.mp4,.m4v,.mov,.webm"
            onFiles={(files) => void chooseFiles(files)}
            title={status === 'loading' ? ui.loading : ui.dropTitle}
            hint={ui.dropHint}
          />
          <Notice>{ui.privacy}</Notice>
          {error === 'decode' && <Notice tone="danger">{ui.decodeFailed}</Notice>}
        </div>
      ) : (
        <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div class="min-w-0 space-y-4">
            <div class="rounded-lg border border-line bg-surface-2 p-4">
              <p class="truncate font-medium text-fg">{file.name}</p>
              <div class="mt-3 grid grid-cols-2 gap-3" aria-live="polite">
                <Stat label={ui.sourceDuration} value={formatTimestamp(decoded.duration)} />
                <Stat label={ui.selectedDuration} value={formatTimestamp(seconds)} emphasis />
              </div>
            </div>
            <Notice>{ui.privacy}</Notice>
            {status === 'encoding' && <Notice>{ui.encoding}</Notice>}
            {error && (
              <Notice tone="danger">
                {error === 'range' ? ui.rangeError : error === 'encode' ? ui.encodeFailed : ui.decodeFailed}
              </Notice>
            )}
            {result && (
              <div class="space-y-3 rounded-lg border border-line bg-surface-2 p-4">
                <div>
                  <p class="font-medium text-fg">{ui.ready}</p>
                  <p class="mt-1 text-sm text-muted">{result.name}</p>
                </div>
                <audio controls src={result.url} aria-label={ui.preview} class="w-full" />
                <Button variant="primary" class="w-full" onClick={() => downloadBlob(result.blob, result.name)}>
                  {ui.download}
                </Button>
              </div>
            )}
          </div>

          <div class="space-y-4 border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <Field label={ui.start} hint={ui.rangeHint}>
              <NumberInput
                min={0}
                max={decoded.duration}
                step={0.01}
                value={range.start}
                onValue={(value) => updateRange('start', value)}
                disabled={status === 'encoding'}
              />
            </Field>
            <Field label={ui.end}>
              <NumberInput
                min={0}
                max={decoded.duration}
                step={0.01}
                value={range.end}
                onValue={(value) => updateRange('end', value)}
                disabled={status === 'encoding'}
              />
            </Field>
            <Field label={ui.bitrate} hint={ui.bitrateHint}>
              <Segmented
                label={ui.bitrate}
                value={String(bitrate)}
                onValue={(value) => {
                  clearResult();
                  setError(null);
                  setBitrate(normalizeBitrate(Number(value)));
                }}
                options={MP3_BITRATES.map((value) => ({
                  value: String(value),
                  label: ui.bitrateOption.replace('{value}', String(value)),
                }))}
                disabled={status === 'encoding'}
              />
            </Field>
            <Stat
              label={ui.estimatedSize}
              value={estimated ? ui.estimatedSizeValue.replace('{value}', String(Math.ceil(estimated / 1024))) : '—'}
            />
            <Button
              variant={result ? 'secondary' : 'primary'}
              size="lg"
              class="w-full"
              disabled={status === 'encoding' || !seconds}
              onClick={() => void convert()}
            >
              {status === 'encoding' ? ui.encoding : ui.extract}
            </Button>
            <p class="text-xs text-subtle">
              {ui.shortcut} <Kbd>E</Kbd>
            </p>
            {status === 'encoding' ? (
              <Button variant="ghost" class="w-full" onClick={cancelEncoding}>
                {ui.cancel}
              </Button>
            ) : (
              <Button variant="ghost" class="w-full" onClick={clear}>
                {ui.chooseAnother}
              </Button>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
