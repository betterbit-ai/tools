import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  Dropzone,
  Field,
  Kbd,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  Stat,
  TextInput,
} from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { AspectId, BackgroundId, FrameStyle } from './logic';
import { outputName, planRender } from './logic';
import { renderScreenshot, type RenderSettings } from './render';
import type { UI } from './content';

const STORAGE_KEY = 'tools:screenshot-beautifier:settings';
const defaults: RenderSettings = {
  aspect: 'original',
  frame: 'browser-light',
  background: 'violet',
  padding: 120,
  radius: 24,
  shadow: 50,
  browserTitle: '',
};

function savedSettings(): RenderSettings {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<RenderSettings> | null;
    if (
      saved &&
      ['original', 'square', 'portrait', 'landscape'].includes(saved.aspect ?? '') &&
      ['none', 'browser-light', 'browser-dark'].includes(saved.frame ?? '') &&
      ['violet', 'sunset', 'ocean', 'mint', 'warm'].includes(saved.background ?? '') &&
      typeof saved.padding === 'number' &&
      typeof saved.radius === 'number' &&
      typeof saved.shadow === 'number' &&
      typeof saved.browserTitle === 'string'
    )
      return saved as RenderSettings;
  } catch {
    // Storage is optional; corrupt settings must not block editing.
  }
  return defaults;
}

