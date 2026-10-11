import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, Segmented, Select, Stat } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_INPUT_DIMENSION,
  MAX_INPUT_PIXELS,
  outputDimensions,
  outputName,
  validateInput,
  type Scale,
} from './logic';
import { upscaleImage, type UpscaleProgress } from './upscale';

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

interface ImageItem {
  file: File;
  width: number;
  height: number;
  preview: string;
}

interface Result {
  blob: Blob;
  width: number;
  height: number;
  url: string;
}

function savedScale(): Scale {
  return safeStorage.get('tools:image-upscaler:scale') === '4' ? 4 : 2;
}

function savedFormat(): OutputFormat {
  const format = safeStorage.get('tools:image-upscaler:format');
  return format === 'image/jpeg' || format === 'image/webp' ? format : 'image/png';
}

export default function ImageUpscaler({ locale, ui }: ToolProps<UI>) {
  const [item, setItem] = useState<ImageItem | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [scale, setScale] = useState<Scale>(savedScale);
  const [format, setFormat] = useState<OutputFormat>(savedFormat);
  const [progress, setProgress] = useState<UpscaleProgress | null>(null);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState<'before' | 'after'>('after');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => item && URL.revokeObjectURL(item.preview), [item]);
  useEffect(() => () => result && URL.revokeObjectURL(result.url), [result]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => safeStorage.set('tools:image-upscaler:scale', String(scale)), [scale]);
  useEffect(() => safeStorage.set('tools:image-upscaler:format', format), [format]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      abortRef.current?.abort();
      setProgress(null);
      setError('');
      try {
        const bitmap = await createImageBitmap(file);
        const check = validateInput(bitmap.width, bitmap.height, file.size);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        if (!check.ok) {
          setError(
            check.reason === 'pixels'
              ? ui.errorPixels.replace('{max}', formatNumber(MAX_INPUT_PIXELS, locale))
              : check.reason === 'dimension'
                ? ui.errorDimension.replace('{max}', String(MAX_INPUT_DIMENSION))
                : check.reason === 'file'
                  ? ui.errorFile
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
  const cancel = () => abortRef.current?.abort();
  const start = async () => {
    if (!item || progress) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setError('');
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
    try {
      const next = await upscaleImage(item.file, {
        scale,
        mime: format,
        signal: controller.signal,
        onProgress: setProgress,
      });
      if (!controller.signal.aborted) {
        setResult({ ...next, url: URL.createObjectURL(next.blob) });
        setComparison('after');
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

  const output = item ? outputDimensions(item.width, item.height, scale) : null;
  const isWorking = !!progress;
  const status = progress
    ? progress.phase === 'model'
      ? progress.total
        ? ui.modelProgress
            .replace('{done}', formatBytes(progress.completed, locale))
            .replace('{total}', formatBytes(progress.total, locale))
        : ui.modelLoading
      : ui.tileProgress.replace('{done}', String(progress.completed)).replace('{total}', String(progress.total))
    : '';

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
              <img src={item.preview} alt="" class="size-14 shrink-0 rounded-md object-cover bg-surface-2" />
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
            <div class="mt-4" aria-live="polite">
              <Segmented
                label={ui.compareLabel}
                value={comparison}
                onValue={setComparison}
                options={[
                  { value: 'before', label: ui.before },
                  { value: 'after', label: ui.after },
                ]}
              />
              <div class="mt-3 max-h-96 overflow-auto rounded-lg border border-line bg-surface-2">
                <img
                  src={comparison === 'before' ? item.preview : result.url}
                  alt={comparison === 'before' ? ui.before : ui.after}
                  class="max-w-none"
                />
              </div>
              <p class="mt-2 text-xs text-subtle">{ui.zoomHint}</p>
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
          <Segmented
            label={ui.scaleLabel}
            value={String(scale)}
            onValue={(value) => setScale(Number(value) as Scale)}
            options={[
              { value: '2', label: ui.scale2 },
              { value: '4', label: ui.scale4 },
            ]}
          />
          <Field label={ui.formatLabel} hint={ui.formatHint}>
            <Select
              value={format}
              onValue={setFormat}
              options={[
                { value: 'image/png', label: ui.formatPng },
                { value: 'image/jpeg', label: ui.formatJpeg },
                { value: 'image/webp', label: ui.formatWebp },
              ]}
            />
          </Field>

          {output && (
            <div class="grid grid-cols-2 gap-3" aria-live="polite">
              <Stat label={ui.originalSize} value={`${item!.width}×${item!.height}`} />
              <Stat label={ui.outputSize} value={`${output.width}×${output.height}`} emphasis />
            </div>
          )}

          <Notice>{ui.limitNote}</Notice>
          {isWorking && <Notice>{status}</Notice>}

          {isWorking ? (
            <Button variant="danger" size="lg" onClick={cancel}>
              {ui.cancel}
            </Button>
          ) : (
            <Button variant="primary" size="lg" disabled={!item} onClick={start}>
              {ui.start}
            </Button>
          )}
          {result && item && !isWorking && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => downloadBlob(result.blob, outputName(item.file.name, scale, format))}
            >
              {ui.download}
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
