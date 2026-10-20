import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zip } from 'fflate';
import {
  Button,
  Dropzone,
  Field,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  Select,
  Toggle,
  cx,
} from '../../components/ui';
import { downloadBlob, yieldToBrowser } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  PRESETS,
  outputName,
  outputType,
  supportsQuality,
  type FitMode,
  type FormatChoice,
  type ResizeOptions,
} from './logic';
import { ImageDecodeError, OutputFormatError, resizeImage, type ResizeProgress } from './resize';

interface Item {
  id: number;
  file: File;
  width?: number;
  height?: number;
  /** `key` = settings the result was made with; unchanged items are skipped. */
  result?: { blob: Blob; url: string; width: number; height: number; name: string; key: string };
  error?: { kind: 'unreadable' | 'format' | 'processing'; key?: string };
  busy?: boolean;
}

interface WorkProgress {
  current: number;
  total: number;
  file: string;
  resize: ResizeProgress;
}

let nextId = 1;
const MAX_BATCH_SIZE = 50;

export default function ImageResizer({ locale, ui, preset }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [opts, setOpts] = useState<ResizeOptions>(() => ({
    mode: 'size',
    percent: 50,
    width: typeof preset?.width === 'number' ? preset.width : 1080,
    height: typeof preset?.height === 'number' ? preset.height : '',
    fit: preset?.width && preset?.height ? 'cover' : 'contain',
    noUpscale: false,
  }));
  const [format, setFormat] = useState<FormatChoice>('original');
  const [quality, setQuality] = useState(85);
  const [notice, setNotice] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState<WorkProgress | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const runId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const itemsRef = useRef(items);
  const settingsKey = JSON.stringify([opts, format, quality]);
  const settingsKeyRef = useRef(settingsKey);
  itemsRef.current = items;
  settingsKeyRef.current = settingsKey;

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted = files.slice(0, Math.max(0, MAX_BATCH_SIZE - itemsRef.current.length));
      if (accepted.length < files.length) setNotice(ui.batchLimit.replace('{n}', String(MAX_BATCH_SIZE)));
      if (!accepted.length) return;
      const added = accepted.map((file) => ({ id: nextId++, file }));
      setCancelled(false);
      setItems((prev) => [...prev, ...added]);
    },
    [ui.batchLimit],
  );

  // Re-encode whenever settings or the file list change (debounced, sequential, cancellable).
  const fileKey = items.map((i) => i.id).join(',');
  useEffect(() => {
    const id = ++runId.current;
    if (cancelled) return;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setItems((prev) => prev.map((item) => (item.busy ? { ...item, busy: false } : item)));
    const timeout = setTimeout(async () => {
      const pending = itemsRef.current.filter(
        (item) =>
          item.error?.kind !== 'unreadable' && item.result?.key !== settingsKey && item.error?.key !== settingsKey,
      );
      try {
        for (const [index, item] of pending.entries()) {
          if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== settingsKey) return;
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, busy: true, error: undefined } : p)));
          try {
            const mime = outputType(format, item.file.type, item.file.name);
            const resized = await resizeImage(item.file, opts, mime, quality / 100, {
              signal: controller.signal,
              onProgress: (resize) => {
                if (runId.current === id && settingsKeyRef.current === settingsKey) {
                  setProgress({ current: index + 1, total: pending.length, file: item.file.name, resize });
                }
              },
            });
            if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== settingsKey) return;
            const { blob, plan, sourceWidth, sourceHeight } = resized;
            const result = {
              blob,
              url: URL.createObjectURL(blob),
              width: plan.width,
              height: plan.height,
              name: outputName(item.file.name, mime, plan.width, plan.height),
              key: settingsKey,
            };
            setItems((prev) =>
              prev.map((p) => {
                if (p.id !== item.id) return p;
                if (p.result) URL.revokeObjectURL(p.result.url);
                return { ...p, width: sourceWidth, height: sourceHeight, result, busy: false };
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
            setItems((prev) =>
              prev.map((p) => {
                if (p.id !== item.id) return p;
                return {
                  ...p,
                  error: { kind, key: kind === 'unreadable' ? undefined : settingsKey },
                  busy: false,
                };
              }),
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
  }, [fileKey, opts, format, quality, settingsKey, retryToken, cancelled]);

  useEffect(
    () => () => {
      runId.current++;
      abortRef.current?.abort();
      for (const item of itemsRef.current) {
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
    },
    [],
  );

  const remove = (id: number) => {
    runId.current++;
    abortRef.current?.abort();
    setProgress(null);
    setCancelled(false);
    const gone = itemsRef.current.find((item) => item.id === id);
    if (gone) {
      if (gone.result) URL.revokeObjectURL(gone.result.url);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clear = () => {
    runId.current++;
    abortRef.current?.abort();
    for (const p of items) {
      if (p.result) URL.revokeObjectURL(p.result.url);
    }
    setItems([]);
    setNotice(null);
    setProgress(null);
    setCancelled(false);
  };

  const cancel = () => {
    runId.current++;
    abortRef.current?.abort();
    setProgress(null);
    setCancelled(true);
    setItems((prev) => prev.map((item) => (item.busy ? { ...item, busy: false } : item)));
  };

  const resume = () => {
    setCancelled(false);
    setRetryToken((value) => value + 1);
  };

  const ready = items.filter((i) => i.result?.key === settingsKey && !i.busy && !i.error);
  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, ready[0].result!.name);
    setZipping(true);
    const files: Record<string, Uint8Array> = {};
    try {
      for (const item of ready) {
        let name = item.result!.name;
        for (let n = 2; files[name]; n++) name = item.result!.name.replace(/(\.\w+)$/, `-${n}$1`);
        files[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
      }
      // fflate's asynchronous API moves compression off the UI thread. Images are
      // already compressed, so store them at level 0 for the fastest archive.
      const archive = await makeZip(files);
      downloadBlob(new Blob([archive as BlobPart], { type: 'application/zip' }), 'resized-images.zip');
    } catch {
      setNotice(ui.zipFailed);
    } finally {
      setZipping(false);
    }
  };

  const set = <K extends keyof ResizeOptions>(key: K, value: ResizeOptions[K]) => {
    setCancelled(false);
    setOpts((o) => ({ ...o, [key]: value }));
  };
  const totalBefore = ready.reduce((s, i) => s + i.file.size, 0);
  const totalAfter = ready.reduce((s, i) => s + i.result!.blob.size, 0);
  const showQuality =
    format === 'original'
      ? items.some((item) => supportsQuality(outputType(format, item.file.type, item.file.name)))
      : supportsQuality(format);
  const presetValue = PRESETS.find((p) => p.width === opts.width && p.height === opts.height)?.id ?? '';
  const progressLabel = progress
    ? ui.progress
        .replace('{current}', String(progress.current))
        .replace('{total}', String(progress.total))
        .replace('{file}', progress.file)
        .replace('{stage}', resizeStage(progress.resize, ui))
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Files */}
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

          {items.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
              {items.map((item) => {
                const stale = item.result?.key !== settingsKey;
                return (
                  <li key={item.id} class="flex items-center gap-3 p-3">
                    <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {item.result && <img src={item.result.url} alt="" class="size-full object-cover" />}
                    </div>
                    <div class="min-w-0 flex-1 text-sm">
                      <p class="truncate font-medium text-fg">{item.file.name}</p>
                      {item.error ? (
                        <p class="text-danger">
                          {item.error.kind === 'unreadable'
                            ? ui.unsupported
                            : item.error.kind === 'format'
                              ? ui.formatFailed
                              : ui.processFailed}
                        </p>
                      ) : (
                        <p class="tabular text-muted">
                          {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
                          {formatBytes(item.file.size, locale)}
                          {item.result && (
                            <>
                              {' → '}
                              <span class="text-fg">
                                {item.result.width}×{item.result.height} · {formatBytes(item.result.blob.size, locale)}
                              </span>
                              <SizeDelta before={item.file.size} after={item.result.blob.size} locale={locale} />
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    {item.result && !item.error && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={item.busy || stale}
                        onClick={() => downloadBlob(item.result!.blob, item.result!.name)}
                      >
                        {item.busy || stale ? ui.processing : ui.download}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" aria-label={ui.remove} onClick={() => remove(item.id)}>
                      ✕
                    </Button>
                  </li>
                );
              })}
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
              {ready.length > 0 && (
                <span class="text-sm text-muted tabular">
                  {formatBytes(totalBefore, locale)} → {formatBytes(totalAfter, locale)}
                </span>
              )}
            </div>
          )}

          {items.length === 0 && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}
        </div>

        {/* Settings */}
        <div class="flex flex-col gap-5">
          <Segmented
            label={ui.modeLabel}
            value={opts.mode}
            onValue={(v) => set('mode', v)}
            options={[
              { value: 'size', label: ui.modeSize },
              { value: 'percent', label: ui.modePercent },
            ]}
          />

          {opts.mode === 'size' ? (
            <>
              <Field label={ui.preset}>
                <Select
                  value={presetValue}
                  onValue={(id) => {
                    const p = PRESETS.find((x) => x.id === id);
                    if (p) {
                      setCancelled(false);
                      setOpts((o) => ({ ...o, width: p.width, height: p.height, fit: 'cover' }));
                    }
                  }}
                  options={[
                    { value: '', label: ui.presetCustom },
                    ...PRESETS.map((p) => ({
                      value: p.id,
                      label: `${ui[`preset_${p.id.replace(/-/g, '_')}` as keyof UI]} (${p.width}×${p.height})`,
                    })),
                  ]}
                />
              </Field>
              <div class="grid grid-cols-2 gap-3">
                <Field label={ui.width}>
                  <NumberInput
                    value={opts.width}
                    min={1}
                    max={8192}
                    placeholder={ui.auto}
                    onValue={(v) => set('width', v)}
                  />
                </Field>
                <Field label={ui.height}>
                  <NumberInput
                    value={opts.height}
                    min={1}
                    max={8192}
                    placeholder={ui.auto}
                    onValue={(v) => set('height', v)}
                  />
                </Field>
              </div>
              <p class="-mt-3 text-xs text-subtle">{ui.sizeHint}</p>
              {opts.width !== '' && opts.height !== '' && (
                <Field label={ui.fit}>
                  <Segmented<FitMode>
                    label={ui.fit}
                    value={opts.fit}
                    onValue={(v) => set('fit', v)}
                    options={[
                      { value: 'contain', label: ui.fitContain },
                      { value: 'cover', label: ui.fitCover },
                      { value: 'stretch', label: ui.fitStretch },
                    ]}
                  />
                </Field>
              )}
            </>
          ) : (
            <Field label={`${ui.percent}: ${opts.percent}%`}>
              <input
                type="range"
                min={1}
                max={200}
                value={opts.percent}
                onInput={(e) => set('percent', Number((e.currentTarget as HTMLInputElement).value))}
                class="w-full accent-[var(--accent)]"
              />
            </Field>
          )}

          <Toggle checked={opts.noUpscale} onChecked={(v) => set('noUpscale', v)} label={ui.noUpscale} />

          <div class="border-t border-line pt-5 flex flex-col gap-5">
            <Field label={ui.format} hint={ui.formatHint}>
              <Select<FormatChoice>
                value={format}
                onValue={(value) => {
                  setCancelled(false);
                  setFormat(value);
                }}
                options={[
                  { value: 'original', label: ui.formatOriginal },
                  { value: 'image/jpeg', label: 'JPG' },
                  { value: 'image/png', label: 'PNG' },
                  { value: 'image/webp', label: 'WebP' },
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
                  onInput={(e) => {
                    setCancelled(false);
                    setQuality(Number((e.currentTarget as HTMLInputElement).value));
                  }}
                  class="w-full accent-[var(--accent)]"
                />
              </Field>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function resizeStage(progress: ResizeProgress, ui: UI): string {
  if (progress.stage === 'decoding') return ui.stageDecoding;
  if (progress.stage === 'encoding') return ui.stageEncoding;
  return ui.stageResizing.replace('{current}', String(progress.current)).replace('{total}', String(progress.total));
}

function makeZip(files: Record<string, Uint8Array>): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zip(files, { level: 0 }, (error, archive) => {
      if (error) reject(error);
      else resolve(archive);
    });
  });
}

function SizeDelta(props: { before: number; after: number; locale: ToolProps['locale'] }) {
  const pct = Math.round(((props.after - props.before) / props.before) * 100);
  if (!Number.isFinite(pct) || pct === 0) return null;
  return (
    <span class={cx('ml-1.5 text-xs', pct < 0 ? 'text-success' : 'text-subtle')}>
      {pct > 0 ? '+' : ''}
      {formatNumber(pct, props.locale)}%
    </span>
  );
}
