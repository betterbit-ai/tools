import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Select, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { convertInteger, isBase, MAX_BASE, MIN_BASE, type Conversion, type ParseErrorCode } from './logic';

const STORAGE_KEY = 'tools:number-base-converter:state';

interface State {
  input: string;
  fromBase: string;
  targetBase: string;
}

const DEFAULT_STATE: State = { input: '255', fromBase: '10', targetBase: '36' };

function isBaseString(value: unknown): value is string {
  return typeof value === 'string' && isBase(Number(value));
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      input: typeof saved.input === 'string' && saved.input.length <= 10_000 ? saved.input : DEFAULT_STATE.input,
      fromBase: isBaseString(saved.fromBase) ? saved.fromBase : DEFAULT_STATE.fromBase,
      targetBase: isBaseString(saved.targetBase) ? saved.targetBase : DEFAULT_STATE.targetBase,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function baseLabel(base: number, ui: UI): string {
  return `${ui.baseLabel} ${base}`;
}

function resultLabel(base: number, ui: UI): string {
  if (base === 2) return ui.binaryLabel;
  if (base === 8) return ui.octalLabel;
  if (base === 10) return ui.decimalLabel;
  if (base === 16) return ui.hexadecimalLabel;
  return `${ui.customResultLabel} ${base}`;
}

function errorMessage(code: ParseErrorCode, character: string | undefined, ui: UI): string {
  if (code === 'empty') return ui.errorEmpty;
  if (code === 'missingDigits') return ui.errorMissingDigits;
  if (code === 'tooLong') return ui.errorTooLong;
  if (code === 'invalidDigit') return ui.errorInvalidDigit.replace('{character}', character ?? '');
  return ui.errorInvalidCharacter.replace('{character}', character ?? '');
}

function ResultCard({ conversion, ui }: { conversion: Conversion; ui: UI }) {
  return (
    <div class="min-w-0 break-all">
      <Stat label={resultLabel(conversion.base, ui)} value={conversion.grouped} />
      <div class="mt-2">
        <CopyButton text={conversion.value} label={ui.copy} copiedLabel={ui.copied} />
      </div>
    </div>
  );
}

export default function NumberBaseConverter({ ui, preset }: ToolProps<UI>) {
  const presetInput = typeof preset?.input === 'string' ? preset.input : undefined;
  const presetFrom = isBase(preset?.fromBase) ? String(preset.fromBase) : undefined;
  const presetTarget = isBase(preset?.targetBase) ? String(preset.targetBase) : undefined;
  const hasPreset = presetInput !== undefined || presetFrom !== undefined || presetTarget !== undefined;

  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(() => ({
    input: presetInput ?? DEFAULT_STATE.input,
    fromBase: presetFrom ?? DEFAULT_STATE.fromBase,
    targetBase: presetTarget ?? DEFAULT_STATE.targetBase,
  }));

  useEffect(() => {
    if (!hasPreset) setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (state.input) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
    else safeStorage.remove(STORAGE_KEY);
  }, [ready, state]);

  const result = useMemo(
    () => convertInteger(state.input, Number(state.fromBase), Number(state.targetBase)),
    [state.input, state.fromBase, state.targetBase],
  );
  const baseOptions = useMemo(
    () =>
      Array.from({ length: MAX_BASE - MIN_BASE + 1 }, (_, index) => MIN_BASE + index).map((base) => ({
        value: String(base),
        label: baseLabel(base, ui),
      })),
    [ui],
  );
  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="grid gap-4 sm:grid-cols-2">
          <Field label={ui.inputLabel} hint={ui.inputHint} class="sm:col-span-2">
            <TextInput
              value={state.input}
              onInput={(event) => update({ input: (event.currentTarget as HTMLInputElement).value })}
              spellcheck={false}
              autocomplete="off"
              autocapitalize="characters"
              inputMode="text"
              maxLength={10_001}
              class="font-mono"
            />
          </Field>
          <Field label={ui.fromBaseLabel}>
            <Select value={state.fromBase} onValue={(fromBase) => update({ fromBase })} options={baseOptions} />
          </Field>
          <Field label={ui.targetBaseLabel}>
            <Select value={state.targetBase} onValue={(targetBase) => update({ targetBase })} options={baseOptions} />
          </Field>
        </div>

        <div class="flex flex-col justify-between gap-3 rounded-lg border border-line bg-surface-2 p-4">
          <div>
            <h3 class="text-sm font-medium text-fg">{ui.liveTitle}</h3>
            <p class="mt-1 text-xs leading-5 text-subtle">{ui.liveHint}</p>
          </div>
          <Button variant="secondary" onClick={() => setState(DEFAULT_STATE)}>
            {ui.reset}
          </Button>
          <span class="text-xs text-subtle">{ui.autosaved}</span>
        </div>
      </div>

      {!result.ok && (
        <div class="mt-4">
          <Notice tone="danger">{errorMessage(result.code, result.character, ui)}</Notice>
        </div>
      )}

      {result.ok && (
        <div class="mt-6 border-t border-line pt-6" aria-live="polite">
          <h3 class="text-sm font-medium text-fg">{ui.resultsTitle}</h3>
          <p class="mt-1 text-xs leading-5 text-subtle">{ui.resultsHint}</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {result.conversions.map((conversion) => (
              <ResultCard key={conversion.base} conversion={conversion} ui={ui} />
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
