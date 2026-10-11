import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Select, TextInput } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { DEFAULT_OPTIONS, normalizeOptions, outputMime, outputName, type WatermarkOptions } from './logic';
import { readDimensions, watermarkImage } from './watermark';

interface Item {
  id: number;
  file: File;
  width: number;
  height: number;
  preview: string;
  result?: { blob: Blob; url: string; name: string; key: string };
  error?: boolean;
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
  const itemsRef = useRef(items);
  const runId = useRef(0);
  itemsRef.current = items;

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(options)), [options]);

  const addFiles = useCallback(async (files: File[]) => {
    const added: Item[] = [];
    for (const file of files) {
      try {
        const dimensions = await readDimensions(file);
        added.push({ id: nextId++, file, ...dimensions, preview: URL.createObjectURL(file) });
      } catch {
        added.push({ id: nextId++, file, width: 0, height: 0, preview: '', error: true });
      }
    }
    setItems((previous) => [...previous, ...added]);
  }, []);

  const addLogo = async (file?: File) => {
    if (!file) return;
    try {
      await readDimensions(file);
      setLogo(file);
      setLogoId((value) => value + 1);
      setMessage('');
    } catch {
      setLogo(undefined);
      setMessage(ui.unsupportedLogo);
    }
  };

  const filesKey = items.map((item) => item.id).join(',');
  const settingsKey = JSON.stringify([options, logoId]);
  useEffect(() => {
    const id = ++runId.current;
    const key = settingsKey;
    if (options.mode === 'logo' && !logo) return;
    const timeout = window.setTimeout(async () => {
      for (const item of itemsRef.current) {
        if (id !== runId.current) return;
        if (item.error || item.result?.key === key) continue;
        setItems((previous) =>
          previous.map((entry) => (entry.id === item.id ? { ...entry, busy: true, renderError: false } : entry)),
        );
        try {
          const blob = await watermarkImage(item.file, options, logo);
          if (id !== runId.current) return;
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
          setItems((previous) =>
            previous.map((entry) => (entry.id === item.id ? { ...entry, busy: false, renderError: true } : entry)),
          );
        }
      }
    }, 280);
    return () => window.clearTimeout(timeout);
  }, [filesKey, logo, options, settingsKey, ui.processingError]);

  const update = <K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) =>
    setOptions((previous) => normalizeOptions({ ...previous, [key]: value }));

  const remove = (id: number) =>
    setItems((previous) => {
      const item = previous.find((entry) => entry.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
        if (item.result) URL.revokeObjectURL(item.result.url);
      }
      return previous.filter((entry) => entry.id !== id);
    });

  const clear = () => {
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
    const { zipSync } = await import('fflate');
    const archive: Record<string, Uint8Array> = {};
    for (const item of ready) {
      let name = item.result!.name;
      for (let index = 2; archive[name]; index++) name = item.result!.name.replace(/(\.[^.]+)$/, `-${index}$1`);
      archive[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
    }
    downloadBlob(
      new Blob([zipSync(archive, { level: 0 }) as BlobPart], { type: 'application/zip' }),
      'watermarked-images.zip',
    );
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
          {items.length === 0 ? (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          ) : (
            <ul class="mt-4 divide-y divide-line rounded-lg border border-line" aria-live="polite">
              {items.map((item) => (
                <li class="flex items-center gap-3 p-3">
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
                      <p class="text-danger">{ui.unsupported}</p>
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
              <Button variant="primary" size="lg" disabled={ready.length === 0} onClick={downloadAll}>
                {ready.length > 1 ? ui.downloadAll.replace('{n}', String(ready.length)) : ui.download}
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
              <TextInput type="file" accept="image/*" onChange={(event) => addLogo(event.currentTarget.files?.[0])} />
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
          {message && <Notice tone="danger">{message}</Notice>}
        </div>
      </div>
    </Panel>
  );
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
