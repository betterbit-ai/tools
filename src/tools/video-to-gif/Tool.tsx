import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Stat } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { FPS_OPTIONS, WIDTH_OPTIONS, formatTimestamp, gifFilename, planGif, type GifSettings } from './logic';
import { convertVideoToGif, VideoDecodeError } from './video';

const SETTINGS_KEY = 'tools:video-to-gif:settings';
const DEFAULT_SETTINGS: GifSettings = { start: 0, end: 3, fps: 10, width: 320 };

function loadSettings(): GifSettings {
  try {
    const stored = JSON.parse(safeStorage.get(SETTINGS_KEY) ?? '{}') as Partial<GifSettings>;
    return {
      start: Number.isFinite(stored.start) ? Math.max(0, stored.start!) : DEFAULT_SETTINGS.start,
      end: Number.isFinite(stored.end) ? Math.max(0, stored.end!) : DEFAULT_SETTINGS.end,
      fps: FPS_OPTIONS.includes(stored.fps as (typeof FPS_OPTIONS)[number]) ? stored.fps! : DEFAULT_SETTINGS.fps,
      width: WIDTH_OPTIONS.includes(stored.width as (typeof WIDTH_OPTIONS)[number])
        ? stored.width!
        : DEFAULT_SETTINGS.width,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function VideoToGif({ locale, ui }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [settings, setSettings] = useState<GifSettings>(loadSettings);
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [notice, setNotice] = useState<{ tone: 'danger' | 'info'; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => () => sourceUrl && URL.revokeObjectURL(sourceUrl), [sourceUrl]);
  useEffect(() => () => result && URL.revokeObjectURL(result.url), [result]);
  useEffect(() => safeStorage.set(SETTINGS_KEY, JSON.stringify(settings)), [settings]);

  const plan = videoInfo ? planGif(videoInfo.width, videoInfo.height, videoInfo.duration, settings) : null;

  const clearResult = () => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  };

  const addFiles = useCallback((files: File[]) => {
    const next = files[0];
    if (!next) return;
    controllerRef.current?.abort();
    clearResult();
    setProgress(null);
    setNotice(null);
    setFile(next);
    setVideoInfo(null);
    setSourceUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(next);
    });
  }, []);

  const clear = () => {
    controllerRef.current?.abort();
    clearResult();
    setProgress(null);
    setNotice(null);
    setFile(null);
    setVideoInfo(null);
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
    const duration = video.duration;
    setVideoInfo({ duration, width: video.videoWidth, height: video.videoHeight });
    setSettings((previous) => ({ ...previous, start: 0, end: Math.min(Math.max(1, Math.min(3, duration)), duration) }));
  };

  const update = <K extends keyof GifSettings>(key: K, value: GifSettings[K]) => {
    clearResult();
    setNotice(null);
    setSettings((previous) => ({ ...previous, [key]: value }));
  };

  const makeGif = async () => {
    const video = videoRef.current;
    if (!video || !file || !plan) {
      setNotice({ tone: 'info', message: ui.noVideo });
      return;
    }
    clearResult();
    setNotice(null);
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setProgress({ current: 0, total: plan.frames });
    try {
      const blob = await convertVideoToGif(video, plan, {
        signal: controller.signal,
        onProgress: (current, total) => setProgress({ current, total }),
      });
      if (controller.signal.aborted) return;
      setResult({ blob, url: URL.createObjectURL(blob), name: gifFilename(file.name) });
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        setNotice({ tone: 'info', message: ui.cancelled });
      } else {
        setNotice({ tone: 'danger', message: error instanceof VideoDecodeError ? ui.unsupported : ui.failed });
      }
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      setProgress(null);
    }
  };

  const pixels = plan ? formatNumber(plan.pixels / 1_000_000, locale, 1) : '—';
  return (
    <Panel>
      {!file || !sourceUrl ? (
        <div class="space-y-3">
          <Dropzone accept="video/*,.mp4,.webm,.mov" onFiles={addFiles} title={ui.dropTitle} hint={ui.dropHint} />
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
            {videoInfo && (
              <div class="grid grid-cols-3 gap-2" aria-live="polite">
                <Stat label={ui.source} value={file.name} />
                <Stat label={ui.duration} value={formatTimestamp(videoInfo.duration)} />
                <Stat label={ui.dimensions} value={`${videoInfo.width}×${videoInfo.height}`} />
              </div>
            )}
            <p class="text-sm text-muted">{ui.privacy}</p>
            {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}
            {progress && (
              <Notice tone="info">
                {ui.progress.replace('{current}', String(progress.current)).replace('{total}', String(progress.total))}
              </Notice>
            )}
            {result && (
              <div class="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-2 p-3">
                <img src={result.url} alt={ui.ready} class="h-16 w-24 rounded-sm border border-line object-cover" />
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-fg">{ui.ready}</p>
                  <p class="text-sm text-muted">{result.name}</p>
                </div>
                <Button onClick={() => downloadBlob(result.blob, result.name)}>{ui.download}</Button>
              </div>
            )}
          </div>

          <div class="space-y-4 border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <Field label={ui.start} hint={ui.rangeHint}>
              <NumberInput
                min={0}
                max={videoInfo?.duration ?? undefined}
                step={0.1}
                value={settings.start}
                onValue={(value) => update('start', typeof value === 'number' ? value : 0)}
              />
            </Field>
            <Field label={ui.end}>
              <NumberInput
                min={0}
                max={videoInfo?.duration ?? undefined}
                step={0.1}
                value={settings.end}
                onValue={(value) => update('end', typeof value === 'number' ? value : 0)}
              />
            </Field>
            <Field label={ui.size}>
              <Segmented
                label={ui.size}
                value={String(settings.width)}
                onValue={(value) => update('width', Number(value))}
                options={[
                  { value: '240', label: ui.sizeSmall },
                  { value: '320', label: ui.sizeMedium },
                  { value: '480', label: ui.sizeLarge },
                ]}
              />
            </Field>
            <Field label={ui.fps}>
              <Segmented
                label={ui.fps}
                value={String(settings.fps)}
                onValue={(value) => update('fps', Number(value))}
                options={[
                  { value: '5', label: ui.fpsLow },
                  { value: '10', label: ui.fpsMedium },
                  { value: '15', label: ui.fpsHigh },
                ]}
              />
            </Field>
            {plan && (
              <Stat
                label={ui.pixels}
                value={ui.pixelsValue.replace('{frames}', String(plan.frames)).replace('{pixels}', pixels)}
                emphasis
              />
            )}
            <div class="flex flex-wrap gap-2 pt-1">
              <Button variant="primary" size="lg" disabled={!plan || !!progress} onClick={makeGif}>
                {progress ? ui.making : ui.make}
              </Button>
              {progress && <Button onClick={() => controllerRef.current?.abort()}>{ui.cancel}</Button>}
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
