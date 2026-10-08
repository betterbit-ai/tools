import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zipSync } from 'fflate';
import { Button, Dropzone, Field, Notice, Panel, Select } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { convertImage, readDimensions } from './convert';
import {
  formatLabel,
  isAnimatedGif,
  needsBackground,
  outputName,
  sourceMayHaveAlpha,
  sourceMime,
  supportsQuality,
  type FormatChoice,
} from './logic';

interface Item {
  id: number;
  file: File;
  sourceMime: string;
  width: number;
  height: number;
  preview: string;
  animatedGif?: boolean;
  result?: { blob: Blob; url: string; name: string; key: string };
  error?: boolean;
  busy?: boolean;
}

interface Preset {
  to?: FormatChoice;
  accept?: string;
}

let nextId = 1;

export default function ImageConverter({ locale, ui, preset }: ToolProps<UI>) {
  const p = preset as Preset | undefined;
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState<FormatChoice>(p?.to ?? 'image/webp');
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState('#ffffff');
  const accept = p?.accept ?? 'image/*';
  const runId = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const addFiles = useCallback(async (files: File[]) => {
    const added: Item[] = [];
    for (const file of files) {
      try {
        const dims = await readDimensions(file);
        const mime = sourceMime(file);
        const animatedGif = mime === 'image/gif' && isAnimatedGif(new Uint8Array(await file.arrayBuffer()));
        added.push({ id: nextId++, file, sourceMime: mime, ...dims, animatedGif, preview: URL.createObjectURL(file) });
      } catch {
        added.push({ id: nextId++, file, sourceMime: sourceMime(file), width: 0, height: 0, preview: '', error: true });
      }
    }
    setItems((prev) => [...prev, ...added]);
  }, []);

  // Re-encode whenever settings or the file list change (debounced, sequential, cancellable).
  const fileKey = items.map((i) => i.id).join(',');
  useEffect(() => {
    const id = ++runId.current;
    const key = JSON.stringify([target, quality, background]);
    const timeout = setTimeout(async () => {
      for (const item of itemsRef.current) {
        if (runId.current !== id) return;
        if (item.error || item.result?.key === key) continue;
        setItems((prev) => prev.map((p2) => (p2.id === item.id ? { ...p2, busy: true } : p2)));
        try {
          const blob = await convertImage(item.file, target, quality / 100, background);
          if (runId.current !== id) return;
          const result = { blob, url: URL.createObjectURL(blob), name: outputName(item.file.name, target), key };
          setItems((prev) =>
            prev.map((p2) => {
              if (p2.id !== item.id) return p2;
              if (p2.result) URL.revokeObjectURL(p2.result.url);
              return { ...p2, result, busy: false };
            }),
          );
        } catch {
          setItems((prev) => prev.map((p2) => (p2.id === item.id ? { ...p2, error: true, busy: false } : p2)));
        }
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [fileKey, target, quality, background]);

  const remove = (id: number) =>
    setItems((prev) => {
      const gone = prev.find((p2) => p2.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
        if (gone.result) URL.revokeObjectURL(gone.result.url);
      }
      return prev.filter((p2) => p2.id !== id);
    });

  const clear = () => {
    for (const p2 of items) {
      URL.revokeObjectURL(p2.preview);
      if (p2.result) URL.revokeObjectURL(p2.result.url);
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
    downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), 'converted-images.zip');
  };

  const anyAlphaSource = items.some((i) => sourceMayHaveAlpha(i.sourceMime));
  const anyAnimated = items.some((i) => i.animatedGif);

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Files */}
        <div class="min-w-0">
          <Dropzone
            accept={accept}
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
                          {formatLabel(item.sourceMime)} · {formatBytes(item.file.size, locale)}
                          {item.result && (
                            <>
                              {' → '}
                              <span class="text-fg">
                                {formatLabel(target)} · {formatBytes(item.result.blob.size, locale)}
                              </span>
                            </>
                          )}
                        </p>
                        {item.animatedGif && <p class="text-xs text-warning">{ui.animatedGifWarning}</p>}
                        {item.sourceMime === target && !item.animatedGif && (
                          <p class="text-xs text-subtle">{ui.sameFormat}</p>
                        )}
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
            </div>
          )}

          {items.length === 0 && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}

          {anyAnimated && items.length > 0 && (
            <div class="mt-3">
              <Notice tone="info">{ui.animatedGifNotice}</Notice>
            </div>
          )}
        </div>

        {/* Settings */}
        <div class="flex flex-col gap-5">
          <Field label={ui.format}>
            <Select<FormatChoice>
              value={target}
              onValue={setTarget}
              options={[
                { value: 'image/jpeg', label: 'JPG' },
                { value: 'image/png', label: 'PNG' },
                { value: 'image/webp', label: 'WebP' },
              ]}
            />
          </Field>

          {supportsQuality(target) && (
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
          )}

          {needsBackground(target) && (anyAlphaSource || items.length === 0) && (
            <Field label={ui.background} hint={ui.backgroundHint}>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  value={background}
                  onInput={(e) => setBackground((e.currentTarget as HTMLInputElement).value)}
                  class="size-10 cursor-pointer rounded-md border border-line bg-surface p-1"
                  aria-label={ui.background}
                />
                <span class="text-sm tabular text-muted">{background}</span>
              </div>
            </Field>
          )}
        </div>
      </div>
    </Panel>
  );
}
