import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Field, Panel, Select, Stat, TextInput, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  convertWeight,
  formatInputValue,
  formatWeight,
  isWeightUnit,
  parseWeightInput,
  quickTable,
  WEIGHT_UNITS,
  type WeightUnit,
} from './logic';

const STORAGE_KEY = 'tools:weight-converter:state';

const UNIT_LABEL_KEY: Record<WeightUnit, keyof UI> = {
  mg: 'unitMg',
  g: 'unitG',
  kg: 'unitKg',
  t: 'unitT',
  oz: 'unitOz',
  lb: 'unitLb',
  st: 'unitSt',
  don: 'unitDon',
  nyang: 'unitNyang',
  geunMeat: 'unitGeunMeat',
  geunProduce: 'unitGeunProduce',
  gwan: 'unitGwan',
};

interface State {
  value: number | '';
  from: WeightUnit;
  to: WeightUnit;
}

const DEFAULT_STATE: State = { value: 70, from: 'kg', to: 'lb' };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      value: isFiniteNumber(saved.value) ? saved.value : DEFAULT_STATE.value,
      from: isWeightUnit(saved.from) ? saved.from : DEFAULT_STATE.from,
      to: isWeightUnit(saved.to) ? saved.to : DEFAULT_STATE.to,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const asText = (value: number | '') => (value === '' ? '' : String(value));

export default function WeightConverter({ locale, ui, preset }: ToolProps<UI>) {
  const presetFrom = isWeightUnit(preset?.from) ? preset.from : undefined;
  const presetTo = isWeightUnit(preset?.to) ? preset.to : undefined;
  const presetValue = isFiniteNumber(preset?.value) ? preset.value : undefined;
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
  /** The field keeps exactly what was typed, so a decimal point or a separator is never eaten. */
  const [text, setText] = useState(() =>
    asText(hasPreset ? (presetValue ?? DEFAULT_STATE.value) : DEFAULT_STATE.value),
  );
  const [saveFailed, setSaveFailed] = useState(false);

  // Variant (preset) pages always start in the promised state; the plain tool page restores it.
  useEffect(() => {
    if (!hasPreset) {
      const restored = restoreState();
      setState(restored);
      setText(asText(restored.value));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // The page says the value is saved automatically; a blocked or full store has to say otherwise.
    setSaveFailed(!safeStorage.trySet(STORAGE_KEY, JSON.stringify(state)));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const parsed = parseWeightInput(text);
  const value = parsed.status === 'valid' ? parsed.value : parsed.status === 'empty' ? 0 : null;
  const result = value === null ? null : convertWeight(value, state.from, state.to);
  const rows = useMemo(() => quickTable(state.from, state.to), [state.from, state.to]);
  const unitOptions = WEIGHT_UNITS.map((u) => ({ value: u, label: ui[UNIT_LABEL_KEY[u]] }));

  const onValueText = (next: string) => {
    setText(next);
    const reading = parseWeightInput(next);
    if (reading.status === 'valid') update({ value: reading.value });
    else if (reading.status === 'empty') update({ value: '' });
  };

  const swap = () => {
    const reading = parseWeightInput(text);
    const converted = reading.status === 'valid' ? convertWeight(reading.value, state.from, state.to) : null;
    setState((s) => ({ value: converted ?? s.value, from: s.to, to: s.from }));
    if (converted !== null) setText(formatInputValue(converted));
  };

  return (
    <Panel>
      <div class="flex flex-wrap items-end gap-3">
        <Field label={ui.valueLabel} class="w-40">
          <TextInput
            inputMode="decimal"
            autoComplete="off"
            spellcheck={false}
            value={text}
            placeholder="70"
            onInput={(event) => onValueText(event.currentTarget.value)}
          />
        </Field>
        <Field label={ui.fromLabel} class="w-48">
          <Select
            value={state.from}
            onValue={(from) => update({ from })}
            ariaLabel={ui.fromLabel}
            options={unitOptions}
          />
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
        <Field label={ui.toLabel} class="w-48">
          <Select value={state.to} onValue={(to) => update({ to })} ariaLabel={ui.toLabel} options={unitOptions} />
        </Field>
      </div>
      {parsed.status === 'invalid' && (
        <p class="mt-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
          {ui.invalidValue}
        </p>
      )}

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div aria-live="polite">
          <Stat label={ui.resultLabel} value={result === null ? '—' : formatWeight(result, locale)} emphasis />
        </div>
        <span class={cx('text-xs', saveFailed ? 'text-danger' : 'text-subtle')}>
          {saveFailed ? ui.saveFailed : ui.autosaved}
        </span>
      </div>

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg mb-3">{ui.quickTableTitle}</h3>
        <div class="overflow-hidden rounded-lg border border-line">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-surface-2 text-left text-xs text-muted">
                <th scope="col" class="px-3 py-2 font-medium">
                  {ui[UNIT_LABEL_KEY[state.from]]}
                </th>
                <th scope="col" class="px-3 py-2 font-medium">
                  {ui[UNIT_LABEL_KEY[state.to]]}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr class="border-t border-line">
                  <td class="px-3 py-1.5 tabular text-fg">{formatWeight(row.value, locale)}</td>
                  <td class="px-3 py-1.5 tabular text-fg">{formatWeight(row.result, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}
