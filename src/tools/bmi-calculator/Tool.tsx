import { useEffect, useMemo, useState } from 'preact/hooks';
import { Field, Notice, NumberInput, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  calculateBmi,
  categorizeBmi,
  healthyWeightRange,
  imperialToMetric,
  metricToImperial,
  type BmiCategory,
} from './logic';

const STORAGE_KEY = 'tools:bmi-calculator:state';

type Unit = 'metric' | 'imperial';

interface State {
  heightCm: number | '';
  weightKg: number | '';
  unit: Unit;
}

const DEFAULT_STATE: State = { heightCm: 170, weightKg: 65, unit: 'metric' };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    return {
      heightCm: isFiniteNumber(saved.heightCm) ? saved.heightCm : DEFAULT_STATE.heightCm,
      weightKg: isFiniteNumber(saved.weightKg) ? saved.weightKg : DEFAULT_STATE.weightKg,
      unit: saved.unit === 'imperial' ? 'imperial' : 'metric',
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function BmiCalculator({ locale, ui }: ToolProps<UI>) {
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
  const height = isFiniteNumber(state.heightCm) ? state.heightCm : 0;
  const weight = isFiniteNumber(state.weightKg) ? state.weightKg : 0;
  const bmi = useMemo(() => calculateBmi(state.heightCm, state.weightKg), [state.heightCm, state.weightKg]);
  const whoRange = useMemo(() => healthyWeightRange(state.heightCm, 'who'), [state.heightCm]);
  const koreanRange = useMemo(() => healthyWeightRange(state.heightCm, 'korean'), [state.heightCm]);
  const imperial = useMemo(() => metricToImperial(height, weight), [height, weight]);
  const n = (value: number) => formatNumber(value, locale, 1);

  const categoryLabel = (category: BmiCategory) => {
    const labels: Record<BmiCategory, string> = {
      underweight: ui.underweight,
      healthy: ui.healthy,
      preObesity: ui.preObesity,
      overweight: ui.overweight,
      obesity1: ui.obesity1,
      obesity2: ui.obesity2,
      obesity3: ui.obesity3,
    };
    return labels[category];
  };

  const updateImperial = (feet: number, inches: number, pounds: number) => {
    const metric = imperialToMetric(feet, inches, pounds);
    update(metric);
  };

  const valid = bmi !== null && whoRange !== null && koreanRange !== null;
  const whoCategory = valid ? categorizeBmi(bmi, 'who') : null;
  const koreanCategory = valid ? categorizeBmi(bmi, 'korean') : null;
  const formula = valid
    ? ui.formula
        .replace('{weight}', n(weight))
        .replaceAll('{height}', n(height / 100))
        .replace('{bmi}', n(bmi))
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Unit>
          label={ui.unitsLabel}
          value={state.unit}
          onValue={(unit) => update({ unit })}
          options={[
            { value: 'metric', label: ui.metric },
            { value: 'imperial', label: ui.imperial },
          ]}
        />
        <span class="text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div class="flex flex-col gap-4">
          {state.unit === 'metric' ? (
            <>
              <Field label={ui.heightCmLabel} hint={ui.heightCmHint}>
                <NumberInput value={state.heightCm} min="0" step="0.1" onValue={(heightCm) => update({ heightCm })} />
              </Field>
              <Field label={ui.weightKgLabel} hint={ui.weightKgHint}>
                <NumberInput value={state.weightKg} min="0" step="0.1" onValue={(weightKg) => update({ weightKg })} />
              </Field>
            </>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-3">
                <Field label={ui.heightFeetLabel}>
                  <NumberInput
                    value={imperial.feet}
                    min="0"
                    step="1"
                    onValue={(feet) =>
                      updateImperial(isFiniteNumber(feet) ? feet : 0, imperial.inches, imperial.pounds)
                    }
                  />
                </Field>
                <Field label={ui.heightInchesLabel}>
                  <NumberInput
                    value={imperial.inches}
                    min="0"
                    step="0.1"
                    onValue={(inches) =>
                      updateImperial(imperial.feet, isFiniteNumber(inches) ? inches : 0, imperial.pounds)
                    }
                  />
                </Field>
              </div>
              <Field label={ui.weightPoundsLabel}>
                <NumberInput
                  value={imperial.pounds}
                  min="0"
                  step="0.1"
                  onValue={(pounds) =>
                    updateImperial(imperial.feet, imperial.inches, isFiniteNumber(pounds) ? pounds : 0)
                  }
                />
              </Field>
            </>
          )}
          <Notice tone="info">{ui.adultNotice}</Notice>
        </div>

        <div class="flex flex-col gap-3">
          {!valid || !whoCategory || !koreanCategory ? (
            <Notice tone="danger">{ui.invalidMeasurements}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.bmiLabel} value={n(bmi)} emphasis />
                <Stat label={ui.whoLabel} value={categoryLabel(whoCategory)} />
                <Stat label={ui.koreanLabel} value={categoryLabel(koreanCategory)} />
                <Stat
                  label={ui.whoWeightLabel}
                  value={ui.weightRange.replace('{min}', n(whoRange.min)).replace('{max}', n(whoRange.max))}
                />
                <Stat
                  label={ui.koreanWeightLabel}
                  value={ui.weightRange.replace('{min}', n(koreanRange.min)).replace('{max}', n(koreanRange.max))}
                />
              </div>
              <p class="font-mono text-xs text-subtle">{formula}</p>
              <Notice tone="info">{ui.screeningNotice}</Notice>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
