import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateArea, compareAreas, type AreaUnit } from './logic';

const STORAGE_KEY = 'tools:pyeong-calculator:state';

type AreaBasis = 'exclusive' | 'supply';

interface State {
  value: number | '';
  unit: AreaUnit;
  basis: AreaBasis;
  exclusiveSquareMeters: number | '';
  supplySquareMeters: number | '';
}

const DEFAULT_STATE: State = {
  value: 84,
  unit: 'squareMeters',
  basis: 'exclusive',
  exclusiveSquareMeters: 84,
  supplySquareMeters: 112,
};

function isFiniteValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isUnit(value: unknown): value is AreaUnit {
  return value === 'squareMeters' || value === 'pyeong';
}

function isBasis(value: unknown): value is AreaBasis {
  return value === 'exclusive' || value === 'supply';
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      value: isFiniteValue(saved.value) ? saved.value : DEFAULT_STATE.value,
      unit: isUnit(saved.unit) ? saved.unit : DEFAULT_STATE.unit,
      basis: isBasis(saved.basis) ? saved.basis : DEFAULT_STATE.basis,
      exclusiveSquareMeters: isFiniteValue(saved.exclusiveSquareMeters)
        ? saved.exclusiveSquareMeters
        : DEFAULT_STATE.exclusiveSquareMeters,
      supplySquareMeters: isFiniteValue(saved.supplySquareMeters)
        ? saved.supplySquareMeters
        : DEFAULT_STATE.supplySquareMeters,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function PyeongCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(DEFAULT_STATE);

  useEffect(() => {
    setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateArea(state.value, state.unit), [state.value, state.unit]);
  const comparison = useMemo(
    () => compareAreas(state.exclusiveSquareMeters, state.supplySquareMeters),
    [state.exclusiveSquareMeters, state.supplySquareMeters],
  );
  const n = (value: number) => formatNumber(value, locale, 2);
  const formula =
    result &&
    (state.unit === 'squareMeters'
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
        `${ui.pyeongResult}: ${n(result.pyeong)}${ui.pyeong}`,
        `${ui.basisResult}: ${state.basis === 'exclusive' ? ui.exclusive : ui.supply}`,
        comparison
          ? `${ui.exclusivePyeong}: ${n(comparison.exclusive.pyeong)}${ui.pyeong}\n${ui.supplyPyeong}: ${n(comparison.supply.pyeong)}${ui.pyeong}\n${ui.exclusiveRatio}: ${n(comparison.exclusiveRatio)}%`
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
          <Field label={ui.unitLabel}>
            <Segmented<AreaUnit>
              label={ui.unitLabel}
              value={state.unit}
              onValue={(unit) => update({ unit })}
              options={[
                { value: 'squareMeters', label: ui.squareMeters },
                { value: 'pyeong', label: ui.pyeong },
              ]}
            />
          </Field>
          <Field label={ui.basisLabel} hint={ui.basisHint}>
            <Segmented<AreaBasis>
              label={ui.basisLabel}
              value={state.basis}
              onValue={(basis) => update({ basis })}
              options={[
                { value: 'exclusive', label: ui.exclusive },
                { value: 'supply', label: ui.supply },
              ]}
            />
          </Field>
          <Field label={ui.valueLabel} hint={ui.valueHint}>
            <NumberInput
              value={state.value}
              min="0"
              max="1000000000000"
              step="any"
              onValue={(value) => update({ value })}
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
                <Stat label={ui.pyeongResult} value={`${n(result.pyeong)}${ui.pyeong}`} emphasis />
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
            <NumberInput
              value={state.exclusiveSquareMeters}
              min="0"
              max="1000000000000"
              step="any"
              onValue={(exclusiveSquareMeters) => update({ exclusiveSquareMeters })}
            />
          </Field>
          <Field label={ui.supplyInput}>
            <NumberInput
              value={state.supplySquareMeters}
              min="0"
              max="1000000000000"
              step="any"
              onValue={(supplySquareMeters) => update({ supplySquareMeters })}
            />
          </Field>
        </div>
        {!comparison ? (
          <div class="mt-4">
            <Notice tone="danger">{ui.invalidComparison}</Notice>
          </div>
        ) : (
          <>
            <div class="mt-4 grid gap-2 sm:grid-cols-2" aria-live="polite">
              <Stat label={ui.exclusivePyeong} value={`${n(comparison.exclusive.pyeong)}${ui.pyeong}`} emphasis />
              <Stat label={ui.supplyPyeong} value={`${n(comparison.supply.pyeong)}${ui.pyeong}`} emphasis />
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
