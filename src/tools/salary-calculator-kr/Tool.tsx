import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Field, Notice, NumberInput, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import type { Locale } from '../../i18n/locales';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateSalary, explainSalaryInput, parseWon, type SalaryIssue, type WithholdingRate } from './logic';

const STORAGE_KEY = 'tools:salary-calculator-kr:state';

interface State {
  /** Kept as typed so "5,000만" survives a re-render; parseWon reads it. */
  annualSalary: string;
  monthlyNonTaxable: string;
  dependents: number | '';
  childrenAge8To20: number | '';
  withholdingRate: WithholdingRate;
}

const fallbackState: State = {
  annualSalary: '50000000',
  monthlyNonTaxable: '0',
  dependents: 1,
  childrenAge8To20: 0,
  withholdingRate: 100,
};

/** Below this, the entered "salary" is almost certainly a 만원 figure with the unit left off. */
const SUSPICIOUSLY_LOW_ANNUAL_SALARY = 1_000_000;

function isStoredNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function storedMoney(saved: unknown, fallback: string): string {
  if (typeof saved === 'string' && saved.length <= 40) return saved;
  if (isStoredNumber(saved)) return String(saved);
  return fallback;
}

function restoreState(): State {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return fallbackState;
    return {
      annualSalary: storedMoney(saved.annualSalary, fallbackState.annualSalary),
      monthlyNonTaxable: storedMoney(saved.monthlyNonTaxable, fallbackState.monthlyNonTaxable),
      dependents: isStoredNumber(saved.dependents) ? saved.dependents : fallbackState.dependents,
      childrenAge8To20: isStoredNumber(saved.childrenAge8To20)
        ? saved.childrenAge8To20
        : fallbackState.childrenAge8To20,
      withholdingRate:
        saved.withholdingRate === 80 || saved.withholdingRate === 100 || saved.withholdingRate === 120
          ? saved.withholdingRate
          : fallbackState.withholdingRate,
    };
  } catch {
    return fallbackState;
  }
}

/**
 * A won field that accepts what people actually type — 50000000, 50,000,000, 5,000만, 1억 5천만 —
 * groups plain digits as they are typed, and shows the amount it read whenever the text uses units.
 */
function MoneyField(props: {
  label: string;
  hint?: string;
  value: string;
  locale: Locale;
  won: string;
  unreadable: string;
  onValue: (value: string) => void;
}) {
  const parsed = parseWon(props.value);
  const grouped = parsed === null ? null : formatNumber(parsed, props.locale);
  // Units and symbols stay exactly as typed; only plain digits are grouped, so parseWon can always
  // read the field back (it ignores commas).
  const hasUnits = /[^\d,\s]/.test(props.value);
  const shown = hasUnits || grouped === null ? props.value : grouped;

  return (
    <div>
      <Field label={props.label} hint={props.hint}>
        <TextInput
          value={shown}
          inputMode="numeric"
          autoComplete="off"
          spellcheck={false}
          class="tabular"
          onInput={(event) => props.onValue((event.currentTarget as HTMLInputElement).value)}
        />
      </Field>
      {hasUnits && props.value.trim() !== '' ? (
        parsed === null ? (
          <p class="mt-1 text-xs text-danger">{props.unreadable}</p>
        ) : (
          <p class="mt-1 text-xs text-muted">
            = {grouped}
            {props.won}
          </p>
        )
      ) : null}
    </div>
  );
}

export default function SalaryCalculatorKr({ locale, ui, preset }: ToolProps<UI>) {
  // Salary landing pages (/salary-calculator-kr/3000-manwon) open on their salary; other saved
  // conditions (non-taxable pay, dependents…) still come back.
  const presetSalary = typeof preset?.annualSalary === 'number' ? String(preset.annualSalary) : null;
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(() =>
    presetSalary === null ? fallbackState : { ...fallbackState, annualSalary: presetSalary },
  );

  useEffect(() => {
    const restored = restoreState();
    setState(presetSalary === null ? restored : { ...restored, annualSalary: presetSalary });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateSalary(state), [state]);
  const issue = useMemo(() => explainSalaryInput(state), [state]);
  const issueText: Record<SalaryIssue, string> = {
    'annual-salary': ui.issueAnnualSalary,
    'annual-salary-too-large': ui.issueAnnualTooLarge,
    'non-taxable': ui.issueNonTaxable,
    'non-taxable-over-pay': ui.issueNonTaxableOverPay,
    dependents: ui.issueDependents,
    children: ui.issueChildren,
    'children-over-dependents': ui.issueChildrenOverDependents,
    'withholding-rate': ui.issueWithholding,
  };
  const annualSalary = parseWon(state.annualSalary);
  const looksLikeManwon = annualSalary !== null && annualSalary > 0 && annualSalary < SUSPICIOUSLY_LOW_ANNUAL_SALARY;
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
          <MoneyField
            label={ui.annualSalaryLabel}
            hint={ui.annualSalaryHint}
            value={state.annualSalary}
            locale={locale}
            won={ui.won}
            unreadable={ui.moneyUnreadable}
            onValue={(annualSalary) => update({ annualSalary })}
          />
          <MoneyField
            label={ui.nonTaxableLabel}
            hint={ui.nonTaxableHint}
            value={state.monthlyNonTaxable}
            locale={locale}
            won={ui.won}
            unreadable={ui.moneyUnreadable}
            onValue={(monthlyNonTaxable) => update({ monthlyNonTaxable })}
          />
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
          <div>
            <p class="mb-1.5 text-sm font-medium text-fg">{ui.withholdingRateLabel}</p>
            <Segmented<`${WithholdingRate}`>
              label={ui.withholdingRateLabel}
              value={String(state.withholdingRate) as `${WithholdingRate}`}
              onValue={(value) => update({ withholdingRate: Number(value) as WithholdingRate })}
              options={[
                { value: '80', label: ui.withholdingRate80 },
                { value: '100', label: ui.withholdingRate100 },
                { value: '120', label: ui.withholdingRate120 },
              ]}
            />
            <p class="mt-1 text-xs text-subtle">{ui.withholdingRateHint}</p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
            <CopyButton text={summary} label={ui.copyResult} copiedLabel={ui.copiedResult} />
          </div>
          {!result ? (
            <Notice tone="danger">{issue ? issueText[issue] : ui.invalidInput}</Notice>
          ) : (
            <>
              {looksLikeManwon && <Notice tone="danger">{ui.lowSalaryWarning}</Notice>}
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
