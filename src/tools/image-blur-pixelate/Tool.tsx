import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Select, Stat, cx } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  clampStrength,
  isMeaningfulRegion,
  normalizeRegion,
  outputName,
  regionFromPoints,
  type Effect,
  type OutputFormat,
  type Region,
} from './logic';
import { loadImage, renderImage, type LoadedImage, type RenderProgress } from './render';

interface Drag {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

let nextRegionId = 1;
const PREVIEW_MAX_LONG_SIDE = 1200;

export default function ImageBlurPixelate({ ui }: ToolProps<UI>) {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [fileName, setFileName] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [effect, setEffect] = useState<Effect>(() => storedEffect());
  const [strength, setStrength] = useState(() => clampStrength(storedNumber('strength', 18)));
  const [format, setFormat] = useState<OutputFormat>(() => storedFormat());
  const [quality, setQuality] = useState(() => storedPercent('quality', 92));
  const [result, setResult] = useState<{ url: string; key: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [drag, setDrag] = useState<Drag | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);
  const previewController = useRef<AbortController | null>(null);
  const exportController = useRef<AbortController | null>(null);
  const imageRef = useRef(image);
  imageRef.current = image;
  const resultRef = useRef(result);
  resultRef.current = result;
  const renderKey = image ? JSON.stringify([fileName, image.width, image.height, regions, effect, strength]) : '';
  const ready = !!result && result.key === renderKey;

  useEffect(() => {
    safeStorage.set('tools:image-blur-pixelate:effect', effect);
  }, [effect]);
  useEffect(() => {
    safeStorage.set('tools:image-blur-pixelate:strength', String(strength));
  }, [strength]);
  useEffect(() => {
    safeStorage.set('tools:image-blur-pixelate:format', format);
  }, [format]);
  useEffect(() => {
    safeStorage.set('tools:image-blur-pixelate:quality', String(quality));
  }, [quality]);

  useEffect(() => {
    if (!image) return;
    const id = ++runId.current;
    const controller = new AbortController();
    previewController.current = controller;
    const timeout = window.setTimeout(() => {
      setPreviewing(true);
      void (async () => {
        try {
          const blob = await renderImage(image, regions, effect, strength, 'image/png', 1, {
            maxLongSide: PREVIEW_MAX_LONG_SIDE,
            signal: controller.signal,
          });
          if (id !== runId.current || controller.signal.aborted) return;
          const next = { url: URL.createObjectURL(blob), key: renderKey };
          setResult((previous) => {
            if (previous) URL.revokeObjectURL(previous.url);
            return next;
          });
          setError('');
        } catch (renderError) {
          if (id === runId.current && !isAbortError(renderError)) setError(ui.renderError);
        } finally {
          if (id === runId.current) setPreviewing(false);
          if (previewController.current === controller) previewController.current = null;
        }
      })();
    }, 250);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      if (previewController.current === controller) previewController.current = null;
    };
  }, [effect, image, regions, renderKey, strength, ui.renderError]);

  useEffect(
    () => () => {
      previewController.current?.abort();
      exportController.current?.abort();
      imageRef.current?.bitmap.close();
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    },
    [],
  );

