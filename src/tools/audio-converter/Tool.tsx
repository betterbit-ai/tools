import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, FieldGroup, Notice, Panel, Segmented, Stat } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { AudioConvertError, decodeAudioFile, encodeMp3, type DecodedAudio } from './audio';
import {
  buildWav,
  describeAudio,
  estimateMp3Bytes,
  estimateWavBytes,
  formatDuration,
  outputFilename,
  sizeSavings,
  validateInput,
  MAX_DURATION_SECONDS,
  MP3_BITRATES,
  OUTPUT_SAMPLE_RATE,
  type AudioError,
  type OutputFormat,
} from './logic';

type Status = 'idle' | 'decoding' | 'encoding' | 'ready' | 'error';

interface LoadedFile {
  file: File;
  duration: number;
  channels: number;
  sampleRate: number;
  url: string;
}

function durationError(seconds: number): AudioError | null {
  return seconds > MAX_DURATION_SECONDS ? 'too-long' : null;
}

export default function AudioConverter({ locale, ui }: ToolProps<UI>) {
  const [loaded, setLoaded] = useState<LoadedFile | null>(null);
  const [format, setFormat] = useState<OutputFormat>('mp3');
  const [bitrate, setBitrate] = useState<number>(192);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<AudioError | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const decodedRef = useRef<DecodedAudio | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef('');
  const runRef = useRef(0);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const resetResult = () => {
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const convert = async (audio: DecodedAudio, nextFormat: OutputFormat, nextBitrate: number) => {
    const run = ++runRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('encoding');
    setProgress(0);
    setError(null);
    setCancelled(false);

    try {
      if (nextFormat === 'wav') {
        const bytes = buildWav(audio.channels, audio.sampleRate);
        if (run !== runRef.current) return;
        setResult({ blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/wav' }), size: bytes.length });
      } else {
        const blob = await encodeMp3(audio, nextBitrate, {
          onProgress: (ratio) => {
            if (run === runRef.current) setProgress(ratio);
          },
          signal: controller.signal,
        });
        if (run !== runRef.current) return;
        setResult({ blob, size: blob.size });
      }
      setStatus('ready');
      setProgress(1);
    } catch (caught) {
      if (run !== runRef.current) return;
      if (controller.signal.aborted) {
        setStatus('ready');
        setCancelled(true);
        setResult(null);
        return;
      }
      setStatus('error');
      setError(caught instanceof AudioConvertError ? caught.code : 'encode-failed');
    }
  };

  const loadFile = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    hidePreview();
    setLoaded(null);
    resetResult();
    setCancelled(false);
    decodedRef.current = null;
    abortRef.current?.abort();
    runRef.current += 1;

    const problem = validateInput(file.size);
    if (problem) {
      setStatus('error');
      setError(problem);
      return;
    }

    setStatus('decoding');
    void (async () => {
      try {
        const audio = await decodeAudioFile(file);
        const tooLong = durationError(audio.duration);
        if (tooLong) throw new AudioConvertError(tooLong);
        decodedRef.current = audio;
        const url = URL.createObjectURL(file);
        urlRef.current = url;
        setLoaded({
          file,
          duration: audio.duration,
          channels: audio.channels.length,
          sampleRate: audio.sampleRate,
          url,
        });
        await convert(audio, format, bitrate);
      } catch (caught) {
        setStatus('error');
        setError(caught instanceof AudioConvertError ? caught.code : 'decode-failed');
      }
    })();
  };

  const hidePreview = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = '';
  };

  const changeFile = () => {
    abortRef.current?.abort();
    runRef.current += 1;
    hidePreview();
    setLoaded(null);
    decodedRef.current = null;
    setStatus('idle');
    resetResult();
    setCancelled(false);
  };

  const rebuild = async (nextFormat: OutputFormat, nextBitrate: number) => {
    if (!loaded) return;
    resetResult();
    let audio = decodedRef.current;
    if (!audio) {
      setStatus('decoding');
      try {
        audio = await decodeAudioFile(loaded.file);
        decodedRef.current = audio;
      } catch {
        setStatus('error');
        setError('decode-failed');
        return;
      }
    }
    await convert(audio, nextFormat, nextBitrate);
  };

  const n = (bytes: number) => formatBytes(bytes, locale);
  const busy = status === 'decoding' || status === 'encoding';
  const estimated =
    loaded === null
      ? 0
      : format === 'wav'
        ? estimateWavBytes(loaded.duration, loaded.sampleRate || OUTPUT_SAMPLE_RATE, loaded.channels)
        : estimateMp3Bytes(loaded.duration, bitrate);
  const outputBytes = result?.size ?? estimated;
  const savings = loaded ? sizeSavings(loaded.file.size, outputBytes) : 0;
  const errorText = error
    ? {
        'empty-file': ui.errorEmpty,
        'too-large': ui.errorTooLarge,
        'too-long': ui.errorTooLong,
        'decode-failed': ui.errorDecodeFailed,
        'no-audio': ui.errorNoAudio,
        'encode-failed': ui.errorEncodeFailed,
      }[error]
    : null;

  return (
    <Panel>
      <div class="space-y-5">
        {!loaded && (
          <Dropzone
            accept="audio/*,video/mp4,video/webm,video/quicktime,.mp3,.wav,.m4a,.aac,.ogg,.oga,.opus,.flac,.aiff,.aif,.wma,.mp4,.mov,.webm"
            onFiles={loadFile}
            title={ui.openFile}
            hint={ui.openFileHint}
            compact={status !== 'idle'}
          />
        )}

        {!loaded && status === 'idle' && <p class="text-sm leading-6 text-muted">{ui.dropNote}</p>}

        {status === 'decoding' && <Notice tone="info">{ui.converting}</Notice>}

        {errorText && <Notice tone="danger">{errorText}</Notice>}

        {loaded && (
          <>
            <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-fg">{loaded.file.name}</p>
                <p class="text-xs text-muted">{ui.sourceTitle}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={changeFile}>
                {ui.changeFile}
              </Button>
            </div>

            <audio class="w-full" controls src={loaded.url} aria-label={ui.playerLabel} />

            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
              <Stat label={ui.sourceSize} value={n(loaded.file.size)} />
              <Stat label={ui.duration} value={formatDuration(loaded.duration)} />
              <Stat label={ui.sound} value={describeAudio(loaded.channels, loaded.sampleRate, loaded.duration)} />
              <Stat
                label={ui.savings}
                value={loaded.file.size ? `${savings > 0 ? '−' : '+'}${Math.abs(savings)}%` : '—'}
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <FieldGroup label={ui.formatLabel}>
                <Segmented<OutputFormat>
                  label={ui.formatLabel}
                  value={format}
                  onValue={(next) => {
                    setFormat(next);
                    void rebuild(next, bitrate);
                  }}
                  options={[
                    { value: 'mp3', label: ui.formatMp3 },
                    { value: 'wav', label: ui.formatWav },
                  ]}
                />
              </FieldGroup>
              {format === 'mp3' && (
                <FieldGroup label={ui.bitrateLabel} hint={ui.bitrateHint}>
                  <Segmented<string>
                    label={ui.bitrateLabel}
                    value={String(bitrate)}
                    onValue={(next) => {
                      const value = Number(next);
                      setBitrate(value);
                      void rebuild('mp3', value);
                    }}
                    options={MP3_BITRATES.map((value) => ({ value: String(value), label: `${value}` }))}
                  />
                </FieldGroup>
              )}
            </div>

            <div class="rounded-lg border border-line bg-surface-2 p-4">
              <div class="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-fg">{ui.outputTitle}</p>
                  <p class="mt-1 text-2xl font-semibold tabular text-fg" aria-live="polite">
                    {busy ? ui.converting : n(result?.size ?? estimated)}
                  </p>
                  <p class="text-xs text-muted">
                    {format === 'mp3' ? `MP3 · ${bitrate} kbps · 44.1 kHz` : 'WAV · 16-bit PCM · 44.1 kHz'}
                    {result ? '' : ` · ${ui.outputSize}`}
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  {busy && (
                    <Button variant="ghost" onClick={() => abortRef.current?.abort()}>
                      {ui.cancel}
                    </Button>
                  )}
                  {!busy && (cancelled || status === 'error' || !result) && (
                    <Button onClick={() => void rebuild(format, bitrate)}>{ui.convertAgain}</Button>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!result}
                    onClick={() => {
                      if (!result || !loaded) return;
                      downloadBlob(result.blob, outputFilename(loaded.file.name, format));
                    }}
                  >
                    {ui.download}
                  </Button>
                </div>
              </div>

              {busy && (
                <div
                  class="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface"
                  role="progressbar"
                  aria-label={ui.progressLabel}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                >
                  <div
                    class="h-full rounded-full bg-accent transition-[width]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
              )}
              {cancelled && <p class="mt-3 text-sm text-muted">{ui.cancelled}</p>}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}
