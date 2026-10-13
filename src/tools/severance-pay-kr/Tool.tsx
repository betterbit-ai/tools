import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Notice, NumberInput, Panel, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateSeverance } from './logic';

const STORAGE_KEY = 'tools:severance-pay-kr:state';

interface State {
  startDate: string;
  lastWorkingDate: string;
  wages: [number | '', number | '', number | ''];
  annualBonus: number | '';
  annualLeavePay: number | '';
  dailyOrdinaryWage: number | '';
  weeklyHours: number | '';
}

function defaultState(): State {
  return {
    startDate: '2023-01-01',
    lastWorkingDate: '2024-01-31',
    wages: [3_000_000, 3_000_000, 3_000_000],
    annualBonus: 0,
    annualLeavePay: 0,
    dailyOrdinaryWage: 0,
    weeklyHours: 40,
  };
}

function isStoredNumber(value: unknown): value is number | '' {
  return value === '' || (typeof value === 'number' && Number.isFinite(value));
}

function isStoredDate(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 10;
}

function restoreState(fallback: State): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object' || !Array.isArray(saved.wages) || saved.wages.length !== 3) return fallback;
    if (!saved.wages.every(isStoredNumber)) return fallback;
    if (
      !isStoredDate(saved.startDate) ||
      !isStoredDate(saved.lastWorkingDate) ||
      !isStoredNumber(saved.annualBonus) ||
      !isStoredNumber(saved.annualLeavePay) ||
      !isStoredNumber(saved.dailyOrdinaryWage) ||
      !isStoredNumber(saved.weeklyHours)
    ) {
      return fallback;
    }
    return {
      startDate: saved.startDate,
      lastWorkingDate: saved.lastWorkingDate,
      wages: [saved.wages[0], saved.wages[1], saved.wages[2]],
      annualBonus: saved.annualBonus,
      annualLeavePay: saved.annualLeavePay,
      dailyOrdinaryWage: saved.dailyOrdinaryWage,
      weeklyHours: saved.weeklyHours,
    };
  } catch {
    return fallback;
  }
}

