import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Stat, TextInput, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { ANNUAL_LEAVE_RULES, calculateAnnualLeave, type AccrualReason, type PayReason } from './logic';

const STORAGE_KEY = 'tools:annual-leave-kr:state';
type InputNumber = number | '';

interface State {
  hireDate: string;
  asOfDate: string;
  workplaceAtLeastFive: boolean;
  weeklyHours: InputNumber;
  attendanceAtLeast80: boolean;
  fullyAttendedMonths: InputNumber;
  endingEmployment: boolean;
  unusedLeaveDays: InputNumber;
  monthlyOrdinaryWage: InputNumber;
  monthlyOrdinaryHours: InputNumber;
  dailyWorkHours: InputNumber;
}

function shiftYears(iso: string, years: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year + years, month, 0)).getUTCDate();
  return `${year + years}-${String(month).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

function defaultState(today: string): State {
  return {
    hireDate: shiftYears(today, -3),
    asOfDate: today,
    workplaceAtLeastFive: true,
    weeklyHours: ANNUAL_LEAVE_RULES.standardWeeklyHours,
    attendanceAtLeast80: true,
    fullyAttendedMonths: 12,
    endingEmployment: false,
    unusedLeaveDays: 5,
    monthlyOrdinaryWage: 3_000_000,
    monthlyOrdinaryHours: ANNUAL_LEAVE_RULES.commonMonthlyOrdinaryHours,
    dailyWorkHours: ANNUAL_LEAVE_RULES.standardDayHours,
  };
}

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isInputNumber(value: unknown): value is InputNumber {
  return value === '' || (typeof value === 'number' && Number.isFinite(value));
}

function restoreState(defaults: State): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return defaults;
    return {
      hireDate: typeof saved.hireDate === 'string' ? saved.hireDate : defaults.hireDate,
      asOfDate: typeof saved.asOfDate === 'string' ? saved.asOfDate : defaults.asOfDate,
      workplaceAtLeastFive:
        typeof saved.workplaceAtLeastFive === 'boolean' ? saved.workplaceAtLeastFive : defaults.workplaceAtLeastFive,
      weeklyHours: isInputNumber(saved.weeklyHours) ? saved.weeklyHours : defaults.weeklyHours,
      attendanceAtLeast80:
        typeof saved.attendanceAtLeast80 === 'boolean' ? saved.attendanceAtLeast80 : defaults.attendanceAtLeast80,
      fullyAttendedMonths: isInputNumber(saved.fullyAttendedMonths)
        ? saved.fullyAttendedMonths
        : defaults.fullyAttendedMonths,
      endingEmployment:
        typeof saved.endingEmployment === 'boolean' ? saved.endingEmployment : defaults.endingEmployment,
      unusedLeaveDays: isInputNumber(saved.unusedLeaveDays) ? saved.unusedLeaveDays : defaults.unusedLeaveDays,
      monthlyOrdinaryWage: isInputNumber(saved.monthlyOrdinaryWage)
        ? saved.monthlyOrdinaryWage
        : defaults.monthlyOrdinaryWage,
      monthlyOrdinaryHours: isInputNumber(saved.monthlyOrdinaryHours)
        ? saved.monthlyOrdinaryHours
        : defaults.monthlyOrdinaryHours,
      dailyWorkHours: isInputNumber(saved.dailyWorkHours) ? saved.dailyWorkHours : defaults.dailyWorkHours,
    };
  } catch {
    return defaults;
  }
}

export default function AnnualLeaveKr({ locale, ui }: ToolProps<UI>) {
  const [state, setState] = useState<State>(() => defaultState('2026-10-22'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(restoreState(defaultState(todayIso())));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateAnnualLeave(state), [state]);
  const n = (value: number, digits = 0) => formatNumber(value, locale, digits);
  const days = (value: number) => `${n(value, 2)}${ui.daysUnit}`;
  const hours = (value: number) => `${n(value, 2)}${ui.hoursUnit}`;
  const money = (value: number, digits = 0) => `${n(value, digits)}${ui.wonUnit}`;
  const formatDate = (iso: string | null) => {
    if (!iso) return ui.notYet;
    const [year, month, day] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  };

  const accrualText: Record<AccrualReason, string> = {
    'first-year-monthly': ui.reasonFirstYear,
    'annual-80-percent': ui.reasonAnnual,
    'monthly-below-80-percent': ui.reasonBelowAttendance,
  };
  const payText: Record<PayReason, string> = {
    calculated: ui.payReasonCalculated,
    'not-statutory-eligible': ui.payReasonIneligible,
    'no-unused-days': ui.payReasonNoDays,
    'no-wage': ui.payReasonNoWage,
  };
  const eligibilityText = result
    ? result.eligibilityReason === 'under-five-employees'
      ? ui.reasonUnderFive
      : result.eligibilityReason === 'under-fifteen-hours'
        ? ui.reasonUnderFifteen
        : ui.reasonEligible
    : '';

  const summary = result
    ? [
        `${ui.hireDateResult}: ${days(result.hireDateCurrentDays)}`,
        `${ui.fiscalYearResult}: ${result.fiscalCurrentDays === null ? ui.needsRecords : days(result.fiscalCurrentDays)}`,
        `${ui.estimatedPay}: ${money(result.estimatedUnusedLeavePay)}`,
        state.endingEmployment && result.terminationShortfallDays !== null
          ? `${ui.terminationShortfall}: ${days(result.terminationShortfallDays)}`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const payFormula = result
    ? ui.payFormula
        .replace('{wage}', money(state.monthlyOrdinaryWage || 0))
        .replace('{monthlyHours}', n(state.monthlyOrdinaryHours || 0, 2))
        .replace('{dayHours}', n(state.dailyWorkHours || 0, 2))
        .replace('{days}', n(result.payableUnusedDays, 2))
        .replace('{pay}', money(result.grossLeaveValue))
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(19rem,0.95fr)]">
        <div class="flex flex-col gap-5">
          <section aria-labelledby="employment-heading">
            <p id="employment-heading" class="text-sm font-medium text-fg">
              {ui.employmentHeading}
            </p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={ui.hireDateLabel}>
                <TextInput
                  aria-label={ui.hireDateLabel}
                  type="date"
                  value={state.hireDate}
                  onInput={(event) => update({ hireDate: event.currentTarget.value })}
                />
              </Field>
              <Field label={ui.asOfDateLabel} hint={state.endingEmployment ? ui.lastWorkingDateHint : ui.asOfDateHint}>
                <TextInput
                  aria-label={ui.asOfDateLabel}
                  type="date"
                  value={state.asOfDate}
                  onInput={(event) => update({ asOfDate: event.currentTarget.value })}
                />
              </Field>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => update({ asOfDate: todayIso() })}>
                {ui.useToday}
              </Button>
            </div>
            <div class="mt-4 flex flex-col gap-3 rounded-md border border-line bg-surface-2 p-3">
              <Toggle
                checked={state.endingEmployment}
                onChecked={(endingEmployment) => update({ endingEmployment })}
                label={ui.endingEmploymentLabel}
              />
              <Toggle
                checked={state.workplaceAtLeastFive}
                onChecked={(workplaceAtLeastFive) => update({ workplaceAtLeastFive })}
                label={ui.workplaceSizeLabel}
              />
              <Field label={ui.weeklyHoursLabel} hint={ui.weeklyHoursHint}>
                <NumberInput
                  aria-label={ui.weeklyHoursLabel}
                  value={state.weeklyHours}
                  min="0"
                  max="168"
                  step="0.5"
                  onValue={(weeklyHours) => update({ weeklyHours })}
                />
              </Field>
            </div>
          </section>

          <section aria-labelledby="attendance-heading">
            <p id="attendance-heading" class="text-sm font-medium text-fg">
              {ui.attendanceHeading}
            </p>
            <div class="mt-3 rounded-md border border-line p-3">
              <Toggle
                checked={state.attendanceAtLeast80}
                onChecked={(attendanceAtLeast80) => update({ attendanceAtLeast80 })}
                label={ui.attendanceLabel}
              />
              <p class="mt-1 text-xs text-subtle">{ui.attendanceHint}</p>
              {!state.attendanceAtLeast80 && (
                <div class="mt-3 max-w-80">
                  <Field label={ui.fullyAttendedMonthsLabel} hint={ui.fullyAttendedMonthsHint}>
                    <NumberInput
                      aria-label={ui.fullyAttendedMonthsLabel}
                      value={state.fullyAttendedMonths}
                      min="0"
                      max="12"
                      step="1"
                      onValue={(fullyAttendedMonths) => update({ fullyAttendedMonths })}
                    />
                  </Field>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="pay-heading">
            <p id="pay-heading" class="text-sm font-medium text-fg">
              {ui.payHeading}
            </p>
            <p class="mt-1 text-xs text-subtle">{ui.payHint}</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={ui.unusedDaysLabel} hint={ui.unusedDaysHint}>
                <NumberInput
                  aria-label={ui.unusedDaysLabel}
                  value={state.unusedLeaveDays}
                  min="0"
                  max="10000"
                  step="0.5"
                  onValue={(unusedLeaveDays) => update({ unusedLeaveDays })}
                />
              </Field>
              <Field label={ui.monthlyWageLabel} hint={ui.monthlyWageHint}>
                <NumberInput
                  aria-label={ui.monthlyWageLabel}
                  value={state.monthlyOrdinaryWage}
                  min="0"
                  max="1000000000000000"
                  step="10000"
                  onValue={(monthlyOrdinaryWage) => update({ monthlyOrdinaryWage })}
                />
              </Field>
              <Field label={ui.monthlyHoursLabel} hint={ui.monthlyHoursHint}>
                <NumberInput
                  aria-label={ui.monthlyHoursLabel}
                  value={state.monthlyOrdinaryHours}
                  min="0.01"
                  max="744"
                  step="0.01"
                  onValue={(monthlyOrdinaryHours) => update({ monthlyOrdinaryHours })}
                />
              </Field>
              <Field label={ui.dailyHoursLabel} hint={ui.dailyHoursHint}>
                <NumberInput
                  aria-label={ui.dailyHoursLabel}
                  value={state.dailyWorkHours}
                  min="0.01"
                  max="24"
                  step="0.5"
                  onValue={(dailyWorkHours) => update({ dailyWorkHours })}
                />
              </Field>
            </div>
          </section>
        </div>

        <div class="flex flex-col gap-3" aria-live="polite">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
              <p class="mt-0.5 text-xs text-subtle">{ui.rulesChecked}</p>
            </div>
            <CopyButton text={summary} label={ui.copyResult} copiedLabel={ui.copiedResult} />
          </div>

          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <Notice tone={result.statutoryEligible ? 'success' : 'danger'}>{eligibilityText}</Notice>

              <div class="grid grid-cols-2 gap-2">
                <Stat label={ui.hireDateResult} value={days(result.hireDateCurrentDays)} emphasis />
                <Stat
                  label={ui.fiscalYearResult}
                  value={result.fiscalCurrentDays === null ? ui.needsRecords : days(result.fiscalCurrentDays)}
                />
                <Stat label={ui.estimatedPay} value={money(result.estimatedUnusedLeavePay)} emphasis />
                {state.endingEmployment ? (
                  <Stat
                    label={ui.terminationShortfall}
                    value={
                      result.terminationShortfallDays === null ? ui.needsRecords : days(result.terminationShortfallDays)
                    }
                  />
                ) : (
                  <Stat
                    label={ui.nextAccrual}
                    value={
                      !result.statutoryEligible
                        ? ui.notApplicable
                        : result.nextAccrualDays === null
                          ? ui.attendanceConditional
                          : formatDate(result.nextAccrualDate)
                    }
                  />
                )}
              </div>

              {result.partTime && result.statutoryEligible && result.fiscalCurrentHours !== null && (
                <Notice tone="info">
                  {ui.partTimeResult
                    .replace('{hireHours}', hours(result.hireDateCurrentHours))
                    .replace('{fiscalHours}', hours(result.fiscalCurrentHours))}
                </Notice>
              )}

              <div class="rounded-md border border-line bg-surface-2 p-3">
                <p class="text-xs font-medium text-muted">{ui.whyHeading}</p>
                <div class="mt-2 space-y-1 text-xs leading-5 text-muted">
                  <p class="text-fg">
                    {result.statutoryEligible ? accrualText[result.accrualReason] : eligibilityText}
                  </p>
                  <p>
                    {ui.servicePeriod}:{' '}
                    <span class="tabular text-fg">
                      {n(result.serviceDays)} {ui.calendarDaysUnit}
                    </span>
                  </p>
                  {result.statutoryEligible && (
                    <>
                      <p>
                        {ui.monthlyAccrual}: <span class="tabular text-fg">{days(result.firstYearMonthlyDays)}</span>
                      </p>
                      <p>
                        {ui.currentGrantDate}:{' '}
                        <span class="text-fg">{formatDate(result.hireDateCurrentGrantDate)}</span>
                      </p>
                      <p>
                        {ui.expiryDate}: <span class="text-fg">{formatDate(result.hireDateCurrentExpiryDate)}</span>
                      </p>
                      <p>
                        {ui.nextAccrual}:{' '}
                        <span class="text-fg">
                          {result.nextAccrualDays === null
                            ? ui.attendanceConditional
                            : `${formatDate(result.nextAccrualDate)} · ${days(result.nextAccrualDays)}`}
                        </span>
                      </p>
                      {state.attendanceAtLeast80 && (
                        <p>
                          {ui.firstFiscalGrant}:{' '}
                          <span class="tabular text-fg">{days(result.firstFiscalProratedDays)}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {result.comparisonAvailable ? (
                <div class="rounded-md border border-line bg-surface-2 p-3">
                  <p class="text-xs font-medium text-muted">{ui.comparisonHeading}</p>
                  <p class="mt-1 font-mono text-xs leading-5 text-fg">
                    {ui.comparisonFormula
                      .replace('{hire}', days(result.hireDateCumulativeDays ?? 0))
                      .replace('{fiscal}', days(result.fiscalCumulativeDays ?? 0))
                      .replace('{difference}', days(Math.abs(result.fiscalDifferenceDays ?? 0)))}
                  </p>
                  <p class="mt-1 text-xs leading-5 text-muted">
                    {(result.fiscalDifferenceDays ?? 0) > 0 ? ui.hireBasisHigher : ui.fiscalBasisNotLower}
                  </p>
                </div>
              ) : (
                <Notice tone="info">{ui.comparisonUnavailable}</Notice>
              )}

              <div class="rounded-md border border-line bg-surface-2 p-3">
                <p class="text-xs font-medium text-muted">{ui.payFormulaHeading}</p>
                <p class="mt-1 font-mono text-xs leading-5 text-fg">{payFormula}</p>
                <p class="mt-1 text-xs leading-5 text-muted">{payText[result.payReason]}</p>
              </div>
            </>
          )}

          <div class="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => setState(defaultState(todayIso()))}>
              {ui.reset}
            </Button>
          </div>
          <Notice tone="info">{ui.scopeNotice}</Notice>
        </div>
      </div>
    </Panel>
  );
}
