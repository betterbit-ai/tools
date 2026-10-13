import { useEffect, useMemo, useState } from 'preact/hooks';
import { Field, Notice, NumberInput, Panel, Segmented, Select, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_MULTIPLIERS,
  calculateCalorieNeeds,
  imperialToMetric,
  metricToImperial,
  type ActivityLevel,
  type Goal,
  type Sex,
} from './logic';

const STORAGE_KEY = 'tools:calorie-calculator:state';

type Unit = 'metric' | 'imperial';

interface State {
  unit: Unit;
  sex: Sex;
  age: number | '';
  heightCm: number | '';
  weightKg: number | '';
  activity: ActivityLevel;
  goal: Goal;
}

const DEFAULT_STATE: State = {
  unit: 'metric',
  sex: 'male',
  age: 30,
  heightCm: 175,
  weightKg: 70,
  activity: 'moderate',
  goal: 'maintain',
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(): State {
  try {
    const saved: unknown = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    const value = saved as Partial<State>;
    return {
      unit: value.unit === 'imperial' ? 'imperial' : 'metric',
      sex: value.sex === 'female' ? 'female' : 'male',
      age: isFiniteNumber(value.age) ? value.age : DEFAULT_STATE.age,
      heightCm: isFiniteNumber(value.heightCm) ? value.heightCm : DEFAULT_STATE.heightCm,
      weightKg: isFiniteNumber(value.weightKg) ? value.weightKg : DEFAULT_STATE.weightKg,
      activity: isActivityLevel(value.activity) ? value.activity : DEFAULT_STATE.activity,
      goal: isGoal(value.goal) ? value.goal : DEFAULT_STATE.goal,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function isActivityLevel(value: unknown): value is ActivityLevel {
  return (
    value === 'sedentary' ||
    value === 'light' ||
    value === 'moderate' ||
    value === 'veryActive' ||
    value === 'extraActive'
  );
}

function isGoal(value: unknown): value is Goal {
  return value === 'lose' || value === 'maintain' || value === 'gain';
}

export default function CalorieCalculator({ locale, ui }: ToolProps<UI>) {
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
  const imperial = useMemo(() => metricToImperial(height, weight), [height, weight]);
  const result = useMemo(() => calculateCalorieNeeds(state), [state]);
  const n = (value: number) => formatNumber(value, locale, 0);
  const measurement = (value: number | '') => (isFiniteNumber(value) ? formatNumber(value, locale, 1) : '');

  const updateImperial = (feet: number, inches: number, pounds: number) =>
    update(imperialToMetric(feet, inches, pounds));
  const goalLabels: Record<Goal, string> = {
    lose: ui.goalLose,
    maintain: ui.goalMaintain,
    gain: ui.goalGain,
  };

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

      <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex flex-col gap-4">
          <Field label={ui.sexLabel} hint={ui.sexHint}>
            <Segmented<Sex>
              label={ui.sexLabel}
              value={state.sex}
              onValue={(sex) => update({ sex })}
              options={[
                { value: 'male', label: ui.male },
                { value: 'female', label: ui.female },
              ]}
            />
          </Field>
          <Field label={ui.ageLabel} hint={ui.ageHint}>
            <NumberInput value={state.age} min="18" max="120" step="1" onValue={(age) => update({ age })} />
          </Field>
          {state.unit === 'metric' ? (
            <div class="grid grid-cols-2 gap-3">
              <Field label={ui.heightCmLabel} hint={ui.heightCmHint}>
                <NumberInput
                  value={state.heightCm}
                  min="80"
                  max="250"
                  step="0.1"
                  onValue={(heightCm) => update({ heightCm })}
                />
              </Field>
              <Field label={ui.weightKgLabel} hint={ui.weightKgHint}>
                <NumberInput
                  value={state.weightKg}
                  min="25"
                  max="400"
                  step="0.1"
                  onValue={(weightKg) => update({ weightKg })}
                />
              </Field>
            </div>
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
          <Field label={ui.activityLabel} hint={ui.activityHint}>
            <Select<ActivityLevel>
              value={state.activity}
              onValue={(activity) => update({ activity })}
              options={[
                { value: 'sedentary', label: ui.activitySedentary },
                { value: 'light', label: ui.activityLight },
                { value: 'moderate', label: ui.activityModerate },
                { value: 'veryActive', label: ui.activityVeryActive },
                { value: 'extraActive', label: ui.activityExtraActive },
              ]}
            />
          </Field>
          <Field label={ui.goalLabel} hint={ui.goalHint}>
            <Select<Goal>
              value={state.goal}
              onValue={(goal) => update({ goal })}
              options={[
                { value: 'lose', label: ui.goalLose },
                { value: 'maintain', label: ui.goalMaintain },
                { value: 'gain', label: ui.goalGain },
              ]}
            />
          </Field>
        </div>

        <div class="flex flex-col gap-3">
          {!result ? (
            <Notice tone="danger">{ui.invalidMeasurements}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat
                  label={ui.targetLabel.replace('{goal}', goalLabels[state.goal])}
                  value={`${n(result.target)} ${ui.kcalDay}`}
                  emphasis
                />
                <Stat label={ui.maintenanceLabel} value={`${n(result.maintenance)} ${ui.kcalDay}`} />
                <Stat label={ui.bmrLabel} value={`${n(result.bmr)} ${ui.kcalDay}`} />
                <Stat label={ui.activityCaloriesLabel} value={`${n(result.activityCalories)} ${ui.kcalDay}`} />
              </div>
              <p class="font-mono text-xs text-subtle">
                {ui.bmrFormula
                  .replace('{weight}', measurement(state.weightKg))
                  .replace('{height}', measurement(state.heightCm))
                  .replace('{age}', measurement(state.age))
                  .replace('{constant}', state.sex === 'male' ? ui.maleConstant : ui.femaleConstant)
                  .replace('{bmr}', n(result.bmr))}
              </p>
              <p class="font-mono text-xs text-subtle">
                {ui.targetFormula
                  .replace('{maintenance}', n(result.maintenance))
                  .replace('{activity}', String(ACTIVITY_MULTIPLIERS[state.activity]))
                  .replace('{goal}', String(GOAL_MULTIPLIERS[state.goal]))
                  .replace('{target}', n(result.target))}
              </p>
              <Notice tone="info">{ui.estimateNotice}</Notice>
            </>
          )}
          <Notice tone="info">{ui.adultNotice}</Notice>
        </div>
      </div>
    </Panel>
  );
}
