import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Field, Notice, NumberInput, Panel, Segmented, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateLoan, type RepaymentMethod } from './logic';

const STORAGE_KEY = 'tools:loan-calculator:state';

interface State {
  principal: number | '';
  annualRate: number | '';
  termMonths: number | '';
  method: RepaymentMethod;
}

function defaultState(locale: ToolProps<UI>['locale']): State {
  return {
    principal: locale === 'ko' ? 300_000_000 : 10_000,
    annualRate: locale === 'ko' ? 4 : 6,
    termMonths: locale === 'ko' ? 360 : 12,
    method: 'amortized',
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function restoreState(fallback: State): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    return {
      principal: isFiniteNumber(saved.principal) ? saved.principal : fallback.principal,
      annualRate: isFiniteNumber(saved.annualRate) ? saved.annualRate : fallback.annualRate,
      termMonths: isFiniteNumber(saved.termMonths) ? saved.termMonths : fallback.termMonths,
      method:
        saved.method === 'equalPrincipal' || saved.method === 'bullet' || saved.method === 'amortized'
          ? saved.method
          : fallback.method,
    };
  } catch {
    return fallback;
  }
}

export default function LoanCalculator({ locale, ui }: ToolProps<UI>) {
  const initialState = defaultState(locale);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(initialState);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    setState(restoreState(initialState));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateLoan(state), [state]);
  const money = (value: number) => formatNumber(value, locale, 0);

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div class="flex flex-col gap-4">
          <Field label={ui.principalLabel} hint={ui.principalHint}>
            <NumberInput
              value={state.principal}
              min="0"
              max={String(Number.MAX_SAFE_INTEGER)}
              step="1"
              onValue={(principal) => update({ principal })}
            />
          </Field>
          <Field label={ui.rateLabel} hint={ui.rateHint}>
            <NumberInput
              value={state.annualRate}
              min="0"
              max="100"
              step="0.01"
              onValue={(annualRate) => update({ annualRate })}
            />
          </Field>
          <Field label={ui.termLabel} hint={ui.termHint}>
            <NumberInput
              value={state.termMonths}
              min="1"
              max="600"
              step="1"
              onValue={(termMonths) => update({ termMonths })}
            />
          </Field>
          <Field label={ui.methodLabel}>
            <Segmented<RepaymentMethod>
              label={ui.methodLabel}
              value={state.method}
              onValue={(method) => update({ method })}
              options={[
                { value: 'amortized', label: ui.amortized },
                { value: 'equalPrincipal', label: ui.equalPrincipal },
                { value: 'bullet', label: ui.bullet },
              ]}
            />
          </Field>
        </div>

        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
          {!result ? (
            <Notice tone="danger">{ui.invalidInput}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.firstPayment} value={money(result.firstPayment)} emphasis />
                <Stat label={ui.lastPayment} value={money(result.lastPayment)} />
                <Stat label={ui.totalInterest} value={money(result.totalInterest)} />
                <Stat label={ui.totalPayment} value={money(result.totalPayment)} />
              </div>
              <Notice tone="info">{ui.calculationAssumption}</Notice>
            </>
          )}
        </div>
      </div>

      {result && (
        <div class="mt-6 border-t border-line pt-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-fg">{ui.scheduleHeading}</p>
              <p class="mt-1 text-xs text-subtle">{ui.scheduleHint}</p>
            </div>
            <Button size="sm" onClick={() => setScheduleOpen((open) => !open)}>
              {scheduleOpen ? ui.hideSchedule : ui.showSchedule.replace('{count}', String(result.schedule.length))}
            </Button>
          </div>
          {scheduleOpen && (
            <div class="mt-4 max-h-96 overflow-auto rounded-md border border-line">
              <table class="w-full min-w-[34rem] border-collapse text-right text-sm tabular">
                <thead class="sticky top-0 bg-surface-2 text-xs text-muted">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium">{ui.month}</th>
                    <th class="px-3 py-2 font-medium">{ui.payment}</th>
                    <th class="px-3 py-2 font-medium">{ui.principal}</th>
                    <th class="px-3 py-2 font-medium">{ui.interest}</th>
                    <th class="px-3 py-2 font-medium">{ui.balance}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line text-fg">
                  {result.schedule.map((payment) => (
                    <tr>
                      <td class="px-3 py-2 text-left">{payment.month}</td>
                      <td class="px-3 py-2">{money(payment.payment)}</td>
                      <td class="px-3 py-2">{money(payment.principal)}</td>
                      <td class="px-3 py-2">{money(payment.interest)}</td>
                      <td class="px-3 py-2">{money(payment.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
