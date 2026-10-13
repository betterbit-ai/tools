import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, Segmented } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_PDF_OPTIONS,
  MAX_IMAGE_COUNT,
  computePageLayout,
  isSafeImageDimensions,
  normalizePdfOptions,
  pdfOutputName,
  shouldBuildPdf,
  type MarginMode,
  type Orientation,
  type PageSizeMode,
} from './logic';
import { buildPdfOffMainThread, encodeToJpeg, readDimensions } from './pdf';

interface Item {
  id: number;
  file: File;
  width: number;
  height: number;
  preview: string;
  jpeg?: Uint8Array;
  /** Quality the cached `jpeg` was encoded at — re-encode when this no longer matches `opts.quality`. */
  jpegQuality?: number;
  error?: 'unreadable' | 'too-large' | 'processing';
}

interface Options {
  pageSize: PageSizeMode;
  orientation: Orientation;
  margin: MarginMode;
  quality: number;
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
  const [dragId, setDragId] = useState<number | null>(null);
  const runId = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(opts)), [opts]);

  const addFiles = useCallback(async (files: File[]) => {
    const accepted = files.slice(0, Math.max(0, MAX_IMAGE_COUNT - itemsRef.current.length));
    const added: Item[] = [];
    for (const file of accepted) {
      try {
        const { width, height } = await readDimensions(file);
        if (!isSafeImageDimensions(width, height)) {
          added.push({ id: nextId++, file, width, height, preview: '', error: 'too-large' });
        } else {
          added.push({ id: nextId++, file, width, height, preview: URL.createObjectURL(file) });
        }
      } catch {
        added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: 'unreadable' });
      }
    }
    setItems((prev) => [...prev, ...added]);
  }, []);

  // Encode each file to JPEG once (independent of order/page settings), then
  // re-assemble the PDF whenever the file list, order, or page settings change.
  const fileKey = items.map((i) => i.id).join(',');
  useEffect(() => {
    const id = ++runId.current;
    const timeout = setTimeout(async () => {
      for (const item of itemsRef.current) {
        if (runId.current !== id) return;
        if (item.error || item.jpegQuality === opts.quality) continue;
        try {
          const encoded = await encodeToJpeg(item.file, opts.quality / 100);
          if (runId.current !== id) return;
          setItems((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, jpeg: encoded.bytes, jpegQuality: opts.quality } : p)),
          );
        } catch {
          if (runId.current !== id) return;
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, error: 'processing' } : p)));
        }
      }
    }, 150);
    return () => clearTimeout(timeout);
  }, [fileKey, opts.quality]);

  const ready = items.filter((i) => i.jpeg && i.jpegQuality === opts.quality && !i.error);
  const hasPendingImages = items.some((i) => !i.error && (!i.jpeg || i.jpegQuality !== opts.quality));
  const readyKey = ready.map((i) => `${i.id}:${i.jpeg!.length}`).join(',');
  const pdfKey = `${readyKey}:${opts.pageSize}:${opts.orientation}:${opts.margin}`;
  useEffect(() => {
    if (!shouldBuildPdf(ready.length, hasPendingImages)) {
      if (hasPendingImages) {
        setBuildingPdf(true);
        setPdfError(false);
        return;
      }
      setBuildingPdf(false);
      setPdfError(false);
      setPdf((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return null;
      });
      return;
    }
    let cancelled = false;
    setBuildingPdf(true);
    setPdfError(false);
    const timeout = setTimeout(() => {
      const pages = ready.map((item) => ({
        jpeg: item.jpeg!,
        widthPx: item.width,
        heightPx: item.height,
        layout: computePageLayout(item.width, item.height, opts),
      }));
      void buildPdfOffMainThread(pages)
        .then((bytes) => {
          if (cancelled) return;
          const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
          setPdf((prev) => {
            if (prev) URL.revokeObjectURL(prev.url);
            return { blob, url: URL.createObjectURL(blob), key: pdfKey };
          });
          setBuildingPdf(false);
        })
        .catch(() => {
          if (!cancelled) {
            setBuildingPdf(false);
            setPdfError(true);
          }
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [hasPendingImages, pdfKey]);

  useEffect(
    () => () => {
      for (const p of itemsRef.current) URL.revokeObjectURL(p.preview);
      setPdf((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return prev;
      });
    },
    [],
  );

  const remove = (id: number) =>
    setItems((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return prev.filter((p) => p.id !== id);
    });

  const clear = () => {
    for (const p of items) URL.revokeObjectURL(p.preview);
    setItems([]);
    setPdfError(false);
  };

  const move = (id: number, dir: -1 | 1) =>
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const reorder = (draggedId: number, overId: number) => {
    if (draggedId === overId) return;
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === draggedId);
      const to = prev.findIndex((p) => p.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const set = <K extends keyof Options>(key: K, value: Options[K]) => setOpts((o) => ({ ...o, [key]: value }));
  const outputName = items.length === 1 ? pdfOutputName(items[0].file.name) : 'images.pdf';
  const pdfIsCurrent = pdf?.key === pdfKey && !buildingPdf && !hasPendingImages;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Files */}
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
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
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
                    {item.preview && <img src={item.preview} alt="" class="size-full object-cover" />}
                  </div>
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{item.file.name}</p>
                    {item.error ? (
                      <p class="text-danger">
                        {item.error === 'too-large'
                          ? ui.tooLarge
                          : item.error === 'processing'
                            ? ui.processFailed
                            : ui.unsupported}
                      </p>
                    ) : (
                      <p class="tabular text-muted" aria-live="polite">
                        {item.width}×{item.height} {item.jpegQuality !== opts.quality && `· ${ui.processing}`}
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
              <Button
                variant="primary"
                size="lg"
                disabled={!pdfIsCurrent}
                onClick={() => pdfIsCurrent && pdf && downloadBlob(pdf.blob, outputName)}
              >
                {buildingPdf || hasPendingImages ? ui.building : ui.download}
              </Button>
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

          {items.length > 0 && items.length >= MAX_IMAGE_COUNT && (
            <div class="mt-4">
              <Notice>{ui.batchLimit.replace('{n}', String(MAX_IMAGE_COUNT))}</Notice>
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

        {/* Settings */}
        <div class="flex flex-col gap-5">
          <Field label={ui.pageSizeLabel}>
            <Segmented<PageSizeMode>
              label={ui.pageSizeLabel}
              value={opts.pageSize}
              onValue={(v) => set('pageSize', v)}
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
                  onValue={(v) => set('orientation', v)}
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
                  onValue={(v) => set('margin', v)}
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
              onInput={(e) => set('quality', Number((e.currentTarget as HTMLInputElement).value))}
              class="w-full accent-[var(--accent)]"
            />
          </Field>

          <p class="text-xs text-subtle">{ui.pageSizeHint}</p>
        </div>
      </div>
    </Panel>
  );
}
