import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, Segmented, Stat } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import { compressVideo, VideoCompressionError } from './compress';
import type { UI } from './content';
import {
  compressedFilename,
  estimateOutputBytes,
  planCompression,
  savedPercent,
  type CompressionSettings,
  type Quality,
  type Resolution,
} from './logic';

const SETTINGS_KEY = 'tools:video-compressor:settings';
const DEFAULT_SETTINGS: CompressionSettings = { quality: 'balanced', resolution: '720' };

function loadSettings(): CompressionSettings {
  try {
    const stored = JSON.parse(safeStorage.get(SETTINGS_KEY) ?? '{}') as Partial<CompressionSettings>;
    return {
      quality: stored.quality === 'high' || stored.quality === 'small' ? stored.quality : 'balanced',
      resolution:
        stored.resolution === 'source' || stored.resolution === '1080' || stored.resolution === '480'
          ? stored.resolution
          : '720',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface VideoInfo {
  duration: number;
  width: number;
  height: number;
}

interface Output {
  blob: Blob;
  url: string;
  name: string;
}

export default function VideoCompressor({ locale, ui }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>(loadSettings);
  const [output, setOutput] = useState<Output | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: 'danger' | 'info'; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => () => sourceUrl && URL.revokeObjectURL(sourceUrl), [sourceUrl]);
  useEffect(() => () => output && URL.revokeObjectURL(output.url), [output]);
  useEffect(() => safeStorage.set(SETTINGS_KEY, JSON.stringify(settings)), [settings]);

  const clearOutput = () => {
    setOutput((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  };

  const addFiles = useCallback((files: File[]) => {
    const next = files[0];
    if (!next) return;
    controllerRef.current?.abort();
    clearOutput();
    setProgress(null);
    setNotice(null);
    setFile(next);
    setInfo(null);
    setSourceUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(next);
    });
  }, []);

  const clear = () => {
    controllerRef.current?.abort();
    clearOutput();
    setProgress(null);
    setNotice(null);
    setFile(null);
    setInfo(null);
    setSourceUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  };

  const readMetadata = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || !video.videoWidth || !video.videoHeight) {
      setNotice({ tone: 'danger', message: ui.unsupported });
      return;
    }
    setInfo({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
  };

  const update = <K extends keyof CompressionSettings>(key: K, value: CompressionSettings[K]) => {
    clearOutput();
    setNotice(null);
    setSettings((previous) => ({ ...previous, [key]: value }));
  };

  const makeCompressed = async () => {
    const video = videoRef.current;
    if (!video || !file || !info) {
      setNotice({ tone: 'info', message: ui.noVideo });
      return;
    }
    clearOutput();
    setNotice(null);
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setProgress(0);
    try {
      const result = await compressVideo(video, planCompression(info.width, info.height, settings), {
        signal: controller.signal,
        onProgress: setProgress,
      });
      if (controller.signal.aborted) return;
      setOutput({ blob: result.blob, url: URL.createObjectURL(result.blob), name: compressedFilename(file.name) });
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        setNotice({ tone: 'info', message: ui.cancelled });
      } else {
        setNotice({ tone: 'danger', message: error instanceof VideoCompressionError ? ui.unsupported : ui.failed });
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      setProgress(null);
    }
  };

  const plan = info ? planCompression(info.width, info.height, settings) : null;
  const estimate = info && plan ? estimateOutputBytes(info.duration, plan) : null;
  const saving = file && output ? savedPercent(file.size, output.blob.size) : null;

  return (
    <Panel>
      {!file || !sourceUrl ? (
        <div class="space-y-3">
          <Dropzone accept="video/*,.mp4,.webm,.mov,.m4v" onFiles={addFiles} title={ui.dropTitle} hint={ui.dropHint} />
          <p class="text-sm text-muted">{ui.privacy}</p>
        </div>
      ) : (
        <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div class="min-w-0 space-y-4">
            <video
              ref={videoRef}
              src={sourceUrl}
              controls
              muted
              playsInline
              aria-label={ui.preview}
              onLoadedMetadata={readMetadata}
              onError={() => setNotice({ tone: 'danger', message: ui.unsupported })}
              class="aspect-video w-full rounded-lg border border-line bg-surface-2"
            />
            {info && (
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
                <Stat label={ui.source} value={formatBytes(file.size, locale)} />
                <Stat label={ui.duration} value={`${formatNumber(info.duration, locale, 1)} ${ui.seconds}`} />
                <Stat label={ui.dimensions} value={`${info.width}×${info.height}`} />
                <Stat label={ui.output} value={plan ? `${plan.width}×${plan.height}` : ui.notAvailable} />
              </div>
            )}
            <p class="text-sm text-muted">{ui.privacy}</p>
            {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}
            {progress !== null && (
              <Notice tone="info">{ui.progress.replace('{percent}', formatNumber(progress * 100, locale, 0))}</Notice>
            )}
            {output && (
              <div class="space-y-3 rounded-lg border border-line bg-surface-2 p-3" aria-live="polite">
                <div class="flex flex-wrap items-center gap-3">
                  <video
                    src={output.url}
                    controls
                    playsInline
                    aria-label={ui.resultPreview}
                    class="h-16 w-28 rounded-sm border border-line"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-fg">{ui.ready}</p>
                    <p class="truncate text-sm text-muted">{output.name}</p>
                  </div>
                  <Button onClick={() => downloadBlob(output.blob, output.name)}>{ui.download}</Button>
                </div>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Stat label={ui.originalSize} value={formatBytes(file.size, locale)} />
                  <Stat label={ui.compressedSize} value={formatBytes(output.blob.size, locale)} />
                  <Stat
                    label={ui.change}
                    value={
                      saving === null
                        ? ui.notAvailable
                        : saving >= 0
                          ? ui.smaller.replace('{percent}', String(saving))
                          : ui.larger.replace('{percent}', String(Math.abs(saving)))
                    }
                    emphasis
                  />
                </div>
              </div>
            )}
          </div>

          <div class="space-y-4 border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <Field label={ui.quality} hint={ui.qualityHint}>
              <Segmented<Quality>
                label={ui.quality}
                value={settings.quality}
                disabled={progress !== null}
                onValue={(value) => update('quality', value)}
                options={[
                  { value: 'high', label: ui.qualityHigh },
                  { value: 'balanced', label: ui.qualityBalanced },
                  { value: 'small', label: ui.qualitySmall },
                ]}
              />
            </Field>
            <Field label={ui.resolution} hint={ui.resolutionHint}>
              <Segmented<Resolution>
                label={ui.resolution}
                value={settings.resolution}
                disabled={progress !== null}
                onValue={(value) => update('resolution', value)}
                options={[
                  { value: 'source', label: ui.resolutionSource },
                  { value: '1080', label: ui.resolution1080 },
                  { value: '720', label: ui.resolution720 },
                  { value: '480', label: ui.resolution480 },
                ]}
              />
            </Field>
            {plan && estimate !== null && <Stat label={ui.estimate} value={formatBytes(estimate, locale)} emphasis />}
            <p class="text-xs leading-5 text-subtle">{ui.foreground}</p>
            <div class="flex flex-wrap gap-2 pt-1">
              <Button variant="primary" size="lg" disabled={!info || progress !== null} onClick={makeCompressed}>
                {progress !== null ? ui.compressing : ui.compress}
              </Button>
              {progress !== null && <Button onClick={() => controllerRef.current?.abort()}>{ui.cancel}</Button>}
              <Button variant="ghost" onClick={clear}>
                {ui.clear}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
