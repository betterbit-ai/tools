import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, Panel, Select, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  AREA_UNITS,
  MAX_AREA,
  convertArea,
  isAreaUnit,
  isValidArea,
  parseAreaNumber,
  quickTable,
  type AreaUnit,
} from './logic';

const STORAGE_KEY = 'tools:area-converter:state';

const UNIT_LABEL_KEY: Record<AreaUnit, keyof UI> = {
  squareMeter: 'unitSquareMeter',
  squareFoot: 'unitSquareFoot',
  squareYard: 'unitSquareYard',
  acre: 'unitAcre',
  hectare: 'unitHectare',
  pyeong: 'unitPyeong',
};

interface State {
  value: string;
  from: AreaUnit;
  to: AreaUnit;
}

const DEFAULT_STATE: State = { value: '1000', from: 'squareFoot', to: 'squareMeter' };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      value:
        typeof saved.value === 'string'
          ? saved.value
          : isFiniteNumber(saved.value)
            ? String(saved.value)
            : DEFAULT_STATE.value,
      from: isAreaUnit(saved.from) ? saved.from : DEFAULT_STATE.from,
      to: isAreaUnit(saved.to) ? saved.to : DEFAULT_STATE.to,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/** More decimals for very small outputs, without hiding useful room- or land-scale precision. */
function resultDecimals(value: number): number {
  const absolute = Math.abs(value);
  if (absolute === 0) return 0;
  if (absolute < 0.001) return 8;
  if (absolute < 1) return 6;
  if (absolute < 100) return 4;
  return 2;
}

export default function AreaConverter({ locale, ui, preset }: ToolProps<UI>) {
  const presetFrom = isAreaUnit(preset?.from) ? preset.from : undefined;
  const presetTo = isAreaUnit(preset?.to) ? preset.to : undefined;
  const presetValue = isFiniteNumber(preset?.value) ? preset.value : undefined;
  const hasPreset = presetFrom !== undefined || presetTo !== undefined || presetValue !== undefined;

  const [ready, setReady] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [state, setState] = useState<State>(() =>
    hasPreset
      ? {
          value: presetValue === undefined ? DEFAULT_STATE.value : String(presetValue),
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
  const parsedValue = parseAreaNumber(state.value);
  const inputEmpty = state.value.trim() === '';
  const inputInvalid = !inputEmpty && parsedValue === null;
  const areaInvalid = typeof parsedValue === 'number' && !isValidArea(parsedValue);
  const canConvert = typeof parsedValue === 'number' && isValidArea(parsedValue);
  const inputValue = canConvert ? parsedValue : 0;
  const result = useMemo(() => convertArea(inputValue, state.from, state.to), [inputValue, state.from, state.to]);
  const rows = useMemo(() => quickTable(state.from, state.to), [state.from, state.to]);
  const otherUnits = AREA_UNITS.filter((unit) => unit !== state.from && unit !== state.to);
  const unitOptions = AREA_UNITS.map((unit) => ({ value: unit, label: ui[UNIT_LABEL_KEY[unit]] }));
  const n = (value: number) => formatNumber(value, locale, resultDecimals(value));
  const copyText = canConvert
    ? AREA_UNITS.map((unit) => `${ui[UNIT_LABEL_KEY[unit]]}: ${n(convertArea(inputValue, state.from, unit))}`).join(
        '\n',
      )
    : '';
  const error = inputInvalid
    ? ui.invalidValue
    : areaInvalid && typeof parsedValue === 'number' && parsedValue < 0
      ? ui.negativeValue
      : areaInvalid
        ? ui.valueTooLarge.replace('{max}', formatNumber(MAX_AREA, locale))
        : null;

  const swap = () => {
    const decimals = resultDecimals(result);
    const roundedResult = Math.round(result * 10 ** decimals) / 10 ** decimals;
    setState((current) => ({ value: String(roundedResult), from: current.to, to: current.from }));
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
              aria-invalid={inputInvalid || areaInvalid}
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
            <Button variant="secondary" aria-label={ui.swap} onClick={swap} disabled={!canConvert} class="mb-0.5">
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
            label={ui.resultLabel.replace('{unit}', ui[UNIT_LABEL_KEY[state.to]])}
            value={canConvert ? n(result) : ui.unavailableResult}
            emphasis
          />
          <CopyButton
            text={copyText}
            label={ui.copy}
            copiedLabel={ui.copied}
            onSuccess={() => setCopyFailed(false)}
            onError={() => setCopyFailed(true)}
          />
          <span class="text-xs text-subtle">{ui.autosaved}</span>
        </div>
      </div>

      {error && (
        <div class="mt-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}

      {copyFailed && (
        <div class="mt-4">
          <Notice tone="danger">{ui.copyError}</Notice>
        </div>
      )}

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg">{ui.otherUnitsTitle}</h3>
        <div class="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
          {otherUnits.map((unit) => (
            <Stat
              label={ui[UNIT_LABEL_KEY[unit]]}
              value={canConvert ? n(convertArea(inputValue, state.from, unit)) : ui.unavailableResult}
            />
          ))}
        </div>
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
    </Panel>
  );
}
