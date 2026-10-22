import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zip } from 'fflate';
import { Button, Dropzone, Field, Notice, Panel, Segmented } from '../../components/ui';
import { downloadBlob, safeStorage, yieldToBrowser } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  convertHeicToJpeg,
  HeicDecodeError,
  JpegEncodeError,
  NotHeicError,
  type ConvertProgress,
  type MetadataMode,
} from './convert';
import { formatExifDate, HEIC_ACCEPT, isHeicFile, outputName, uniqueName } from './logic';

interface Result {
  blob: Blob;
  url: string;
  name: string;
  width: number;
  height: number;
  date: string | null;
  camera: string | null;
  exifFound: boolean;
  exifKept: boolean;
  exifRemoved: boolean;
  gpsRemoved: boolean;
  /** Settings the result was produced with, so unchanged files are not re-encoded. */
  key: string;
}

interface Item {
  id: number;
  file: File;
  /** Set when the file is clearly not a HEIC, before any decoding is attempted. */
  notHeic?: boolean;
  result?: Result;
  error?: { kind: 'not-heic' | 'decode' | 'encode' | 'processing'; key?: string };
  busy?: boolean;
}

interface WorkProgress {
  current: number;
  total: number;
  file: string;
  convert: ConvertProgress;
}

const QUALITY_KEY = 'tools:heic-to-jpg:quality';
const METADATA_KEY = 'tools:heic-to-jpg:metadata';
const METADATA_MODES: MetadataMode[] = ['no-gps', 'keep', 'strip'];
const MAX_BATCH_SIZE = 50;

let nextId = 1;

