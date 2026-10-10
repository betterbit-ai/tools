import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, NumberInput, Panel, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateSalary } from './logic';

const STORAGE_KEY = 'tools:salary-calculator-kr:state';

interface State {
  annualSalary: number | '';
  monthlyNonTaxable: number | '';
  dependents: number | '';
  childrenAge8To20: number | '';
}

const fallbackState: State = {
  annualSalary: 50_000_000,
  monthlyNonTaxable: 0,
  dependents: 1,
  childrenAge8To20: 0,
};

function isStoredNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallbackState;
    return {
      annualSalary: isStoredNumber(saved.annualSalary) ? saved.annualSalary : fallbackState.annualSalary,
      monthlyNonTaxable: isStoredNumber(saved.monthlyNonTaxable)
        ? saved.monthlyNonTaxable
        : fallbackState.monthlyNonTaxable,
      dependents: isStoredNumber(saved.dependents) ? saved.dependents : fallbackState.dependents,
      childrenAge8To20: isStoredNumber(saved.childrenAge8To20)
        ? saved.childrenAge8To20
        : fallbackState.childrenAge8To20,
    };
  } catch {
    return fallbackState;
  }
}

export default function SalaryCalculatorKr({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(fallbackState);

  useEffect(() => {
    setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateSalary(state), [state]);
  const money = (value: number) => `${formatNumber(value, locale)}${ui.won}`;
  const summary = result
    ? `${ui.monthlyTakeHome}: ${money(result.monthlyTakeHome)}\n${ui.annualTakeHome}: ${money(result.annualTakeHome)}`
    : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div class="flex flex-col gap-4">
          <Field label={ui.annualSalaryLabel} hint={ui.annualSalaryHint}>
            <NumberInput
              value={state.annualSalary}
              min="1"
              max="1000000000"
              step="10000"
              onValue={(annualSalary) => update({ annualSalary })}
            />
          </Field>
          <Field label={ui.nonTaxableLabel} hint={ui.nonTaxableHint}>
            <NumberInput
              value={state.monthlyNonTaxable}
              min="0"
              max="100000000"
              step="10000"
              onValue={(monthlyNonTaxable) => update({ monthlyNonTaxable })}
            />
          </Field>
          <Field label={ui.dependentsLabel} hint={ui.dependentsHint}>
            <NumberInput
              value={state.dependents}
              min="1"
              max="50"
              step="1"
              onValue={(dependents) => update({ dependents })}
            />
          </Field>
          <Field label={ui.childrenLabel} hint={ui.childrenHint}>
            <NumberInput
              value={state.childrenAge8To20}
              min="0"
              max="50"
              step="1"
              onValue={(childrenAge8To20) => update({ childrenAge8To20 })}
            />
          </Field>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <CopyButton text={summary} label={ui.copyResult} copiedLabel={ui.copiedResult} />
          </div>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.monthlyTakeHome} value={money(result.monthlyTakeHome)} emphasis />
                <Stat label={ui.annualTakeHome} value={money(result.annualTakeHome)} />
                <Stat label={ui.monthlyGross} value={money(result.monthlyGross)} />
                <Stat label={ui.totalDeductions} value={money(result.totalDeductions)} />
              </div>
              <Notice tone="info">{ui.withholdingNotice}</Notice>
            </>
          )}
        </div>
      </div>

      {result && (
        <div class="mt-6 border-t border-line pt-5">
          <p class="text-sm font-medium text-fg">{ui.deductionHeading}</p>
          <div class="mt-3 overflow-auto rounded-md border border-line">
            <table class="w-full min-w-[30rem] border-collapse text-right text-sm tabular">
              <thead class="bg-surface-2 text-xs text-muted">
                <tr>
                  <th class="px-3 py-2 text-left font-medium">{ui.item}</th>
                  <th class="px-3 py-2 font-medium">{ui.monthlyAmount}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line text-fg">
                {[
                  [ui.nationalPension, result.nationalPension],
                  [ui.healthInsurance, result.healthInsurance],
                  [ui.longTermCareInsurance, result.longTermCareInsurance],
                  [ui.employmentInsurance, result.employmentInsurance],
                  [ui.incomeTax, result.incomeTax],
                  [ui.localIncomeTax, result.localIncomeTax],
                ].map(([label, value]) => (
                  <tr>
                    <td class="px-3 py-2 text-left">{label}</td>
                    <td class="px-3 py-2">{money(value as number)}</td>
                  </tr>
                ))}
                <tr class="bg-surface-2 font-medium">
                  <td class="px-3 py-2 text-left">{ui.totalDeductions}</td>
                  <td class="px-3 py-2">{money(result.totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Panel>
  );
}
