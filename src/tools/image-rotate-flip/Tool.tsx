import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zipSync } from 'fflate';
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
import { readDimensions, rotateImage } from './rotate';

interface Item {
  id: number;
  file: File;
  width: number;
  height: number;
  preview: string;
  result?: { blob: Blob; url: string; name: string; width: number; height: number; key: string };
  error?: { kind: 'read' | 'process'; key?: string };
  busy?: boolean;
}

interface SavedOptions {
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
  format: FormatChoice;
  quality: number;
}

const STORAGE_KEY = 'tools:image-rotate-flip:settings';
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
  const runId = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const opts: TransformOptions = { rotation, flipHorizontal, flipVertical };
  useEffect(() => {
    safeStorage.set(STORAGE_KEY, JSON.stringify({ ...opts, format, quality }));
  }, [rotation, flipHorizontal, flipVertical, format, quality]);

  const addFiles = useCallback(async (files: File[]) => {
    const added: Item[] = [];
    for (const file of files) {
      try {
        const dimensions = await readDimensions(file);
        added.push({ id: nextId++, file, ...dimensions, preview: URL.createObjectURL(file) });
      } catch {
        added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: { kind: 'read' } });
      }
    }
    setItems((previous) => [...previous, ...added]);
  }, []);

  const fileKey = items.map((item) => item.id).join(',');
  const key = transformKey(opts, format, quality);
  useEffect(() => {
    const id = ++runId.current;
    const timeout = setTimeout(async () => {
      for (const item of itemsRef.current) {
        if (runId.current !== id) return;
        if (item.error?.kind === 'read' || item.error?.key === key || item.result?.key === key) continue;
        setItems((previous) => previous.map((p) => (p.id === item.id ? { ...p, busy: true } : p)));
        try {
          const mime = outputType(format, item.file.type, item.file.name);
          const transformed = await rotateImage(item.file, opts, mime, quality / 100);
          if (runId.current !== id) return;
          const result = {
            blob: transformed.blob,
            url: URL.createObjectURL(transformed.blob),
            name: outputName(item.file.name, mime),
            width: transformed.width,
            height: transformed.height,
            key,
          };
          setItems((previous) =>
            previous.map((p) => {
              if (p.id !== item.id) return p;
              if (p.result) URL.revokeObjectURL(p.result.url);
              return { ...p, result, error: undefined, busy: false };
            }),
          );
        } catch {
          if (runId.current !== id) return;
          setItems((previous) =>
            previous.map((p) => (p.id === item.id ? { ...p, error: { kind: 'process', key }, busy: false } : p)),
          );
        }
        await yieldToBrowser();
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [fileKey, rotation, flipHorizontal, flipVertical, format, quality]);

  useEffect(
    () => () => {
      runId.current += 1;
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.preview);
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
    },
    [],
  );

  const remove = (id: number) => {
    runId.current += 1;
    setItems((previous) => {
      const gone = previous.find((item) => item.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
        if (gone.result) URL.revokeObjectURL(gone.result.url);
      }
      return previous.filter((item) => item.id !== id);
    });
  };

  const clear = () => {
    runId.current += 1;
    for (const item of items) {
      URL.revokeObjectURL(item.preview);
      if (item.result) URL.revokeObjectURL(item.result.url);
    }
    setItems([]);
  };

  const ready = items.filter((item) => item.result && !item.busy && isCurrentResult(item.result.key, key));
  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, ready[0].result!.name);
    const files: Record<string, Uint8Array> = {};
    for (const item of ready) {
      let name = item.result!.name;
      for (let n = 2; files[name]; n++) name = item.result!.name.replace(/(\.[^.]+)$/, `-${n}$1`);
      files[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
    }
    downloadBlob(
      new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: 'application/zip' }),
      'rotated-images.zip',
    );
  };

  const outputMime = outputType(format, items[0]?.file.type ?? 'image/jpeg', items[0]?.file.name);
  const rotateBy = (amount: number) => setRotation((current) => ((current + amount + 360) % 360) as Rotation);

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
                    {item.result?.url ? (
                      <img src={item.result.url} alt="" class="size-full object-cover" />
                    ) : item.preview ? (
                      <img src={item.preview} alt="" class="size-full object-cover" />
                    ) : null}
                  </div>
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{item.file.name}</p>
                    {item.error?.kind === 'read' || item.error?.key === key ? (
                      <p class="text-danger">{item.error?.kind === 'read' ? ui.unreadable : ui.processingFailed}</p>
                    ) : (
                      <p class="tabular text-muted" aria-live="polite">
                        {item.width}×{item.height} · {formatBytes(item.file.size, locale)}
                        {item.result && (
                          <>
                            {' '}
                            {' → '}
                            <span class="text-fg">
                              {item.result.width}×{item.result.height} · {formatBytes(item.result.blob.size, locale)}
                            </span>
                          </>
                        )}
                        {(item.busy || !isCurrentResult(item.result?.key, key)) && <> · {ui.processing}</>}
                      </p>
                    )}
                  </div>
                  {item.result && isCurrentResult(item.result.key, key) && !item.error && (
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
              <Button variant="primary" size="lg" disabled={ready.length === 0} onClick={downloadAll}>
                {ready.length > 1 ? ui.downloadAll.replace('{n}', String(ready.length)) : ui.download}
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
            onValue={(value) => setRotation(Number(value) as Rotation)}
            options={[
              { value: '0', label: ui.rotation0 },
              { value: '90', label: ui.rotation90 },
              { value: '180', label: ui.rotation180 },
              { value: '270', label: ui.rotation270 },
            ]}
          />
          <div class="flex flex-col gap-3 border-t border-line pt-5">
            <Toggle checked={flipHorizontal} onChecked={setFlipHorizontal} label={ui.flipHorizontal} />
            <Toggle checked={flipVertical} onChecked={setFlipVertical} label={ui.flipVertical} />
          </div>
          <div class="flex flex-col gap-5 border-t border-line pt-5">
            <Field label={ui.format}>
              <Select<FormatChoice>
                value={format}
                onValue={setFormat}
                options={[
                  { value: 'original', label: ui.formatOriginal },
                  { value: 'image/jpeg', label: ui.formatJpeg },
                  { value: 'image/png', label: ui.formatPng },
                  { value: 'image/webp', label: ui.formatWebp },
                ]}
              />
            </Field>
            {supportsQuality(outputMime) && (
              <Field label={`${ui.quality}: ${quality}`} hint={ui.qualityHint}>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onInput={(event) => setQuality(Number((event.currentTarget as HTMLInputElement).value))}
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
