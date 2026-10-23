import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, NumberInput, Panel, Segmented, Select, Stat, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  SOCIAL_INSURANCE_RULES_2026,
  calculateSocialInsurance,
  type PayPeriod,
  type PensionPeriod,
  type ResultReason,
  type WorkplaceSize,
} from './logic';

const STORAGE_KEY = 'tools:social-insurance-kr:state';
type InputNumber = number | '';

interface State {
  pay: InputNumber;
  payPeriod: PayPeriod;
  monthlyNonTaxable: InputNumber;
  pensionPeriod: PensionPeriod;
  workplaceSize: WorkplaceSize;
  industrialAccidentRatePercent: InputNumber;
  pensionCovered: boolean;
  healthCovered: boolean;
  employmentCovered: boolean;
}

const fallbackState: State = {
  pay: 3_000_000,
  payPeriod: 'monthly',
  monthlyNonTaxable: 0,
  pensionPeriod: 'second-half',
  workplaceSize: 'under150',
  industrialAccidentRatePercent: 0,
  pensionCovered: true,
  healthCovered: true,
  employmentCovered: true,
};

function isInputNumber(value: unknown): value is InputNumber {
  return value === '' || (typeof value === 'number' && Number.isFinite(value));
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallbackState;
    return {
      pay: isInputNumber(saved.pay) ? saved.pay : fallbackState.pay,
      payPeriod: saved.payPeriod === 'annual' ? 'annual' : 'monthly',
      monthlyNonTaxable: isInputNumber(saved.monthlyNonTaxable)
        ? saved.monthlyNonTaxable
        : fallbackState.monthlyNonTaxable,
      pensionPeriod: saved.pensionPeriod === 'first-half' ? 'first-half' : 'second-half',
      workplaceSize: ['under150', 'priority150Plus', 'from150To999', 'atLeast1000'].includes(saved.workplaceSize)
        ? saved.workplaceSize
        : fallbackState.workplaceSize,
      industrialAccidentRatePercent: isInputNumber(saved.industrialAccidentRatePercent)
        ? saved.industrialAccidentRatePercent
        : fallbackState.industrialAccidentRatePercent,
      pensionCovered: typeof saved.pensionCovered === 'boolean' ? saved.pensionCovered : true,
      healthCovered: typeof saved.healthCovered === 'boolean' ? saved.healthCovered : true,
      employmentCovered: typeof saved.employmentCovered === 'boolean' ? saved.employmentCovered : true,
    };
  } catch {
    return fallbackState;
  }
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export default function SocialInsuranceKr({ locale, ui }: ToolProps<UI>) {
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
  const result = useMemo(
    () =>
      calculateSocialInsurance({
        pay: state.pay,
        payPeriod: state.payPeriod,
        monthlyNonTaxable: state.monthlyNonTaxable,
        pensionPeriod: state.pensionPeriod,
        workplaceSize: state.workplaceSize,
        industrialAccidentRatePercent: state.industrialAccidentRatePercent,
        coverage: {
          pension: state.pensionCovered,
          health: state.healthCovered,
          employment: state.employmentCovered,
        },
      }),
    [state],
  );

  const money = (value: number) => `${formatNumber(value, locale)}${ui.won}`;
  const percent = (value: number) => `${formatNumber(value * 100, locale, 3)}%`;
  const payLabel = state.payPeriod === 'monthly' ? ui.monthlyPayLabel : ui.annualPayLabel;
  const reasonText = (reason: ResultReason): string => {
    if (!result) return '';
    const values = {
      gross: money(result.monthlyGross),
      amount: money(result.monthlyNonTaxable),
      base: money(result.remunerationBase),
      pensionBase: money(result.pensionBase),
      minimum: money(result.pensionMinimumBase),
      maximum: money(result.pensionMaximumBase),
      rate: percent(result.employmentStabilityRate),
      accidentRate: percent(result.industrialAccidentRate),
    };
    const templates: Record<ResultReason, string> = {
      'annual-converted': ui.reasonAnnualConverted,
      'non-taxable-excluded': ui.reasonNonTaxable,
      'pension-thousand-floor': ui.reasonPensionThousandFloor,
      'pension-minimum': ui.reasonPensionMinimum,
      'pension-maximum': ui.reasonPensionMaximum,
      'pension-excluded': ui.reasonPensionExcluded,
      'health-minimum': ui.reasonHealthMinimum,
      'health-maximum': ui.reasonHealthMaximum,
      'health-excluded': ui.reasonHealthExcluded,
      'employment-excluded': ui.reasonEmploymentExcluded,
      'employer-size-rate': ui.reasonEmployerSize,
      'industrial-rate-entered': ui.reasonIndustrialEntered,
      'industrial-rate-missing': ui.reasonIndustrialMissing,
    };
    return fill(templates[reason], values);
  };

  const summary = result
    ? [
        `${ui.employeeTotal}: ${money(result.employee.total)}`,
        `${ui.employerTotal}: ${money(result.employer.total)}`,
        `${ui.employeePayAfterInsurance}: ${money(result.payAfterEmployeeInsurance)}`,
        `${ui.employerLaborCost}: ${money(result.employerLaborCost)}`,
      ].join('\n')
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(19rem,1.15fr)]">
        <div class="flex flex-col gap-5">
          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.payPeriodLabel}</p>
            <Segmented<PayPeriod>
              label={ui.payPeriodLabel}
              value={state.payPeriod}
              onValue={(payPeriod) => {
                if (payPeriod === state.payPeriod) return;
                update({
                  payPeriod,
                  pay:
                    typeof state.pay === 'number'
                      ? payPeriod === 'annual'
                        ? state.pay * 12
                        : Math.floor(state.pay / 12)
                      : state.pay,
                });
              }}
              options={[
                { value: 'monthly', label: ui.monthly },
                { value: 'annual', label: ui.annual },
              ]}
            />
          </div>

          <Field label={payLabel} hint={ui.payHint}>
            <NumberInput
              aria-label={payLabel}
              value={state.pay}
              min="1"
              max={String(
                state.payPeriod === 'monthly'
                  ? SOCIAL_INSURANCE_RULES_2026.maximumMonthlyPayInput
                  : SOCIAL_INSURANCE_RULES_2026.maximumAnnualPayInput,
              )}
              step="10000"
              onValue={(pay) => update({ pay })}
            />
          </Field>

          <Field label={ui.nonTaxableLabel} hint={ui.nonTaxableHint}>
            <NumberInput
              aria-label={ui.nonTaxableLabel}
              value={state.monthlyNonTaxable}
              min="0"
              max={String(SOCIAL_INSURANCE_RULES_2026.maximumMonthlyPayInput)}
              step="10000"
              onValue={(monthlyNonTaxable) => update({ monthlyNonTaxable })}
            />
          </Field>

          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.pensionPeriodLabel}</p>
            <Segmented<PensionPeriod>
              label={ui.pensionPeriodLabel}
              value={state.pensionPeriod}
              onValue={(pensionPeriod) => update({ pensionPeriod })}
              options={[
                { value: 'first-half', label: ui.firstHalf },
                { value: 'second-half', label: ui.secondHalf },
              ]}
            />
            <p class="mt-1 text-xs text-subtle">{ui.pensionPeriodHint}</p>
          </div>

          <Field label={ui.workplaceSizeLabel} hint={ui.workplaceSizeHint}>
            <Select<WorkplaceSize>
              ariaLabel={ui.workplaceSizeLabel}
              value={state.workplaceSize}
              onValue={(workplaceSize) => update({ workplaceSize })}
              options={[
                { value: 'under150', label: ui.under150 },
                { value: 'priority150Plus', label: ui.priority150Plus },
                { value: 'from150To999', label: ui.from150To999 },
                { value: 'atLeast1000', label: ui.atLeast1000 },
              ]}
            />
          </Field>

          <Field label={ui.industrialRateLabel} hint={ui.industrialRateHint}>
            <NumberInput
              aria-label={ui.industrialRateLabel}
              value={state.industrialAccidentRatePercent}
              min="0"
              max={String(SOCIAL_INSURANCE_RULES_2026.maximumIndustrialAccidentRatePercent)}
              step="0.01"
              onValue={(industrialAccidentRatePercent) => update({ industrialAccidentRatePercent })}
            />
          </Field>

          <div>
            <p class="text-sm font-medium text-fg">{ui.coverageHeading}</p>
            <p class="mt-1 text-xs text-subtle">{ui.coverageHint}</p>
            <div class="mt-3 flex flex-col gap-3 rounded-md border border-line bg-surface-2 p-3">
              <Toggle
                checked={state.pensionCovered}
                onChecked={(pensionCovered) => update({ pensionCovered })}
                label={ui.includePension}
              />
              <Toggle
                checked={state.healthCovered}
                onChecked={(healthCovered) => update({ healthCovered })}
                label={ui.includeHealth}
              />
              <Toggle
                checked={state.employmentCovered}
                onChecked={(employmentCovered) => update({ employmentCovered })}
                label={ui.includeEmployment}
              />
            </div>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <CopyButton text={summary} label={ui.copyResult} copiedLabel={ui.copiedResult} />
          </div>

          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.employeeTotal} value={money(result.employee.total)} emphasis />
                <Stat label={ui.employerTotal} value={money(result.employer.total)} />
                <Stat label={ui.employeePayAfterInsurance} value={money(result.payAfterEmployeeInsurance)} />
                <Stat label={ui.employerLaborCost} value={money(result.employerLaborCost)} />
              </div>
              <Notice tone="info">{ui.taxNotice}</Notice>

              <div class="overflow-auto rounded-md border border-line">
                <table class="w-full min-w-[32rem] border-collapse text-right text-sm tabular">
                  <thead class="bg-surface-2 text-xs text-muted">
                    <tr>
                      <th class="px-3 py-2 text-left font-medium">{ui.item}</th>
                      <th class="px-3 py-2 font-medium">{ui.employee}</th>
                      <th class="px-3 py-2 font-medium">{ui.employer}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-line text-fg">
                    {[
                      [ui.nationalPension, result.employee.pension, result.employer.pension],
                      [ui.healthInsurance, result.employee.health, result.employer.health],
                      [ui.longTermCare, result.employee.longTermCare, result.employer.longTermCare],
                      [ui.employmentInsurance, result.employee.employment, result.employer.employment],
                      [ui.employmentStability, null, result.employer.employmentStability],
                      [ui.industrialAccident, null, result.employer.industrialAccident],
                    ].map(([label, employee, employer]) => (
                      <tr>
                        <td class="px-3 py-2 text-left">{label}</td>
                        <td class="px-3 py-2">{typeof employee === 'number' ? money(employee) : ui.notApplicable}</td>
                        <td class="px-3 py-2">{money(employer as number)}</td>
                      </tr>
                    ))}
                    <tr class="bg-surface-2 font-medium">
                      <td class="px-3 py-2 text-left">{ui.total}</td>
                      <td class="px-3 py-2">{money(result.employee.total)}</td>
                      <td class="px-3 py-2">{money(result.employer.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="rounded-md border border-line p-3">
                <p class="text-sm font-medium text-fg">{ui.whyHeading}</p>
                <p class="mt-1 text-xs text-subtle">
                  {fill(ui.basisSummary, {
                    gross: money(result.monthlyGross),
                    base: money(result.remunerationBase),
                    rate: percent(result.employeeEffectiveRate),
                  })}
                </p>
                <ul class="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted">
                  {result.reasons.map((reason) => (
                    <li>{reasonText(reason)}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
