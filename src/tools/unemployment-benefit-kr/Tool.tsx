import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateUnemploymentBenefit, type AgeGroup } from './logic';

const STORAGE_KEY = 'tools:unemployment-benefit-kr:state';

interface State {
  averageDailyWage: number | '';
  ordinaryDailyWage: number | '';
  scheduledHoursPerDay: number | '';
  insuranceMonths: number | '';
  ageGroup: AgeGroup;
  insuredUnitDays: number | '';
  eligibleSeparation: boolean;
  seekingWork: boolean;
}

function defaultState(): State {
  return {
    averageDailyWage: 100_000,
    ordinaryDailyWage: 0,
    scheduledHoursPerDay: 8,
    insuranceMonths: 48,
    ageGroup: 'under-50',
    insuredUnitDays: 180,
    eligibleSeparation: true,
    seekingWork: true,
  };
}

function isStoredNumber(value: unknown): value is number | '' {
  return value === '' || (typeof value === 'number' && Number.isFinite(value));
}

function restoreState(fallback: State): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    if (
      !isStoredNumber(saved.averageDailyWage) ||
      !isStoredNumber(saved.ordinaryDailyWage) ||
      !isStoredNumber(saved.scheduledHoursPerDay) ||
      !isStoredNumber(saved.insuranceMonths) ||
      !isStoredNumber(saved.insuredUnitDays) ||
      (saved.ageGroup !== 'under-50' && saved.ageGroup !== '50-or-disabled') ||
      typeof saved.eligibleSeparation !== 'boolean' ||
      typeof saved.seekingWork !== 'boolean'
    ) {
      return fallback;
    }
    return {
      averageDailyWage: saved.averageDailyWage,
      ordinaryDailyWage: saved.ordinaryDailyWage,
      scheduledHoursPerDay: saved.scheduledHoursPerDay,
      insuranceMonths: saved.insuranceMonths,
      ageGroup: saved.ageGroup,
      insuredUnitDays: saved.insuredUnitDays,
      eligibleSeparation: saved.eligibleSeparation,
      seekingWork: saved.seekingWork,
    };
  } catch {
    return fallback;
  }
}

