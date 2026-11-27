import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, FieldGroup, Notice, Panel, Segmented, Stat, TextInput, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { quietZones, renderBarcodeSvg, validateBarcode, type BarcodeFormat, type BarcodeSettings } from './logic';

const STORAGE_KEY = 'tools:barcode-generator:settings';
const DEFAULT_SETTINGS: BarcodeSettings = {
  format: 'CODE128',
  value: 'ITEM-2026-001',
  moduleWidth: 2,
  height: 80,
  displayValue: true,
};

/**
 * A whole-number field that keeps what the user is typing. The shared NumberInput
 * re-parses and clamps on every keystroke, so typing 120 into a 40–240 field landed on
 * 240: the first "1" was clamped to 40 and the rest of the digits appended to it.
 */
function IntegerField(props: {
  value: number;
  onValue: (value: number) => void;
  label: string;
  hint?: string;
  min: number;
  max: number;
  step?: number;
}) {
  const [text, setText] = useState(String(props.value));

  const clamp = (value: number) => Math.min(props.max, Math.max(props.min, Math.round(value)));

  return (
    <FieldGroup label={props.label} hint={props.hint}>
      <TextInput
        value={text}
        inputMode="numeric"
        autocomplete="off"
        spellcheck={false}
        aria-label={props.label}
        class="tabular"
        onInput={(event) => {
          const raw = (event.currentTarget as HTMLInputElement).value;
          const digits = raw.replace(/[^0-9]/g, '');
          setText(digits);
          const typed = Number(digits);
          // Only a value already inside the range updates the barcode; the field keeps the
          // digits so a partly typed number is never rewritten under the caret.
          if (digits !== '' && typed >= props.min && typed <= props.max) props.onValue(typed);
        }}
        onBlur={() => {
          const next = text === '' ? props.value : clamp(Number(text));
          setText(String(next));
          props.onValue(next);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') (event.currentTarget as HTMLInputElement).blur();
        }}
      />
    </FieldGroup>
  );
}

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
  const quiet = quietZones(settings.format);
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
          <FieldGroup label={ui.formatLabel}>
            <Segmented<BarcodeFormat>
              value={settings.format}
              onValue={(format) => update({ format })}
              label={ui.formatLabel}
              options={[
                { value: 'CODE128', label: ui.code128 },
                { value: 'EAN13', label: ui.ean13 },
              ]}
            />
          </FieldGroup>

          <FieldGroup label={ui.valueLabel} hint={settings.format === 'CODE128' ? ui.code128Hint : ui.ean13Hint}>
            <TextInput
              value={settings.value}
              onInput={(event) => update({ value: event.currentTarget.value })}
              placeholder={ui.valuePlaceholder}
              spellcheck={false}
              autocomplete="off"
              aria-label={ui.valueLabel}
            />
          </FieldGroup>

          <div class="grid gap-3 sm:grid-cols-2">
            <IntegerField
              label={ui.moduleWidthLabel}
              hint={ui.moduleWidthHint}
              value={settings.moduleWidth}
              min={1}
              max={4}
              onValue={(moduleWidth) => update({ moduleWidth })}
            />
            <IntegerField
              label={ui.heightLabel}
              hint={ui.heightHint}
              value={settings.height}
              min={40}
              max={240}
              onValue={(height) => update({ height })}
            />
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
            <p class="mt-3 text-xs leading-5 text-subtle">
              {ui.quietZoneNote.replace('{left}', String(quiet.left)).replace('{right}', String(quiet.right))}
            </p>
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
