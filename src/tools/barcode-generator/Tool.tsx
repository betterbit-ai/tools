import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  Stat,
  TextInput,
  Toggle,
} from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { renderBarcodeSvg, validateBarcode, type BarcodeFormat, type BarcodeSettings } from './logic';

const STORAGE_KEY = 'tools:barcode-generator:settings';
const DEFAULT_SETTINGS: BarcodeSettings = {
  format: 'CODE128',
  value: 'ITEM-2026-001',
  moduleWidth: 2,
  height: 80,
  displayValue: true,
};

function isSettings(value: unknown): value is BarcodeSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Partial<BarcodeSettings>;
  return (
    (settings.format === 'CODE128' || settings.format === 'EAN13') &&
    typeof settings.value === 'string' &&
    typeof settings.moduleWidth === 'number' &&
    settings.moduleWidth >= 1 &&
    settings.moduleWidth <= 4 &&
    typeof settings.height === 'number' &&
    settings.height >= 40 &&
    settings.height <= 240 &&
    typeof settings.displayValue === 'boolean'
  );
}

export default function BarcodeGenerator({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<BarcodeSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (isSettings(saved)) setSettings(saved);
    } catch {
      /* Ignore unavailable or malformed local data. */
    }
  }, []);

  useEffect(() => {
    safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<BarcodeSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const error = validateBarcode(settings);
  const barcode = useMemo(() => renderBarcodeSvg(settings), [settings]);
  const previewUrl = barcode ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(barcode.svg)}` : '';
  const errorText =
    error === 'empty'
      ? ui.emptyError
      : error === 'too-long'
        ? ui.tooLongError
        : error === 'unsupported-character'
          ? ui.unsupportedCharacterError
          : error === 'invalid-ean-length'
            ? ui.eanLengthError
            : error === 'invalid-check-digit'
              ? ui.eanCheckDigitError
              : null;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0 space-y-5">
          <Field label={ui.formatLabel}>
            <Segmented<BarcodeFormat>
              value={settings.format}
              onValue={(format) => update({ format })}
              label={ui.formatLabel}
              options={[
                { value: 'CODE128', label: ui.code128 },
                { value: 'EAN13', label: ui.ean13 },
              ]}
            />
          </Field>

          <Field label={ui.valueLabel} hint={settings.format === 'CODE128' ? ui.code128Hint : ui.ean13Hint}>
            <TextInput
              value={settings.value}
              onInput={(event) => update({ value: event.currentTarget.value })}
              placeholder={ui.valuePlaceholder}
              spellcheck={false}
              autocomplete="off"
            />
          </Field>

          <div class="grid gap-3 sm:grid-cols-2">
            <Field label={ui.moduleWidthLabel}>
              <NumberInput
                value={settings.moduleWidth}
                onValue={(moduleWidth) =>
                  update({ moduleWidth: typeof moduleWidth === 'number' ? Math.min(4, Math.max(1, moduleWidth)) : 1 })
                }
                min={1}
                max={4}
                step={1}
                aria-label={ui.moduleWidthLabel}
              />
            </Field>
            <Field label={ui.heightLabel}>
              <NumberInput
                value={settings.height}
                onValue={(height) =>
                  update({ height: typeof height === 'number' ? Math.min(240, Math.max(40, height)) : 40 })
                }
                min={40}
                max={240}
                step={1}
                aria-label={ui.heightLabel}
              />
            </Field>
          </div>

          <Toggle
            checked={settings.displayValue}
            onChecked={(displayValue) => update({ displayValue })}
            label={ui.showValue}
          />
          {errorText ? <Notice tone="danger">{errorText}</Notice> : null}
          <p class="text-xs leading-5 text-subtle">{ui.privacyNote}</p>
        </div>

        <div class="flex min-w-0 flex-col gap-4">
          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <p class="text-sm font-medium text-fg">{ui.previewHeading}</p>
            {barcode ? (
              <div class="mt-4 overflow-x-auto rounded-md border border-line bg-surface p-3">
                <img class="mx-auto block max-w-none" src={previewUrl} alt={ui.previewAlt} />
              </div>
            ) : (
              <div class="mt-4 flex min-h-32 items-center justify-center rounded-md border border-dashed border-line-strong bg-surface px-4 text-center text-sm text-muted">
                {ui.previewEmpty}
              </div>
            )}
          </div>

          {barcode ? (
            settings.format === 'EAN13' ? (
              <div class="grid grid-cols-2 gap-3" aria-live="polite">
                <Stat label={ui.encodedValue} value={barcode.encodedValue} />
                <Stat label={ui.moduleCount} value={barcode.moduleCount} />
              </div>
            ) : (
              <div aria-live="polite">
                <Stat label={ui.moduleCount} value={barcode.moduleCount} />
              </div>
            )
          ) : null}

          <Button
            variant="primary"
            size="lg"
            disabled={!barcode}
            onClick={() =>
              barcode &&
              downloadBlob(
                new Blob([barcode.svg], { type: 'image/svg+xml;charset=utf-8' }),
                `barcode-${settings.format.toLowerCase()}.svg`,
              )
            }
          >
            {ui.downloadSvg}
          </Button>
          <CopyButton text={barcode?.svg ?? ''} label={ui.copySvg} copiedLabel={ui.copiedSvg} size="lg" />
        </div>
      </div>
    </Panel>
  );
}
