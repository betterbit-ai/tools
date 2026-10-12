import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
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
import { renderCollage, type RenderOptions } from './render';

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
  const [error, setError] = useState('');

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(settings)), [settings]);

  const fileKey = files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join('|');
  useEffect(() => {
    if (files.length < 2) {
      setPreview('');
      return;
    }
    let cancelled = false;
    let url = '';
    setPreviewing(true);
    setError('');
    const timeout = setTimeout(async () => {
      try {
        const previewSide = 720;
        const blob = await renderCollage(files, {
          ...settings,
          longSide: previewSide,
          gap: Math.max(0, Math.round((settings.gap * previewSide) / settings.longSide)),
          format: 'image/png',
        });
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreview(url);
      } catch {
        if (!cancelled) setError(ui.unreadable);
      } finally {
        if (!cancelled) setPreviewing(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileKey, files, settings, ui.unreadable]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      setFiles((current) => {
        const available = MAX_IMAGES - current.length;
        if (incoming.length > available) setError(ui.limitReached.replace('{n}', String(MAX_IMAGES)));
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
    setFiles([]);
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
    setDownloading(true);
    setError('');
    try {
      const blob = await renderCollage(files, settingsForRender);
      downloadBlob(blob, outputName(settings.format, dimensions.width, dimensions.height));
    } catch {
      setError(ui.unreadable);
    } finally {
      setDownloading(false);
    }
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
            <div class="mt-5" aria-live="polite">
              <p class="mb-2 text-sm font-medium text-fg">{previewing ? ui.previewing : ui.previewLabel}</p>
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
          <Button variant="primary" size="lg" disabled={files.length < 2 || downloading} onClick={download}>
            {downloading ? ui.exporting : ui.download}
          </Button>
          <p class={cx('text-xs text-subtle', files.length < 2 && 'hidden')}>{ui.localNote}</p>
        </div>
      </div>
    </Panel>
  );
}
