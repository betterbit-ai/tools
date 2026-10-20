import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, Segmented } from '../../components/ui';
import { downloadBlob, safeStorage, yieldToBrowser } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_PDF_OPTIONS,
  MAX_IMAGE_COUNT,
  computePageLayout,
  normalizePdfOptions,
  pdfOutputName,
  shouldBuildPdf,
  type MarginMode,
  type Orientation,
  type PageSizeMode,
} from './logic';
import {
  ConversionCancelledError,
  ImageDecodeError,
  ImageEncodeError,
  buildPdfOffMainThread,
  encodeToJpeg,
  type EncodeStage,
} from './pdf';

type ItemError = 'unreadable' | 'encoding' | 'processing';

interface Item {
  id: number;
  file: File;
  preview: string;
  width?: number;
  height?: number;
  jpeg?: Uint8Array;
  jpegWidth?: number;
  jpegHeight?: number;
  /** Quality the cached `jpeg` was encoded at — re-encode when this no longer matches `opts.quality`. */
  jpegQuality?: number;
  busy?: boolean;
  error?: ItemError;
}

interface Options {
  pageSize: PageSizeMode;
  orientation: Orientation;
  margin: MarginMode;
  quality: number;
}

interface WorkProgress {
  current: number;
  total: number;
  file: string;
  stage: EncodeStage | 'assembling';
}

const STORAGE_KEY = 'tools:image-to-pdf:options';
const SUPPORTED_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp';

function loadOptions(): Options {
  const defaults: Options = { ...DEFAULT_PDF_OPTIONS, quality: 85 };
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return defaults;
  try {
    const parsed: unknown = JSON.parse(raw);
    const quality =
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as { quality?: unknown }).quality === 'number' &&
      Number.isFinite((parsed as { quality: number }).quality)
        ? Math.min(100, Math.max(40, Math.round((parsed as { quality: number }).quality)))
        : defaults.quality;
    return { ...normalizePdfOptions(parsed), quality };
  } catch {
    return defaults;
  }
}

let nextId = 1;

