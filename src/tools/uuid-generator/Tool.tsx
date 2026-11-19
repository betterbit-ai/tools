import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  FieldGroup,
  Kbd,
  Notice,
  Panel,
  Segmented,
  Stat,
  TextInput,
  Toggle,
  cx,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_COUNT,
  formatOutput,
  formatUuid,
  generateUuidBytes,
  parseUuidCount,
  type OutputFormat,
  type UuidSettings,
  type UuidTextFormat,
  type UuidVersion,
} from './logic';

const STORAGE_KEY = 'tools:uuid-generator:settings';
const DEFAULT_SETTINGS: UuidSettings = {
  version: 'v4',
  count: 1,
  format: 'standard',
  uppercase: false,
  output: 'lines',
};

function cryptoBytes(length: number): Uint8Array {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

export default function UuidGenerator({ locale, ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<UuidSettings>(DEFAULT_SETTINGS);
  /** The current batch as raw bytes, so changing the text format re-renders the same IDs. */
  const [batch, setBatch] = useState<Uint8Array[]>([]);
  const [countText, setCountText] = useState('1');
  const [countError, setCountError] = useState(false);
  const [cryptoError, setCryptoError] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const hasGeneratedInitialResult = useRef(false);

  const numberFormat = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const makeBatch = useCallback((next: UuidSettings) => {
    try {
      const result = generateUuidBytes(next, cryptoBytes, Date.now());
      if (!result.ok) {
        setCountError(true);
        return false;
      }
      setBatch(result.bytes);
      setCountError(false);
      setCryptoError(false);
      return true;
    } catch {
      setCryptoError(true);
      return false;
    }
  }, []);

  /** Reads the number field; typing an invalid size keeps the last valid batch on screen. */
  const readCount = (text: string): number | null => {
    const parsed = parseUuidCount(text);
    if (parsed === null || parsed < 1 || parsed > MAX_COUNT) {
      setCountError(true);
      return null;
    }
    setCountError(false);
    return parsed;
  };

  const generate = useCallback(() => {
    const count = readCount(countText);
    if (count === null) return;
    const next = { ...settings, count };
    setSettings(next);
    makeBatch(next);
  }, [countText, makeBatch, settings]);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (
        saved &&
        typeof saved === 'object' &&
        (saved.version === 'v4' || saved.version === 'v7') &&
        Number.isSafeInteger(saved.count) &&
        ['standard', 'compact', 'braces', 'urn'].includes(saved.format) &&
        typeof saved.uppercase === 'boolean' &&
        ['lines', 'json'].includes(saved.output)
      ) {
        setSettings(saved as UuidSettings);
        setCountText(String(saved.count));
      }
    } catch {
      /* Ignore malformed local settings. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // The notice below says the options stay in this browser; a blocked store has to say otherwise.
    setSaveFailed(!safeStorage.trySet(STORAGE_KEY, JSON.stringify(settings)));
  }, [ready, settings]);

  useEffect(() => {
    if (ready && !hasGeneratedInitialResult.current) {
      hasGeneratedInitialResult.current = true;
      generate();
    }
  }, [generate, ready]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [generate]);

  const update = (patch: Partial<UuidSettings>) => setSettings((current) => ({ ...current, ...patch }));

  const changeVersion = (version: UuidVersion) => {
    const next = { ...settings, version };
    setSettings(next);
    // A v7 batch cannot stay on screen while the page says v4, so the batch follows the version.
    if (!countError) makeBatch(next);
  };

  const applyPreset = (count: number) => {
    setCountText(String(count));
    const next = { ...settings, count };
    setSettings(next);
    setCountError(false);
    makeBatch(next);
  };

  /** The same 16-byte values, re-rendered in the chosen text format and case. */
  const values = useMemo(
    () => batch.map((bytes) => formatUuid(bytes, settings.format, settings.uppercase)),
    [batch, settings.format, settings.uppercase],
  );
  const output = useMemo(() => formatOutput(values, settings.output), [settings.output, values]);
  const versionDescription = settings.version === 'v4' ? ui.v4Description : ui.v7Description;

  return (
    <Panel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <p class="text-sm text-muted">{ui.intro}</p>
            <div class="mt-4 flex flex-col gap-4">
              <FieldGroup label={ui.versionLabel} hint={versionDescription}>
                <Segmented<UuidVersion>
                  label={ui.versionLabel}
                  value={settings.version}
                  onValue={changeVersion}
                  options={[
                    { value: 'v4', label: ui.v4 },
                    { value: 'v7', label: ui.v7 },
                  ]}
                />
              </FieldGroup>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Field label={ui.countLabel} hint={ui.countHint.replace('{max}', numberFormat.format(MAX_COUNT))}>
                    <TextInput
                      inputMode="numeric"
                      autoComplete="off"
                      spellcheck={false}
                      value={countText}
                      placeholder="10"
                      aria-invalid={countError}
                      onInput={(event) => {
                        const next = event.currentTarget.value;
                        setCountText(next);
                        const count = readCount(next);
                        if (count !== null) update({ count });
                      }}
                    />
                  </Field>
                  {countError && (
                    <p class="mt-1 text-xs text-danger" role="alert">
                      {ui.invalidCount}
                    </p>
                  )}
                </div>
                <FieldGroup label={ui.formatLabel}>
                  <Segmented<UuidTextFormat>
                    label={ui.formatLabel}
                    value={settings.format}
                    onValue={(format) => update({ format })}
                    options={[
                      { value: 'standard', label: ui.formatStandard },
                      { value: 'compact', label: ui.formatCompact },
                      { value: 'braces', label: ui.formatBraces },
                      { value: 'urn', label: ui.formatUrn },
                    ]}
                  />
                </FieldGroup>
              </div>
              <Toggle
                checked={settings.uppercase}
                onChecked={(uppercase) => update({ uppercase })}
                label={ui.uppercase}
              />
              <div class="flex flex-wrap gap-2">
                {[1, 10, 100, 1000].map((count) => (
                  <Button size="sm" onClick={() => applyPreset(count)}>
                    {ui.preset.replace('{count}', numberFormat.format(count))}
                  </Button>
                ))}
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" type="submit">
                  {ui.generate}
                </Button>
                <span class="text-xs text-muted">
                  {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
                </span>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm font-medium text-fg">{ui.outputLabel}</p>
              <CopyButton text={output} label={ui.copy} copiedLabel={ui.copied} />
            </div>
            <div class="mt-3">
              <Segmented<OutputFormat>
                label={ui.outputFormatLabel}
                value={settings.output}
                onValue={(output: OutputFormat) => update({ output })}
                options={[
                  { value: 'lines', label: ui.outputLines },
                  { value: 'json', label: ui.outputJson },
                ]}
              />
            </div>
            {cryptoError ? (
              <div class="mt-3">
                <Notice tone="danger">{ui.cryptoError}</Notice>
              </div>
            ) : (
              <output
                aria-live="polite"
                class="mt-3 block max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-surface p-3 font-mono text-sm leading-6 text-fg"
              >
                {output}
              </output>
            )}
            <div class="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
              <Stat label={ui.generatedLabel} value={numberFormat.format(values.length)} emphasis />
              <Stat label={ui.charactersLabel} value={numberFormat.format(output.length)} />
            </div>
          </div>
        </div>
      </form>
      <p class={cx('mt-4 text-xs', saveFailed ? 'text-danger' : 'text-subtle')}>
        {saveFailed ? ui.saveFailed : ui.privacyNote}
      </p>
    </Panel>
  );
}
