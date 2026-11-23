import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, FieldGroup, Notice, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateArea, compareAreas, parseAreaInput, parseSquareMeters, type AreaUnit } from './logic';

const STORAGE_KEY = 'tools:pyeong-calculator:state';

type AreaBasis = 'exclusive' | 'supply';

/**
 * Areas are held as the text the visitor typed, not as a number. A controlled
 * `type=number` field cannot keep a decimal intact: after "84." the parsed value is
 * 84, the field is re-rendered as "84", and the next digit lands before the caret
 * (typing 84.5 used to leave 584). Text also lets a pasted "84㎡" or "34평" through.
 */
interface State {
  valueText: string;
  unit: AreaUnit;
  basis: AreaBasis;
  exclusiveText: string;
  supplyText: string;
}

const DEFAULT_STATE: State = {
  valueText: '84',
  unit: 'squareMeters',
  basis: 'exclusive',
  exclusiveText: '84',
  supplyText: '112',
};

function isUnit(value: unknown): value is AreaUnit {
  return value === 'squareMeters' || value === 'pyeong';
}

function isBasis(value: unknown): value is AreaBasis {
  return value === 'exclusive' || value === 'supply';
}

/** Older saved state kept plain numbers; both shapes reopen on the same values. */
function asText(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      valueText: asText(saved.valueText ?? saved.value, DEFAULT_STATE.valueText),
      unit: isUnit(saved.unit) ? saved.unit : DEFAULT_STATE.unit,
      basis: isBasis(saved.basis) ? saved.basis : DEFAULT_STATE.basis,
      exclusiveText: asText(saved.exclusiveText ?? saved.exclusiveSquareMeters, DEFAULT_STATE.exclusiveText),
      supplyText: asText(saved.supplyText ?? saved.supplySquareMeters, DEFAULT_STATE.supplyText),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function PyeongCalculator({ locale, ui, preset }: ToolProps<UI>) {
  // Landing pages (/pyeong-calculator/84-square-meters, /30-pyeong) open on their area.
  const presetArea =
    typeof preset?.value === 'number' && Number.isFinite(preset.value) && isUnit(preset?.unit)
      ? { valueText: String(preset.value), unit: preset.unit as AreaUnit }
      : null;
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(() => (presetArea ? { ...DEFAULT_STATE, ...presetArea } : DEFAULT_STATE));

  useEffect(() => {
    const restored = restoreState();
    setState(presetArea ? { ...restored, ...presetArea } : restored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const parsed = parseAreaInput(state.valueText, state.unit);
  const unit = parsed?.unit ?? state.unit;
  const result = parsed ? calculateArea(parsed.value, unit) : null;
  // A unit written into the pasted text moves the unit buttons to match.
  const onValueText = (valueText: string) => {
    const read = parseAreaInput(valueText, state.unit);
    update(read && read.unit !== state.unit ? { valueText, unit: read.unit } : { valueText });
  };

  const exclusive = parseSquareMeters(state.exclusiveText);
  const supply = parseSquareMeters(state.supplyText);
  const comparison = exclusive !== null && supply !== null ? compareAreas(exclusive, supply) : null;
  const comparisonUnreadable = exclusive === null || supply === null;

  const n = (value: number) => formatNumber(value, locale, 2);
  const formula =
    result &&
    (unit === 'squareMeters'
      ? ui.squareMetersFormula.replaceAll('{value}', n(result.squareMeters)).replaceAll('{result}', n(result.pyeong))
      : ui.pyeongFormula.replaceAll('{value}', n(result.pyeong)).replaceAll('{result}', n(result.squareMeters)));
  const comparisonNotice = comparison
    ? ui.comparisonNotice
        .replaceAll('{exclusive}', n(comparison.exclusive.pyeong))
        .replaceAll('{supply}', n(comparison.supply.pyeong))
    : '';
  const copyText = result
    ? [
        `${ui.squareMetersResult}: ${n(result.squareMeters)}㎡`,
        `${ui.pyeongResult}: ${n(result.pyeong)}${ui.pyeongSuffix}`,
        `${ui.basisResult}: ${state.basis === 'exclusive' ? ui.exclusive : ui.supply}`,
        comparison
          ? `${ui.exclusivePyeong}: ${n(comparison.exclusive.pyeong)}${ui.pyeongSuffix}\n${ui.supplyPyeong}: ${n(comparison.supply.pyeong)}${ui.pyeongSuffix}\n${ui.exclusiveRatio}: ${n(comparison.exclusiveRatio)}%`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex flex-col gap-4">
          <FieldGroup label={ui.unitLabel}>
            <Segmented<AreaUnit>
              label={ui.unitLabel}
              value={unit}
              onValue={(nextUnit) => update({ unit: nextUnit })}
              options={[
                { value: 'squareMeters', label: ui.squareMeters },
                { value: 'pyeong', label: ui.pyeong },
              ]}
            />
          </FieldGroup>
          <FieldGroup label={ui.basisLabel} hint={ui.basisHint}>
            <Segmented<AreaBasis>
              label={ui.basisLabel}
              value={state.basis}
              onValue={(basis) => update({ basis })}
              options={[
                { value: 'exclusive', label: ui.exclusive },
                { value: 'supply', label: ui.supply },
              ]}
            />
          </FieldGroup>
          <Field label={ui.valueLabel} hint={ui.valueHint}>
            <TextInput
              inputMode="decimal"
              autocomplete="off"
              spellcheck={false}
              value={state.valueText}
              onInput={(event) => onValueText(event.currentTarget.value)}
            />
          </Field>
        </div>

        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.squareMetersResult} value={`${n(result.squareMeters)}㎡`} emphasis />
                <Stat label={ui.pyeongResult} value={`${n(result.pyeong)}${ui.pyeongSuffix}`} emphasis />
                <Stat label={ui.basisResult} value={state.basis === 'exclusive' ? ui.exclusive : ui.supply} />
              </div>
              <div class="rounded-md border border-line bg-surface-2 p-3">
                <p class="text-xs font-medium text-muted">{ui.exactFactor}</p>
                <p class="mt-1 font-mono text-xs leading-5 text-fg">{formula}</p>
              </div>
              <Notice tone="info">{state.basis === 'exclusive' ? ui.exclusiveNotice : ui.supplyNotice}</Notice>
            </>
          )}
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-6">
        <h3 class="text-sm font-medium text-fg">{ui.comparisonTitle}</h3>
        <p class="mt-1 text-xs leading-5 text-subtle">{ui.comparisonHint}</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={ui.exclusiveInput}>
            <TextInput
              inputMode="decimal"
              autocomplete="off"
              spellcheck={false}
              value={state.exclusiveText}
              onInput={(event) => update({ exclusiveText: event.currentTarget.value })}
            />
          </Field>
          <Field label={ui.supplyInput}>
            <TextInput
              inputMode="decimal"
              autocomplete="off"
              spellcheck={false}
              value={state.supplyText}
              onInput={(event) => update({ supplyText: event.currentTarget.value })}
            />
          </Field>
        </div>
        {comparisonUnreadable ? (
          <div class="mt-4">
            <Notice tone="danger">{ui.comparisonInputError}</Notice>
          </div>
        ) : !comparison ? (
          <div class="mt-4">
            <Notice tone="danger">{ui.invalidComparison}</Notice>
          </div>
        ) : (
          <>
            <div class="mt-4 grid gap-2 sm:grid-cols-2" aria-live="polite">
              <Stat label={ui.exclusivePyeong} value={`${n(comparison.exclusive.pyeong)}${ui.pyeongSuffix}`} emphasis />
              <Stat label={ui.supplyPyeong} value={`${n(comparison.supply.pyeong)}${ui.pyeongSuffix}`} emphasis />
              <Stat label={ui.exclusiveRatio} value={`${n(comparison.exclusiveRatio)}%`} />
              <Stat
                label={ui.commonArea}
                value={`${n(comparison.supply.squareMeters - comparison.exclusive.squareMeters)}㎡`}
              />
            </div>
            <div class="mt-3">
              <Notice tone="info">{comparisonNotice}</Notice>
            </div>
          </>
        )}
        <div class="mt-4 flex flex-wrap gap-2">
          <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          <Button size="sm" variant="ghost" onClick={() => setState(DEFAULT_STATE)}>
            {ui.reset}
          </Button>
        </div>
      </div>
    </Panel>
  );
}
