import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zipSync } from 'fflate';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Select, cx } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { compressAtQuality, compressToTarget, readDimensions } from './compress';
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
  result?: { blob: Blob; url: string; width: number; height: number; name: string; achieved: boolean; key: string };
  error?: boolean;
  busy?: boolean;
}

let nextId = 1;

export default function ImageCompressor({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<CompressMode>('size');
  const [targetValue, setTargetValue] = useState<number | ''>(500);
  const [targetUnit, setTargetUnit] = useState<SizeUnit>('KB');
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<FormatChoice>('original');
  const runId = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const addFiles = useCallback(async (files: File[]) => {
    const added: Item[] = [];
    for (const file of files) {
      try {
        const dims = await readDimensions(file);
        // Canvas only ever draws a GIF's first frame, so flag animated ones instead of
        // silently dropping the rest of the frames when the file re-encodes.
        const animatedGif = file.type === 'image/gif' && isAnimatedGif(new Uint8Array(await file.arrayBuffer()));
        added.push({ id: nextId++, file, ...dims, animatedGif, preview: URL.createObjectURL(file) });
      } catch {
        added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: true });
      }
    }
    setItems((prev) => [...prev, ...added]);
  }, []);

  // Re-encode whenever settings or the file list change (debounced, sequential, cancellable).
  const fileKey = items.map((i) => i.id).join(',');
  useEffect(() => {
    const id = ++runId.current;
    const key = JSON.stringify([mode, format, quality, targetValue, targetUnit]);
    const timeout = setTimeout(async () => {
      for (const item of itemsRef.current) {
        if (runId.current !== id) return;
        if (item.error || item.result?.key === key) continue;
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, busy: true } : p)));
        try {
          const mime = outputType(format, item.file.type);
          let out: { blob: Blob; width: number; height: number; size: number };
          let achieved = true;
          if (mode === 'size') {
            const target = toBytes(targetValue === '' ? 500 : targetValue, targetUnit);
            const outcome = await compressToTarget(item.file, mime, target);
            out = outcome.result;
            achieved = outcome.achieved;
          } else {
            out = await compressAtQuality(item.file, mime, quality / 100);
          }
          if (runId.current !== id) return;
          const result = {
            blob: out.blob,
            url: URL.createObjectURL(out.blob),
            width: out.width,
            height: out.height,
            name: outputName(item.file.name, mime),
            achieved,
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
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, error: true, busy: false } : p)));
        }
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [fileKey, mode, format, quality, targetValue, targetUnit]);

  const remove = (id: number) =>
    setItems((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
        if (gone.result) URL.revokeObjectURL(gone.result.url);
      }
      return prev.filter((p) => p.id !== id);
    });

  const clear = () => {
    for (const p of items) {
      URL.revokeObjectURL(p.preview);
      if (p.result) URL.revokeObjectURL(p.result.url);
    }
    setItems([]);
  };

  const ready = items.filter((i) => i.result && !i.busy);
  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, ready[0].result!.name);
    const files: Record<string, Uint8Array> = {};
    for (const item of ready) {
      let name = item.result!.name;
      for (let n = 2; files[name]; n++) name = item.result!.name.replace(/(\.\w+)$/, `-${n}$1`);
      files[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
    }
    // Images are already compressed — store without re-compressing (level 0) for speed.
    const zip = zipSync(files, { level: 0 });
    downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), 'compressed-images.zip');
  };

  const totalBefore = ready.reduce((s, i) => s + i.file.size, 0);
  const totalAfter = ready.reduce((s, i) => s + i.result!.blob.size, 0);
  const outMime = outputType(format, items[0]?.file.type ?? 'image/jpeg');

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

          {items.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
              {items.map((item) => (
                <li class="flex items-center gap-3 p-3">
                  <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                    {item.preview && <img src={item.preview} alt="" class="size-full object-cover" />}
                  </div>
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{item.file.name}</p>
                    {item.error ? (
                      <p class="text-danger">{ui.unsupported}</p>
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
                {ready.length > 1 ? ui.downloadAll.replace('{n}', String(ready.length)) : ui.download}
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
            value={mode}
            onValue={setMode}
            options={[
              { value: 'size', label: ui.modeSize },
              { value: 'quality', label: ui.modeQuality },
            ]}
          />

          {mode === 'size' ? (
            <Field label={ui.targetSize} hint={ui.targetSizeHint}>
              <div class="grid grid-cols-[1fr_90px] gap-2">
                <NumberInput value={targetValue} min={1} max={50000} onValue={setTargetValue} />
                <Select<SizeUnit>
                  value={targetUnit}
                  onValue={setTargetUnit}
                  options={[
                    { value: 'KB', label: 'KB' },
                    { value: 'MB', label: 'MB' },
                  ]}
                />
              </div>
            </Field>
          ) : supportsQuality(outMime) || format === 'original' ? (
            <Field label={`${ui.quality}: ${quality}`} hint={ui.qualityHint}>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onInput={(e) => setQuality(Number((e.currentTarget as HTMLInputElement).value))}
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
                onValue={setFormat}
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
