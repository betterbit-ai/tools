import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, Segmented, Select, cx } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_EXPORT_LONG_SIDE,
  MAX_IMAGES,
  outputDimensions,
  outputName,
  type AspectId,
  type FormatChoice,
  type LayoutId,
} from './logic';
import { renderCollage, type RenderOptions, type RenderProgress } from './render';

const STORAGE_KEY = 'tools:collage-maker:settings';
const LONG_SIDES = [1080, 2048, 3000, MAX_EXPORT_LONG_SIDE] as const;

interface Settings {
  layout: LayoutId;
  aspect: AspectId;
  longSide: (typeof LONG_SIDES)[number];
  gap: number;
  format: FormatChoice;
  quality: number;
}

const defaults: Settings = {
  layout: 'auto',
  aspect: 'square',
  longSide: 3000,
  gap: 16,
  format: 'image/jpeg',
  quality: 0.92,
};

function savedSettings(): Settings {
  try {
    const stored = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<Settings> | null;
    if (
      stored &&
      ['auto', 'grid', 'featured', 'row', 'column'].includes(stored.layout ?? '') &&
      ['square', 'portrait', 'landscape', 'story'].includes(stored.aspect ?? '') &&
      LONG_SIDES.includes(stored.longSide as (typeof LONG_SIDES)[number]) &&
      [0, 8, 16, 24].includes(stored.gap ?? -1) &&
      ['image/jpeg', 'image/png', 'image/webp'].includes(stored.format ?? '') &&
      [0.8, 0.92, 1].includes(stored.quality ?? -1)
    ) {
      return stored as Settings;
    }
  } catch {
    // Corrupt or unavailable storage should never stop a simple image task.
  }
  return defaults;
}

