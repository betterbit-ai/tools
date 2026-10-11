import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, NumberInput, Panel, Select, Stat, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_COUNT,
  MAX_VALUE,
  MIN_VALUE,
  formatNumbers,
  generateNumbers,
  type RandomSettings,
  type SortOrder,
  type ValidationError,
} from './logic';

const STORAGE_KEY = 'tools:random-number:settings';
const DEFAULT_SETTINGS: RandomSettings = { min: 1, max: 100, count: 1, unique: false, sort: 'draw' };

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

export default function RandomNumber({ locale, ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<RandomSettings>(DEFAULT_SETTINGS);
  const [values, setValues] = useState<number[]>([]);
  const [error, setError] = useState<ValidationError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const hasGeneratedInitialResult = useRef(false);

  const update = (patch: Partial<RandomSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const generate = useCallback(() => {
    try {
      const result = generateNumbers(settings, cryptoSource);
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
        typeof saved.min === 'number' &&
        typeof saved.max === 'number' &&
        typeof saved.count === 'number' &&
        typeof saved.unique === 'boolean' &&
        ['draw', 'asc', 'desc'].includes(saved.sort)
      ) {
        setSettings(saved as RandomSettings);
      }
    } catch {
      /* Ignore malformed local state. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [ready, settings]);

  // A fresh page has a useful result immediately; restored settings get a fresh draw after loading.
  useEffect(() => {
    if (!ready || hasGeneratedInitialResult.current) return;
    hasGeneratedInitialResult.current = true;
    generate();
  }, [ready, generate]);

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

  const resultText = useMemo(() => formatNumbers(values), [values]);
  const rangeText = `${formatNumber(settings.min, locale)}–${formatNumber(settings.max, locale)}`;
  const errorText =
    error === 'invalid-bounds'
      ? ui.invalidBoundsError
      : error === 'invalid-count'
        ? ui.invalidCountError
        : error === 'range-order'
          ? ui.rangeOrderError
          : error === 'too-many-unique'
            ? ui.tooManyUniqueError
            : error === 'crypto'
              ? ui.cryptoError
              : null;

  return (
    <Panel>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <div class="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div>
            <p class="text-sm text-muted">{ui.intro}</p>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <Field label={ui.minLabel} hint={ui.boundHint}>
                <NumberInput
                  value={settings.min}
                  min={MIN_VALUE}
                  max={MAX_VALUE}
                  step={1}
                  onValue={(min) => update({ min: min === '' ? Number.NaN : min })}
                />
              </Field>
              <Field label={ui.maxLabel} hint={ui.boundHint}>
                <NumberInput
                  value={settings.max}
                  min={MIN_VALUE}
                  max={MAX_VALUE}
                  step={1}
                  onValue={(max) => update({ max: max === '' ? Number.NaN : max })}
                />
              </Field>
              <Field label={ui.countLabel} hint={ui.countHint.replace('{max}', formatNumber(MAX_COUNT, locale))}>
                <NumberInput
                  value={settings.count}
                  min={1}
                  max={MAX_COUNT}
                  step={1}
                  onValue={(count) => update({ count: count === '' ? Number.NaN : count })}
                />
              </Field>
              <Field label={ui.sortLabel}>
                <Select<SortOrder>
                  value={settings.sort}
                  onValue={(sort) => update({ sort })}
                  options={[
                    { value: 'draw', label: ui.sortDraw },
                    { value: 'asc', label: ui.sortAscending },
                    { value: 'desc', label: ui.sortDescending },
                  ]}
                />
              </Field>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Toggle checked={settings.unique} onChecked={(unique) => update({ unique })} label={ui.uniqueLabel} />
              <div class="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setSettings({ ...DEFAULT_SETTINGS, min: 1, max: 6 })}>
                  {ui.diePreset}
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setSettings({ ...DEFAULT_SETTINGS, min: 1, max: 45, count: 6, unique: true, sort: 'asc' })
                  }
                >
                  {ui.lotteryPreset}
                </Button>
                <Button size="sm" onClick={() => setSettings({ ...DEFAULT_SETTINGS, min: 1, max: 100, count: 10 })}>
                  {ui.bulkPreset}
                </Button>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" type="submit">
                {ui.generate}
              </Button>
              <span class="text-xs text-muted">
                {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
              </span>
            </div>
          </div>

          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <div class="flex items-start justify-between gap-3">
              <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
              <CopyButton text={resultText} label={ui.copy} copiedLabel={ui.copied} />
            </div>
            {errorText ? (
              <div class="mt-3">
                <Notice tone="danger">{errorText}</Notice>
              </div>
            ) : (
              <output
                aria-live="polite"
                class="mt-3 block max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-surface p-3 font-mono text-sm text-fg"
              >
                {resultText}
              </output>
            )}
            <div class="mt-3 grid grid-cols-2 gap-2">
              <Stat label={ui.countResultLabel} value={values.length} />
              <Stat label={ui.rangeResultLabel} value={rangeText} />
            </div>
            <p class="mt-3 text-xs text-subtle">{ui.cryptoNote}</p>
          </div>
        </div>
      </form>
    </Panel>
  );
}