  const clearImage = useCallback(() => {
    runId.current += 1;
    previewController.current?.abort();
    exportController.current?.abort();
    if (image) image.bitmap.close();
    if (result) URL.revokeObjectURL(result.url);
    setImage(null);
    setResult(null);
    setFileName('');
    setRegions([]);
    setActiveId(null);
    setDrag(null);
    setPreviewing(false);
    setExporting(false);
    setExportProgress('');
    setStatus('');
    setError('');
  }, [image, result]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      clearImage();
      const loadId = runId.current;
      try {
        const loaded = await loadImage(file);
        if (loadId !== runId.current) {
          loaded.bitmap.close();
          return;
        }
        setImage(loaded);
        setFileName(file.name);
      } catch {
        if (loadId === runId.current) setError(ui.unsupported);
      }
    },
    [clearImage, ui.unsupported],
  );

  const relativePoint = (clientX: number, clientY: number) => {
    const bounds = editorRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return {
      x: Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (clientY - bounds.top) / bounds.height)),
    };
  };

  const endDrag = (clientX: number, clientY: number) => {
    if (!drag) return;
    const point = relativePoint(clientX, clientY);
    const region = regionFromPoints(nextRegionId++, drag.startX, drag.startY, point.x, point.y);
    setDrag(null);
    if (!isMeaningfulRegion(region)) return;
    setRegions((current) => [...current, region]);
    setActiveId(region.id);
  };

  const addRegion = () => {
    const region: Region = { id: nextRegionId++, x: 0.4, y: 0.4, width: 0.2, height: 0.2 };
    setRegions((current) => [...current, region]);
    setActiveId(region.id);
  };

  const updateRegion = (id: number, patch: Partial<Region>) =>
    setRegions((current) =>
      current.map((region) => (region.id === id ? normalizeRegion({ ...region, ...patch }) : region)),
    );

  const exportImage = async () => {
    if (!image || regions.length === 0 || exporting) return;
    const controller = new AbortController();
    exportController.current?.abort();
    exportController.current = controller;
    setExporting(true);
    setExportProgress(ui.preparingFull);
    setStatus('');
    setError('');
    try {
      const blob = await renderImage(image, regions, effect, strength, format, quality / 100, {
        signal: controller.signal,
        onProgress: (progress) => setExportProgress(progressText(progress, ui)),
      });
      if (controller.signal.aborted) return;
      downloadBlob(blob, outputName(fileName, format));
    } catch (renderError) {
      if (!isAbortError(renderError)) setError(ui.renderError);
    } finally {
      if (exportController.current === controller) {
        exportController.current = null;
        setExporting(false);
        setExportProgress('');
      }
    }
  };

  const cancelExport = () => {
    exportController.current?.abort();
    setExporting(false);
    setExportProgress('');
    setStatus(ui.exportCancelled);
  };

  const active = regions.find((region) => region.id === activeId) ?? null;
  const previewRegion = drag && regionFromPoints(-1, drag.startX, drag.startY, drag.endX, drag.endY);
  const renderingEdit = regions.length > 0 && !ready;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          {!image ? (
            <>
              <Dropzone accept="image/*" onFiles={addFiles} title={ui.dropTitle} hint={ui.dropHint} />
              <div class="mt-4">
                <Notice>{ui.privacyNote}</Notice>
              </div>
            </>
          ) : (
            <>
              <div
                ref={editorRef}
                role="region"
                tabIndex={0}
                aria-label={ui.editorLabel}
                aria-busy={previewing}
                onPointerDown={(event) => {
                  if (exporting) return;
                  if ((event.target as HTMLElement).closest('[data-region]')) return;
                  const point = relativePoint(event.clientX, event.clientY);
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDrag({ startX: point.x, startY: point.y, endX: point.x, endY: point.y });
                }}
                onPointerMove={(event) => {
                  if (exporting) return;
                  if (!drag) return;
                  const point = relativePoint(event.clientX, event.clientY);
                  setDrag((current) => (current ? { ...current, endX: point.x, endY: point.y } : null));
                }}
                onPointerUp={(event) => !exporting && endDrag(event.clientX, event.clientY)}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={(event) => {
                  if (exporting) return;
                  if ((event.key === 'Delete' || event.key === 'Backspace') && activeId !== null) {
                    event.preventDefault();
                    setRegions((current) => current.filter((region) => region.id !== activeId));
                    setActiveId(null);
                  }
                }}
                class="relative w-full overflow-hidden rounded-lg border border-line bg-surface-2 touch-none"
                style={!result ? { aspectRatio: `${image.width} / ${image.height}` } : undefined}
              >
                {result && (
                  <img src={result.url} alt={ui.previewAlt} class="block w-full h-auto select-none" draggable={false} />
                )}
                {previewing && !result && <div class="size-full" aria-hidden="true" />}
                {[...regions, ...(previewRegion ? [previewRegion] : [])].map((region) => (
                  <button
                    type="button"
                    data-region
                    disabled={exporting}
                    aria-label={ui.regionLabel.replace('{n}', String(region.id))}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setActiveId(region.id)}
                    class={cx(
                      'absolute border-2 transition-colors',
                      region.id === activeId ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface-2/50',
                    )}
                    style={{
                      left: `${region.x * 100}%`,
                      top: `${region.y * 100}%`,
                      width: `${region.width * 100}%`,
                      height: `${region.height * 100}%`,
                    }}
                  />
                ))}
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <Button variant="secondary" disabled={exporting} onClick={addRegion}>
                  {ui.addRegion}
                </Button>
                <Button
                  variant="ghost"
                  disabled={regions.length === 0 || exporting}
                  onClick={() => {
                    setRegions((current) => current.slice(0, -1));
                    setActiveId(null);
                  }}
                >
                  {ui.undo}
                </Button>
                <Button
                  variant="ghost"
                  disabled={regions.length === 0 || exporting}
                  onClick={() => {
                    setRegions([]);
                    setActiveId(null);
                  }}
                >
                  {ui.clearRegions}
                </Button>
                <Button variant="ghost" disabled={exporting} onClick={clearImage}>
                  {ui.changeImage}
                </Button>
              </div>
              <p class="mt-3 text-xs text-subtle">{ui.drawHint}</p>
              {error && (
                <div class="mt-4">
                  <Notice tone="danger">{error}</Notice>
                </div>
              )}
            </>
          )}
        </div>

        <div class="flex flex-col gap-5">
          <Field label={ui.effectLabel}>
            <Segmented<Effect>
              label={ui.effectLabel}
              value={effect}
              onValue={setEffect}
              disabled={exporting}
              options={[
                { value: 'blur', label: ui.effectBlur },
                { value: 'pixelate', label: ui.effectPixelate },
              ]}
            />
          </Field>
          <Field label={ui.strengthLabel.replace('{n}', String(strength))} hint={ui.strengthHint}>
            <input
              type="range"
              min={1}
              max={50}
              value={strength}
              disabled={exporting}
              onInput={(event) => setStrength(clampStrength(Number((event.currentTarget as HTMLInputElement).value)))}
              class="w-full accent-[var(--accent)]"
            />
          </Field>

          {active && (
            <div class="border-t border-line pt-5">
              <p class="mb-3 text-sm font-medium text-fg">{ui.selectedRegion}</p>
              <div class="grid grid-cols-2 gap-3">
                <Field label={ui.regionX}>
                  <NumberInput
                    value={percentValue(active.x)}
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={exporting}
                    onValue={(v) => typeof v === 'number' && updateRegion(active.id, { x: v / 100 })}
                  />
                </Field>
                <Field label={ui.regionY}>
                  <NumberInput
                    value={percentValue(active.y)}
                    min={0}
                    max={100}
                    step={0.1}
                    disabled={exporting}
                    onValue={(v) => typeof v === 'number' && updateRegion(active.id, { y: v / 100 })}
                  />
                </Field>
                <Field label={ui.regionWidth}>
                  <NumberInput
                    value={percentValue(active.width)}
                    min={1}
                    max={100}
                    step={0.1}
                    disabled={exporting}
                    onValue={(v) => typeof v === 'number' && updateRegion(active.id, { width: v / 100 })}
                  />
                </Field>
                <Field label={ui.regionHeight}>
                  <NumberInput
                    value={percentValue(active.height)}
                    min={1}
                    max={100}
                    step={0.1}
                    disabled={exporting}
                    onValue={(v) => typeof v === 'number' && updateRegion(active.id, { height: v / 100 })}
                  />
                </Field>
              </div>
              <Button
                class="mt-3"
                variant="ghost"
                disabled={exporting}
                onClick={() => {
                  setRegions((current) => current.filter((region) => region.id !== active.id));
                  setActiveId(null);
                }}
              >
                {ui.removeRegion}
              </Button>
            </div>
          )}

          <div class="border-t border-line pt-5 flex flex-col gap-5">
            <Field label={ui.formatLabel}>
              <Select<OutputFormat>
                value={format}
                onValue={setFormat}
                disabled={exporting}
                options={[
                  { value: 'image/png', label: ui.formatPng },
                  { value: 'image/jpeg', label: ui.formatJpeg },
                  { value: 'image/webp', label: ui.formatWebp },
                ]}
              />
            </Field>
            {format !== 'image/png' && (
              <Field label={ui.qualityLabel.replace('{n}', String(quality))}>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  disabled={exporting}
                  onInput={(event) => setQuality(Number((event.currentTarget as HTMLInputElement).value))}
                  class="w-full accent-[var(--accent)]"
                />
              </Field>
            )}
          </div>

          {image && (
            <div class="border-t border-line pt-5">
              <div class="grid grid-cols-2 gap-3" aria-live="polite">
                <Stat label={ui.widthLabel} value={image.width} />
                <Stat label={ui.heightLabel} value={image.height} />
              </div>
              <div class="mt-4 flex gap-2" aria-live="polite" aria-busy={exporting}>
                <Button
                  class="min-w-0 flex-1"
                  variant="primary"
                  size="lg"
                  disabled={!ready || exporting || regions.length === 0}
                  onClick={exportImage}
                >
                  {exporting ? ui.exporting : previewing || renderingEdit ? ui.processing : ui.download}
                </Button>
                {exporting && (
                  <Button size="lg" onClick={cancelExport}>
                    {ui.cancel}
                  </Button>
                )}
              </div>
              {regions.length === 0 ? (
                <div class="mt-3">
                  <Notice>{ui.selectRegionNotice}</Notice>
                </div>
              ) : (
                (previewing || renderingEdit) && (
                  <p class="mt-2 text-xs text-subtle" aria-live="polite">
                    {ui.processing}
                  </p>
                )
              )}
              {exportProgress && <p class="mt-2 text-sm text-muted">{exportProgress}</p>}
              {status && (
                <div class="mt-3">
                  <Notice>{status}</Notice>
                </div>
              )}
            </div>
          )}
          {!image && error && <Notice tone="danger">{error}</Notice>}
        </div>
      </div>
    </Panel>
  );
}

function storedNumber(name: string, fallback: number): number {
  const value = Number(safeStorage.get(`tools:image-blur-pixelate:${name}`));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function storedEffect(): Effect {
  return safeStorage.get('tools:image-blur-pixelate:effect') === 'pixelate' ? 'pixelate' : 'blur';
}

function storedFormat(): OutputFormat {
  const format = safeStorage.get('tools:image-blur-pixelate:format');
  return format === 'image/jpeg' || format === 'image/webp' ? format : 'image/png';
}

function storedPercent(name: string, fallback: number): number {
  return Math.min(100, Math.max(10, Math.round(storedNumber(name, fallback))));
}

function percentValue(value: number): number {
  return Number((value * 100).toFixed(1));
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function progressText(progress: RenderProgress, ui: UI): string {
  if (progress.stage === 'encoding') return ui.encodingFull;
  if (progress.stage === 'effects') {
    return ui.applyingEffect.replace('{current}', String(progress.current)).replace('{total}', String(progress.total));
  }
  return ui.preparingFull;
}
