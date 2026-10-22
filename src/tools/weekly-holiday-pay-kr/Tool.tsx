import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  WEEKLY_HOLIDAY_PAY_RULES_2026,
  calculateWeeklyHolidayPay,
  type EligibilityReason,
  type HolidayHoursMethod,
} from './logic';

const STORAGE_KEY = 'tools:weekly-holiday-pay-kr:state';
type WeekCount = '1' | '2' | '3' | '4';
type InputNumber = number | '';

interface State {
  hourlyWage: InputNumber;
  dailyHours: InputNumber[];
  previousWeeklyHours: InputNumber[];
  weeksInAverage: WeekCount;
  regularSchedule: boolean;
  holidayHoursMethod: HolidayHoursMethod;
  ordinaryWorkerDaysPerWeek: InputNumber;
  normalWorkdayHours: InputNumber;
  attendedAllScheduledDays: boolean;
  employedThroughWeekEnd: boolean;
}

const fallbackState: State = {
  hourlyWage: WEEKLY_HOLIDAY_PAY_RULES_2026.minimumHourlyWage,
  dailyHours: [4, 4, 4, 4, 4, 0, 0],
  previousWeeklyHours: [20, 20, 20],
  weeksInAverage: '4',
  regularSchedule: true,
  holidayHoursMethod: 'part-time',
  ordinaryWorkerDaysPerWeek: WEEKLY_HOLIDAY_PAY_RULES_2026.defaultOrdinaryWorkerDaysPerWeek,
  normalWorkdayHours: WEEKLY_HOLIDAY_PAY_RULES_2026.maximumHolidayHours,
  attendedAllScheduledDays: true,
  employedThroughWeekEnd: true,
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
      dailyHours:
        Array.isArray(saved.dailyHours) && saved.dailyHours.length === 7 && saved.dailyHours.every(isInputNumber)
          ? saved.dailyHours
          : fallbackState.dailyHours,
      previousWeeklyHours:
        Array.isArray(saved.previousWeeklyHours) &&
        saved.previousWeeklyHours.length === 3 &&
        saved.previousWeeklyHours.every(isInputNumber)
          ? saved.previousWeeklyHours
          : fallbackState.previousWeeklyHours,
      weeksInAverage: ['1', '2', '3', '4'].includes(saved.weeksInAverage)
        ? saved.weeksInAverage
        : fallbackState.weeksInAverage,
      regularSchedule:
        typeof saved.regularSchedule === 'boolean' ? saved.regularSchedule : fallbackState.regularSchedule,
      holidayHoursMethod:
        saved.holidayHoursMethod === 'part-time' || saved.holidayHoursMethod === 'regular'
          ? saved.holidayHoursMethod
          : fallbackState.holidayHoursMethod,
      ordinaryWorkerDaysPerWeek: isInputNumber(saved.ordinaryWorkerDaysPerWeek)
        ? saved.ordinaryWorkerDaysPerWeek
        : fallbackState.ordinaryWorkerDaysPerWeek,
      normalWorkdayHours: isInputNumber(saved.normalWorkdayHours)
        ? saved.normalWorkdayHours
        : fallbackState.normalWorkdayHours,
      attendedAllScheduledDays:
        typeof saved.attendedAllScheduledDays === 'boolean'
          ? saved.attendedAllScheduledDays
          : fallbackState.attendedAllScheduledDays,
      employedThroughWeekEnd:
        typeof saved.employedThroughWeekEnd === 'boolean'
          ? saved.employedThroughWeekEnd
          : fallbackState.employedThroughWeekEnd,
    };
  } catch {
    return fallbackState;
  }
}