function formatDate(value: string, locale: ToolProps<UI>['locale']): string {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

export default function SeverancePayKr({ locale, ui }: ToolProps<UI>) {
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

  const result = useMemo(() => calculateSeverance(state), [state]);
  const money = (amount: number, fractionDigits = 0) => `${formatNumber(amount, locale, fractionDigits)}${ui.won}`;
  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const updateWage = (index: 0 | 1 | 2, value: number | '') =>
    setState((current) => {
      const wages = [...current.wages] as State['wages'];
      wages[index] = value;
      return { ...current, wages };
    });

  const formula = result
    ? ui.formula
        .replace('{daily}', money(result.applicableDailyWage, 2))
        .replace('{serviceDays}', formatNumber(result.serviceDays, locale))
        .replace('{severance}', money(result.severancePay))
    : '';
  const copyText = result
    ? `${ui.severancePay}: ${money(result.severancePay)}\n${ui.retirementDate}: ${formatDate(result.retirementDate, locale)}\n${ui.serviceDays}: ${formatNumber(result.serviceDays, locale)}\n${ui.averageDailyWage}: ${money(result.averageDailyWage, 2)}`
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="flex flex-col gap-5">
          <section aria-labelledby="employment-heading">
            <p id="employment-heading" class="text-sm font-medium text-fg">
              {ui.employmentHeading}
            </p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={ui.startDateLabel}>
                <TextInput
                  type="date"
                  value={state.startDate}
                  onInput={(event) => update({ startDate: event.currentTarget.value })}
                />
              </Field>
              <Field label={ui.lastWorkingDateLabel} hint={ui.lastWorkingDateHint}>
                <TextInput
                  type="date"
                  value={state.lastWorkingDate}
                  onInput={(event) => update({ lastWorkingDate: event.currentTarget.value })}
                />
              </Field>
            </div>
            <div class="mt-3 max-w-80">
              <Field label={ui.weeklyHoursLabel} hint={ui.weeklyHoursHint}>
                <NumberInput
                  value={state.weeklyHours}
                  min="0"
                  max="168"
                  step="0.01"
                  onValue={(weeklyHours) => update({ weeklyHours })}
                />
              </Field>
            </div>
          </section>

          <section aria-labelledby="wages-heading">
            <p id="wages-heading" class="text-sm font-medium text-fg">
              {ui.wagesHeading}
            </p>
            <p class="mt-1 text-xs text-subtle">{ui.wagesHint}</p>
            <div class="mt-3 grid gap-3 sm:grid-cols-3">
              {state.wages.map((wage, index) => (
                <Field label={ui.wageLabel.replace('{number}', String(index + 1))}>
                  <NumberInput
                    value={wage}
                    min="0"
                    max="1000000000000000"
                    step="1"
                    onValue={(value) => updateWage(index as 0 | 1 | 2, value)}
                  />
                </Field>
              ))}
            </div>
          </section>

          <section aria-labelledby="extra-heading">
            <p id="extra-heading" class="text-sm font-medium text-fg">
              {ui.extraHeading}
            </p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label={ui.annualBonusLabel} hint={ui.annualBonusHint}>
                <NumberInput
                  value={state.annualBonus}
                  min="0"
                  max="1000000000000000"
                  step="1"
                  onValue={(annualBonus) => update({ annualBonus })}
                />
              </Field>
              <Field label={ui.annualLeaveLabel} hint={ui.annualLeaveHint}>
                <NumberInput
                  value={state.annualLeavePay}
                  min="0"
                  max="1000000000000000"
                  step="1"
                  onValue={(annualLeavePay) => update({ annualLeavePay })}
                />
              </Field>
              <Field label={ui.ordinaryWageLabel} hint={ui.ordinaryWageHint}>
                <NumberInput
                  value={state.dailyOrdinaryWage}
                  min="0"
                  max="1000000000000000"
                  step="1"
                  onValue={(dailyOrdinaryWage) => update({ dailyOrdinaryWage })}
                />
              </Field>
            </div>
          </section>
        </div>

        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium text-fg">{ui.resultHeading}</p>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div aria-live="polite">
                <Stat label={ui.severancePay} value={money(result.severancePay)} emphasis />
              </div>
              <Notice tone={result.eligible ? 'success' : 'info'}>
                {result.eligible ? ui.eligible : ui.ineligible}
              </Notice>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.serviceDays} value={formatNumber(result.serviceDays, locale)} />
                <Stat label={ui.averageWageDays} value={formatNumber(result.averageWageDays, locale)} />
                <Stat label={ui.averageDailyWage} value={money(result.averageDailyWage, 2)} />
                <Stat label={ui.applicableDailyWage} value={money(result.applicableDailyWage, 2)} />
              </div>
              <div class="rounded-md border border-line bg-surface-2 p-3 text-xs leading-5 text-muted">
                <p>
                  {ui.retirementDate}: <span class="text-fg">{formatDate(result.retirementDate, locale)}</span>
                </p>
                <p>
                  {ui.averageWagePeriod}:{' '}
                  <span class="text-fg">
                    {formatDate(result.averageWageStartDate, locale)} {ui.dateRangeSeparator}{' '}
                    {formatDate(result.averageWageEndDate, locale)}
                  </span>
                </p>
                <p>
                  {ui.threeMonthWages}: <span class="tabular text-fg">{money(result.threeMonthWages)}</span>
                </p>
                <p>
                  {ui.includedBonus}: <span class="tabular text-fg">{money(result.includedBonus)}</span>
                </p>
                <p>
                  {ui.includedAnnualLeave}: <span class="tabular text-fg">{money(result.includedAnnualLeavePay)}</span>
                </p>
                <p>
                  {ui.averageWageTotal}: <span class="tabular text-fg">{money(result.averageWageTotal)}</span>
                </p>
              </div>
              <div class="rounded-md border border-line bg-surface-2 p-3">
                <p class="text-xs font-medium text-muted">{ui.formulaHeading}</p>
                <p class="mt-1 font-mono text-xs leading-5 text-fg">{formula}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
                <Button size="sm" variant="ghost" onClick={() => setState(defaultState())}>
                  {ui.reset}
                </Button>
              </div>
            </>
          )}
          <Notice tone="info">{ui.resultNotice}</Notice>
        </div>
      </div>
    </Panel>
  );
}
