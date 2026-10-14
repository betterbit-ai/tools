import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, NumberInput, Panel, Segmented, Select, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_SPEED,
  SPEED_UNITS,
  convertSpeed,
  formatPace,
  isSpeedUnit,
  paceSecondsFromSpeed,
  quickTable,
  speedFromPace,
  type SpeedUnit,
} from './logic';

const STORAGE_KEY = 'tools:speed-converter:state';

type Mode = 'speed' | 'pace';
type PaceDistance = 'km' | 'mi';

const UNIT_LABEL_KEY: Record<SpeedUnit, keyof UI> = {
  kmh: 'unitKmh',
  mph: 'unitMph',
  ms: 'unitMs',
  knot: 'unitKnot',
};

interface State {
  mode: Mode;
  value: number | '';
  from: SpeedUnit;
  to: SpeedUnit;
  paceMinutes: number | '';
  paceSeconds: number | '';
  paceDistance: PaceDistance;
}

const DEFAULT_STATE: State = {
  mode: 'speed',
  value: 60,
  from: 'mph',
  to: 'kmh',
  paceMinutes: 5,
  paceSeconds: 0,
  paceDistance: 'km',
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isMode(value: unknown): value is Mode {
  return value === 'speed' || value === 'pace';
}

function isPaceDistance(value: unknown): value is PaceDistance {
  return value === 'km' || value === 'mi';
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      mode: isMode(saved.mode) ? saved.mode : DEFAULT_STATE.mode,
      value: isFiniteNumber(saved.value) ? saved.value : DEFAULT_STATE.value,
      from: isSpeedUnit(saved.from) ? saved.from : DEFAULT_STATE.from,
      to: isSpeedUnit(saved.to) ? saved.to : DEFAULT_STATE.to,
      paceMinutes: isFiniteNumber(saved.paceMinutes) ? saved.paceMinutes : DEFAULT_STATE.paceMinutes,
      paceSeconds: isFiniteNumber(saved.paceSeconds) ? saved.paceSeconds : DEFAULT_STATE.paceSeconds,
      paceDistance: isPaceDistance(saved.paceDistance) ? saved.paceDistance : DEFAULT_STATE.paceDistance,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function resultDecimals(value: number): number {
  const absolute = Math.abs(value);
  if (absolute === 0) return 0;
  if (absolute < 0.01) return 6;
  if (absolute < 1) return 4;
  if (absolute < 100) return 3;
  return 2;
}

export default function SpeedConverter({ locale, ui, preset }: ToolProps<UI>) {
  const presetMode = isMode(preset?.mode) ? preset.mode : undefined;
  const presetFrom = isSpeedUnit(preset?.from) ? preset.from : undefined;
  const presetTo = isSpeedUnit(preset?.to) ? preset.to : undefined;
  const presetValue = isFiniteNumber(preset?.value) ? preset.value : undefined;
  const hasPreset =
    presetMode !== undefined || presetFrom !== undefined || presetTo !== undefined || presetValue !== undefined;
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(() =>
    hasPreset
      ? {
          ...DEFAULT_STATE,
          mode: presetMode ?? DEFAULT_STATE.mode,
          from: presetFrom ?? DEFAULT_STATE.from,
          to: presetTo ?? DEFAULT_STATE.to,
          value: presetValue ?? DEFAULT_STATE.value,
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
  const sourceSpeed =
    state.mode === 'speed'
      ? convertSpeed(isFiniteNumber(state.value) ? state.value : 0, state.from, 'ms')
      : speedFromPace(
          isFiniteNumber(state.paceMinutes) ? state.paceMinutes : 0,
          isFiniteNumber(state.paceSeconds) ? state.paceSeconds : 0,
          state.paceDistance,
        );
  const primaryResult = convertSpeed(sourceSpeed, 'ms', state.to);
  const unitOptions = SPEED_UNITS.map((unit) => ({ value: unit, label: ui[UNIT_LABEL_KEY[unit]] }));
  const otherUnits = SPEED_UNITS.filter((unit) => unit !== state.to);
  const rows = useMemo(() => quickTable(state.from, state.to), [state.from, state.to]);
  const n = (value: number) => formatNumber(value, locale, resultDecimals(value));
  const paceKm = formatPace(paceSecondsFromSpeed(sourceSpeed, 'ms', 'km'));
  const paceMi = formatPace(paceSecondsFromSpeed(sourceSpeed, 'ms', 'mi'));
  const copyText = [
    ...SPEED_UNITS.map((unit) => `${ui[UNIT_LABEL_KEY[unit]]}: ${n(convertSpeed(sourceSpeed, 'ms', unit))}`),
    `${ui.paceKmResult}: ${paceKm}`,
    `${ui.paceMiResult}: ${paceMi}`,
  ].join('\n');

  const swap = () => {
    const decimals = resultDecimals(primaryResult);
    const rounded = Math.round(primaryResult * 10 ** decimals) / 10 ** decimals;
    update({ value: rounded, from: state.to, to: state.from });
  };

  return (
    <Panel>
      <Segmented<Mode>
        label={ui.modeLabel}
        value={state.mode}
        onValue={(mode) => update({ mode })}
        options={[
          { value: 'speed', label: ui.speedMode },
          { value: 'pace', label: ui.paceMode },
        ]}
      />

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {state.mode === 'speed' ? (
          <div class="grid gap-4 sm:grid-cols-2">
            <Field label={ui.valueLabel} class="sm:col-span-2" hint={ui.speedHint}>
              <NumberInput
                value={state.value}
                min="0"
                max={MAX_SPEED}
                step="any"
                onValue={(value) => update({ value })}
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
                {ui.swap}
              </Button>
            </div>
          </div>
        ) : (
          <div class="grid gap-4 sm:grid-cols-2">
            <Field label={ui.paceMinutesLabel} hint={ui.paceHint}>
              <NumberInput
                value={state.paceMinutes}
                min="0"
                step="1"
                onValue={(paceMinutes) => update({ paceMinutes })}
              />
            </Field>
            <Field label={ui.paceSecondsLabel} hint={ui.secondsHint}>
              <NumberInput
                value={state.paceSeconds}
                min="0"
                max="59"
                step="1"
                onValue={(paceSeconds) => update({ paceSeconds })}
              />
            </Field>
            <Field label={ui.paceDistanceLabel} class="sm:col-span-2">
              <Select
                value={state.paceDistance}
                onValue={(paceDistance) => update({ paceDistance })}
                options={[
                  { value: 'km', label: ui.paceKm },
                  { value: 'mi', label: ui.paceMi },
                ]}
              />
            </Field>
          </div>
        )}

        <div class="flex flex-col gap-3" aria-live="polite">
          <Stat
            label={ui.resultLabel.replace('{unit}', ui[UNIT_LABEL_KEY[state.to]])}
            value={n(primaryResult)}
            emphasis
          />
          <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          <span class="text-xs text-subtle">{ui.autosaved}</span>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg">{ui.allResultsTitle}</h3>
        <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-live="polite">
          {otherUnits.map((unit) => (
            <Stat label={ui[UNIT_LABEL_KEY[unit]]} value={n(convertSpeed(sourceSpeed, 'ms', unit))} />
          ))}
          <Stat label={ui.paceKmResult} value={paceKm} />
          <Stat label={ui.paceMiResult} value={paceMi} />
        </div>
      </div>

      {state.mode === 'speed' && (
        <div class="mt-6 border-t border-line pt-6">
          <h3 class="mb-3 text-sm font-medium text-fg">{ui.quickTableTitle}</h3>
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
      )}
    </Panel>
  );
}
