import { useEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Dropzone,
  Field,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  TextInput,
  Toggle,
} from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { FAVICON_FILES, installSnippet } from './logic';
import { packageZip, renderFavicons, type FaviconSettings, type ImageFit, type RenderedFavicon } from './render';

const STORAGE_KEY = 'tools:favicon-generator:settings';
const DEFAULT_SETTINGS: FaviconSettings = {
  source: 'text',
  text: 'B',
  background: '#2563eb',
  foreground: '#ffffff',
  transparent: false,
  fit: 'contain',
  padding: 8,
  siteName: '',
};

function isSettings(value: unknown): value is FaviconSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Partial<FaviconSettings>;
  return (
    (settings.source === 'text' || settings.source === 'image') &&
    typeof settings.text === 'string' &&
    typeof settings.background === 'string' &&
    typeof settings.foreground === 'string' &&
    typeof settings.transparent === 'boolean' &&
    (settings.fit === 'contain' || settings.fit === 'cover') &&
    typeof settings.padding === 'number' &&
    typeof settings.siteName === 'string'
  );
}

export default function FaviconGenerator({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<FaviconSettings>(DEFAULT_SETTINGS);
  const [image, setImage] = useState<File | null>(null);
  const [rendered, setRendered] = useState<RenderedFavicon | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'working' | 'cancelled' | 'error'>('idle');
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [error, setError] = useState('');
  const previewRef = useRef('');
  const renderAbortRef = useRef<AbortController | null>(null);
  const downloadAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (isSettings(saved)) setSettings({ ...DEFAULT_SETTINGS, ...saved });
    } catch {
      /* Ignore malformed local browser data. */
    }
  }, []);

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(settings)), [settings]);

  useEffect(() => {
    if (settings.source === 'image' && !image) {
      renderAbortRef.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = '';
      setPreviewUrl('');
      setRendered(null);
      setStatus('idle');
      setProgress(null);
      return;
    }
    const controller = new AbortController();
    renderAbortRef.current?.abort();
    renderAbortRef.current = controller;
    let cancelled = false;
    setStatus('working');
    setProgress(null);
    setError('');
    setDownloadError('');
    setRendered(null);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = '';
    setPreviewUrl('');
    const timeout = window.setTimeout(async () => {
      try {
        const next = await renderFavicons(image, settings, {
          signal: controller.signal,
          onProgress: (current, total) => {
            if (!cancelled && !controller.signal.aborted) setProgress({ current, total });
          },
        });
        if (cancelled || controller.signal.aborted) return;
        const nextPreview = URL.createObjectURL(next.pngs['android-chrome-192x192.png']);
        previewRef.current = nextPreview;
        setPreviewUrl(nextPreview);
        setRendered(next);
        setStatus('idle');
      } catch (renderError) {
        if (!cancelled && !isAbortError(renderError)) {
          setRendered(null);
          setStatus('error');
          setError(ui.unsupported);
        }
      } finally {
        if (renderAbortRef.current === controller) {
          renderAbortRef.current = null;
          setProgress(null);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      controller.abort();
      if (renderAbortRef.current === controller) renderAbortRef.current = null;
      window.clearTimeout(timeout);
    };
  }, [
    image,
    settings.source,
    settings.text,
    settings.background,
    settings.foreground,
    settings.transparent,
    settings.fit,
    settings.padding,
    ui.unsupported,
  ]);

  useEffect(
    () => () => {
      renderAbortRef.current?.abort();
      downloadAbortRef.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const invalidateRendered = () => {
    renderAbortRef.current?.abort();
    downloadAbortRef.current?.abort();
    setRendered(null);
    setDownloading(false);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = '';
    setPreviewUrl('');
  };
  const update = (patch: Partial<FaviconSettings>) => {
    if (Object.keys(patch).some((key) => key !== 'siteName')) invalidateRendered();
    setSettings((current) => ({ ...current, ...patch }));
  };
  const useImage = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    invalidateRendered();
    setImage(file);
    update({ source: 'image' });
  };
  const clearImage = () => {
    setImage(null);
    update({ source: 'text' });
  };
  const cancelRendering = () => {
    renderAbortRef.current?.abort();
    setRendered(null);
    setProgress(null);
    setStatus('cancelled');
    setError('');
  };
  const downloadPackage = async () => {
    if (!rendered || downloading) return;
    const controller = new AbortController();
    downloadAbortRef.current?.abort();
    downloadAbortRef.current = controller;
    setDownloading(true);
    setDownloadError('');
    try {
      const archive = await packageZip(rendered, settings.siteName, { signal: controller.signal });
      if (!controller.signal.aborted) downloadBlob(archive, 'favicon-package.zip');
    } catch (packageError) {
      if (!isAbortError(packageError)) setDownloadError(ui.packageError);
    } finally {
      if (downloadAbortRef.current === controller) {
        downloadAbortRef.current = null;
        setDownloading(false);
      }
    }
  };

  const progressText = progress
    ? ui.processingProgress.replace('{current}', String(progress.current)).replace('{total}', String(progress.total))
    : ui.processing;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div class="min-w-0 space-y-5">
          <Field label={ui.sourceLabel}>
            <Segmented<'text' | 'image'>
              value={settings.source}
              onValue={(source) => update({ source })}
              label={ui.sourceLabel}
              options={[
                { value: 'text', label: ui.sourceText },
                { value: 'image', label: ui.sourceImage },
              ]}
            />
          </Field>

          {settings.source === 'text' ? (
            <div class="grid gap-3 sm:grid-cols-2">
              <Field label={ui.textLabel} hint={ui.textHint} class="sm:col-span-2">
                <TextInput
                  value={settings.text}
                  maxLength={12}
                  onInput={(event) => update({ text: event.currentTarget.value })}
                />
              </Field>
              <Field label={ui.backgroundLabel}>
                <TextInput
                  type="color"
                  value={settings.background}
                  onInput={(event) => update({ background: event.currentTarget.value })}
                />
              </Field>
              <Field label={ui.foregroundLabel}>
                <TextInput
                  type="color"
                  value={settings.foreground}
                  onInput={(event) => update({ foreground: event.currentTarget.value })}
                />
              </Field>
            </div>
          ) : (
            <>
              <Dropzone
                accept="image/png,image/jpeg,image/webp"
                onFiles={useImage}
                title={image ? image.name : ui.dropTitle}
                hint={ui.dropHint}
                compact={!!image}
              />
              {image && (
                <div class="flex flex-wrap items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={clearImage}>
                    {ui.clearImage}
                  </Button>
                  <span class="text-xs text-subtle">{ui.imageReady}</span>
                </div>
              )}
              <div class="grid gap-3 sm:grid-cols-2">
                <Field label={ui.fitLabel}>
                  <Segmented<ImageFit>
                    value={settings.fit}
                    onValue={(fit) => update({ fit })}
                    label={ui.fitLabel}
                    options={[
                      { value: 'contain', label: ui.fitContain },
                      { value: 'cover', label: ui.fitCover },
                    ]}
                  />
                </Field>
                <Field label={ui.paddingLabel} hint={ui.paddingHint}>
                  <NumberInput
                    min={0}
                    max={40}
                    value={settings.padding}
                    onValue={(padding) => update({ padding: typeof padding === 'number' ? padding : 0 })}
                  />
                </Field>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <Field label={ui.backgroundLabel}>
                  <TextInput
                    type="color"
                    value={settings.background}
                    onInput={(event) => update({ background: event.currentTarget.value })}
                  />
                </Field>
                <div class="flex items-end pb-2">
                  <Toggle
                    checked={settings.transparent}
                    onChecked={(transparent) => update({ transparent })}
                    label={ui.transparent}
                  />
                </div>
              </div>
            </>
          )}

          <Field label={ui.siteNameLabel} hint={ui.siteNameHint}>
            <TextInput
              value={settings.siteName}
              maxLength={80}
              onInput={(event) => update({ siteName: event.currentTarget.value })}
            />
          </Field>

          <Notice>{ui.privacyNote}</Notice>
          {status === 'cancelled' && <Notice>{ui.cancelled}</Notice>}
          {status === 'error' && <Notice tone="danger">{error}</Notice>}
          {downloadError && <Notice tone="danger">{downloadError}</Notice>}
        </div>

        <div class="space-y-5">
          <div class="rounded-lg border border-line bg-surface-2 p-4 text-center" aria-live="polite">
            <p class="text-sm font-medium text-fg">{ui.previewLabel}</p>
            {status === 'working' ? (
              <div class="mt-8">
                <p class="text-sm text-muted">{progressText}</p>
                <Button class="mt-3" variant="secondary" size="sm" onClick={cancelRendering}>
                  {ui.cancel}
                </Button>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={ui.previewAlt}
                class="mx-auto mt-4 size-36 rounded-lg border border-line bg-surface"
              />
            ) : (
              <p class="mt-8 text-sm text-muted">{ui.addImage}</p>
            )}
            <p class="mt-3 text-xs text-subtle">{ui.previewHint}</p>
          </div>

          {rendered && (
            <>
              <div>
                <p class="text-sm font-medium text-fg">{ui.filesLabel}</p>
                <ul class="mt-2 divide-y divide-line rounded-lg border border-line text-sm">
                  <li class="flex items-center justify-between gap-3 px-3 py-2 text-fg">
                    <span>favicon.ico</span>
                    <span class="text-xs text-muted">16 · 32 · 48</span>
                  </li>
                  {FAVICON_FILES.map((file) => (
                    <li class="flex items-center justify-between gap-3 px-3 py-2 text-fg">
                      <span class="truncate">{file.name}</span>
                      <span class="text-xs text-muted">
                        {file.size}×{file.size}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="primary" size="lg" class="w-full" disabled={downloading} onClick={downloadPackage}>
                {downloading ? ui.preparingPackage : ui.download}
              </Button>
              <div>
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-medium text-fg">{ui.snippetLabel}</p>
                  <CopyButton text={installSnippet()} label={ui.copy} copiedLabel={ui.copied} />
                </div>
                <pre class="mt-2 overflow-x-auto rounded-md border border-line bg-surface-2 p-3 text-xs leading-5 text-muted">
                  <code>{installSnippet()}</code>
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
