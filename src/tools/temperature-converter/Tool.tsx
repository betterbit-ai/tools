import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Field, NumberInput, Notice, Panel, Select, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  convertTemperature,
  cookingTable,
  isBelowAbsoluteZero,
  isTemperatureUnit,
  TEMPERATURE_UNITS,
  type TemperatureUnit,
} from './logic';

const STORAGE_KEY = 'tools:temperature-converter:state';

const UNIT_LABEL_KEY: Record<TemperatureUnit, keyof UI> = {
  c: 'unitC',
  f: 'unitF',
  k: 'unitK',
};

const DESCRIPTION_KEY: Record<string, keyof UI> = {
  ovenSlow: 'ovenSlow',
  ovenModeratelySlow: 'ovenModeratelySlow',
  ovenModerate: 'ovenModerate',
  ovenModeratelyHot: 'ovenModeratelyHot',
  ovenHot: 'ovenHot',
  ovenVeryHot: 'ovenVeryHot',
};

interface State {
  value: number | '';
  from: TemperatureUnit;
  to: TemperatureUnit;
}

const DEFAULT_STATE: State = { value: 37, from: 'c', to: 'f' };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      value: isFiniteNumber(saved.value) ? saved.value : DEFAULT_STATE.value,
      from: isTemperatureUnit(saved.from) ? saved.from : DEFAULT_STATE.from,
      to: isTemperatureUnit(saved.to) ? saved.to : DEFAULT_STATE.to,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function TemperatureConverter({ locale, ui, preset }: ToolProps<UI>) {
  const presetFrom = isTemperatureUnit(preset?.from) ? preset.from : undefined;
  const presetTo = isTemperatureUnit(preset?.to) ? preset.to : undefined;
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

  // Variant (preset) pages always start in the promised state; the plain tool page restores it.
  useEffect(() => {
    if (!hasPreset) setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const value = isFiniteNumber(state.value) ? state.value : 0;
  const result = useMemo(() => convertTemperature(value, state.from, state.to), [value, state.from, state.to]);
  const rows = useMemo(() => cookingTable(state.from, state.to), [state.from, state.to]);
  const n = (num: number) => formatNumber(num === 0 ? 0 : num, locale, 2);
  const unitOptions = TEMPERATURE_UNITS.map((u) => ({ value: u, label: ui[UNIT_LABEL_KEY[u]] }));
  const impossible = isBelowAbsoluteZero(value, state.from);

  const swap = () => {
    // Keep enough precision that repeated swaps (C -> F -> C -> ...) don't drift.
    const factor = 1e9;
    const rounded = Math.round(result * factor) / factor;
    setState((s) => ({ value: rounded, from: s.to, to: s.from }));
  };

  return (
    <Panel>
      <div class="flex flex-wrap items-end gap-3">
        <Field label={ui.valueLabel} class="w-32">
          <NumberInput value={state.value} onValue={(v) => update({ value: v })} />
        </Field>
        <Field label={ui.fromLabel} class="w-40">
          <Select value={state.from} onValue={(from) => update({ from })} options={unitOptions} />
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
        <Field label={ui.toLabel} class="w-40">
          <Select value={state.to} onValue={(to) => update({ to })} options={unitOptions} />
        </Field>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div aria-live="polite">
          <Stat label={ui.resultLabel} value={n(result)} emphasis />
        </div>
        <span class="text-xs text-subtle">{ui.autosaved}</span>
      </div>

      {impossible && (
        <div class="mt-4">
          <Notice tone="danger">{ui.belowAbsoluteZero}</Notice>
        </div>
      )}

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg mb-3">{ui.cookingTableTitle}</h3>
        <div class="overflow-hidden rounded-lg border border-line">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-surface-2 text-left text-xs text-muted">
                <th scope="col" class="px-3 py-2 font-medium">
                  {ui.gasMark}
                </th>
                <th scope="col" class="px-3 py-2 font-medium">
                  {ui[UNIT_LABEL_KEY[state.from]]}
                </th>
                <th scope="col" class="px-3 py-2 font-medium">
                  {ui[UNIT_LABEL_KEY[state.to]]}
                </th>
                <th scope="col" class="px-3 py-2 font-medium">
                  {ui.heatLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.gasMark} class="border-t border-line">
                  <td class="px-3 py-1.5 tabular text-fg">{row.gasMark}</td>
                  <td class="px-3 py-1.5 tabular text-fg">{n(row.fromValue)}</td>
                  <td class="px-3 py-1.5 tabular text-fg">{n(row.toValue)}</td>
                  <td class="px-3 py-1.5 text-muted">{ui[DESCRIPTION_KEY[row.descriptionKey]]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}