export default function WeeklyHolidayPayKr({ locale, ui }: ToolProps<UI>) {
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
  const updateDailyHours = (index: number, value: InputNumber) => {
    const dailyHours = [...state.dailyHours];
    dailyHours[index] = value;
    update({ dailyHours });
  };
  const updatePreviousHours = (index: number, value: InputNumber) => {
    const previousWeeklyHours = [...state.previousWeeklyHours];
    previousWeeklyHours[index] = value;
    update({ previousWeeklyHours });
  };

  const weeksInAverage = Number(state.weeksInAverage);
  const currentHours = state.dailyHours.reduce<number>(
    (sum, value) => sum + (typeof value === 'number' ? value : 0),
    0,
  );
  const previousWeeklyHours = state.regularSchedule
    ? Array.from({ length: weeksInAverage - 1 }, () => currentHours)
    : state.previousWeeklyHours.slice(0, weeksInAverage - 1);
  const result = useMemo(
    () =>
      calculateWeeklyHolidayPay({
        hourlyWage: state.hourlyWage,
        dailyHours: state.dailyHours,
        previousWeeklyHours,
        weeksInAverage,
        holidayHoursMethod: state.holidayHoursMethod,
        ordinaryWorkerDaysPerWeek: state.ordinaryWorkerDaysPerWeek,
        normalWorkdayHours: state.normalWorkdayHours,
        attendedAllScheduledDays: state.attendedAllScheduledDays,
        employedThroughWeekEnd: state.employedThroughWeekEnd,
      }),
    [state, weeksInAverage, currentHours],
  );

  const money = (value: number) => `${formatNumber(Math.round(value), locale)}${ui.won}`;
  const hours = (value: number) => `${formatNumber(value, locale, 2)}${ui.hoursUnit}`;
  const reasonText: Record<EligibilityReason, string> = {
    'under-15-hours': ui.reasonUnder15,
    absence: ui.reasonAbsence,
    'employment-ended-before-week-end': ui.reasonEmploymentEnded,
  };
  const summary = result
    ? [
        `${ui.eligibilityLabel}: ${result.eligible ? ui.eligible : ui.notEligible}`,
        `${ui.weeklyHolidayPay}: ${money(result.weeklyHolidayPay)}`,
        `${ui.weeklyTotalPay}: ${money(result.weeklyTotalPay)}`,
        `${ui.monthlyEstimate}: ${money(result.monthlyTotalPay)}`,
      ].join('\n')
    : '';
  const dayLabels = [ui.monday, ui.tuesday, ui.wednesday, ui.thursday, ui.friday, ui.saturday, ui.sunday];
  const previousWeekLabels = [ui.previousWeek1, ui.previousWeek2, ui.previousWeek3];

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]">
        <div class="flex flex-col gap-5">
          <Field label={ui.hourlyWageLabel} hint={ui.hourlyWageHint}>
            <NumberInput
              aria-label={ui.hourlyWageLabel}
              value={state.hourlyWage}
              min="1"
              max={String(WEEKLY_HOLIDAY_PAY_RULES_2026.maximumHourlyWageInput)}
              step="10"
              onValue={(hourlyWage) => update({ hourlyWage })}
            />
          </Field>

          <div>
            <div class="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p class="text-sm font-medium text-fg">{ui.dailyHoursLabel}</p>
                <p class="mt-1 text-xs text-subtle">{ui.dailyHoursHint}</p>
              </div>
              <span class="text-sm tabular text-muted">
                {ui.currentWeekTotal}: {hours(currentHours)}
              </span>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {dayLabels.map((label, index) => (
                <Field label={label}>
                  <NumberInput
                    aria-label={`${label} ${ui.hoursInputLabel}`}
                    value={state.dailyHours[index]}
                    min="0"
                    max={String(WEEKLY_HOLIDAY_PAY_RULES_2026.maximumDailyInputHours)}
                    step="0.5"
                    onValue={(value) => updateDailyHours(index, value)}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.reviewWeeksLabel}</p>
            <Segmented<WeekCount>
              label={ui.reviewWeeksLabel}
              value={state.weeksInAverage}
              onValue={(weeksInAverage) => update({ weeksInAverage })}
              options={[
                { value: '1', label: ui.oneWeek },
                { value: '2', label: ui.twoWeeks },
                { value: '3', label: ui.threeWeeks },
                { value: '4', label: ui.fourWeeks },
              ]}
            />
            <p class="mt-1 text-xs text-subtle">{ui.reviewWeeksHint}</p>
          </div>

          {weeksInAverage > 1 && (
            <div class="rounded-md border border-line bg-surface-2 p-3">
              <Toggle
                checked={state.regularSchedule}
                onChecked={(regularSchedule) => update({ regularSchedule })}
                label={ui.regularScheduleLabel}
              />
              <p class="mt-1 text-xs text-subtle">{ui.regularScheduleHint}</p>
              {!state.regularSchedule && (
                <div class="mt-3 grid gap-3 sm:grid-cols-3">
                  {previousWeekLabels.slice(0, weeksInAverage - 1).map((label, index) => (
                    <Field label={label} hint={ui.previousWeekHint}>
                      <NumberInput
                        aria-label={label}
                        value={state.previousWeeklyHours[index]}
                        min="0"
                        max={String(WEEKLY_HOLIDAY_PAY_RULES_2026.maximumWeeklyInputHours)}
                        step="0.5"
                        onValue={(value) => updatePreviousHours(index, value)}
                      />
                    </Field>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.workerTypeLabel}</p>
            <Segmented<HolidayHoursMethod>
              label={ui.workerTypeLabel}
              value={state.holidayHoursMethod}
              onValue={(holidayHoursMethod) => update({ holidayHoursMethod })}
              options={[
                { value: 'part-time', label: ui.partTimeWorker },
                { value: 'regular', label: ui.regularWorker },
              ]}
            />
            <p class="mt-1 text-xs text-subtle">{ui.workerTypeHint}</p>
          </div>

          {state.holidayHoursMethod === 'part-time' ? (
            <Field label={ui.ordinaryWorkerDaysLabel} hint={ui.ordinaryWorkerDaysHint}>
              <NumberInput
                aria-label={ui.ordinaryWorkerDaysLabel}
                value={state.ordinaryWorkerDaysPerWeek}
                min="1"
                max="7"
                step="1"
                onValue={(ordinaryWorkerDaysPerWeek) => update({ ordinaryWorkerDaysPerWeek })}
              />
            </Field>
          ) : (
            <Field label={ui.normalWorkdayHoursLabel} hint={ui.normalWorkdayHoursHint}>
              <NumberInput
                aria-label={ui.normalWorkdayHoursLabel}
                value={state.normalWorkdayHours}
                min="0.5"
                max={String(WEEKLY_HOLIDAY_PAY_RULES_2026.maximumHolidayHours)}
                step="0.5"
                onValue={(normalWorkdayHours) => update({ normalWorkdayHours })}
              />
            </Field>
          )}

          <div class="flex flex-col gap-3 rounded-md border border-line p-3">
            <Toggle
              checked={state.attendedAllScheduledDays}
              onChecked={(attendedAllScheduledDays) => update({ attendedAllScheduledDays })}
              label={ui.attendanceLabel}
            />
            <Toggle
              checked={state.employedThroughWeekEnd}
              onChecked={(employedThroughWeekEnd) => update({ employedThroughWeekEnd })}
              label={ui.employmentLabel}
            />
            <p class="text-xs text-subtle">{ui.attendanceHint}</p>
          </div>
        </div>

        <div class="flex flex-col gap-3" aria-live="polite">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <CopyButton text={summary} label={ui.copyResult} copiedLabel={ui.copiedResult} />
          </div>

          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <Notice tone={result.eligible ? 'success' : 'danger'}>
                {result.eligible
                  ? ui.eligibleExplanation
                  : result.reasons.map((reason) => reasonText[reason]).join(' ')}
              </Notice>

              <div class="grid grid-cols-2 gap-2">
                <Stat label={ui.weeklyHolidayPay} value={money(result.weeklyHolidayPay)} emphasis />
                <Stat label={ui.holidayHours} value={hours(result.holidayHours)} />
                <Stat label={ui.weeklyTotalPay} value={money(result.weeklyTotalPay)} />
                <Stat label={ui.monthlyEstimate} value={money(result.monthlyTotalPay)} />
              </div>

              <Notice tone={result.minimumWageStatus === 'below' ? 'danger' : 'success'}>
                {result.minimumWageStatus === 'below'
                  ? `${ui.minimumWageBelow} ${money(Math.abs(result.minimumWageDifference))}`
                  : result.minimumWageStatus === 'equal'
                    ? ui.minimumWageEqual
                    : `${ui.minimumWageAbove} ${money(result.minimumWageDifference)}`}
              </Notice>

              <div class="rounded-md border border-line">
                <p class="border-b border-line bg-surface-2 px-3 py-2 text-sm font-medium text-fg">{ui.whyHeading}</p>
                <dl class="divide-y divide-line text-sm">
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <dt class="text-muted">{ui.averageWeeklyHours}</dt>
                    <dd class="text-right tabular text-fg">{hours(result.averageWeeklyHours)}</dd>
                  </div>
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <dt class="text-muted">{ui.fifteenHourCheck}</dt>
                    <dd
                      class={
                        result.averageWeeklyHours >= WEEKLY_HOLIDAY_PAY_RULES_2026.minimumAverageWeeklyHours
                          ? 'text-success'
                          : 'text-danger'
                      }
                    >
                      {result.averageWeeklyHours >= WEEKLY_HOLIDAY_PAY_RULES_2026.minimumAverageWeeklyHours
                        ? ui.met
                        : ui.notMet}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <dt class="text-muted">{ui.attendanceCheck}</dt>
                    <dd class={state.attendedAllScheduledDays ? 'text-success' : 'text-danger'}>
                      {state.attendedAllScheduledDays ? ui.met : ui.notMet}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <dt class="text-muted">{ui.employmentCheck}</dt>
                    <dd class={state.employedThroughWeekEnd ? 'text-success' : 'text-danger'}>
                      {state.employedThroughWeekEnd ? ui.met : ui.notMet}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <dt class="text-muted">{ui.holidayHoursFormula}</dt>
                    <dd class="text-right tabular text-fg">
                      {result.holidayHoursMethod === 'part-time'
                        ? `${hours(result.averageWeeklyHours)} ÷ ${result.ordinaryWorkerDaysPerWeek} = ${hours(result.potentialHolidayHours)}`
                        : `${hours(result.normalWorkdayHours)} = ${hours(result.potentialHolidayHours)}`}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <dt class="text-muted">{ui.weeklyBasePay}</dt>
                    <dd class="text-right tabular text-fg">{money(result.weeklyBasePay)}</dd>
                  </div>
                  <div class="flex items-start justify-between gap-3 px-3 py-2">
                    <dt class="text-muted">{ui.monthlyHolidayPay}</dt>
                    <dd class="text-right tabular text-fg">{money(result.monthlyHolidayPay)}</dd>
                  </div>
                </dl>
              </div>
              <p class="text-xs leading-5 text-subtle">{ui.monthlyEstimateHint}</p>
            </>
          )}
        </div>
      </div>

      <div class="mt-5 flex justify-end border-t border-line pt-4">
        <Button variant="ghost" size="sm" onClick={() => setState(fallbackState)}>
          {ui.reset}
        </Button>
      </div>
    </Panel>
  );
}
