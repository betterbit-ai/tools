import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  Dropzone,
  Field,
  Notice,
  Panel,
  Segmented,
  Select,
  Textarea,
  TextInput,
  Toggle,
} from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  ERROR_CORRECTION_LEVELS,
  buildPayload,
  type ContentType,
  type ErrorCorrectionLevel,
  type QrSettings,
  type WifiSecurity,
  validateSettings,
} from './logic';
import { renderQrSvg } from './render';

const STORAGE_KEY = 'tools:qr-code-generator:settings';
const DEFAULT_SETTINGS: QrSettings = {
  type: 'url',
  value: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiSecurity: 'WPA',
  wifiHidden: false,
  errorCorrection: 'M',
};

function isSettings(value: unknown): value is QrSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Partial<QrSettings>;
  return (
    (settings.type === 'url' || settings.type === 'text' || settings.type === 'wifi') &&
    typeof settings.value === 'string' &&
    typeof settings.wifiSsid === 'string' &&
    typeof settings.wifiPassword === 'string' &&
    (settings.wifiSecurity === 'WPA' || settings.wifiSecurity === 'WEP' || settings.wifiSecurity === 'nopass') &&
    typeof settings.wifiHidden === 'boolean' &&
    ERROR_CORRECTION_LEVELS.includes(settings.errorCorrection as ErrorCorrectionLevel)
  );
}

async function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.onload = () =>
      typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

