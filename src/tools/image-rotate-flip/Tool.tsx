import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zip } from 'fflate';
import { Button, Dropzone, Field, Notice, Panel, Segmented, Select, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage, yieldToBrowser } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  isCurrentResult,
  outputName,
  outputType,
  supportsQuality,
  transformKey,
  type FormatChoice,
  type Rotation,
  type TransformOptions,
} from './logic';
import { ImageDecodeError, OutputFormatError, rotateImage, type RotateProgress } from './rotate';

interface Item {
  id: number;
  file: File;
  width?: number;
  height?: number;
  result?: { blob: Blob; url: string; name: string; width: number; height: number; key: string };
  error?: { kind: 'unreadable' | 'format' | 'processing'; key?: string };
  busy?: boolean;
}

interface WorkProgress {
  current: number;
  total: number;
  file: string;
  rotate: RotateProgress;
}

interface SavedOptions {
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
  format: FormatChoice;
  quality: number;
}

const STORAGE_KEY = 'tools:image-rotate-flip:settings';
const MAX_BATCH_SIZE = 50;
let nextId = 1;

function loadSettings(): SavedOptions {
  const defaults: SavedOptions = {
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    format: 'original',
    quality: 92,
  };
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? '{}') as Partial<SavedOptions>;
    return {
      rotation: [0, 90, 180, 270].includes(saved.rotation ?? -1) ? (saved.rotation as Rotation) : defaults.rotation,
      flipHorizontal: saved.flipHorizontal === true,
      flipVertical: saved.flipVertical === true,
      format: ['original', 'image/jpeg', 'image/png', 'image/webp'].includes(saved.format ?? '')
        ? (saved.format as FormatChoice)
        : defaults.format,
      quality:
        typeof saved.quality === 'number' && saved.quality >= 10 && saved.quality <= 100
          ? saved.quality
          : defaults.quality,
    };
  } catch {
    return defaults;
  }
}