export default function UnemploymentBenefitKr({ locale, ui }: ToolProps<UI>) {
  const initialState = defaultState();
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    setState(restoreState(initialState));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateUnemploymentBenefit(state), [state]);
  const money = (amount: number) => `${formatNumber(amount, locale)}${ui.won}`;
  const copyText = result
    ? `${ui.total}: ${money(result.estimatedTotal)}\n${ui.dailyBenefit}: ${money(result.dailyBenefit)}\n${ui.benefitDays}: ${formatNumber(result.benefitDays, locale)}${ui.days}`
    : '';

  const appliedRule = result
    ? result.appliedDailyRule === 'floor'
      ? ui.floorApplied
      : result.appliedDailyRule === 'cap'
        ? ui.capApplied
        : ui.wageApplied
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex flex-col gap-5">
          <section aria-labelledby="pay-heading">
            <p id="pay-heading" class="text-sm font-medium text-fg">
              {ui.wageHeading}
            </p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={ui.averageDailyWageLabel} hint={ui.averageDailyWageHint}>
                <NumberInput
                  value={state.averageDailyWage}
                  min="1"
                  max="10000000"
                  step="1000"
                  onValue={(averageDailyWage) => update({ averageDailyWage })}
                />
              </Field>
              <Field label={ui.ordinaryDailyWageLabel} hint={ui.ordinaryDailyWageHint}>
                <NumberInput
                  value={state.ordinaryDailyWage}
                  min="0"
                  max="10000000"
                  step="1000"
                  onValue={(ordinaryDailyWage) => update({ ordinaryDailyWage })}
                />
              </Field>
              <Field label={ui.hoursLabel} hint={ui.hoursHint}>
                <NumberInput
                  value={state.scheduledHoursPerDay}
                  min="1"
                  max="8"
                  step="1"
                  onValue={(scheduledHoursPerDay) => update({ scheduledHoursPerDay })}
                />
              </Field>
            </div>
          </section>

          <section aria-labelledby="coverage-heading">
            <p id="coverage-heading" class="text-sm font-medium text-fg">
              {ui.coverageHeading}
            </p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={ui.insuranceMonthsLabel} hint={ui.insuranceMonthsHint}>
                <NumberInput
                  value={state.insuranceMonths}
                  min="0"
                  max="1200"
                  step="1"
                  onValue={(insuranceMonths) => update({ insuranceMonths })}
                />
              </Field>
              <Field label={ui.insuredDaysLabel} hint={ui.insuredDaysHint}>
                <NumberInput
                  value={state.insuredUnitDays}
                  min="0"
                  max="10000"
                  step="1"
                  onValue={(insuredUnitDays) => update({ insuredUnitDays })}
                />
              </Field>
            </div>
            <div class="mt-3">
              <p class="mb-1.5 text-sm font-medium text-fg">{ui.ageLabel}</p>
              <Segmented
                label={ui.ageLabel}
                value={state.ageGroup}
                onValue={(ageGroup) => update({ ageGroup })}
                options={[
                  { value: 'under-50', label: ui.under50 },
                  { value: '50-or-disabled', label: ui.over50OrDisabled },
                ]}
              />
            </div>
          </section>

          <section aria-labelledby="eligibility-heading">
            <p id="eligibility-heading" class="text-sm font-medium text-fg">
              {ui.eligibilityHeading}
            </p>
            <div class="mt-3 flex flex-col gap-3">
              <Toggle
                checked={state.eligibleSeparation}
                onChecked={(eligibleSeparation) => update({ eligibleSeparation })}
                label={ui.eligibleSeparation}
              />
              <Toggle
                checked={state.seekingWork}
                onChecked={(seekingWork) => update({ seekingWork })}
                label={ui.seekingWork}
              />
            </div>
          </section>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          </div>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div aria-live="polite">
                <Stat label={ui.total} value={money(result.estimatedTotal)} emphasis />
              </div>
              <Notice tone={result.eligibility.likelyEligible ? 'success' : 'info'}>
                {result.eligibility.likelyEligible ? ui.likelyEligible : ui.notLikelyEligible}
              </Notice>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.dailyBenefit} value={money(result.dailyBenefit)} />
                <Stat label={ui.benefitDays} value={`${formatNumber(result.benefitDays, locale)}${ui.days}`} />
                <Stat label={ui.floor} value={money(result.minimumDailyBenefit)} />
                <Stat label={ui.cap} value={money(result.maximumDailyBenefit)} />
              </div>
              <div class="rounded-md border border-line bg-surface-2 p-3 text-xs leading-5 text-muted">
                <p>{result.eligibility.insuredDays ? ui.insuredDaysMet : ui.insuredDaysNotMet}</p>
                <p>{result.eligibility.separation ? ui.separationMet : ui.separationNotMet}</p>
                <p>{result.eligibility.seekingWork ? ui.seekingWorkMet : ui.seekingWorkNotMet}</p>
              </div>
              <div class="rounded-md border border-line bg-surface-2 p-3">
                <p class="text-xs font-medium text-muted">{ui.formulaHeading}</p>
                <p class="mt-1 font-mono text-xs leading-5 text-fg">
                  {ui.dailyFormula
                    .replace('{base}', money(result.applicableDailyBase))
                    .replace('{rate}', money(result.dailyWageBenefit))
                    .replace('{floor}', money(result.minimumDailyBenefit))
                    .replace('{cap}', money(result.maximumDailyBenefit))}
                </p>
                <p class="mt-1 font-mono text-xs leading-5 text-fg">
                  {ui.totalFormula
                    .replace('{daily}', money(result.dailyBenefit))
                    .replace('{days}', formatNumber(result.benefitDays, locale))
                    .replace('{total}', money(result.estimatedTotal))}
                </p>
                <p class="mt-2 text-xs text-muted">{appliedRule}</p>
              </div>
              <Button size="sm" variant="ghost" class="self-start" onClick={() => setState(defaultState())}>
                {ui.reset}
              </Button>
            </>
          )}
          <Notice tone="info">{ui.estimateNotice}</Notice>
        </div>
      </div>
    </Panel>
  );
}