export default function HeicToJpg({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(90);
  const [metadata, setMetadata] = useState<MetadataMode>('no-gps');
  const [notice, setNotice] = useState<string | null>(null);
  const [progress, setProgress] = useState<WorkProgress | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [zipping, setZipping] = useState(false);
  const runId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const itemsRef = useRef(items);
  const settingsKeyRef = useRef('');
  itemsRef.current = items;
  const settingsKey = JSON.stringify([quality, metadata]);
  settingsKeyRef.current = settingsKey;

  useEffect(
    () => () => {
      runId.current++;
      abortRef.current?.abort();
      for (const item of itemsRef.current) if (item.result) URL.revokeObjectURL(item.result.url);
    },
    [],
  );

  // Restore the previous session's settings (the files themselves are never stored).
  useEffect(() => {
    const saved = Number(safeStorage.get(QUALITY_KEY));
    if (saved >= 10 && saved <= 100) setQuality(saved);
    const mode = safeStorage.get(METADATA_KEY);
    if (mode && (METADATA_MODES as string[]).includes(mode)) setMetadata(mode as MetadataMode);
  }, []);

  const changeQuality = (value: number) => {
    setCancelled(false);
    setQuality(value);
    safeStorage.set(QUALITY_KEY, String(value));
  };
  const changeMetadata = (value: MetadataMode) => {
    setCancelled(false);
    setMetadata(value);
    safeStorage.set(METADATA_KEY, value);
  };

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted = files.slice(0, Math.max(0, MAX_BATCH_SIZE - itemsRef.current.length));
      if (accepted.length < files.length) setNotice(ui.batchLimit.replace('{n}', String(MAX_BATCH_SIZE)));
      if (!accepted.length) return;
      setCancelled(false);
      setItems((prev) => [...prev, ...accepted.map((file) => ({ id: nextId++, file, notHeic: !isHeicFile(file) }))]);
    },
    [ui.batchLimit],
  );

  // Convert whenever the file list or settings change (debounced, sequential, cancellable).
  const fileKey = items.map((i) => i.id).join(',');
  useEffect(() => {
    const id = ++runId.current;
    if (cancelled) return;
    const key = settingsKey;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setItems((prev) => prev.map((item) => (item.busy ? { ...item, busy: false } : item)));
    const timeout = setTimeout(async () => {
      const pending = itemsRef.current.filter(
        (item) => !item.notHeic && item.result?.key !== key && item.error?.key !== key,
      );
      try {
        for (const [index, item] of pending.entries()) {
          if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== key) return;
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, busy: true, error: undefined } : p)));
          try {
            const out = await convertHeicToJpeg(item.file, {
              quality: quality / 100,
              metadata,
              signal: controller.signal,
              onProgress: (convert) => {
                if (runId.current === id && settingsKeyRef.current === key) {
                  setProgress({ current: index + 1, total: pending.length, file: item.file.name, convert });
                }
              },
            });
            if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== key) return;
            const result: Result = {
              blob: out.blob,
              url: URL.createObjectURL(out.blob),
              name: outputName(item.file.name),
              width: out.width,
              height: out.height,
              date: formatExifDate(out.exif?.dateTaken ?? null),
              camera: out.exif?.camera ?? null,
              exifFound: out.exifFound,
              exifKept: out.exifKept,
              exifRemoved: out.exifRemoved,
              gpsRemoved: out.gpsRemoved,
              key,
            };
            setItems((prev) =>
              prev.map((p) => {
                if (p.id !== item.id) return p;
                if (p.result) URL.revokeObjectURL(p.result.url);
                return { ...p, result, busy: false };
              }),
            );
          } catch (cause) {
            if (controller.signal.aborted || runId.current !== id || settingsKeyRef.current !== key) return;
            const kind =
              cause instanceof NotHeicError
                ? 'not-heic'
                : cause instanceof HeicDecodeError
                  ? 'decode'
                  : cause instanceof JpegEncodeError
                    ? 'encode'
                    : 'processing';
            setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, error: { kind, key }, busy: false } : p)));
          }
          await yieldToBrowser();
        }
      } finally {
        if (runId.current === id && settingsKeyRef.current === key) setProgress(null);
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
      if (abortRef.current === controller) abortRef.current = null;
    };
  }, [fileKey, settingsKey, quality, metadata, retryToken, cancelled]);

  const remove = (id: number) => {
    runId.current++;
    abortRef.current?.abort();
    setProgress(null);
    setCancelled(false);
    setItems((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone?.result) URL.revokeObjectURL(gone.result.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const clear = () => {
    runId.current++;
    abortRef.current?.abort();
    for (const p of items) if (p.result) URL.revokeObjectURL(p.result.url);
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

  // Do not let a previous quality/metadata setting be downloaded while its
  // replacement is waiting for the debounce or conversion queue.
  const ready = items.filter(
    (i) => i.result && !i.busy && i.result.key === settingsKey && i.error?.key !== settingsKey,
  );
  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, ready[0].result!.name);
    setZipping(true);
    const files: Record<string, Uint8Array> = {};
    try {
      for (const item of ready) {
        files[uniqueName(item.result!.name, Object.keys(files))] = new Uint8Array(
          await item.result!.blob.arrayBuffer(),
        );
        await yieldToBrowser();
      }
      // JPGs are already compressed. The asynchronous API moves ZIP assembly
      // off the UI thread and stores entries without re-compressing them.
      const archive = await makeZip(files);
      downloadBlob(new Blob([archive as BlobPart], { type: 'application/zip' }), 'heic-to-jpg.zip');
    } catch {
      setNotice(ui.zipFailed);
    } finally {
      setZipping(false);
    }
  };

  const totalBefore = ready.reduce((s, i) => s + i.file.size, 0);
  const totalAfter = ready.reduce((s, i) => s + i.result!.blob.size, 0);

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Files */}
        <div class="min-w-0">
          <Dropzone
            accept={HEIC_ACCEPT}
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
                <Notice>{progressLabel(progress, ui)}</Notice>
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
                const activeError = item.error?.key === settingsKey ? item.error : undefined;
                return (
                  <li key={item.id} class="flex items-center gap-3 p-3">
                    <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {item.result && <img src={item.result.url} alt="" class="size-full object-cover" />}
                    </div>
                    <div class="min-w-0 flex-1 text-sm">
                      <p class="truncate font-medium text-fg">{item.file.name}</p>
                      {item.notHeic || activeError?.kind === 'not-heic' ? (
                        <p class="text-danger">{ui.notHeic}</p>
                      ) : activeError ? (
                        <p class="text-danger">
                          {activeError.kind === 'decode'
                            ? ui.unsupported
                            : activeError.kind === 'encode'
                              ? ui.encodeFailed
                              : ui.processFailed}
                        </p>
                      ) : (
                        <>
                          <p class="tabular text-muted" aria-live="polite">
                            {formatBytes(item.file.size, locale)}
                            {item.result && (
                              <>
                                {' → '}
                                <span class="text-fg">JPG {formatBytes(item.result.blob.size, locale)}</span>
                                {' · '}
                                {formatNumber(item.result.width, locale)}×{formatNumber(item.result.height, locale)}
                              </>
                            )}
                          </p>
                          {item.busy && !item.result && <p class="text-xs text-subtle">{ui.processing}</p>}
                          {item.result && <MetadataLine ui={ui} result={item.result} />}
                        </>
                      )}
                    </div>
                    {item.result && !activeError && item.result.key === settingsKey && (
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
                    ? ui.downloadAll.replace('{n}', formatNumber(ready.length, locale))
                    : ui.download}
              </Button>
              <Button variant="ghost" onClick={clear}>
                {ui.clear}
              </Button>
              {ready.length > 0 && (
                <span class="text-sm tabular text-muted">
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
          <Field label={`${ui.quality}: ${quality}`} hint={ui.qualityHint}>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onInput={(e) => changeQuality(Number((e.currentTarget as HTMLInputElement).value))}
              class="w-full accent-[var(--accent)]"
            />
          </Field>

          <div class="border-t border-line pt-5">
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.metadata}</p>
            <Segmented<MetadataMode>
              label={ui.metadata}
              value={metadata}
              onValue={changeMetadata}
              options={[
                { value: 'no-gps', label: ui.metadataNoGps },
                { value: 'keep', label: ui.metadataKeep },
                { value: 'strip', label: ui.metadataStrip },
              ]}
            />
            <p class="mt-2 text-xs text-subtle">
              {metadata === 'no-gps'
                ? ui.metadataNoGpsHint
                : metadata === 'keep'
                  ? ui.metadataKeepHint
                  : ui.metadataStripHint}
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/** Shows what happened to the photo's metadata — the point of the tool made visible. */
function MetadataLine({ ui, result }: { ui: UI; result: Result }) {
  if (!result.exifFound) return <p class="text-xs text-subtle">{ui.noMetadata}</p>;
  if (result.exifRemoved) return <p class="text-xs text-subtle">{ui.metadataDropped}</p>;
  if (!result.exifKept) return <p class="text-xs text-danger">{ui.metadataNotKept}</p>;
  const parts = [
    result.date && ui.dateKept.replace('{date}', result.date),
    result.camera,
    result.gpsRemoved && ui.gpsRemoved,
  ]
    .filter(Boolean)
    .join(' · ');
  if (!parts) return <p class="text-xs text-success">{ui.metadataKept}</p>;
  return <p class="text-xs text-success">{parts}</p>;
}

function progressLabel(progress: WorkProgress, ui: UI): string {
  const stage =
    progress.convert.stage === 'reading'
      ? ui.stageReading
      : progress.convert.stage === 'loading-decoder'
        ? ui.stageLoadingDecoder
        : progress.convert.stage === 'decoding'
          ? ui.stageDecoding
          : progress.convert.stage === 'encoding'
            ? ui.stageEncoding
            : ui.stageMetadata;
  return ui.progress
    .replace('{current}', String(progress.current))
    .replace('{total}', String(progress.total))
    .replace('{file}', progress.file)
    .replace('{stage}', stage);
}

function makeZip(files: Record<string, Uint8Array>): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zip(files, { level: 0 }, (error, data) => (error ? reject(error) : resolve(data)));
  });
}