export default function ImageToPdf({ ui, locale }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [opts, setOpts] = useState<Options>(loadOptions);
  const [pdf, setPdf] = useState<{ blob: Blob; url: string; key: string } | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [buildingPdf, setBuildingPdf] = useState(false);
  const [progress, setProgress] = useState<WorkProgress | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [batchNotice, setBatchNotice] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const runId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const itemsRef = useRef(items);
  const pdfRef = useRef(pdf);
  itemsRef.current = items;
  pdfRef.current = pdf;

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(opts)), [opts]);

  const addFiles = useCallback((files: File[]) => {
    const accepted = files.slice(0, Math.max(0, MAX_IMAGE_COUNT - itemsRef.current.length));
    setBatchNotice(accepted.length < files.length);
    if (!accepted.length) return;
    setCancelled(false);
    setItems((prev) => [
      ...prev,
      ...accepted.map((file) => ({ id: nextId++, file, preview: URL.createObjectURL(file) })),
    ]);
  }, []);

  // Encode sequentially to bound peak canvas memory, yield between stages, then assemble in a worker.
  const fileKey = items.map((item) => item.id).join(',');
  const jobKey = JSON.stringify([fileKey, opts]);
  useEffect(() => {
    const id = ++runId.current;
    abortRef.current?.abort();
    if (cancelled || items.length === 0) {
      setBuildingPdf(false);
      setProgress(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setBuildingPdf(true);
    setPdfError(false);

    void (async () => {
      await yieldToBrowser();
      const working = itemsRef.current.slice();

      for (const [index, original] of working.entries()) {
        if (controller.signal.aborted || runId.current !== id) return;
        if (original.error === 'unreadable') continue;
        if (original.jpeg && original.jpegQuality === opts.quality) continue;

        setProgress({ current: index + 1, total: working.length, file: original.file.name, stage: 'decoding' });
        setItems((prev) =>
          prev.map((item) => (item.id === original.id ? { ...item, busy: true, error: undefined } : item)),
        );
        try {
          const encoded = await encodeToJpeg(original.file, opts.quality / 100, {
            signal: controller.signal,
            onProgress: (stage) => {
              if (runId.current === id) {
                setProgress({ current: index + 1, total: working.length, file: original.file.name, stage });
              }
            },
          });
          if (controller.signal.aborted || runId.current !== id) return;
          const completed: Item = {
            ...original,
            width: encoded.sourceWidth,
            height: encoded.sourceHeight,
            jpeg: encoded.bytes,
            jpegWidth: encoded.width,
            jpegHeight: encoded.height,
            jpegQuality: opts.quality,
            busy: false,
            error: undefined,
          };
          working[index] = completed;
          setItems((prev) => prev.map((item) => (item.id === completed.id ? completed : item)));
        } catch (cause) {
          if (cause instanceof ConversionCancelledError || controller.signal.aborted || runId.current !== id) return;
          const error: ItemError =
            cause instanceof ImageDecodeError
              ? 'unreadable'
              : cause instanceof ImageEncodeError
                ? 'encoding'
                : 'processing';
          const failed: Item = {
            ...original,
            jpeg: undefined,
            jpegWidth: undefined,
            jpegHeight: undefined,
            jpegQuality: undefined,
            busy: false,
            error,
          };
          working[index] = failed;
          setItems((prev) => prev.map((item) => (item.id === failed.id ? failed : item)));
        }
        await yieldToBrowser();
      }

      if (controller.signal.aborted || runId.current !== id) return;
      const ready = working.filter((item) => item.jpeg && item.jpegQuality === opts.quality && !item.error);
      const hasPending = working.some((item) => !item.error && (!item.jpeg || item.jpegQuality !== opts.quality));
      const hasFailed = working.some((item) => Boolean(item.error));
      if (!shouldBuildPdf(ready.length, hasPending, hasFailed)) {
        setPdf((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return null;
        });
        return;
      }

      setProgress({ current: working.length, total: working.length, file: '', stage: 'assembling' });
      const pages = working.map((item) => ({
        jpeg: item.jpeg!,
        widthPx: item.jpegWidth!,
        heightPx: item.jpegHeight!,
        layout: computePageLayout(item.width!, item.height!, opts),
      }));
      const bytes = await buildPdfOffMainThread(pages, { signal: controller.signal });
      if (controller.signal.aborted || runId.current !== id) return;
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      setPdf((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return { blob, url: URL.createObjectURL(blob), key: jobKey };
      });
    })()
      .catch((cause) => {
        if (!(cause instanceof ConversionCancelledError) && !controller.signal.aborted && runId.current === id) {
          setPdfError(true);
        }
      })
      .finally(() => {
        if (runId.current === id) {
          setBuildingPdf(false);
          setProgress(null);
          if (abortRef.current === controller) abortRef.current = null;
        }
      });

    return () => controller.abort();
  }, [cancelled, fileKey, jobKey, opts, retryToken, items.length]);

  useEffect(
    () => () => {
      runId.current++;
      abortRef.current?.abort();
      for (const item of itemsRef.current) URL.revokeObjectURL(item.preview);
      if (pdfRef.current) URL.revokeObjectURL(pdfRef.current.url);
    },
    [],
  );

  const remove = (id: number) => {
    runId.current++;
    abortRef.current?.abort();
    setProgress(null);
    setCancelled(false);
    const gone = itemsRef.current.find((item) => item.id === id);
    if (gone) URL.revokeObjectURL(gone.preview);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clear = () => {
    runId.current++;
    abortRef.current?.abort();
    for (const item of itemsRef.current) URL.revokeObjectURL(item.preview);
    setItems([]);
    setPdf((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
    setPdfError(false);
    setProgress(null);
    setBuildingPdf(false);
    setCancelled(false);
    setBatchNotice(false);
  };

  const cancel = () => {
    runId.current++;
    abortRef.current?.abort();
    setProgress(null);
    setBuildingPdf(false);
    setCancelled(true);
    setItems((prev) => prev.map((item) => (item.busy ? { ...item, busy: false } : item)));
  };

  const resume = () => {
    setCancelled(false);
    setRetryToken((value) => value + 1);
  };

  const move = (id: number, dir: -1 | 1) =>
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      const destination = index + dir;
      if (index < 0 || destination < 0 || destination >= prev.length) return prev;
      const next = prev.slice();
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });

  const reorder = (draggedId: number, overId: number) => {
    if (draggedId === overId) return;
    setItems((prev) => {
      const from = prev.findIndex((item) => item.id === draggedId);
      const to = prev.findIndex((item) => item.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const set = <K extends keyof Options>(key: K, value: Options[K]) => {
    setCancelled(false);
    setOpts((current) => ({ ...current, [key]: value }));
  };
  const ready = items.filter((item) => item.jpeg && item.jpegQuality === opts.quality && !item.error);
  const hasFailures = items.some((item) => Boolean(item.error));
  const outputName = items.length === 1 ? pdfOutputName(items[0].file.name) : 'images.pdf';
  const pdfIsCurrent = pdf?.key === jobKey && !buildingPdf && !cancelled && !hasFailures;
  const progressLabel = progress
    ? progress.stage === 'assembling'
      ? ui.assembling
      : ui.progress
          .replace('{current}', String(progress.current))
          .replace('{total}', String(progress.total))
          .replace('{file}', progress.file)
          .replace(
            '{stage}',
            progress.stage === 'decoding'
              ? ui.stageDecoding
              : progress.stage === 'drawing'
                ? ui.stageDrawing
                : ui.stageEncoding,
          )
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept={SUPPORTED_IMAGE_ACCEPT}
            multiple
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={items.length > 0}
          />

          {items.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragId !== null) reorder(dragId, item.id);
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                  class={dragId === item.id ? 'flex items-center gap-3 p-3 opacity-50' : 'flex items-center gap-3 p-3'}
                >
                  <span class="w-5 shrink-0 text-center text-sm tabular text-subtle">{index + 1}</span>
                  <div
                    class="size-14 shrink-0 cursor-grab touch-none overflow-hidden rounded-md bg-surface-2 active:cursor-grabbing"
                    aria-hidden="true"
                  >
                    <img src={item.preview} alt="" class="size-full object-cover" />
                  </div>
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{item.file.name}</p>
                    {item.error ? (
                      <p class="text-danger">
                        {item.error === 'unreadable'
                          ? ui.unsupported
                          : item.error === 'encoding'
                            ? ui.encodeFailed
                            : ui.processFailed}
                      </p>
                    ) : item.width && item.height ? (
                      <p class="tabular text-muted">
                        {item.width}×{item.height}
                        {item.jpegWidth !== item.width || item.jpegHeight !== item.height
                          ? ` · ${ui.reduced
                              .replace('{width}', String(item.jpegWidth))
                              .replace('{height}', String(item.jpegHeight))}`
                          : ''}
                      </p>
                    ) : (
                      <p class="text-muted" aria-live="polite">
                        {item.busy ? ui.processing : ui.waiting}
                      </p>
                    )}
                  </div>
                  <div class="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={ui.moveUp}
                      disabled={index === 0}
                      onClick={() => move(item.id, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={ui.moveDown}
                      disabled={index === items.length - 1}
                      onClick={() => move(item.id, 1)}
                    >
                      ↓
                    </Button>
                    <Button size="sm" variant="ghost" aria-label={ui.remove} onClick={() => remove(item.id)}>
                      ✕
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <div class="mt-4 flex flex-wrap items-center gap-3">
              {pdfIsCurrent && pdf ? (
                <Button variant="primary" size="lg" onClick={() => downloadBlob(pdf.blob, outputName)}>
                  {ui.download}
                </Button>
              ) : buildingPdf ? (
                <>
                  <Button variant="primary" size="lg" disabled>
                    {ui.building}
                  </Button>
                  <Button variant="secondary" onClick={cancel}>
                    {ui.cancel}
                  </Button>
                </>
              ) : cancelled ? (
                <Button variant="primary" size="lg" onClick={resume}>
                  {ui.resume}
                </Button>
              ) : null}
              <Button variant="ghost" onClick={clear}>
                {ui.clear}
              </Button>
              {pdfIsCurrent && pdf && (
                <span class="text-sm text-muted tabular" aria-live="polite">
                  {ui.pages.replace('{n}', String(ready.length))} · {formatBytes(pdf.blob.size, locale)}
                </span>
              )}
            </div>
          )}

          {progressLabel && (
            <p class="mt-3 text-sm text-muted" role="status" aria-live="polite">
              {progressLabel}
            </p>
          )}
          {cancelled && (
            <div class="mt-4">
              <Notice>{ui.cancelled}</Notice>
            </div>
          )}
          {batchNotice && (
            <div class="mt-4">
              <Notice>{ui.batchLimit.replace('{n}', String(MAX_IMAGE_COUNT))}</Notice>
            </div>
          )}
          {hasFailures && (
            <div class="mt-4">
              <Notice tone="danger">{ui.failedImages}</Notice>
            </div>
          )}
          {pdfError && (
            <div class="mt-4">
              <Notice tone="danger">{ui.pdfFailed}</Notice>
            </div>
          )}
          {items.length === 0 && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}
        </div>

        <div class="flex flex-col gap-5">
          <Field label={ui.pageSizeLabel}>
            <Segmented<PageSizeMode>
              label={ui.pageSizeLabel}
              value={opts.pageSize}
              onValue={(value) => set('pageSize', value)}
              options={[
                { value: 'fit', label: ui.pageSizeFit },
                { value: 'a4', label: ui.pageSizeA4 },
                { value: 'letter', label: ui.pageSizeLetter },
              ]}
            />
          </Field>

          {opts.pageSize !== 'fit' && (
            <>
              <Field label={ui.orientationLabel}>
                <Segmented<Orientation>
                  label={ui.orientationLabel}
                  value={opts.orientation}
                  onValue={(value) => set('orientation', value)}
                  options={[
                    { value: 'auto', label: ui.orientationAuto },
                    { value: 'portrait', label: ui.orientationPortrait },
                    { value: 'landscape', label: ui.orientationLandscape },
                  ]}
                />
              </Field>
              <Field label={ui.marginLabel}>
                <Segmented<MarginMode>
                  label={ui.marginLabel}
                  value={opts.margin}
                  onValue={(value) => set('margin', value)}
                  options={[
                    { value: 'none', label: ui.marginNone },
                    { value: 'small', label: ui.marginSmall },
                  ]}
                />
              </Field>
            </>
          )}

          <Field label={`${ui.qualityLabel}: ${opts.quality}`} hint={ui.qualityHint}>
            <input
              type="range"
              min={40}
              max={100}
              value={opts.quality}
              onInput={(event) => set('quality', Number((event.currentTarget as HTMLInputElement).value))}
              class="w-full accent-[var(--accent)]"
            />
          </Field>

          <p class="text-xs text-subtle">{ui.pageSizeHint}</p>
        </div>
      </div>
    </Panel>
  );
}
