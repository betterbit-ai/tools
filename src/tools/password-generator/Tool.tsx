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
  MAX_PASSWORD_LENGTH,
  MAX_WORD_COUNT,
  MIN_PASSWORD_LENGTH,
  MIN_WORD_COUNT,
  characterCount,
  characterSets,
  entropyBits,
  generatePassword,
  type PasswordMode,
  type PasswordSettings,
  type ValidationError,
  validateSettings,
} from './logic';

const STORAGE_KEY = 'tools:password-generator:settings';
const DEFAULT_SETTINGS: PasswordSettings = {
  mode: 'password',
  length: 20,
  wordCount: 6,
  separator: '-',
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

function cryptoSource(): number {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto unavailable');
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
}

function isSavedSettings(value: unknown): value is PasswordSettings {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.mode === 'password' || candidate.mode === 'passphrase') &&
    typeof candidate.length === 'number' &&
    typeof candidate.wordCount === 'number' &&
    typeof candidate.separator === 'string' &&
    typeof candidate.uppercase === 'boolean' &&
    typeof candidate.lowercase === 'boolean' &&
    typeof candidate.numbers === 'boolean' &&
    typeof candidate.symbols === 'boolean' &&
    typeof candidate.excludeAmbiguous === 'boolean'
  );
}

export default function PasswordGenerator({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<PasswordSettings>(DEFAULT_SETTINGS);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<ValidationError | 'crypto' | null>(null);
  const [ready, setReady] = useState(false);
  const generatedInitially = useRef(false);
  const update = (patch: Partial<PasswordSettings>) => setSettings((current) => ({ ...current, ...patch }));

  const generate = useCallback(() => {
    const validationError = validateSettings(settings);
    if (validationError) return setError(validationError);
    try {
      setPassword(generatePassword(settings, cryptoSource));
      setError(null);
    } catch {
      setError('crypto');
    }
  }, [settings]);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (isSavedSettings(saved)) setSettings(saved);
    } catch {
      /* Ignore malformed local state. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [ready, settings]);
  useEffect(() => {
    if (!ready || generatedInitially.current) return;
    generatedInitially.current = true;
    generate();
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
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [generate]);

  const entropy = useMemo(() => entropyBits(settings), [settings]);
  const strength =
    entropy < 35
      ? ui.strengthWeak
      : entropy < 60
        ? ui.strengthFair
        : entropy < 80
          ? ui.strengthStrong
          : ui.strengthVeryStrong;
  const errorText =
    error === 'invalid-length'
      ? ui.invalidLength
      : error === 'invalid-word-count'
        ? ui.invalidWordCount
        : error === 'no-character-set'
          ? ui.noCharacterSet
          : error === 'length-too-short'
            ? ui.lengthTooShort
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
        <div class="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div>
            <p class="text-sm text-muted">{ui.intro}</p>
            <div class="mt-4">
              <Segmented<PasswordMode>
                label={ui.modeLabel}
                value={settings.mode}
                onValue={(mode) => update({ mode })}
                options={[
                  { value: 'password', label: ui.passwordMode },
                  { value: 'passphrase', label: ui.passphraseMode },
                ]}
              />
            </div>
            {settings.mode === 'password' ? (
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label={ui.lengthLabel} hint={ui.passwordLengthHint}>
                  <NumberInput
                    value={settings.length}
                    min={MIN_PASSWORD_LENGTH}
                    max={MAX_PASSWORD_LENGTH}
                    step={1}
                    onValue={(length) => update({ length: length === '' ? Number.NaN : length })}
                  />
                </Field>
                <div class="rounded-lg border border-line bg-surface-2 p-3">
                  <p class="text-sm font-medium text-fg">{ui.characterTypesLabel}</p>
                  <div class="mt-2 grid grid-cols-2 gap-2">
                    <Toggle
                      checked={settings.uppercase}
                      onChecked={(uppercase) => update({ uppercase })}
                      label={ui.uppercase}
                    />
                    <Toggle
                      checked={settings.lowercase}
                      onChecked={(lowercase) => update({ lowercase })}
                      label={ui.lowercase}
                    />
                    <Toggle
                      checked={settings.numbers}
                      onChecked={(numbers) => update({ numbers })}
                      label={ui.numbers}
                    />
                    <Toggle
                      checked={settings.symbols}
                      onChecked={(symbols) => update({ symbols })}
                      label={ui.symbols}
                    />
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <Toggle
                    checked={settings.excludeAmbiguous}
                    onChecked={(excludeAmbiguous) => update({ excludeAmbiguous })}
                    label={ui.excludeAmbiguous}
                  />
                </div>
              </div>
            ) : (
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label={ui.wordCountLabel} hint={ui.wordCountHint}>
                  <NumberInput
                    value={settings.wordCount}
                    min={MIN_WORD_COUNT}
                    max={MAX_WORD_COUNT}
                    step={1}
                    onValue={(wordCount) => update({ wordCount: wordCount === '' ? Number.NaN : wordCount })}
                  />
                </Field>
                <Field label={ui.separatorLabel}>
                  <Segmented
                    label={ui.separatorLabel}
                    value={settings.separator}
                    onValue={(separator) => update({ separator })}
                    options={[
                      { value: '-', label: ui.separatorHyphen },
                      { value: ' ', label: ui.separatorSpace },
                      { value: '·', label: ui.separatorDot },
                    ]}
                  />
                </Field>
              </div>
            )}
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
              <CopyButton text={password} label={ui.copy} copiedLabel={ui.copied} />
            </div>
            {errorText ? (
              <div class="mt-3">
                <Notice tone="danger">{errorText}</Notice>
              </div>
            ) : (
              <output
                aria-live="polite"
                class="mt-3 block break-all rounded-md bg-surface p-3 font-mono text-lg text-fg"
              >
                {password}
              </output>
            )}
            <div class="mt-3 grid grid-cols-2 gap-2">
              <Stat label={ui.entropyLabel} value={`${Math.round(entropy)} ${ui.bits}`} emphasis />
              <Stat label={ui.strengthLabel} value={strength} />
            </div>
            <p class="mt-3 text-xs text-subtle">
              {settings.mode === 'password'
                ? ui.characterCountNote
                    .replace('{count}', String(characterCount(password)))
                    .replace('{sets}', String(characterSets(settings).length))
                : ui.passphraseNote}
            </p>
            <p class="mt-2 text-xs text-subtle">{ui.localNote}</p>
          </div>
        </div>
      </form>
    </Panel>
  );
}
