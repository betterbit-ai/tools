import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Select, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { BYTES_PER_UNIT, DATA_UNITS, isDataUnit, readDataSize, resultsFromBytes, type DataUnit } from './logic';

const STORAGE_KEY = 'tools:data-size-converter:state';

const UNIT_LABEL_KEY: Record<DataUnit, keyof UI> = {
  bit: 'unitBit',
  B: 'unitByte',
  kB: 'unitKilobyte',
  MB: 'unitMegabyte',
  GB: 'unitGigabyte',
  TB: 'unitTerabyte',
  PB: 'unitPetabyte',
  KiB: 'unitKibibyte',
  MiB: 'unitMebibyte',
  GiB: 'unitGibibyte',
  TiB: 'unitTebibyte',
  PiB: 'unitPebibyte',
};

interface State {
  /** The text the visitor typed. Kept as text so "1.", "1,000" and "1.5" survive typing. */
  value: string;
  from: DataUnit;
  to: DataUnit;
}

const DEFAULT_STATE: State = { value: '1000', from: 'MB', to: 'GB' };

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<State> | null;
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    const value =
      typeof saved.value === 'string'
        ? saved.value
        : typeof saved.value === 'number' && Number.isFinite(saved.value) && saved.value >= 0
          ? String(saved.value)
          : DEFAULT_STATE.value;
    return {
      value: value.length <= 40 ? value : DEFAULT_STATE.value,
      from: isDataUnit(saved.from) ? saved.from : DEFAULT_STATE.from,
      to: isDataUnit(saved.to) ? saved.to : DEFAULT_STATE.to,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function resultDecimals(value: number): number {
  const absolute = Math.abs(value);
  if (absolute === 0) return 0;
  if (absolute < 0.001) return 10;
  if (absolute < 1) return 6;
  if (absolute < 100) return 4;
  return 2;
}

/** Keeps a nonzero size from being shown as "0": below the display's precision, use an exponent. */
function formatResult(value: number, format: (value: number, digits: number) => string): string {
  if (value !== 0 && Math.abs(value) < 1e-10) return value.toExponential(2);
  return format(value, resultDecimals(value));
}

/** A converted size carried back into the input field, without a screenful of float noise. */
function exactText(value: number): string {
  if (!Number.isFinite(value)) return '';
  return String(Number(value.toPrecision(12)));
}

export default function DataSizeConverter({ locale, ui, preset }: ToolProps<UI>) {
  const presetFrom = isDataUnit(preset?.from) ? preset.from : undefined;
  const presetTo = isDataUnit(preset?.to) ? preset.to : undefined;
  const presetValue =
    typeof preset?.value === 'number' && Number.isFinite(preset.value) && preset.value >= 0
      ? String(preset.value)
      : undefined;
  const hasPreset = presetFrom !== undefined || presetTo !== undefined || presetValue !== undefined;

  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(() =>
    hasPreset
      ? {
          value: presetValue ?? DEFAULT_STATE.value,
          from: presetFrom ?? DEFAULT_STATE.from,
          to: presetTo ?? DEFAULT_STATE.to,
        }
      : DEFAULT_STATE,
  );

  useEffect(() => {
    if (!hasPreset) setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const reading = useMemo(() => readDataSize(state.value, state.from), [state.value, state.from]);
  const results = reading.status === 'ok' ? resultsFromBytes(reading.bytes) : null;
  const result = reading.status === 'ok' ? reading.bytes / BYTES_PER_UNIT[state.to] : null;
  const unitOptions = DATA_UNITS.map((unit) => ({ value: unit, label: ui[UNIT_LABEL_KEY[unit]] }));
  const format = (value: number, digits: number) => formatNumber(value, locale, digits);
  const n = (value: number) => formatResult(value, format);
  const dash = '—';
  const notice =
    reading.status === 'empty'
      ? { tone: 'info' as const, text: ui.emptyInput }
      : reading.status === 'invalid'
        ? { tone: 'danger' as const, text: ui.invalidInput }
        : reading.status === 'tooLarge'
          ? {
              tone: 'danger' as const,
              text: ui.tooLarge.replace('{max}', formatNumber(Number.MAX_SAFE_INTEGER, locale)),
            }
          : null;
  const copyText = results
    ? [
        `${ui.bitsLabel}: ${n(results.bits)} bit`,
        `${ui.bytesLabel}: ${n(results.bytes)} B`,
        ...results.decimal.map((item) => `${item.unit}: ${n(item.value)}`),
        ...results.binary.map((item) => `${item.unit}: ${n(item.value)}`),
      ].join('\n')
    : '';

  const swap = () => {
    if (result === null) {
      setState((current) => ({ value: current.value, from: current.to, to: current.from }));
      return;
    }
    setState((current) => ({ value: exactText(result), from: current.to, to: current.from }));
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="grid gap-4 sm:grid-cols-2">
          <Field label={ui.valueLabel} class="sm:col-span-2">
            <TextInput
              value={state.value}
              inputMode="decimal"
              autocomplete="off"
              spellcheck={false}
              onInput={(event) => update({ value: (event.currentTarget as HTMLInputElement).value })}
            />
          </Field>
          <Field label={ui.fromLabel}>
            <Select value={state.from} onValue={(from) => update({ from })} options={unitOptions} />
          </Field>
          <div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
            <Field label={ui.toLabel}>
              <Select value={state.to} onValue={(to) => update({ to })} options={unitOptions} />
            </Field>
            <Button variant="secondary" aria-label={ui.swap} onClick={swap} class="mb-0.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m17 3 4 4-4 4" />
                <path d="M21 7H3" />
                <path d="m7 21-4-4 4-4" />
                <path d="M3 17h18" />
              </svg>
            </Button>
          </div>
          <p class="sm:col-span-2 text-xs leading-5 text-subtle">{ui.factorHint}</p>
        </div>

        <div class="flex flex-col gap-3" aria-live="polite">
          <Stat
            label={ui.resultLabel.replace('{unit}', state.to)}
            value={result === null ? dash : n(result)}
            emphasis
          />
          {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
          <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          <span class="text-xs text-subtle">{ui.autosaved}</span>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg">{ui.comparisonTitle}</h3>
        <p class="mt-1 text-xs leading-5 text-subtle">{ui.comparisonHint}</p>
        <div class="mt-3 grid gap-4 lg:grid-cols-2" aria-live="polite">
          <section>
            <h4 class="text-sm font-medium text-fg">{ui.decimalTitle}</h4>
            <p class="mt-1 text-xs text-subtle">{ui.decimalHint}</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              {results
                ? results.decimal.map((item) => <Stat label={item.unit} value={n(item.value)} />)
                : ['kB', 'MB', 'GB', 'TB', 'PB'].map((unit) => <Stat label={unit} value={dash} />)}
            </div>
          </section>
          <section>
            <h4 class="text-sm font-medium text-fg">{ui.binaryTitle}</h4>
            <p class="mt-1 text-xs text-subtle">{ui.binaryHint}</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              {results
                ? results.binary.map((item) => <Stat label={item.unit} value={n(item.value)} />)
                : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'].map((unit) => <Stat label={unit} value={dash} />)}
            </div>
          </section>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-2 border-t border-line pt-6" aria-live="polite">
        <Stat label={ui.bitsLabel} value={results ? n(results.bits) : dash} />
        <Stat label={ui.bytesLabel} value={results ? n(results.bytes) : dash} />
      </div>
    </Panel>
  );
}