export default function ImageRotateFlip({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [saved] = useState(loadSettings);
  const [rotation, setRotation] = useState<Rotation>(saved.rotation);
  const [flipHorizontal, setFlipHorizontal] = useState(saved.flipHorizontal);
  const [flipVertical, setFlipVertical] = useState(saved.flipVertical);
  const [format, setFormat] = useState<FormatChoice>(saved.format);
  const [quality, setQuality] = useState(saved.quality);
  const [notice, setNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<WorkProgress | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [zipping, setZipping] = useState(false);
  const runId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const opts: TransformOptions = { rotation, flipHorizontal, flipVertical };
  const settingsKey = transformKey(opts, format, quality);
  const settingsKeyRef = useRef(settingsKey);
  settingsKeyRef.current = settingsKey;
  useEffect(() => {
    safeStorage.set(STORAGE_KEY, JSON.stringify({ ...opts, format, quality }));
  }, [rotation, flipHorizontal, flipVertical, format, quality]);

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted = files.slice(0, Math.max(0, MAX_BATCH_SIZE - itemsRef.current.length));
      if (accepted.length < files.length) setNotice(ui.batchLimit.replace('{n}', String(MAX_BATCH_SIZE)));
      if (!accepted.length) return;
      setCancelled(false);
      setItems((previous) => [...previous, ...accepted.map((file) => ({ id: nextId++, file }))]);
    },
    [ui.batchLimit],
  );

  const fileKey = items.map((item) => item.id).join(',');
  useEffect(() => {
    const id = ++runId.current;
    if (cancelled) return;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setItems((previous) => previous.map((item) => (item.busy ? { ...item, busy: false } : item)));
    const timeout = setTimeout(async () => {
      const pending = itemsRef.current.filter(
        (item) =>
          item.error?.kind !== 'unreadable' && item.error?.key !== settingsKey && item.result?.key !== settingsKey,
      );
      try {
        for (const [index, item] of pending.entries()) {
          if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== settingsKey) return;
          setItems((previous) => previous.map((p) => (p.id === item.id ? { ...p, busy: true, error: undefined } : p)));
          try {
            const mime = outputType(format, item.file.type, item.file.name);
            const transformed = await rotateImage(item.file, opts, mime, quality / 100, {
              signal: controller.signal,
              onProgress: (rotate) => {
                if (runId.current === id && settingsKeyRef.current === settingsKey) {
                  setProgress({ current: index + 1, total: pending.length, file: item.file.name, rotate });
                }
              },
            });
            if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== settingsKey) return;
            const result = {
              blob: transformed.blob,
              url: URL.createObjectURL(transformed.blob),
              name: outputName(item.file.name, mime),
              width: transformed.width,
              height: transformed.height,
              key: settingsKey,
            };
            setItems((previous) =>
              previous.map((p) => {
                if (p.id !== item.id) return p;
                if (p.result) URL.revokeObjectURL(p.result.url);
                return {
                  ...p,
                  width: transformed.sourceWidth,
                  height: transformed.sourceHeight,
                  result,
                  error: undefined,
                  busy: false,
                };
              }),
            );
          } catch (cause) {
            if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== settingsKey) return;
            const kind =
              cause instanceof ImageDecodeError
                ? 'unreadable'
                : cause instanceof OutputFormatError
                  ? 'format'
                  : 'processing';
            setItems((previous) =>
              previous.map((p) =>
                p.id === item.id
                  ? {
                      ...p,
                      error: { kind, key: kind === 'unreadable' ? undefined : settingsKey },
                      busy: false,
                    }
                  : p,
              ),
            );
          }
          await yieldToBrowser();
        }
      } finally {
        if (runId.current === id && settingsKeyRef.current === settingsKey) setProgress(null);
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
      if (abortRef.current === controller) abortRef.current = null;
    };
  }, [fileKey, rotation, flipHorizontal, flipVertical, format, quality, settingsKey, retryToken, cancelled]);

  useEffect(
    () => () => {
      runId.current += 1;
      abortRef.current?.abort();
      for (const item of itemsRef.current) {
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
    },
    [],
  );

  const remove = (id: number) => {
    runId.current += 1;
    abortRef.current?.abort();
    setProgress(null);
    setCancelled(false);
    setItems((previous) => {
      const gone = previous.find((item) => item.id === id);
      if (gone?.result) URL.revokeObjectURL(gone.result.url);
      return previous.filter((item) => item.id !== id);
    });
  };

  const clear = () => {
    runId.current += 1;
    abortRef.current?.abort();
    for (const item of items) {
      if (item.result) URL.revokeObjectURL(item.result.url);
    }
    setItems([]);
    setNotice(null);
    setProgress(null);
    setCancelled(false);
  };

  const cancel = () => {
    runId.current += 1;
    abortRef.current?.abort();
    setProgress(null);
    setCancelled(true);
    setItems((previous) => previous.map((item) => (item.busy ? { ...item, busy: false } : item)));
  };

  const resume = () => {
    setCancelled(false);
    setRetryToken((value) => value + 1);
  };

  const ready = items.filter(
    (item) => item.result && !item.busy && !item.error && isCurrentResult(item.result.key, settingsKey),
  );
  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, ready[0].result!.name);
    setZipping(true);
    const files: Record<string, Uint8Array> = {};
    try {
      for (const item of ready) {
        let name = item.result!.name;
        for (let n = 2; files[name]; n++) name = item.result!.name.replace(/(\.[^.]+)$/, `-${n}$1`);
        files[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
        await yieldToBrowser();
      }
      const archive = await makeZip(files);
      downloadBlob(new Blob([archive as BlobPart], { type: 'application/zip' }), 'rotated-images.zip');
    } catch {
      setNotice(ui.zipFailed);
    } finally {
      setZipping(false);
    }
  };

  const showQuality =
    format === 'original'
      ? items.length === 0 || items.some((item) => supportsQuality(outputType(format, item.file.type, item.file.name)))
      : supportsQuality(format);
  const changeRotation = (value: Rotation) => {
    setCancelled(false);
    setRotation(value);
  };
  const rotateBy = (amount: number) => {
    setCancelled(false);
    setRotation((current) => ((current + amount + 360) % 360) as Rotation);
  };
  const progressLabel = progress
    ? ui.progress
        .replace('{current}', String(progress.current))
        .replace('{total}', String(progress.total))
        .replace('{file}', progress.file)
        .replace('{stage}', progressStage(progress.rotate, ui))
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="image/*"
            multiple
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={items.length > 0}
          />
          {notice && (
            <div class="mt-4">
              <Notice tone="danger">{notice}</Notice>
            </div>
          )}
          {progress && (
            <div class="mt-4 flex flex-wrap items-center gap-3" aria-live="polite">
              <div class="min-w-0 flex-1">
                <Notice>{progressLabel}</Notice>
              </div>
              <Button variant="danger" onClick={cancel}>
                {ui.cancel}
              </Button>
            </div>
          )}
          {cancelled && (
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <div class="min-w-0 flex-1">
                <Notice>{ui.cancelled}</Notice>
              </div>
              <Button variant="secondary" onClick={resume}>
                {ui.resume}
              </Button>
            </div>
          )}
          {items.length === 0 && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}
          {items.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
              {items.map((item) => (
                <li class="flex items-center gap-3 p-3" key={item.id}>
                  <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                    {item.result?.url && <img src={item.result.url} alt="" class="size-full object-cover" />}
                  </div>
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{item.file.name}</p>
                    {item.error ? (
                      <p class="text-danger" role="alert">
                        {item.error.kind === 'unreadable'
                          ? ui.unreadable
                          : item.error.kind === 'format'
                            ? ui.formatFailed
                            : ui.processingFailed}
                      </p>
                    ) : (
                      <p class="tabular text-muted" aria-live="polite">
                        {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
                        {formatBytes(item.file.size, locale)}
                        {item.result && (
                          <>
                            {' '}
                            {' → '}
                            <span class="text-fg">
                              {item.result.width}×{item.result.height} · {formatBytes(item.result.blob.size, locale)}
                            </span>
                          </>
                        )}
                        {(item.busy || (!cancelled && !isCurrentResult(item.result?.key, settingsKey))) && (
                          <> · {ui.processing}</>
                        )}
                      </p>
                    )}
                  </div>
                  {item.result && isCurrentResult(item.result.key, settingsKey) && !item.error && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={item.busy}
                      onClick={() => downloadBlob(item.result!.blob, item.result!.name)}
                    >
                      {item.busy ? ui.processing : ui.download}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" aria-label={ui.remove} onClick={() => remove(item.id)}>
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={ready.length === 0 || zipping || Boolean(progress)}
                onClick={downloadAll}
              >
                {zipping
                  ? ui.preparingDownload
                  : ready.length > 1
                    ? ui.downloadAll.replace('{n}', String(ready.length))
                    : ui.download}
              </Button>
              <Button variant="ghost" onClick={clear}>
                {ui.clear}
              </Button>
            </div>
          )}
        </div>
        <div class="flex flex-col gap-5">
          <Field label={ui.rotateLabel} hint={ui.rotateHint}>
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => rotateBy(-90)}>
                {ui.rotateLeft}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => rotateBy(90)}>
                {ui.rotateRight}
              </Button>
            </div>
          </Field>
          <Segmented
            label={ui.rotationValue}
            value={String(rotation)}
            onValue={(value) => changeRotation(Number(value) as Rotation)}
            options={[
              { value: '0', label: ui.rotation0 },
              { value: '90', label: ui.rotation90 },
              { value: '180', label: ui.rotation180 },
              { value: '270', label: ui.rotation270 },
            ]}
          />
          <div class="flex flex-col gap-3 border-t border-line pt-5">
            <Toggle
              checked={flipHorizontal}
              onChecked={(value) => {
                setCancelled(false);
                setFlipHorizontal(value);
              }}
              label={ui.flipHorizontal}
            />
            <Toggle
              checked={flipVertical}
              onChecked={(value) => {
                setCancelled(false);
                setFlipVertical(value);
              }}
              label={ui.flipVertical}
            />
          </div>
          <div class="flex flex-col gap-5 border-t border-line pt-5">
            <Field label={ui.format}>
              <Select<FormatChoice>
                value={format}
                onValue={(value) => {
                  setCancelled(false);
                  setFormat(value);
                }}
                options={[
                  { value: 'original', label: ui.formatOriginal },
                  { value: 'image/jpeg', label: ui.formatJpeg },
                  { value: 'image/png', label: ui.formatPng },
                  { value: 'image/webp', label: ui.formatWebp },
                ]}
              />
            </Field>
            {showQuality && (
              <Field label={`${ui.quality}: ${quality}`} hint={ui.qualityHint}>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onInput={(event) => {
                    setCancelled(false);
                    setQuality(Number((event.currentTarget as HTMLInputElement).value));
                  }}
                  class="w-full accent-[var(--accent)]"
                />
              </Field>
            )}
          </div>
          <Notice tone="info">{ui.exifNote}</Notice>
        </div>
      </div>
    </Panel>
  );
}

function progressStage(progress: RotateProgress, ui: UI): string {
  if (progress === 'decoding') return ui.stageDecoding;
  if (progress === 'drawing') return ui.stageDrawing;
  return ui.stageEncoding;
}

function makeZip(files: Record<string, Uint8Array>): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zip(files, { level: 0 }, (error, archive) => {
      if (error) reject(error);
      else resolve(archive);
    });
  });
}
