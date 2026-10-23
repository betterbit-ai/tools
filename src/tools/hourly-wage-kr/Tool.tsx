import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { HOURLY_WAGE_RULES_2026, calculateHourlyWage, type DeductionMode, type HolidayPayReason } from './logic';

const STORAGE_KEY = 'tools:hourly-wage-kr:state';
type InputNumber = number | '';

interface State {
  hourlyWage: InputNumber;
  hoursPerDay: InputNumber;
  daysPerWeek: InputNumber;
  attendedAllScheduledDays: boolean;
  employedThroughWeekEnd: boolean;
  deductionMode: DeductionMode;
}

const fallbackState: State = {
  hourlyWage: HOURLY_WAGE_RULES_2026.minimumHourlyWage,
  hoursPerDay: 8,
  daysPerWeek: 5,
  attendedAllScheduledDays: true,
  employedThroughWeekEnd: true,
  deductionMode: 'none',
};

function isInputNumber(value: unknown): value is InputNumber {
  return value === '' || (typeof value === 'number' && Number.isFinite(value));
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallbackState;
    return {
      hourlyWage: isInputNumber(saved.hourlyWage) ? saved.hourlyWage : fallbackState.hourlyWage,
      hoursPerDay: isInputNumber(saved.hoursPerDay) ? saved.hoursPerDay : fallbackState.hoursPerDay,
      daysPerWeek: isInputNumber(saved.daysPerWeek) ? saved.daysPerWeek : fallbackState.daysPerWeek,
      attendedAllScheduledDays:
        typeof saved.attendedAllScheduledDays === 'boolean'
          ? saved.attendedAllScheduledDays
          : fallbackState.attendedAllScheduledDays,
      employedThroughWeekEnd:
        typeof saved.employedThroughWeekEnd === 'boolean'
          ? saved.employedThroughWeekEnd
          : fallbackState.employedThroughWeekEnd,
      deductionMode:
        saved.deductionMode === 'none' || saved.deductionMode === 'business-3.3'
          ? saved.deductionMode
          : fallbackState.deductionMode,
    };
  } catch {
    return fallbackState;
  }
}

