import { useEffect, useMemo, useState } from 'preact/hooks';
import { Field, Notice, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  calculateBmi,
  calculateRawBmi,
  categorizeBmi,
  healthyWeightRange,
  imperialToMetric,
  metricToImperial,
  parseMeasurement,
  type BmiCategory,
  type WeightRange,
} from './logic';

const STORAGE_KEY = 'tools:bmi-calculator:state';

type Unit = 'metric' | 'imperial';

const POUNDS_PER_KG = 2.2046226218;

/**
 * A numeric field that keeps the text the visitor typed.
 *
 * The shared number input re-renders a partly typed value, so the decimal point never survived a
 * keystroke: typing 170.5 left “5170” in the height field and the page said the measurements were
 * out of range. This keeps the text as typed and reads it only when it is a number.
 */
function NumberField(props: {
  value: number | '';
  onValue: (value: number | '') => void;
  label: string;
  hint?: string;
}) {
  const [text, setText] = useState(() => (props.value === '' ? '' : String(props.value)));

  useEffect(() => {
    if (props.value === '') return;
    if (parseMeasurement(text) !== props.value) setText(String(props.value));
  }, [props.value, text]);

  return (
    <Field label={props.label} hint={props.hint}>
      <TextInput
        value={text}
        inputMode="decimal"
        autocomplete="off"
        spellcheck={false}
        class="tabular"
        onInput={(event) => {
          const typed = (event.currentTarget as HTMLInputElement).value;
          setText(typed);
          props.onValue(parseMeasurement(typed) ?? '');
        }}
      />
    </Field>
  );
}

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
  const rawBmi = useMemo(() => calculateRawBmi(state.heightCm, state.weightKg), [state.heightCm, state.weightKg]);
  const whoRange = useMemo(() => healthyWeightRange(state.heightCm, 'who'), [state.heightCm]);
  const koreanRange = useMemo(() => healthyWeightRange(state.heightCm, 'korean'), [state.heightCm]);
  const imperial = useMemo(() => metricToImperial(height, weight), [height, weight]);
  const n = (value: number) => formatNumber(value, locale, 1);
  /** The healthy-weight range in the unit the visitor is entering, not kilograms in the US view. */
  const rangeText = (range: WeightRange) =>
    (state.unit === 'imperial' ? ui.weightRangeLb : ui.weightRange)
      .replace('{min}', n(state.unit === 'imperial' ? range.min * POUNDS_PER_KG : range.min))
      .replace('{max}', n(state.unit === 'imperial' ? range.max * POUNDS_PER_KG : range.max));

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

  const valid = bmi !== null && rawBmi !== null && whoRange !== null && koreanRange !== null;
  const whoCategory = valid ? categorizeBmi(rawBmi, 'who') : null;
  const koreanCategory = valid ? categorizeBmi(rawBmi, 'korean') : null;
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
              <NumberField
                label={ui.heightCmLabel}
                hint={ui.heightCmHint}
                value={state.heightCm}
                onValue={(heightCm) => update({ heightCm })}
              />
              <NumberField
                label={ui.weightKgLabel}
                hint={ui.weightKgHint}
                value={state.weightKg}
                onValue={(weightKg) => update({ weightKg })}
              />
            </>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-3">
                <NumberField
                  label={ui.heightFeetLabel}
                  value={imperial.feet}
                  onValue={(feet) => updateImperial(isFiniteNumber(feet) ? feet : 0, imperial.inches, imperial.pounds)}
                />
                <NumberField
                  label={ui.heightInchesLabel}
                  value={imperial.inches}
                  onValue={(inches) =>
                    updateImperial(imperial.feet, isFiniteNumber(inches) ? inches : 0, imperial.pounds)
                  }
                />
              </div>
              <NumberField
                label={ui.weightPoundsLabel}
                value={imperial.pounds}
                onValue={(pounds) =>
                  updateImperial(imperial.feet, imperial.inches, isFiniteNumber(pounds) ? pounds : 0)
                }
              />
            </>
          )}
          <Notice tone="info">{ui.adultNotice}</Notice>
        </div>

        <div class="flex flex-col gap-3">
          {!valid || !whoCategory || !koreanCategory ? (
            <Notice tone="danger">
              {state.unit === 'metric' ? ui.invalidMetricMeasurements : ui.invalidImperialMeasurements}
            </Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.bmiLabel} value={n(bmi)} emphasis />
                <Stat label={ui.whoLabel} value={categoryLabel(whoCategory)} />
                <Stat label={ui.koreanLabel} value={categoryLabel(koreanCategory)} />
                <Stat label={ui.whoWeightLabel} value={rangeText(whoRange)} />
                <Stat label={ui.koreanWeightLabel} value={rangeText(koreanRange)} />
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
