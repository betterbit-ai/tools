import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { zip } from 'fflate';
import { Button, Dropzone, Field, Notice, Panel, Select } from '../../components/ui';
import { downloadBlob, yieldToBrowser } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { convertImage, inspectImage } from './convert';
import {
  formatLabel,
  isCurrentResult,
  isAnimatedGif,
  isWithinPixelLimit,
  MAX_PIXELS,
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
  error?: { kind: 'unreadable' | 'tooLarge' | 'processing'; key?: string };
  busy?: boolean;
}

interface Preset {
  to?: FormatChoice;
  accept?: string;
}

interface WorkProgress {
  current: number;
  total: number;
  file: string;
}

let nextId = 1;
const MAX_BATCH_SIZE = 50;
const MAX_GIF_SCAN_BYTES = 2 * 1024 * 1024;

export default function ImageConverter({ locale, ui, preset }: ToolProps<UI>) {
  const p = preset as Preset | undefined;
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState<FormatChoice>(p?.to ?? 'image/webp');
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState('#ffffff');
  const [notice, setNotice] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [inspecting, setInspecting] = useState<WorkProgress | null>(null);
  const [progress, setProgress] = useState<WorkProgress | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const accept = p?.accept ?? 'image/*';
  const runId = useRef(0);
  const importId = useRef(0);
  const itemsRef = useRef(items);
  const settingsKeyRef = useRef('');
  itemsRef.current = items;

  const addFiles = useCallback(
    async (files: File[]) => {
      const accepted = files.slice(0, Math.max(0, MAX_BATCH_SIZE - itemsRef.current.length));
      if (accepted.length < files.length) setNotice(ui.batchLimit.replace('{n}', String(MAX_BATCH_SIZE)));
      if (!accepted.length) return;

      const loadId = ++importId.current;
      const added: Item[] = [];
      for (const [index, file] of accepted.entries()) {
        if (importId.current !== loadId) break;
        setInspecting({ current: index + 1, total: accepted.length, file: file.name });
        await yieldToBrowser();
        const mime = sourceMime(file);
        try {
          const info = await inspectImage(file);
          if (!isWithinPixelLimit(info.width, info.height)) {
            added.push({
              id: nextId++,
              file,
              sourceMime: mime,
              width: info.width,
              height: info.height,
              preview: '',
              error: { kind: 'tooLarge' },
            });
            continue;
          }
          // Only inspect a prefix: reading an arbitrarily large GIF into a second
          // ArrayBuffer can exhaust memory before any conversion begins.
          const gifBytes =
            mime === 'image/gif' ? new Uint8Array(await file.slice(0, MAX_GIF_SCAN_BYTES).arrayBuffer()) : null;
          const animatedGif = gifBytes ? isAnimatedGif(gifBytes) : false;
          added.push({
            id: nextId++,
            file,
            sourceMime: mime,
            width: info.width,
            height: info.height,
            animatedGif,
            preview: URL.createObjectURL(info.thumbnail),
          });
        } catch {
          added.push({
            id: nextId++,
            file,
            sourceMime: mime,
            width: 0,
            height: 0,
            preview: '',
            error: { kind: 'unreadable' },
          });
        }
      }
      if (importId.current === loadId) setItems((prev) => [...prev, ...added]);
      else for (const item of added) if (item.preview) URL.revokeObjectURL(item.preview);
      setInspecting((current) => (importId.current === loadId ? null : current));
    },
    [ui.batchLimit],
  );

  // Re-encode whenever settings or the file list change (debounced, sequential, cancellable).
  const fileKey = items.map((i) => i.id).join(',');
  const settingsKey = JSON.stringify([target, quality, background]);
  settingsKeyRef.current = settingsKey;
  useEffect(() => {
    const id = ++runId.current;
    setCancelled(false);
    const timeout = setTimeout(async () => {
      const pending = itemsRef.current.filter(
        (item) =>
          item.error?.kind !== 'unreadable' &&
          item.error?.kind !== 'tooLarge' &&
          !isCurrentResult(item.result?.key, settingsKey) &&
          item.error?.key !== settingsKey,
      );
      try {
        for (const [index, item] of pending.entries()) {
          if (runId.current !== id || settingsKeyRef.current !== settingsKey) return;
          setProgress({ current: index + 1, total: pending.length, file: item.file.name });
          setItems((prev) => prev.map((p2) => (p2.id === item.id ? { ...p2, busy: true, error: undefined } : p2)));
          try {
            const blob = await convertImage(item.file, target, quality / 100, background);
            if (runId.current !== id || settingsKeyRef.current !== settingsKey) return;
            const result = {
              blob,
              url: URL.createObjectURL(blob),
              name: outputName(item.file.name, target),
              key: settingsKey,
            };
            setItems((prev) =>
              prev.map((p2) => {
                if (p2.id !== item.id) return p2;
                if (p2.result) URL.revokeObjectURL(p2.result.url);
                return { ...p2, result, busy: false };
              }),
            );
          } catch {
            if (runId.current !== id || settingsKeyRef.current !== settingsKey) return;
            setItems((prev) =>
              prev.map((p2) =>
                p2.id === item.id ? { ...p2, error: { kind: 'processing', key: settingsKey }, busy: false } : p2,
              ),
            );
          }
          await yieldToBrowser();
        }
      } finally {
        if (runId.current === id && settingsKeyRef.current === settingsKey) setProgress(null);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [fileKey, target, quality, background, settingsKey, retryToken]);

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
      setProgress(null);
      setCancelled(false);
      const gone = prev.find((p2) => p2.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
        if (gone.result) URL.revokeObjectURL(gone.result.url);
      }
      return prev.filter((p2) => p2.id !== id);
    });

  const clear = () => {
    runId.current++;
    importId.current++;
    for (const p2 of items) {
      URL.revokeObjectURL(p2.preview);
      if (p2.result) URL.revokeObjectURL(p2.result.url);
    }
    setItems([]);
    setNotice(null);
    setInspecting(null);
    setProgress(null);
    setCancelled(false);
  };

  const cancel = () => {
    runId.current++;
    setProgress(null);
    setCancelled(true);
    setItems((prev) => prev.map((item) => (item.busy ? { ...item, busy: false } : item)));
  };

  const retry = () => {
    setCancelled(false);
    setRetryToken((value) => value + 1);
  };

  const ready = items.filter((i) => isCurrentResult(i.result?.key, settingsKey) && !i.busy && !i.error);
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
      // Images are already compressed. fflate's asynchronous API keeps ZIP
      // construction off the main thread for larger batches.
      const archive = await makeZip(files);
      downloadBlob(new Blob([archive as BlobPart], { type: 'application/zip' }), 'converted-images.zip');
    } catch {
      setNotice(ui.zipFailed);
    } finally {
      setZipping(false);
    }
  };

  const anyAlphaSource = items.some((i) => sourceMayHaveAlpha(i.sourceMime));
  const anyAnimated = items.some((i) => i.animatedGif);
  const hasGif = items.some((i) => i.sourceMime === 'image/gif' && !i.error);

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

          {notice && (
            <div class="mt-4">
              <Notice tone="danger">{notice}</Notice>
            </div>
          )}

          {inspecting && (
            <div class="mt-4">
              <Notice>
                {ui.reading
                  .replace('{current}', String(inspecting.current))
                  .replace('{total}', String(inspecting.total))
                  .replace('{file}', inspecting.file)}
              </Notice>
            </div>
          )}

          {progress && (
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <Notice>
                {ui.progress
                  .replace('{current}', String(progress.current))
                  .replace('{total}', String(progress.total))
                  .replace('{file}', progress.file)}
              </Notice>
              <Button size="sm" variant="ghost" onClick={cancel}>
                {ui.cancel}
              </Button>
            </div>
          )}

          {cancelled && (
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <Notice>{ui.cancelled}</Notice>
              <Button size="sm" variant="secondary" onClick={retry}>
                {ui.retry}
              </Button>
            </div>
          )}

          {items.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
              {items.map((item) => {
                const stale = !isCurrentResult(item.result?.key, settingsKey);
                const currentResult = stale ? undefined : item.result;
                return (
                  <li key={item.id} class="flex items-center gap-3 p-3">
                    <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {item.preview && <img src={item.preview} alt="" class="size-full object-cover" />}
                    </div>
                    <div class="min-w-0 flex-1 text-sm">
                      <p class="truncate font-medium text-fg">{item.file.name}</p>
                      {item.error ? (
                        <p class="text-danger">
                          {item.error.kind === 'unreadable'
                            ? ui.unsupported
                            : item.error.kind === 'tooLarge'
                              ? ui.tooLarge.replace('{max}', formatNumber(MAX_PIXELS, locale))
                              : ui.processFailed}
                        </p>
                      ) : (
                        <>
                          <p class="tabular text-muted" aria-live="polite">
                            {formatLabel(item.sourceMime)} · {formatBytes(item.file.size, locale)}
                            {currentResult && (
                              <>
                                {' → '}
                                <span class="text-fg">
                                  {formatLabel(target)} · {formatBytes(currentResult.blob.size, locale)}
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
                    {currentResult && !item.error && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={item.busy}
                        onClick={() => downloadBlob(currentResult.blob, currentResult.name)}
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

          {hasGif && !anyAnimated && (
            <div class="mt-3">
              <Notice>{ui.gifNotice}</Notice>
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

function makeZip(files: Record<string, Uint8Array>): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zip(files, { level: 0 }, (error, archive) => {
      if (error) reject(error);
      else resolve(archive);
    });
  });
}
