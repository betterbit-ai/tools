import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Select, TextInput } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_OPTIONS,
  MAX_FILE_BYTES,
  MAX_IMAGE_COUNT,
  MAX_INPUT_DIMENSION,
  MAX_INPUT_PIXELS,
  normalizeOptions,
  outputMime,
  outputName,
  validateInput,
  type InputCheck,
  type WatermarkOptions,
} from './logic';
import { isAnimatedImage, readDimensions, watermarkImage } from './watermark';

interface Item {
  id: number;
  file: File;
  width: number;
  height: number;
  preview: string;
  result?: { blob: Blob; url: string; name: string; key: string };
  error?: 'unreadable' | 'dimension' | 'pixels' | 'file' | 'animated';
  renderError?: boolean;
  busy?: boolean;
}

const STORAGE_KEY = 'tools:image-watermark:settings';
let nextId = 1;

export default function ImageWatermark({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [options, setOptions] = useState<WatermarkOptions>(() => storedOptions(ui.defaultText));
  const [logo, setLogo] = useState<File>();
  const [logoId, setLogoId] = useState(0);
  const [message, setMessage] = useState('');
  const [zipping, setZipping] = useState(false);
  const itemsRef = useRef(items);
  const runId = useRef(0);
  const settingsKeyRef = useRef('');
  itemsRef.current = items;

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(options)), [options]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const accepted = files.slice(0, Math.max(0, MAX_IMAGE_COUNT - itemsRef.current.length));
      if (accepted.length < files.length) setMessage(ui.batchLimit.replace('{n}', String(MAX_IMAGE_COUNT)));
      else setMessage('');
      if (!accepted.length) return;

      const added: Item[] = [];
      for (const file of accepted) {
        try {
          if (file.size > MAX_FILE_BYTES) {
            added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: 'file' });
            continue;
          }
          if (await isAnimatedImage(file)) {
            added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: 'animated' });
            continue;
          }
          const dimensions = await readDimensions(file);
          const check = validateInput(dimensions.width, dimensions.height, file.size);
          added.push(
            check.ok
              ? { id: nextId++, file, ...dimensions, preview: URL.createObjectURL(file) }
              : {
                  id: nextId++,
                  file,
                  width: dimensions.width,
                  height: dimensions.height,
                  preview: '',
                  error:
                    check.reason === 'dimension' || check.reason === 'pixels' || check.reason === 'file'
                      ? check.reason
                      : 'unreadable',
                },
          );
        } catch {
          added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: 'unreadable' });
        }
      }
      setItems((previous) => [...previous, ...added]);
    },
    [ui.batchLimit],
  );

  const addLogo = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > MAX_FILE_BYTES) {
        setMessage(inputErrorMessage('file', ui, locale));
        return;
      }
      if (await isAnimatedImage(file)) {
        setMessage(ui.animatedImage);
        return;
      }
      const dimensions = await readDimensions(file);
      const check = validateInput(dimensions.width, dimensions.height, file.size);
      if (!check.ok) {
        setMessage(inputErrorMessage(check.reason!, ui, locale));
        return;
      }
      setLogo(file);
      setLogoId((value) => value + 1);
      setMessage('');
    } catch {
      setMessage(ui.unsupportedLogo);
    }
  };

  const filesKey = items.map((item) => item.id).join(',');
  const settingsKey = JSON.stringify([options, logoId]);
  settingsKeyRef.current = settingsKey;
  useEffect(() => {
    const id = ++runId.current;
    const key = settingsKey;
    if (options.mode === 'logo' && !logo) return;
    const timeout = window.setTimeout(async () => {
      for (const item of itemsRef.current) {
        if (id !== runId.current || settingsKeyRef.current !== key) return;
        if (item.error || item.result?.key === key) continue;
        setItems((previous) =>
          previous.map((entry) => (entry.id === item.id ? { ...entry, busy: true, renderError: false } : entry)),
        );
        try {
          const blob = await watermarkImage(item.file, options, logo);
          if (id !== runId.current || settingsKeyRef.current !== key) return;
          const result = {
            blob,
            url: URL.createObjectURL(blob),
            name: outputName(item.file.name, outputMime(options.format, item.file.type)),
            key,
          };
          setItems((previous) =>
            previous.map((entry) => {
              if (entry.id !== item.id) return entry;
              if (entry.result) URL.revokeObjectURL(entry.result.url);
              return { ...entry, result, busy: false, renderError: false };
            }),
          );
        } catch {
          if (id !== runId.current || settingsKeyRef.current !== key) return;
          setItems((previous) =>
            previous.map((entry) => (entry.id === item.id ? { ...entry, busy: false, renderError: true } : entry)),
          );
        }
      }
    }, 280);
    return () => window.clearTimeout(timeout);
  }, [filesKey, logo, options, settingsKey, ui.processingError]);

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

  const update = <K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) =>
    setOptions((previous) => normalizeOptions({ ...previous, [key]: value }));

  const remove = (id: number) =>
    setItems((previous) => {
      runId.current++;
      const item = previous.find((entry) => entry.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
      return previous.filter((entry) => entry.id !== id);
    });

  const clear = () => {
    runId.current++;
    items.forEach((item) => {
      URL.revokeObjectURL(item.preview);
      if (item.result) URL.revokeObjectURL(item.result.url);
    });
    setItems([]);
    setMessage('');
  };

  const ready = items.filter((item) => item.result?.key === settingsKey && !item.busy);
  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, ready[0].result!.name);
    setZipping(true);
    try {
      const archive: Record<string, Uint8Array> = {};
      for (const item of ready) {
        let name = item.result!.name;
        for (let index = 2; archive[name]; index++) name = item.result!.name.replace(/(\.[^.]+)$/, `-${index}$1`);
        archive[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
      }
      const zip = await makeZip(archive);
      downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), 'watermarked-images.zip');
    } catch {
      setMessage(ui.zipFailed);
    } finally {
      setZipping(false);
    }
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="image/*"
            multiple
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={items.length > 0}
          />
          {message && (
            <div class="mt-4">
              <Notice tone="danger">{message}</Notice>
            </div>
          )}
          {items.length === 0 ? (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          ) : (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line" aria-live="polite">
              {items.map((item) => (
                <li key={item.id} class="flex items-center gap-3 p-3">
                  <div class="size-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                    {item.preview && (
                      <img
                        src={item.result?.key === settingsKey ? item.result.url : item.preview}
                        alt=""
                        class="size-full object-cover"
                      />
                    )}
                  </div>
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{item.file.name}</p>
                    {item.error ? (
                      <p class="text-danger">{inputErrorMessage(item.error, ui, locale)}</p>
                    ) : item.renderError ? (
                      <p class="text-danger">{ui.processingError}</p>
                    ) : (
                      <p class="tabular text-muted">
                        {item.width}×{item.height} · {formatBytes(item.file.size, locale)}
                        {item.result?.key === settingsKey && ` → ${formatBytes(item.result.blob.size, locale)}`}
                      </p>
                    )}
                  </div>
                  {item.result?.key === settingsKey && !item.error && (
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
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && (
            <div class="mt-4 flex flex-wrap items-center gap-3" aria-live="polite">
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
              {items.some((item) => item.busy) && <span class="text-sm text-muted">{ui.processing}</span>}
            </div>
          )}
        </div>

        <div class="flex flex-col gap-5">
          <Segmented
            label={ui.modeLabel}
            value={options.mode}
            onValue={(value) => update('mode', value)}
            options={[
              { value: 'text', label: ui.modeText },
              { value: 'logo', label: ui.modeLogo },
            ]}
          />
          {options.mode === 'text' ? (
            <Field label={ui.textLabel} hint={ui.textHint}>
              <TextInput
                value={options.text}
                maxLength={160}
                onInput={(event) => update('text', event.currentTarget.value)}
              />
            </Field>
          ) : (
            <Field label={ui.logoLabel} hint={logo ? `${ui.logoReady}: ${logo.name}` : ui.logoHint}>
              <TextInput
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  await addLogo(event.currentTarget.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
            </Field>
          )}
          <Segmented
            label={ui.layoutLabel}
            value={options.layout}
            onValue={(value) => update('layout', value)}
            options={[
              { value: 'single', label: ui.layoutSingle },
              { value: 'tile', label: ui.layoutTile },
            ]}
          />
          {options.layout === 'single' && (
            <Field label={ui.positionLabel}>
              <Select
                value={options.position}
                onValue={(value) => update('position', value)}
                options={[
                  { value: 'top-left', label: ui.positionTopLeft },
                  { value: 'top', label: ui.positionTop },
                  { value: 'top-right', label: ui.positionTopRight },
                  { value: 'left', label: ui.positionLeft },
                  { value: 'center', label: ui.positionCenter },
                  { value: 'right', label: ui.positionRight },
                  { value: 'bottom-left', label: ui.positionBottomLeft },
                  { value: 'bottom', label: ui.positionBottom },
                  { value: 'bottom-right', label: ui.positionBottomRight },
                ]}
              />
            </Field>
          )}
          <div class="grid grid-cols-2 gap-3">
            <Field label={ui.sizeLabel} hint={ui.sizeHint}>
              <NumberInput value={options.size} min={4} max={80} onValue={(value) => update('size', Number(value))} />
            </Field>
            <Field label={ui.opacityLabel}>
              <NumberInput
                value={options.opacity}
                min={0}
                max={100}
                onValue={(value) => update('opacity', Number(value))}
              />
            </Field>
            <Field label={ui.rotationLabel}>
              <NumberInput
                value={options.rotation}
                min={-90}
                max={90}
                onValue={(value) => update('rotation', Number(value))}
              />
            </Field>
            {options.layout === 'tile' ? (
              <Field label={ui.gapLabel}>
                <NumberInput value={options.gap} min={0} max={100} onValue={(value) => update('gap', Number(value))} />
              </Field>
            ) : (
              <ColorSelect options={options} update={update} ui={ui} />
            )}
          </div>
          {options.layout === 'tile' && options.mode === 'text' && (
            <ColorSelect options={options} update={update} ui={ui} />
          )}
          <Field label={ui.formatLabel} hint={ui.formatHint}>
            <Select
              value={options.format}
              onValue={(value) => update('format', value)}
              options={[
                { value: 'original', label: ui.formatOriginal },
                { value: 'image/jpeg', label: ui.formatJpg },
                { value: 'image/png', label: ui.formatPng },
                { value: 'image/webp', label: ui.formatWebp },
              ]}
            />
          </Field>
        </div>
      </div>
    </Panel>
  );
}

function inputErrorMessage(error: Item['error'] | InputCheck['reason'], ui: UI, locale: ToolProps['locale']): string {
  switch (error) {
    case 'pixels':
      return ui.errorPixels.replace('{max}', formatNumber(MAX_INPUT_PIXELS, locale));
    case 'dimension':
      return ui.errorDimension.replace('{max}', String(MAX_INPUT_DIMENSION));
    case 'file':
      return ui.errorFile.replace('{max}', formatBytes(MAX_FILE_BYTES, locale));
    case 'animated':
      return ui.animatedImage;
    default:
      return ui.unsupported;
  }
}

async function makeZip(files: Record<string, Uint8Array>): Promise<Uint8Array> {
  const { zip } = await import('fflate');
  return new Promise((resolve, reject) => {
    zip(files, { level: 0 }, (error, archive) => {
      if (error) reject(error);
      else resolve(archive);
    });
  });
}

function ColorSelect({
  options,
  update,
  ui,
}: {
  options: WatermarkOptions;
  update: <K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) => void;
  ui: UI;
}) {
  return (
    <Field label={ui.colorLabel}>
      <Select
        value={options.color}
        onValue={(value) => update('color', value)}
        options={[
          { value: 'light', label: ui.colorLight },
          { value: 'dark', label: ui.colorDark },
        ]}
      />
    </Field>
  );
}

function storedOptions(defaultText: string): WatermarkOptions {
  try {
    const saved = safeStorage.get(STORAGE_KEY);
    return normalizeOptions(saved ? JSON.parse(saved) : { ...DEFAULT_OPTIONS, text: defaultText });
  } catch {
    return { ...DEFAULT_OPTIONS, text: defaultText };
  }
}
