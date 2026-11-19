import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Panel, Select, Stat, TextInput, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  MAX_VOLUME,
  VOLUME_UNITS,
  convertVolume,
  formatInputValue,
  formatVolume,
  isVolumeUnit,
  parseVolumeInput,
  quickTable,
  type VolumeUnit,
} from './logic';

const STORAGE_KEY = 'tools:volume-converter:state';

const UNIT_LABEL_KEY: Record<VolumeUnit, keyof UI> = {
  milliliter: 'unitMilliliter',
  liter: 'unitLiter',
  koreanCup: 'unitKoreanCup',
  usCup: 'unitUsCup',
  usLegalCup: 'unitUsLegalCup',
  metricCup: 'unitMetricCup',
  imperialCup: 'unitImperialCup',
  usFluidOunce: 'unitUsFluidOunce',
  usTablespoon: 'unitUsTablespoon',
  usTeaspoon: 'unitUsTeaspoon',
};

interface State {
  value: number | '';
  from: VolumeUnit;
  to: VolumeUnit;
}

function defaultState(locale: string): State {
  return locale === 'ko'
    ? { value: 1, from: 'koreanCup', to: 'milliliter' }
    : { value: 1, from: 'usCup', to: 'milliliter' };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(locale: string): State {
  const fallback = defaultState(locale);
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    return {
      value: isFiniteNumber(saved.value) ? saved.value : fallback.value,
      from: isVolumeUnit(saved.from) ? saved.from : fallback.from,
      to: isVolumeUnit(saved.to) ? saved.to : fallback.to,
    };
  } catch {
    return fallback;
  }
}

const asText = (value: number | '') => (value === '' ? '' : String(value));

export default function VolumeConverter({ locale, ui, preset }: ToolProps<UI>) {
  const presetFrom = isVolumeUnit(preset?.from) ? preset.from : undefined;
  const presetTo = isVolumeUnit(preset?.to) ? preset.to : undefined;
  const presetValue = isFiniteNumber(preset?.value) ? preset.value : undefined;
  const hasPreset = presetFrom !== undefined || presetTo !== undefined || presetValue !== undefined;
  const fallback = defaultState(locale);

  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(() =>
    hasPreset
      ? { value: presetValue ?? fallback.value, from: presetFrom ?? fallback.from, to: presetTo ?? fallback.to }
      : fallback,
  );
  /** The field keeps exactly what was typed, so a decimal point or a separator is never eaten. */
  const [text, setText] = useState(() => asText(hasPreset ? (presetValue ?? fallback.value) : fallback.value));
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (!hasPreset) {
      const restored = restoreState(locale);
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

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const parsed = parseVolumeInput(text);
  const value = parsed.status === 'valid' ? parsed.value : parsed.status === 'empty' ? 0 : null;
  const result = value === null ? null : convertVolume(value, state.from, state.to);
  const rows = useMemo(() => quickTable(state.from, state.to), [state.from, state.to]);
  const otherUnits = VOLUME_UNITS.filter((unit) => unit !== state.from && unit !== state.to);
  const unitOptions = VOLUME_UNITS.map((unit) => ({ value: unit, label: ui[UNIT_LABEL_KEY[unit]] }));
  const n = (amount: number) => formatVolume(amount, locale);
  const copyText =
    value === null
      ? ''
      : VOLUME_UNITS.map((unit) => `${ui[UNIT_LABEL_KEY[unit]]}: ${n(convertVolume(value, state.from, unit))}`).join(
          '\n',
        );

  const onValueText = (next: string) => {
    setText(next);
    const reading = parseVolumeInput(next);
    if (reading.status === 'valid') update({ value: reading.value });
    else if (reading.status === 'empty') update({ value: '' });
  };

  const swap = () => {
    if (result === null) {
      setState((current) => ({ value: current.value, from: current.to, to: current.from }));
      return;
    }
    // Keep 12 significant digits so the value survives swapping back, instead of the 2–4 decimals
    // the result card happens to show.
    setState((current) => ({ value: result, from: current.to, to: current.from }));
    setText(formatInputValue(result));
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="grid gap-4 sm:grid-cols-2">
          <Field label={ui.valueLabel} class="sm:col-span-2">
            <TextInput
              inputMode="decimal"
              autoComplete="off"
              spellcheck={false}
              value={text}
              placeholder="1"
              onInput={(event) => onValueText(event.currentTarget.value)}
            />
          </Field>
          <Field label={ui.fromLabel}>
            <Select
              value={state.from}
              onValue={(from) => update({ from })}
              ariaLabel={ui.fromLabel}
              options={unitOptions}
            />
          </Field>
          <div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
            <Field label={ui.toLabel}>
              <Select value={state.to} onValue={(to) => update({ to })} ariaLabel={ui.toLabel} options={unitOptions} />
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
            label={ui.resultLabel.replace('{unit}', ui[UNIT_LABEL_KEY[state.to]])}
            value={result === null ? '—' : n(result)}
            emphasis
          />
          <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          <span class={cx('text-xs', saveFailed ? 'text-danger' : 'text-subtle')}>
            {saveFailed ? ui.saveFailed : ui.autosaved}
          </span>
        </div>
      </div>

      {parsed.status === 'invalid' && (
        <p class="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
          {ui.invalidValue}
        </p>
      )}
      {parsed.status === 'out-of-range' && (
        <p class="mt-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
          {ui.outOfRange.replace('{max}', new Intl.NumberFormat(locale).format(MAX_VOLUME))}
        </p>
      )}

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg">{ui.otherUnitsTitle}</h3>
        <div class="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
          {otherUnits.map((unit) => (
            <Stat
              label={ui[UNIT_LABEL_KEY[unit]]}
              value={result === null ? '—' : n(convertVolume(value ?? 0, state.from, unit))}
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
                  <td class="px-3 py-1.5 tabular text-fg">{row.label ?? n(row.value)}</td>
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
