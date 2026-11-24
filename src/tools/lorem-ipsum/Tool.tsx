import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  FieldGroup,
  Notice,
  Panel,
  Segmented,
  Stat,
  TextInput,
  Textarea,
  Toggle,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { type IpsumLanguage, type IpsumUnit, type OutputFormat, generateIpsum, maxCountFor } from './logic';

const STORAGE_KEY = 'tools:lorem-ipsum:settings';

interface StoredSettings {
  language: IpsumLanguage;
  unit: IpsumUnit;
  count: number;
  startWithClassic: boolean;
  format: OutputFormat;
  seed: number;
}

const defaults: StoredSettings = {
  language: 'latin',
  unit: 'paragraphs',
  count: 3,
  startWithClassic: true,
  format: 'plain',
  seed: 64,
};

function defaultSettings(locale: string): StoredSettings {
  return locale === 'ko' ? { ...defaults, language: 'korean', startWithClassic: false } : defaults;
}

let seedTick = 0;
/** A distinct seed even when two clicks land in the same millisecond. */
function nextSeed(): number {
  seedTick = (seedTick + 1) % 1000;
  return Date.now() * 1000 + seedTick;
}

/** Reads the amount field as a whole number: "50" → 50, "5 0" and "abc" → null. */
function readAmount(text: string): number | null {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

function storedSettings(value: string | null): StoredSettings | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredSettings>;
    if (
      (parsed.language === 'latin' || parsed.language === 'korean') &&
      ['paragraphs', 'sentences', 'words', 'characters'].includes(parsed.unit ?? '') &&
      typeof parsed.count === 'number' &&
      typeof parsed.startWithClassic === 'boolean' &&
      (parsed.format === 'plain' || parsed.format === 'html') &&
      typeof parsed.seed === 'number'
    ) {
      return {
        ...(parsed as StoredSettings),
        count: Math.min(maxCountFor(parsed.unit as IpsumUnit), Math.max(1, Math.round(parsed.count))),
      };
    }
  } catch {
    // Ignore malformed local storage and keep the useful defaults.
  }
  return null;
}

export default function LoremIpsum({ locale, ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<StoredSettings>(() => defaultSettings(locale));
  // The amount field keeps what the user typed. Reading it into a number on every
  // keystroke used to rewrite a cleared field to 1, so typing 20 afterwards left 120.
  const [amountText, setAmountText] = useState(() => String(defaultSettings(locale).count));

  useEffect(() => {
    const saved = storedSettings(safeStorage.get(STORAGE_KEY));
    if (saved) {
      setSettings(saved);
      setAmountText(String(saved.count));
    }
  }, []);

  useEffect(() => {
    safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      setSettings((current) => ({ ...current, seed: nextSeed() }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const result = useMemo(
    () => generateIpsum(settings, settings.seed),
    [settings.language, settings.unit, settings.count, settings.startWithClassic, settings.format, settings.seed],
  );
  const n = (value: number) => formatNumber(value, locale);
  const update = <K extends keyof StoredSettings>(key: K, value: StoredSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));
  const maxCount = maxCountFor(settings.unit);
  const typedAmount = readAmount(amountText);
  const amountOutOfRange = typedAmount === null || typedAmount < 1 || typedAmount > maxCount;

  /** Keeps the typed text, and uses the nearest allowed amount so the output never disagrees with the field. */
  const onAmountInput = (raw: string) => {
    setAmountText(raw);
    const parsed = readAmount(raw);
    if (parsed !== null) update('count', Math.min(maxCount, Math.max(1, parsed)));
  };

  /** Each unit has its own ceiling, so switching units keeps the amount inside the new one. */
  const changeUnit = (unit: IpsumUnit) => {
    const limit = maxCountFor(unit);
    const count = Math.min(limit, Math.max(1, settings.count));
    setSettings((current) => ({ ...current, unit, count }));
    setAmountText(String(count));
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex min-w-0 flex-col">
          <label for="lorem-output" class="mb-1.5 text-sm font-medium text-fg">
            {ui.outputLabel}
          </label>
          <Textarea
            id="lorem-output"
            value={result.text}
            readOnly
            aria-live="polite"
            spellcheck={false}
            class="min-h-64 flex-1 bg-bg font-mono text-sm leading-6 lg:min-h-[420px]"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => update('seed', nextSeed())}>
              {ui.regenerate}
            </Button>
            <CopyButton text={result.text} label={ui.copy} copiedLabel={ui.copied} />
            <span class="ml-auto text-xs text-subtle">{ui.localOnly}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <FieldGroup label={ui.languageLabel}>
            <Segmented
              value={settings.language}
              onValue={(value) => update('language', value)}
              label={ui.languageLabel}
              options={[
                { value: 'latin', label: ui.latin },
                { value: 'korean', label: ui.korean },
              ]}
            />
          </FieldGroup>

          <FieldGroup label={ui.unitLabel}>
            <Segmented
              value={settings.unit}
              onValue={(value) => changeUnit(value)}
              label={ui.unitLabel}
              options={[
                { value: 'paragraphs', label: ui.paragraphs },
                { value: 'sentences', label: ui.sentences },
                { value: 'words', label: ui.words },
                { value: 'characters', label: ui.characters },
              ]}
            />
          </FieldGroup>

          <Field label={ui.amountLabel} hint={ui.amountHint.replace('{max}', n(maxCount))}>
            <TextInput
              value={amountText}
              onInput={(event) => onAmountInput((event.currentTarget as HTMLInputElement).value)}
              onBlur={() => setAmountText(String(settings.count))}
              inputMode="numeric"
              autocomplete="off"
              aria-invalid={amountOutOfRange}
              class="tabular"
              placeholder={ui.amountPlaceholder}
            />
          </Field>
          {amountOutOfRange && (
            <Notice>{ui.amountOutOfRange.replace('{max}', n(maxCount)).replace('{n}', n(settings.count))}</Notice>
          )}

          {settings.language === 'latin' ? (
            <Toggle
              checked={settings.startWithClassic}
              onChecked={(value) => update('startWithClassic', value)}
              label={ui.classicOpening}
            />
          ) : (
            <p class="text-xs leading-5 text-subtle">{ui.koreanHint}</p>
          )}

          <FieldGroup label={ui.formatLabel}>
            <Segmented
              value={settings.format}
              onValue={(value) => update('format', value)}
              label={ui.formatLabel}
              options={[
                { value: 'plain', label: ui.plain },
                { value: 'html', label: ui.html },
              ]}
            />
          </FieldGroup>

          <div class="grid grid-cols-3 gap-2" aria-live="polite">
            <Stat label={ui.resultWords} value={n(result.words)} emphasis />
            <Stat label={ui.resultCharacters} value={n(result.characters)} />
            <Stat label={ui.resultParagraphs} value={n(result.paragraphs)} />
          </div>
        </div>
      </div>
    </Panel>
  );
}
