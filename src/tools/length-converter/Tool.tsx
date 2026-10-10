import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Field, NumberInput, Panel, Select, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  cmToFeetInches,
  convertLength,
  feetInchesToCm,
  isLengthUnit,
  LENGTH_UNITS,
  quickTable,
  type LengthUnit,
} from './logic';

const STORAGE_KEY = 'tools:length-converter:state';
const HEIGHT_KEY = 'tools:length-converter:height-cm';

const UNIT_LABEL_KEY: Record<LengthUnit, keyof UI> = {
  mm: 'unitMm',
  cm: 'unitCm',
  m: 'unitM',
  km: 'unitKm',
  in: 'unitIn',
  ft: 'unitFt',
  yd: 'unitYd',
  mi: 'unitMi',
};

interface State {
  value: number | '';
  from: LengthUnit;
  to: LengthUnit;
}

const DEFAULT_STATE: State = { value: 170, from: 'cm', to: 'in' };
const DEFAULT_HEIGHT_CM = 170;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      value: isFiniteNumber(saved.value) ? saved.value : DEFAULT_STATE.value,
      from: isLengthUnit(saved.from) ? saved.from : DEFAULT_STATE.from,
      to: isLengthUnit(saved.to) ? saved.to : DEFAULT_STATE.to,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/** More decimals for tiny results (e.g. mm -> km), fewer for large ones. */
function resultDecimals(n: number): number {
  const abs = Math.abs(n);
  if (abs === 0) return 0;
  if (abs < 0.001) return 8;
  if (abs < 1) return 6;
  if (abs < 100) return 4;
  return 2;
}

export default function LengthConverter({ locale, ui, preset }: ToolProps<UI>) {
  const presetFrom = isLengthUnit(preset?.from) ? preset.from : undefined;
  const presetTo = isLengthUnit(preset?.to) ? preset.to : undefined;
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
  const [heightCm, setHeightCm] = useState(DEFAULT_HEIGHT_CM);

  // Variant (preset) pages always start in the promised state; the plain tool page restores it.
  useEffect(() => {
    if (!hasPreset) setState(restoreState());
    const savedHeight = Number(safeStorage.get(HEIGHT_KEY));
    if (savedHeight > 0) setHeightCm(savedHeight);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  useEffect(() => {
    if (ready) safeStorage.set(HEIGHT_KEY, String(heightCm));
  }, [ready, heightCm]);

  const update = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));
  const value = isFiniteNumber(state.value) ? state.value : 0;
  const result = useMemo(() => convertLength(value, state.from, state.to), [value, state.from, state.to]);
  const rows = useMemo(() => quickTable(state.from, state.to), [state.from, state.to]);
  const height = useMemo(() => cmToFeetInches(heightCm), [heightCm]);
  const n = (num: number) => formatNumber(num, locale, resultDecimals(num));
  const unitOptions = LENGTH_UNITS.map((u) => ({ value: u, label: ui[UNIT_LABEL_KEY[u]] }));

  const swap = () => {
    const decimals = resultDecimals(result);
    const factor = 10 ** decimals;
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
                  <td class="px-3 py-1.5 tabular text-fg">{n(row.value)}</td>
                  <td class="px-3 py-1.5 tabular text-fg">{n(row.result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg mb-3">{ui.heightTitle}</h3>
        <div class="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <Field label={ui.heightFeetLabel}>
            <NumberInput
              value={height.feet}
              min="0"
              step="1"
              onValue={(feet) => setHeightCm(feetInchesToCm(isFiniteNumber(feet) ? feet : 0, height.inches))}
            />
          </Field>
          <Field label={ui.heightInchesLabel}>
            <NumberInput
              value={height.inches}
              min="0"
              max="11.9"
              step="0.1"
              onValue={(inches) => setHeightCm(feetInchesToCm(height.feet, isFiniteNumber(inches) ? inches : 0))}
            />
          </Field>
          <Field label={ui.heightCmLabel}>
            <NumberInput
              value={Math.round(heightCm * 10) / 10}
              min="0"
              step="0.1"
              onValue={(cm) => setHeightCm(isFiniteNumber(cm) ? cm : 0)}
            />
          </Field>
        </div>
      </div>
    </Panel>
  );
}