export default function ScreenshotBeautifier({ ui }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<RenderSettings>(savedSettings);
  const [preview, setPreview] = useState('');
  const [source, setSource] = useState<{ width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);
  const previewRef = useRef('');

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(settings)), [settings]);
  const fileKey = file ? `${file.name}:${file.size}:${file.lastModified}` : '';

  useEffect(() => {
    if (!file) {
      setPreview('');
      setSource(null);
      setBusy(false);
      return;
    }
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    const timeout = window.setTimeout(() => {
      setBusy(true);
      setError('');
      void (async () => {
        try {
          const dimensions = await imageDimensions(file);
          const blob = await renderScreenshot(file, settings, true, controller.signal);
          if (controller.signal.aborted) return;
          const nextPreview = URL.createObjectURL(blob);
          if (previewRef.current) URL.revokeObjectURL(previewRef.current);
          previewRef.current = nextPreview;
          setPreview(nextPreview);
          setSource(dimensions);
        } catch (cause) {
          if (!isAbortError(cause)) setError(ui.renderFailed);
        } finally {
          if (controllerRef.current === controller) setBusy(false);
        }
      })();
    }, 250);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [file, fileKey, settings, ui.renderFailed]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );
  const set = <K extends keyof RenderSettings>(key: K, value: RenderSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));
  const addFile = useCallback((files: File[]) => {
    if (files[0]) {
      setError('');
      setFile(files[0]);
    }
  }, []);
  const reset = () => {
    controllerRef.current?.abort();
    setFile(null);
    setSettings(defaults);
    setPreview('');
    setSource(null);
    setError('');
  };

  const download = useCallback(async () => {
    if (!file || downloading) return;
    setDownloading(true);
    setError('');
    try {
      downloadBlob(await renderScreenshot(file, settings, false), outputName(file.name));
    } catch {
      setError(ui.downloadFailed);
    } finally {
      setDownloading(false);
    }
  }, [downloading, file, settings, ui.downloadFailed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key.toLowerCase() !== 'd' ||
        target?.matches('input, textarea, select, [contenteditable]') ||
        !file ||
        busy ||
        downloading
      )
        return;
      event.preventDefault();
      void download();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, download, downloading, file]);

  const plan = source ? planRender(source.width, source.height, settings) : null;
  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0">
          {!file ? (
            <Dropzone
              accept="image/png,image/jpeg,image/webp"
              onFiles={addFile}
              title={ui.dropTitle}
              hint={ui.dropHint}
            />
          ) : (
            <>
              <Dropzone
                accept="image/png,image/jpeg,image/webp"
                onFiles={addFile}
                title={ui.replaceTitle}
                hint={ui.dropHint}
                compact
              />
              <div class="mt-4 overflow-hidden rounded-lg border border-line bg-surface-2">
                {preview ? (
                  <img src={preview} alt={ui.previewAlt} class="block max-h-[560px] w-full object-contain" />
                ) : (
                  <div
                    class="flex min-h-64 items-center justify-center px-4 text-center text-sm text-muted"
                    aria-live="polite"
                  >
                    {busy ? ui.rendering : ui.previewWaiting}
                  </div>
                )}
              </div>
              <div class="mt-3 grid grid-cols-2 gap-3" aria-live="polite">
                <Stat label={ui.sourceSize} value={source ? `${source.width} × ${source.height}` : ui.emptyValue} />
                <Stat label={ui.exportSize} value={plan ? `${plan.width} × ${plan.height}` : ui.emptyValue} />
              </div>
            </>
          )}
          {error && (
            <div class="mt-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          )}
        </div>
        <div class="space-y-5 border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <Field label={ui.backgroundLabel}>
            <Segmented
              label={ui.backgroundLabel}
              value={settings.background}
              onValue={(value) => set('background', value as BackgroundId)}
              options={[
                { value: 'violet', label: ui.backgroundViolet },
                { value: 'sunset', label: ui.backgroundSunset },
                { value: 'ocean', label: ui.backgroundOcean },
                { value: 'mint', label: ui.backgroundMint },
                { value: 'warm', label: ui.backgroundWarm },
              ]}
            />
          </Field>
          <Field label={ui.frameLabel}>
            <Segmented
              label={ui.frameLabel}
              value={settings.frame}
              onValue={(value) => set('frame', value as FrameStyle)}
              options={[
                { value: 'none', label: ui.frameNone },
                { value: 'browser-light', label: ui.frameLight },
                { value: 'browser-dark', label: ui.frameDark },
              ]}
            />
          </Field>
          {settings.frame !== 'none' && (
            <Field label={ui.titleLabel} hint={ui.titleHint}>
              <TextInput
                value={settings.browserTitle}
                maxLength={100}
                onInput={(event) => set('browserTitle', event.currentTarget.value)}
              />
            </Field>
          )}
          <Field label={ui.aspectLabel}>
            <Segmented
              label={ui.aspectLabel}
              value={settings.aspect}
              onValue={(value) => set('aspect', value as AspectId)}
              options={[
                { value: 'original', label: ui.aspectOriginal },
                { value: 'square', label: ui.aspectSquare },
                { value: 'portrait', label: ui.aspectPortrait },
                { value: 'landscape', label: ui.aspectLandscape },
              ]}
            />
          </Field>
          <div class="grid grid-cols-3 gap-3">
            <Field label={ui.paddingLabel}>
              <NumberInput
                value={settings.padding}
                min={0}
                max={800}
                onValue={(value) => set('padding', value === '' ? 0 : value)}
              />
            </Field>
            <Field label={ui.radiusLabel}>
              <NumberInput
                value={settings.radius}
                min={0}
                max={160}
                onValue={(value) => set('radius', value === '' ? 0 : value)}
              />
            </Field>
            <Field label={ui.shadowLabel}>
              <NumberInput
                value={settings.shadow}
                min={0}
                max={100}
                onValue={(value) => set('shadow', value === '' ? 0 : value)}
              />
            </Field>
          </div>
          <div class="flex flex-wrap gap-3 pt-1">
            <Button variant="primary" disabled={!file || busy || downloading} onClick={() => void download()}>
              {downloading ? ui.downloading : ui.download}
            </Button>
            <Button variant="secondary" onClick={reset}>
              {ui.reset}
            </Button>
          </div>
          <p class="text-xs text-subtle">
            {ui.shortcutHint} <Kbd>{ui.shortcutKey}</Kbd>
          </p>
        </div>
      </div>
    </Panel>
  );
}

async function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