export default function CollageMaker({ ui }: ToolProps<UI>) {
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState<Settings>(savedSettings);
  const [preview, setPreview] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewProgress, setPreviewProgress] = useState('');
  const [exportProgress, setExportProgress] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const previewController = useRef<AbortController | null>(null);
  const exportController = useRef<AbortController | null>(null);

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(settings)), [settings]);

  const fileKey = files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join('|');
  useEffect(() => {
    if (files.length < 2) {
      setPreview('');
      setPreviewing(false);
      setPreviewProgress('');
      return;
    }
    const controller = new AbortController();
    previewController.current = controller;
    let url = '';
    setPreviewing(true);
    setPreviewProgress(ui.previewing);
    setError('');
    void (async () => {
      try {
        const previewSide = 720;
        const blob = await renderCollage(
          files,
          {
            ...settings,
            longSide: previewSide,
            gap: Math.max(0, Math.round((settings.gap * previewSide) / settings.longSide)),
            format: 'image/png',
          },
          {
            signal: controller.signal,
            onProgress: (progress) =>
              setPreviewProgress(progressText(progress, 'PNG', ui.processingPhoto, ui.encoding)),
          },
        );
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setPreview(url);
      } catch (renderError) {
        if (!isAbortError(renderError)) setError(ui.renderFailed);
      } finally {
        if (previewController.current === controller) {
          previewController.current = null;
          setPreviewing(false);
          setPreviewProgress('');
        }
      }
    })();
    return () => {
      controller.abort();
      if (previewController.current === controller) previewController.current = null;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileKey, files, settings, ui.encoding, ui.previewing, ui.processingPhoto, ui.renderFailed]);

  useEffect(
    () => () => {
      previewController.current?.abort();
      exportController.current?.abort();
    },
    [],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      setFiles((current) => {
        const available = MAX_IMAGES - current.length;
        setStatus(incoming.length > available ? ui.limitReached.replace('{n}', String(MAX_IMAGES)) : '');
        return [...current, ...incoming.slice(0, Math.max(0, available))];
      });
    },
    [ui.limitReached],
  );

  const remove = (index: number) => setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  const move = (index: number, direction: -1 | 1) =>
    setFiles((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  const reset = () => {
    previewController.current?.abort();
    exportController.current?.abort();
    setFiles([]);
    setPreviewing(false);
    setDownloading(false);
    setPreviewProgress('');
    setExportProgress('');
    setStatus('');
    setError('');
  };
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const dimensions = useMemo(
    () => outputDimensions(settings.aspect, settings.longSide),
    [settings.aspect, settings.longSide],
  );
  const settingsForRender: RenderOptions = settings;
  const download = async () => {
    if (files.length < 2) return;
    const controller = new AbortController();
    exportController.current?.abort();
    exportController.current = controller;
    setDownloading(true);
    setExportProgress(ui.exporting);
    setStatus('');
    setError('');
    try {
      const blob = await renderCollage(files, settingsForRender, {
        signal: controller.signal,
        onProgress: (progress) =>
          setExportProgress(progressText(progress, formatLabel(settings.format, ui), ui.processingPhoto, ui.encoding)),
      });
      if (controller.signal.aborted) return;
      downloadBlob(blob, outputName(settings.format, dimensions.width, dimensions.height));
    } catch (renderError) {
      if (!isAbortError(renderError)) setError(ui.renderFailed);
    } finally {
      if (exportController.current === controller) {
        exportController.current = null;
        setDownloading(false);
        setExportProgress('');
      }
    }
  };

  const cancelPreview = () => {
    previewController.current?.abort();
    setPreviewing(false);
    setPreviewProgress('');
    setStatus(ui.previewCancelled);
  };
  const cancelDownload = () => {
    exportController.current?.abort();
    setDownloading(false);
    setExportProgress('');
    setStatus(ui.cancelled);
  };

  const outputSize = ui.outputSize
    .replace('{width}', String(dimensions.width))
    .replace('{height}', String(dimensions.height));

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="image/*"
            multiple
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint.replace('{n}', String(MAX_IMAGES))}
            compact={files.length > 0}
          />

          {files.length > 0 && (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line" aria-label={ui.photoList}>
              {files.map((file, index) => (
                <li class="flex items-center gap-2 p-2.5">
                  <span class="tabular text-xs text-subtle">{index + 1}</span>
                  <span class="min-w-0 flex-1 truncate text-sm font-medium text-fg">{file.name}</span>
                  <div class="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={ui.moveUp}
                    >
                      {ui.moveUp}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === files.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={ui.moveDown}
                    >
                      {ui.moveDown}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(index)} aria-label={ui.remove}>
                      {ui.remove}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {files.length === 0 && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}
          {files.length === 1 && (
            <div class="mt-4">
              <Notice>{ui.addAnother}</Notice>
            </div>
          )}
          {error && (
            <div class="mt-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          )}

          {files.length >= 2 && (
            <div class="mt-5" aria-live="polite" aria-busy={previewing}>
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium text-fg">{previewing ? previewProgress : ui.previewLabel}</p>
                {previewing && (
                  <Button size="sm" variant="ghost" onClick={cancelPreview}>
                    {ui.cancelPreview}
                  </Button>
                )}
              </div>
              <div class="overflow-hidden rounded-lg border border-line bg-surface-2">
                {preview ? (
                  <img src={preview} alt={ui.previewAlt} class="mx-auto block max-h-[440px] max-w-full" />
                ) : (
                  <div class="flex min-h-48 items-center justify-center p-4 text-sm text-muted">{ui.previewing}</div>
                )}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div class="mt-4 flex flex-wrap gap-3">
              <Button variant="ghost" onClick={reset}>
                {ui.clear}
              </Button>
            </div>
          )}
        </div>

        <div class="flex flex-col gap-5">
          <Field label={ui.layout}>
            <Select
              value={settings.layout}
              onValue={(value) => set('layout', value)}
              options={[
                { value: 'auto', label: ui.layoutAuto },
                { value: 'grid', label: ui.layoutGrid },
                { value: 'featured', label: ui.layoutFeatured },
                { value: 'row', label: ui.layoutRow },
                { value: 'column', label: ui.layoutColumn },
              ]}
            />
          </Field>
          <Field label={ui.canvas}>
            <Segmented
              label={ui.canvas}
              value={settings.aspect}
              onValue={(value) => set('aspect', value)}
              options={[
                { value: 'square', label: ui.aspectSquare },
                { value: 'portrait', label: ui.aspectPortrait },
                { value: 'landscape', label: ui.aspectLandscape },
                { value: 'story', label: ui.aspectStory },
              ]}
            />
          </Field>
          <Field label={ui.exportSize} hint={outputSize}>
            <Select
              value={String(settings.longSide)}
              onValue={(value) => set('longSide', Number(value) as Settings['longSide'])}
              options={LONG_SIDES.map((side) => ({
                value: String(side),
                label: ui.sizeOption.replace('{n}', String(side)),
              }))}
            />
          </Field>
          <Field label={ui.spacing}>
            <Segmented
              label={ui.spacing}
              value={String(settings.gap)}
              onValue={(value) => set('gap', Number(value))}
              options={[0, 8, 16, 24].map((gap) => ({
                value: String(gap),
                label: ui.gapOption.replace('{n}', String(gap)),
              }))}
            />
          </Field>
          <Field label={ui.format}>
            <Select
              value={settings.format}
              onValue={(value) => set('format', value)}
              options={[
                { value: 'image/jpeg', label: ui.formatJpg },
                { value: 'image/png', label: ui.formatPng },
                { value: 'image/webp', label: ui.formatWebp },
              ]}
            />
          </Field>
          {settings.format !== 'image/png' && (
            <Field label={ui.quality}>
              <Segmented
                label={ui.quality}
                value={String(settings.quality)}
                onValue={(value) => set('quality', Number(value))}
                options={[
                  { value: '0.8', label: ui.qualitySmall },
                  { value: '0.92', label: ui.qualityBalanced },
                  { value: '1', label: ui.qualityBest },
                ]}
              />
            </Field>
          )}
          <div class="flex gap-2" aria-live="polite" aria-busy={downloading}>
            <Button
              class="min-w-0 flex-1"
              variant="primary"
              size="lg"
              disabled={files.length < 2 || downloading}
              onClick={download}
            >
              {downloading ? ui.exporting : ui.download}
            </Button>
            {downloading && (
              <Button size="lg" onClick={cancelDownload}>
                {ui.cancel}
              </Button>
            )}
          </div>
          {exportProgress && <p class="text-sm text-muted">{exportProgress}</p>}
          {status && <Notice>{status}</Notice>}
          <p class={cx('text-xs text-subtle', files.length < 2 && 'hidden')}>{ui.localNote}</p>
        </div>
      </div>
    </Panel>
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function progressText(
  progress: RenderProgress,
  format: string,
  photoTemplate: string,
  encodingTemplate: string,
): string {
  if (progress.stage === 'encoding') return encodingTemplate.replace('{format}', format);
  return photoTemplate.replace('{current}', String(progress.current)).replace('{total}', String(progress.total));
}

function formatLabel(format: FormatChoice, ui: UI): string {
  if (format === 'image/png') return ui.formatPng;
  if (format === 'image/webp') return ui.formatWebp;
  return ui.formatJpg;
}
