import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zipSync } from 'fflate';
import { Button, Dropzone, Field, Notice, Panel, Segmented } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { convertHeicToJpeg, type MetadataMode } from './convert';
import { formatExifDate, HEIC_ACCEPT, isHeicFile, outputName, uniqueName } from './logic';

interface Result {
  blob: Blob;
  url: string;
  name: string;
  width: number;
  height: number;
  date: string | null;
  camera: string | null;
  exifKept: boolean;
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
  error?: boolean;
  busy?: boolean;
}

const QUALITY_KEY = 'tools:heic-to-jpg:quality';
const METADATA_KEY = 'tools:heic-to-jpg:metadata';
const METADATA_MODES: MetadataMode[] = ['no-gps', 'keep', 'strip'];

let nextId = 1;

export default function HeicToJpg({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(90);
  const [metadata, setMetadata] = useState<MetadataMode>('no-gps');
  const [loadingDecoder, setLoadingDecoder] = useState(false);
  const runId = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Restore the previous session's settings (the files themselves are never stored).
  useEffect(() => {
    const saved = Number(safeStorage.get(QUALITY_KEY));
    if (saved >= 10 && saved <= 100) setQuality(saved);
    const mode = safeStorage.get(METADATA_KEY);
    if (mode && (METADATA_MODES as string[]).includes(mode)) setMetadata(mode as MetadataMode);
  }, []);

  const changeQuality = (value: number) => {
    setQuality(value);
    safeStorage.set(QUALITY_KEY, String(value));
  };
  const changeMetadata = (value: MetadataMode) => {
    setMetadata(value);
    safeStorage.set(METADATA_KEY, value);
  };

  const addFiles = useCallback((files: File[]) => {
    setItems((prev) => [...prev, ...files.map((file) => ({ id: nextId++, file, notHeic: !isHeicFile(file) }))]);
  }, []);

  // Convert whenever the file list or settings change (debounced, sequential, cancellable).
  const fileKey = items.map((i) => i.id).join(',');
  useEffect(() => {
    const id = ++runId.current;
    const key = JSON.stringify([quality, metadata]);
    const timeout = setTimeout(async () => {
      for (const item of itemsRef.current) {
        if (runId.current !== id) return;
        if (item.error || item.notHeic || item.result?.key === key) continue;
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, busy: true } : p)));
        try {
          const out = await convertHeicToJpeg(item.file, {
            quality: quality / 100,
            metadata,
            onDecoderLoad: () => setLoadingDecoder(true),
          });
          setLoadingDecoder(false);
          if (runId.current !== id) return;
          const result: Result = {
            blob: out.blob,
            url: URL.createObjectURL(out.blob),
            name: outputName(item.file.name),
            width: out.width,
            height: out.height,
            date: formatExifDate(out.exif?.dateTaken ?? null),
            camera: out.exif?.camera ?? null,
            exifKept: out.exifKept,
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
        } catch {
          setLoadingDecoder(false);
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, error: true, busy: false } : p)));
        }
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [fileKey, quality, metadata]);

  const remove = (id: number) =>
    setItems((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone?.result) URL.revokeObjectURL(gone.result.url);
      return prev.filter((p) => p.id !== id);
    });

  const clear = () => {
    for (const p of items) if (p.result) URL.revokeObjectURL(p.result.url);
    setItems([]);
  };

  const ready = items.filter((i) => i.result && !i.busy);
  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, ready[0].result!.name);
    const files: Record<string, Uint8Array> = {};
    for (const item of ready) {
      files[uniqueName(item.result!.name, Object.keys(files))] = new Uint8Array(await item.result!.blob.arrayBuffer());
    }
    // JPGs are already compressed — store them without re-compressing (level 0).
    const zip = zipSync(files, { level: 0 });
    downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), 'heic-to-jpg.zip');
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

          {loadingDecoder && (
            <div class="mt-4">
              <Notice tone="info">{ui.decoderLoading}</Notice>
            </div>
          )}

          {items.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
              {items.map((item) => (
                <li class="flex items-center gap-3 p-3">
                  <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                    {item.result && <img src={item.result.url} alt="" class="size-full object-cover" />}
                  </div>
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{item.file.name}</p>
                    {item.notHeic ? (
                      <p class="text-danger">{ui.notHeic}</p>
                    ) : item.error ? (
                      <p class="text-danger">{ui.unsupported}</p>
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
                  {item.result && (
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
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" disabled={ready.length === 0} onClick={downloadAll}>
                {ready.length > 1 ? ui.downloadAll.replace('{n}', formatNumber(ready.length, locale)) : ui.download}
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
  if (!result.exifKept) return <p class="text-xs text-subtle">{result.date ? ui.metadataDropped : ui.noMetadata}</p>;
  const parts = [
    result.date && ui.dateKept.replace('{date}', result.date),
    result.camera,
    result.gpsRemoved && ui.gpsRemoved,
  ]
    .filter(Boolean)
    .join(' · ');
  if (!parts) return <p class="text-xs text-subtle">{ui.noMetadata}</p>;
  return <p class="text-xs text-success">{parts}</p>;
}
