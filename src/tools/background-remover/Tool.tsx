import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Notice, Panel, Stat } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_FILE_BYTES,
  MAX_INPUT_DIMENSION,
  MAX_INPUT_PIXELS,
  outputDimensions,
  outputName,
  validateInput,
} from './logic';
import { removeBackground, type RemovalEngine, type RemovalProgress } from './remove';

interface ImageItem {
  file: File;
  width: number;
  height: number;
  preview: string;
}

interface Result {
  blob: Blob;
  url: string;
  engine: RemovalEngine;
}

export default function BackgroundRemover({ locale, ui }: ToolProps<UI>) {
  const [item, setItem] = useState<ImageItem | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [progress, setProgress] = useState<RemovalProgress | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      abortRef.current?.abort();
      setProgress(null);
      setError('');
      try {
        const bitmap = await createImageBitmap(file);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        const check = validateInput(dimensions.width, dimensions.height, file.size);
        bitmap.close();
        if (!check.ok) {
          setError(
            check.reason === 'pixels'
              ? ui.errorPixels.replace('{max}', formatNumber(MAX_INPUT_PIXELS, locale))
              : check.reason === 'dimension'
                ? ui.errorDimension.replace('{max}', String(MAX_INPUT_DIMENSION))
                : check.reason === 'file'
                  ? ui.errorFile.replace('{max}', formatBytes(MAX_FILE_BYTES, locale))
                  : ui.errorRead,
          );
          return;
        }
        const preview = URL.createObjectURL(file);
        setItem((previous) => {
          if (previous) URL.revokeObjectURL(previous.preview);
          return { file, ...dimensions, preview };
        });
        setResult((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return null;
        });
      } catch {
        setError(ui.errorRead);
      }
    },
    [locale, ui],
  );

  const clear = () => {
    abortRef.current?.abort();
    setProgress(null);
    setError('');
    setItem((previous) => {
      if (previous) URL.revokeObjectURL(previous.preview);
      return null;
    });
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  };

  const start = async () => {
    if (!item || progress) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setError('');
    setProgress({ phase: 'reading', completed: 0, total: 1 });
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
    try {
      const completed = await removeBackground(item.file, { signal: controller.signal, onProgress: setProgress });
      if (!controller.signal.aborted) {
        setResult({ ...completed, url: URL.createObjectURL(completed.blob) });
      }
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(ui.errorProcess);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setProgress(null);
      }
    }
  };

  const status = progress
    ? progress.phase === 'reading'
      ? ui.reading
      : progress.phase === 'model'
        ? progress.total
          ? ui.modelProgress
              .replace('{done}', formatBytes(progress.completed, locale))
              .replace('{total}', formatBytes(progress.total, locale))
          : ui.modelLoading
        : progress.phase === 'runtime'
          ? progress.engine === 'wasm'
            ? ui.runtimeWasm
            : ui.runtimeLoading
          : progress.phase === 'processing'
            ? progress.engine === 'wasm'
              ? ui.processingWasm
              : ui.processingWebgpu
            : progress.phase === 'rendering'
              ? ui.rendering
              : ui.encoding
    : '';
  const output = item ? outputDimensions(item.width, item.height) : null;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="image/jpeg,image/png,image/webp"
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={!!item}
          />

          {item && (
            <div class="mt-4 flex items-center gap-3 rounded-lg border border-line p-3">
              <img src={item.preview} alt="" class="size-14 shrink-0 rounded-md bg-surface-2 object-cover" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-fg">{item.file.name}</p>
                <p class="tabular text-sm text-muted">
                  {formatNumber(item.width, locale)}×{formatNumber(item.height, locale)} ·{' '}
                  {formatBytes(item.file.size, locale)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={clear} aria-label={ui.clear}>
                {ui.clear}
              </Button>
            </div>
          )}

          {result && item && (
            <div class="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
              <Preview label={ui.before} src={item.preview} />
              <Preview label={ui.after} src={result.url} />
            </div>
          )}

          {!item && <Notice>{ui.privacyNote}</Notice>}
          {error && (
            <div class="mt-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          )}
        </div>

        <div class="flex flex-col gap-5">
          {item && output && (
            <div class="grid grid-cols-2 gap-3" aria-live="polite">
              <Stat label={ui.originalSize} value={`${item.width}×${item.height}`} />
              <Stat label={ui.outputSize} value={`${output.width}×${output.height}`} emphasis />
            </div>
          )}
          <Notice>{ui.limitNote}</Notice>
          {progress && <Notice>{status}</Notice>}
          {result && !progress && (
            <Notice tone="success">{result.engine === 'webgpu' ? ui.resultWebgpu : ui.resultWasm}</Notice>
          )}
          {progress ? (
            <Button variant="danger" size="lg" onClick={() => abortRef.current?.abort()}>
              {ui.cancel}
            </Button>
          ) : (
            <Button variant="primary" size="lg" disabled={!item} onClick={start}>
              {ui.start}
            </Button>
          )}
          {result && item && !progress && (
            <Button variant="secondary" onClick={() => downloadBlob(result.blob, outputName(item.file.name))}>
              {ui.download}
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}

function Preview({ label, src }: { label: string; src: string }) {
  return (
    <div class="overflow-hidden rounded-lg border border-line bg-surface-2">
      <p class="border-b border-line px-3 py-2 text-sm font-medium text-fg">{label}</p>
      <img src={src} alt={label} class="aspect-square w-full object-contain" />
    </div>
  );
}
