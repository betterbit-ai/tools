import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zip } from 'fflate';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Select, cx } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { compressAtQuality, compressToTarget, readDimensions, type CompressResult } from './compress';
import {
  isAnimatedGif,
  outputName,
  outputType,
  supportsQuality,
  toBytes,
  type CompressMode,
  type FormatChoice,
  type SizeUnit,
} from './logic';

interface Item {
  id: number;
  file: File;
  width: number;
  height: number;
  preview: string;
  animatedGif?: boolean;
  result?: {
    blob: Blob;
    url: string;
    width: number;
    height: number;
    name: string;
    achieved: boolean;
    keptOriginal?: boolean;
    key: string;
  };
  error?: { kind: 'unreadable' | 'processing'; key?: string };
  busy?: boolean;
}

interface WorkProgress {
  file: string;
  current: number;
  total: number;
  attempt: number;
  maximum: number;
}

let nextId = 1;
const MAX_BATCH_SIZE = 50;

export default function ImageCompressor({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<CompressMode>('size');
  const [targetValue, setTargetValue] = useState<number | ''>(500);
  const [targetUnit, setTargetUnit] = useState<SizeUnit>('KB');
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<FormatChoice>('original');
  const [notice, setNotice] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState<WorkProgress | null>(null);
  const runId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const addFiles = useCallback(
    async (files: File[]) => {
      setPaused(false);
      const accepted = files.slice(0, Math.max(0, MAX_BATCH_SIZE - itemsRef.current.length));
      if (accepted.length < files.length) setNotice(ui.batchLimit.replace('{n}', String(MAX_BATCH_SIZE)));
      if (!accepted.length) return;

      const added: Item[] = [];
      for (const file of accepted) {
        try {
          const dims = await readDimensions(file);
          // Canvas only ever draws a GIF's first frame, so flag animated ones instead of
          // silently dropping the rest of the frames when the file re-encodes.
          const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name);
          const animatedGif = isGif && isAnimatedGif(new Uint8Array(await file.arrayBuffer()));
          added.push({ id: nextId++, file, ...dims, animatedGif, preview: URL.createObjectURL(file) });
        } catch {
          added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: { kind: 'unreadable' } });
        }
      }
      setItems((prev) => [...prev, ...added]);
    },
    [ui.batchLimit],
  );

  // Re-encode whenever settings or the file list change (debounced, sequential, cancellable).
  const fileKey = items.map((i) => i.id).join(',');
  const settingsKey = JSON.stringify([mode, format, quality, targetValue, targetUnit]);
  const targetIsValid = targetValue !== '' && Number.isFinite(targetValue) && targetValue > 0;
  useEffect(() => {
    const id = ++runId.current;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setProgress(null);
    if (paused || (mode === 'size' && !targetIsValid)) {
      setItems((prev) => prev.map((item) => (item.busy ? { ...item, busy: false } : item)));
      return () => controller.abort();
    }
    const timeout = setTimeout(async () => {
      const pending = itemsRef.current.filter(
        (item) =>
          item.error?.kind !== 'unreadable' && item.result?.key !== settingsKey && item.error?.key !== settingsKey,
      );
      for (let index = 0; index < pending.length; index++) {
        const item = pending[index];
        if (runId.current !== id || controller.signal.aborted) return;
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, busy: true, error: undefined } : p)));
        try {
          const mime = outputType(format, item.file.type);
          let out: CompressResult;
          let achieved = true;
          const onProgress = ({ attempt, maximum }: { attempt: number; maximum: number }) => {
            if (runId.current === id) {
              setProgress({ file: item.file.name, current: index + 1, total: pending.length, attempt, maximum });
            }
          };
          if (mode === 'size') {
            const target = toBytes(targetValue === '' ? 500 : targetValue, targetUnit);
            const outcome = await compressToTarget(item.file, mime, target, {
              signal: controller.signal,
              onProgress,
            });
            out = outcome.result;
            achieved = outcome.achieved;
          } else {
            out = await compressAtQuality(item.file, mime, quality / 100, {
              signal: controller.signal,
              onProgress,
            });
          }
          if (runId.current !== id) return;
          const result = {
            blob: out.blob,
            url: URL.createObjectURL(out.blob),
            width: out.width,
            height: out.height,
            name: outputName(item.file.name, mime),
            achieved,
            keptOriginal: out.keptOriginal,
            key: settingsKey,
          };
          setItems((prev) =>
            prev.map((p) => {
              if (p.id !== item.id) return p;
              if (p.result) URL.revokeObjectURL(p.result.url);
              return { ...p, result, busy: false };
            }),
          );
        } catch (error) {
          if (runId.current !== id) return;
          if (error instanceof DOMException && error.name === 'AbortError') {
            setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, busy: false } : p)));
            return;
          }
          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id ? { ...p, error: { kind: 'processing', key: settingsKey }, busy: false } : p,
            ),
          );
        }
      }
      if (runId.current === id) {
        setProgress(null);
        abortRef.current = null;
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [fileKey, mode, format, paused, quality, settingsKey, targetIsValid, targetUnit, targetValue]);

  useEffect(
    () => () => {
      runId.current++;
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.preview);
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
    },
    [],
  );

  const remove = (id: number) =>
    setItems((prev) => {
      runId.current++;
      const gone = prev.find((p) => p.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
        if (gone.result) URL.revokeObjectURL(gone.result.url);
      }
      return prev.filter((p) => p.id !== id);
    });

  const clear = () => {
    runId.current++;
    abortRef.current?.abort();
    for (const p of items) {
      URL.revokeObjectURL(p.preview);
      if (p.result) URL.revokeObjectURL(p.result.url);
    }
    setItems([]);
    setNotice(null);
    setPaused(false);
    setProgress(null);
  };

  const cancel = () => {
    runId.current++;
    abortRef.current?.abort();
    setItems((prev) => prev.map((item) => (item.busy ? { ...item, busy: false } : item)));
    setProgress(null);
    setPaused(true);
  };

  const resume = () => setPaused(false);

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
      // Images are already compressed. fflate's asynchronous API avoids blocking
      // the page while it builds the archive.
      const archive = await makeZip(files);
      downloadBlob(new Blob([archive as BlobPart], { type: 'application/zip' }), 'compressed-images.zip');
    } catch {
      setNotice(ui.zipFailed);
    } finally {
      setZipping(false);
    }
  };

  const totalBefore = ready.reduce((s, i) => s + i.file.size, 0);
  const totalAfter = ready.reduce((s, i) => s + i.result!.blob.size, 0);
  const showQuality =
    items.length === 0 ||
    (format === 'original'
      ? items.some((item) => supportsQuality(outputType(format, item.file.type)))
      : supportsQuality(format));

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

          {items.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
              {items.map((item) => {
                const stale = item.result?.key !== settingsKey;
                return (
                  <li key={item.id} class="flex items-center gap-3 p-3">
                    <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {item.preview && <img src={item.preview} alt="" class="size-full object-cover" />}
                    </div>
                    <div class="min-w-0 flex-1 text-sm">
                      <p class="truncate font-medium text-fg">{item.file.name}</p>
                      {item.error ? (
                        <p class="text-danger">
                          {item.error.kind === 'unreadable' ? ui.unsupported : ui.processFailed}
                        </p>
                      ) : (
                        <>
                          <p class="tabular text-muted" aria-live="polite">
                            {formatBytes(item.file.size, locale)}
                            {item.result && (
                              <>
                                {' → '}
                                <span class="text-fg">{formatBytes(item.result.blob.size, locale)}</span>
                                <SizeDelta before={item.file.size} after={item.result.blob.size} locale={locale} />
                              </>
                            )}
                          </p>
                          {item.busy && <p class="text-xs text-muted">{ui.processing}</p>}
                          {item.result?.keptOriginal && <p class="text-xs text-muted">{ui.originalKept}</p>}
                          {item.result && item.result.blob.size > item.file.size && (
                            <p class="text-xs text-warning">{ui.outputLarger}</p>
                          )}
                          {item.result && !item.result.achieved && (
                            <p class="text-xs text-danger">{ui.targetNotReached}</p>
                          )}
                          {item.animatedGif && <p class="text-xs text-warning">{ui.animatedGifWarning}</p>}
                        </>
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
              <Button variant="primary" size="lg" disabled={ready.length === 0 || zipping} onClick={downloadAll}>
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

          {progress && (
            <div class="mt-4 flex flex-wrap items-center gap-3" aria-live="polite">
              <Notice>
                {ui.progress
                  .replace('{current}', String(progress.current))
                  .replace('{total}', String(progress.total))
                  .replace('{attempt}', String(progress.attempt))
                  .replace('{maximum}', String(progress.maximum))
                  .replace('{file}', progress.file)}
              </Notice>
              <Button variant="danger" onClick={cancel}>
                {ui.cancel}
              </Button>
            </div>
          )}

          {paused && (
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <Notice>{ui.cancelled}</Notice>
              <Button onClick={resume}>{ui.retry}</Button>
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
            value={mode}
            onValue={(value) => {
              setPaused(false);
              setMode(value);
            }}
            options={[
              { value: 'size', label: ui.modeSize },
              { value: 'quality', label: ui.modeQuality },
            ]}
          />

          {mode === 'size' ? (
            <>
              <Field label={ui.targetSize} hint={ui.targetSizeHint}>
                <div class="grid grid-cols-[1fr_90px] gap-2">
                  <NumberInput
                    value={targetValue}
                    min={1}
                    max={50000}
                    onValue={(value) => {
                      setPaused(false);
                      setTargetValue(value);
                    }}
                  />
                  <Select<SizeUnit>
                    value={targetUnit}
                    onValue={(value) => {
                      setPaused(false);
                      setTargetUnit(value);
                    }}
                    options={[
                      { value: 'KB', label: 'KB' },
                      { value: 'MB', label: 'MB' },
                    ]}
                  />
                </div>
              </Field>
              {!targetIsValid && <Notice tone="danger">{ui.targetInvalid}</Notice>}
            </>
          ) : showQuality ? (
            <Field label={`${ui.quality}: ${quality}`} hint={ui.qualityHint}>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onInput={(e) => {
                  setPaused(false);
                  setQuality(Number((e.currentTarget as HTMLInputElement).value));
                }}
                class="w-full accent-[var(--accent)]"
              />
            </Field>
          ) : (
            <Notice>{ui.pngNoQuality}</Notice>
          )}

          <div class="border-t border-line pt-5">
            <Field label={ui.format} hint={ui.formatHint}>
              <Select<FormatChoice>
                value={format}
                onValue={(value) => {
                  setPaused(false);
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
          </div>
        </div>
      </div>
    </Panel>
  );
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