async function downloadPng(svg: string, filename: string): Promise<void> {
  const source = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('image failed'));
      image.src = source;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas unavailable');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('png failed');
    downloadBlob(blob, filename);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function QrCodeGenerator({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<QrSettings>(DEFAULT_SETTINGS);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (isSettings(saved)) setSettings(saved);
    } catch {
      /* Ignore malformed local browser data. */
    }
  }, []);

  useEffect(() => {
    safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<QrSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const correction = logoDataUrl ? 'H' : settings.errorCorrection;
  const checkedSettings = { ...settings, errorCorrection: correction };
  const validation = validateSettings(checkedSettings);
  const payload = useMemo(() => buildPayload(settings), [settings]);
  const rendered = useMemo(() => {
    if (validation) return null;
    try {
      return renderQrSvg(payload, correction, '#000000', '#ffffff', logoDataUrl);
    } catch {
      return null;
    }
  }, [correction, logoDataUrl, payload, validation]);
  const previewUrl = rendered ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}` : '';
  const errorText =
    validation === 'empty'
      ? ui.emptyError
      : validation === 'missing-wifi-name'
        ? ui.wifiNameError
        : validation === 'too-long'
          ? ui.tooLongError
          : !rendered && payload
            ? ui.generationError
            : null;

  const useLogo = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    try {
      setLogoDataUrl(await readLogo(file));
      setLogoName(file.name);
      setLogoError(false);
    } catch {
      setLogoError(true);
    }
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0 space-y-5">
          <Field label={ui.typeLabel}>
            <Segmented<ContentType>
              value={settings.type}
              onValue={(type) => update({ type })}
              label={ui.typeLabel}
              options={[
                { value: 'url', label: ui.urlType },
                { value: 'text', label: ui.textType },
                { value: 'wifi', label: ui.wifiType },
              ]}
            />
          </Field>

          {settings.type === 'wifi' ? (
            <div class="grid gap-3 sm:grid-cols-2">
              <Field label={ui.wifiNameLabel}>
                <TextInput value={settings.wifiSsid} onInput={(e) => update({ wifiSsid: e.currentTarget.value })} />
              </Field>
              <Field label={ui.wifiSecurityLabel}>
                <Select<WifiSecurity>
                  value={settings.wifiSecurity}
                  onValue={(wifiSecurity) => update({ wifiSecurity })}
                  options={[
                    { value: 'WPA', label: ui.wifiWpa },
                    { value: 'WEP', label: ui.wifiWep },
                    { value: 'nopass', label: ui.wifiOpen },
                  ]}
                />
              </Field>
              {settings.wifiSecurity !== 'nopass' ? (
                <Field label={ui.wifiPasswordLabel} class="sm:col-span-2">
                  <TextInput
                    type="password"
                    value={settings.wifiPassword}
                    onInput={(e) => update({ wifiPassword: e.currentTarget.value })}
                  />
                </Field>
              ) : null}
              <div class="sm:col-span-2">
                <Toggle
                  checked={settings.wifiHidden}
                  onChecked={(wifiHidden) => update({ wifiHidden })}
                  label={ui.wifiHiddenLabel}
                />
              </div>
            </div>
          ) : (
            <Field
              label={settings.type === 'url' ? ui.urlLabel : ui.textLabel}
              hint={settings.type === 'url' ? ui.urlHint : undefined}
            >
              <Textarea
                value={settings.value}
                onInput={(e) => update({ value: e.currentTarget.value })}
                placeholder={settings.type === 'url' ? ui.urlPlaceholder : ui.textPlaceholder}
                spellcheck={false}
                class="min-h-36"
              />
            </Field>
          )}

          <div class="grid gap-3 sm:grid-cols-2">
            <Field label={ui.errorCorrectionLabel} hint={logoDataUrl ? ui.logoCorrectionHint : ui.errorCorrectionHint}>
              <Segmented<ErrorCorrectionLevel>
                value={correction}
                onValue={(errorCorrection) => update({ errorCorrection })}
                label={ui.errorCorrectionLabel}
                options={ERROR_CORRECTION_LEVELS.map((value) => ({ value, label: value }))}
              />
            </Field>
            <Field label={ui.logoLabel} hint={ui.logoHint}>
              {logoDataUrl ? (
                <div class="flex items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2">
                  <span class="min-w-0 truncate text-sm text-fg">{logoName}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLogoDataUrl(null);
                      setLogoName('');
                    }}
                  >
                    {ui.removeLogo}
                  </Button>
                </div>
              ) : (
                <Dropzone
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onFiles={useLogo}
                  title={ui.logoDropTitle}
                  hint={ui.logoDropHint}
                  compact
                />
              )}
            </Field>
          </div>

          {logoError ? <Notice tone="danger">{ui.logoError}</Notice> : null}
          {errorText ? <Notice tone="danger">{errorText}</Notice> : null}
          <p class="text-xs leading-5 text-subtle">{ui.privacyNote}</p>
        </div>

        <div class="flex min-w-0 flex-col gap-4">
          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <p class="text-sm font-medium text-fg">{ui.previewHeading}</p>
            {rendered ? (
              <img class="mx-auto mt-4 aspect-square w-full max-w-56" src={previewUrl} alt={ui.previewAlt} />
            ) : (
              <div class="mt-4 aspect-square w-full rounded-md border border-dashed border-line-strong bg-surface" />
            )}
            {rendered ? (
              <p class="mt-3 text-center text-xs text-subtle" aria-live="polite">
                {ui.moduleCount.replace('{count}', String(rendered.moduleCount))}
              </p>
            ) : null}
          </div>
          <Button
            variant="primary"
            size="lg"
            disabled={!rendered}
            onClick={() =>
              rendered && downloadBlob(new Blob([rendered.svg], { type: 'image/svg+xml;charset=utf-8' }), 'qr-code.svg')
            }
          >
            {ui.downloadSvg}
          </Button>
          <Button
            size="lg"
            disabled={!rendered}
            onClick={async () => {
              if (!rendered) return;
              try {
                await downloadPng(rendered.svg, 'qr-code.png');
                setDownloadError(false);
              } catch {
                setDownloadError(true);
              }
            }}
          >
            {ui.downloadPng}
          </Button>
          {downloadError ? <Notice tone="danger">{ui.downloadError}</Notice> : null}
          <p class="text-xs leading-5 text-subtle">{ui.staticNote}</p>
        </div>
      </div>
    </Panel>
  );
}
