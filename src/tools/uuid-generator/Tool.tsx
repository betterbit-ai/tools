import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  Kbd,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  Stat,
  Toggle,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_COUNT,
  formatOutput,
  generateUuids,
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
  const [values, setValues] = useState<string[]>([]);
  const [error, setError] = useState<'invalid-count' | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const hasGeneratedInitialResult = useRef(false);

  const update = (patch: Partial<UuidSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const generate = useCallback(() => {
    try {
      const result = generateUuids(settings, cryptoBytes, Date.now());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setValues(result.values);
      setError(null);
    } catch {
      setError('crypto');
    }
  }, [settings]);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (
        saved &&
        typeof saved === 'object' &&
        (saved.version === 'v4' || saved.version === 'v7') &&
        typeof saved.count === 'number' &&
        ['standard', 'compact', 'braces', 'urn'].includes(saved.format) &&
        typeof saved.uppercase === 'boolean' &&
        ['lines', 'json'].includes(saved.output)
      ) {
        setSettings(saved as UuidSettings);
      }
    } catch {
      /* Ignore malformed local settings. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
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

  const output = useMemo(() => formatOutput(values, settings.output), [settings.output, values]);
  const errorText = error === 'invalid-count' ? ui.invalidCount : error === 'crypto' ? ui.cryptoError : null;
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
              <Field label={ui.versionLabel} hint={versionDescription}>
                <Segmented<UuidVersion>
                  label={ui.versionLabel}
                  value={settings.version}
                  onValue={(version) => update({ version })}
                  options={[
                    { value: 'v4', label: ui.v4 },
                    { value: 'v7', label: ui.v7 },
                  ]}
                />
              </Field>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={ui.countLabel} hint={ui.countHint.replace('{max}', MAX_COUNT.toLocaleString(locale))}>
                  <NumberInput
                    value={settings.count}
                    min={1}
                    max={MAX_COUNT}
                    step={1}
                    onValue={(count) => update({ count: count === '' ? Number.NaN : count })}
                  />
                </Field>
                <Field label={ui.formatLabel}>
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
                </Field>
              </div>
              <Toggle
                checked={settings.uppercase}
                onChecked={(uppercase) => update({ uppercase })}
                label={ui.uppercase}
              />
              <div class="flex flex-wrap gap-2">
                {[1, 10, 100, 1000].map((count) => (
                  <Button size="sm" onClick={() => update({ count })}>
                    {ui.preset.replace('{count}', count.toLocaleString(locale))}
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
            {errorText ? (
              <div class="mt-3">
                <Notice tone="danger">{errorText}</Notice>
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
              <Stat label={ui.generatedLabel} value={values.length} emphasis />
              <Stat label={ui.charactersLabel} value={output.length} />
            </div>
          </div>
        </div>
      </form>
      <p class="mt-4 text-xs text-subtle">{ui.privacyNote}</p>
    </Panel>
  );
}