export default function HourlyWageKr({ locale, ui }: ToolProps<UI>) {
  const [state, setState] = useState<State>(fallbackState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateHourlyWage(state), [state]);
  const money = (value: number) => `${formatNumber(Math.round(value), locale)}${locale === 'ko' ? '' : ' '}${ui.won}`;
  const hours = (value: number) => `${formatNumber(value, locale, 2)} ${ui.hoursUnit}`;
  const reasonText: Record<HolidayPayReason, string> = {
    'under-15-hours': ui.reasonUnder15,
    absence: ui.reasonAbsence,
    'employment-ended-before-week-end': ui.reasonEmploymentEnded,
  };

  const copyText = result
    ? [
        `${ui.hourlyWageLabel}: ${money(result.hourlyWage)}`,
        `${ui.dailyPay}: ${money(result.dailyPay)}`,
        `${ui.weeklyBasePay}: ${money(result.weeklyBasePay)}`,
        `${ui.weeklyHolidayPay}: ${money(result.weeklyHolidayPay)}`,
        `${ui.monthlyWithHoliday}: ${money(result.monthlyPayWithHoliday)}`,
        `${ui.monthlyWithoutHoliday}: ${money(result.monthlyPayWithoutHoliday)}`,
        `${ui.annualPay}: ${money(result.annualPayWithHoliday)}`,
        `${ui.eligibilityHeading}: ${
          result.holidayPayEligible
            ? `${ui.eligible}: ${ui.eligibleExplanation}`
            : `${ui.notEligible}: ${result.holidayPayReasons.map((reason) => reasonText[reason]).join(' ')}`
        }`,
        ...(result.deductionMode === 'business-3.3'
          ? [
              `${ui.businessIncomeTax}: ${money(result.estimatedBusinessIncomeTax)}`,
              `${ui.localIncomeTax}: ${money(result.estimatedLocalIncomeTax)}`,
              `${ui.businessWithholding}: ${money(result.estimatedBusinessWithholding)}`,
              `${ui.estimatedReceipt}: ${money(result.estimatedAfterDeduction)}`,
            ]
          : []),
      ].join('\n')
    : '';

  const reset = () => {
    safeStorage.remove(STORAGE_KEY);
    setState(fallbackState);
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <p class="mb-5 text-sm leading-6 text-muted">{ui.intro}</p>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field label={ui.hourlyWageLabel} hint={ui.hourlyWageHint} class="sm:col-span-2">
              <div class="flex flex-wrap gap-2">
                <NumberInput
                  aria-label={ui.hourlyWageLabel}
                  value={state.hourlyWage}
                  onValue={(hourlyWage) => update({ hourlyWage })}
                  min="1"
                  max={HOURLY_WAGE_RULES_2026.maximumHourlyWageInput}
                  step="10"
                  class="min-w-0 flex-1"
                />
                <Button size="sm" onClick={() => update({ hourlyWage: HOURLY_WAGE_RULES_2026.minimumHourlyWage })}>
                  {ui.useMinimumWage}
                </Button>
              </div>
            </Field>

            <Field label={ui.hoursPerDayLabel} hint={ui.hoursPerDayHint}>
              <NumberInput
                aria-label={ui.hoursPerDayLabel}
                value={state.hoursPerDay}
                onValue={(hoursPerDay) => update({ hoursPerDay })}
                min="0.25"
                max={HOURLY_WAGE_RULES_2026.maximumDailyHours}
                step="0.25"
              />
            </Field>

            <Field label={ui.daysPerWeekLabel} hint={ui.daysPerWeekHint}>
              <NumberInput
                aria-label={ui.daysPerWeekLabel}
                value={state.daysPerWeek}
                onValue={(daysPerWeek) => update({ daysPerWeek })}
                min="1"
                max={HOURLY_WAGE_RULES_2026.maximumDaysPerWeek}
                step="1"
              />
            </Field>
          </div>

          <div class="mt-6 border-t border-line pt-5">
            <h2 class="text-sm font-medium text-fg">{ui.conditionsHeading}</h2>
            <p class="mt-1 text-xs text-subtle">{ui.conditionsHint}</p>
            <div class="mt-3 grid gap-3">
              <Toggle
                checked={state.attendedAllScheduledDays}
                onChecked={(attendedAllScheduledDays) => update({ attendedAllScheduledDays })}
                label={ui.attendedLabel}
              />
              <Toggle
                checked={state.employedThroughWeekEnd}
                onChecked={(employedThroughWeekEnd) => update({ employedThroughWeekEnd })}
                label={ui.employedLabel}
              />
            </div>
          </div>

          <div class="mt-6 border-t border-line pt-5">
            <div>
              <span class="mb-1.5 block text-sm font-medium text-fg">{ui.deductionLabel}</span>
              <Segmented<DeductionMode>
                value={state.deductionMode}
                onValue={(deductionMode) => update({ deductionMode })}
                label={ui.deductionLabel}
                options={[
                  { value: 'none', label: ui.deductionNone },
                  { value: 'business-3.3', label: ui.deductionBusiness },
                ]}
              />
              <span class="mt-1 block text-xs text-subtle">{ui.deductionHint}</span>
            </div>
          </div>
        </div>

        <div aria-live="polite">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h2 class="text-sm font-medium text-fg">{ui.resultsHeading}</h2>
            <CopyButton text={copyText} label={ui.copyResult} copiedLabel={ui.copiedResult} />
          </div>

          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <div class="grid gap-3">
              <Stat label={ui.monthlyWithHoliday} value={money(result.monthlyPayWithHoliday)} emphasis />
              <div class="grid grid-cols-2 gap-2">
                <Stat label={ui.monthlyWithoutHoliday} value={money(result.monthlyPayWithoutHoliday)} />
                <Stat label={ui.annualPay} value={money(result.annualPayWithHoliday)} />
                <Stat label={ui.dailyPay} value={money(result.dailyPay)} />
                <Stat label={ui.weeklyTotalPay} value={money(result.weeklyPayWithHoliday)} />
              </div>

              {result.deductionMode === 'business-3.3' && (
                <div class="grid gap-2">
                  <Notice>{ui.businessNotice}</Notice>
                  <div class="grid grid-cols-2 gap-2">
                    <Stat label={ui.businessIncomeTax} value={money(result.estimatedBusinessIncomeTax)} />
                    <Stat label={ui.localIncomeTax} value={money(result.estimatedLocalIncomeTax)} />
                    <Stat label={ui.businessWithholding} value={money(result.estimatedBusinessWithholding)} />
                    <Stat label={ui.estimatedReceipt} value={money(result.estimatedAfterDeduction)} />
                  </div>
                </div>
              )}

              <Notice tone={result.minimumWageStatus === 'below' ? 'danger' : 'success'}>
                {result.minimumWageStatus === 'equal'
                  ? ui.minimumWageEqual
                  : `${result.minimumWageStatus === 'above' ? ui.minimumWageAbove : ui.minimumWageBelow} ${money(
                      Math.abs(result.minimumWageDifference),
                    )}.`}
              </Notice>

              <div class="border-t border-line pt-4">
                <h3 class="text-sm font-medium text-fg">{ui.eligibilityHeading}</h3>
                <div class="mt-2">
                  <Notice tone={result.holidayPayEligible ? 'success' : 'info'}>
                    {result.holidayPayEligible
                      ? `${ui.eligible}: ${ui.eligibleExplanation}`
                      : `${ui.notEligible}: ${result.holidayPayReasons.map((reason) => reasonText[reason]).join(' ')}`}
                  </Notice>
                </div>
                <dl class="mt-3 grid gap-2 text-sm">
                  <div class="flex items-center justify-between gap-3">
                    <dt class="text-muted">{ui.weeklyHours}</dt>
                    <dd class="tabular font-medium text-fg">{hours(result.weeklyHours)}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <dt class="text-muted">{ui.holidayHoursFormula}</dt>
                    <dd class="tabular text-right font-medium text-fg">
                      {hours(result.weeklyHours)} ÷ {HOURLY_WAGE_RULES_2026.standardWeeklyHours} ×{' '}
                      {HOURLY_WAGE_RULES_2026.maximumHolidayHours} = {hours(result.potentialHolidayHours)}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <dt class="text-muted">{ui.weeklyBasePay}</dt>
                    <dd class="tabular font-medium text-fg">{money(result.weeklyBasePay)}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <dt class="text-muted">{ui.weeklyHolidayPay}</dt>
                    <dd class="tabular font-medium text-fg">{money(result.weeklyHolidayPay)}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <dt class="text-muted">{ui.monthlyHoursFormula}</dt>
                    <dd class="tabular font-medium text-fg">{hours(result.monthlyPaidHours)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          <div class="mt-4 flex justify-end">
            <Button size="sm" variant="ghost" onClick={reset}>
              {ui.reset}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
