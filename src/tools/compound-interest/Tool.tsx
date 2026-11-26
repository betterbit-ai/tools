import { useEffect, useMemo, useState } from 'preact/hooks';
import { BarChart, Button, Field, Notice, Panel, Segmented, Select, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  compoundInputIssue,
  parseCompoundNumber,
  calculateCompoundInterest,
  type CompoundFrequency,
  type ContributionTiming,
} from './logic';
import { defaultCompoundInterestState, restoreCompoundInterestState, type CompoundInterestState } from './state';

const STORAGE_KEY = 'tools:compound-interest:state';

/**
 * A numeric field that keeps the text the visitor typed and reports only a readable number.
 *
 * The shared number input re-renders a partial value, so a decimal point typed into a rate field
 * vanished: "5.5" arrived as 55. Keeping the text here means "5." stays "5." while the projection
 * already uses 5, and a field that holds text is reported instead of being read as blank.
 */
function NumberField(props: {
  value: number | '';
  onValue: (value: number | '') => void;
  label: string;
  hint?: string;
}) {
  const [text, setText] = useState(() => (props.value === '' ? '' : String(props.value)));

  // Follow the value when something else changes it (Reset, a restored session), but never
  // rewrite what the visitor is in the middle of typing.
  useEffect(() => {
    if (props.value === '') return;
    if (parseCompoundNumber(text) !== props.value) setText(String(props.value));
  }, [props.value, text]);

  return (
    <Field label={props.label} hint={props.hint}>
      <TextInput
        value={text}
        inputMode="decimal"
        autocomplete="off"
        spellcheck={false}
        class="tabular"
        onInput={(event) => {
          const typed = (event.currentTarget as HTMLInputElement).value;
          setText(typed);
          props.onValue(parseCompoundNumber(typed) ?? '');
        }}
      />
    </Field>
  );
}

export default function CompoundInterest({ locale, ui }: ToolProps<UI>) {
  const initialState = useMemo(() => defaultCompoundInterestState(locale), [locale]);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<CompoundInterestState>(initialState);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    try {
      setState(restoreCompoundInterestState(JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null'), initialState));
    } catch {
      setState(initialState);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<CompoundInterestState>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(() => calculateCompoundInterest(state), [state]);
  const issue = useMemo(() => compoundInputIssue(state), [state]);
  const issueText =
    issue === 'amount'
      ? ui.amountRange
      : issue === 'rate'
        ? ui.rateRange
        : issue === 'years'
          ? ui.yearsRange
          : issue === 'missing'
            ? ui.missingInput
            : issue === 'settings'
              ? ui.invalidInput
              : null;
  const money = (value: number) => formatNumber(value, locale, 0);
  const percent = (value: number) => `${formatNumber(value * 100, locale, 2)}%`;
  const chartItems = result?.schedule.map((row) => ({ label: `${ui.year} ${row.year}`, value: row.balance })) ?? [];

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-muted">{ui.intro}</p>
        <div class="flex items-center gap-3">
          <span class="shrink-0 text-xs text-subtle">{ui.autosaved}</span>
          <Button
            size="sm"
            onClick={() => {
              setState(defaultCompoundInterestState(locale));
              setScheduleOpen(false);
            }}
          >
            {ui.reset}
          </Button>
        </div>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div class="flex flex-col gap-4">
          <NumberField
            label={ui.principalLabel}
            hint={ui.principalHint}
            value={state.principal}
            onValue={(principal) => update({ principal })}
          />
          <NumberField
            label={ui.monthlyContributionLabel}
            hint={ui.monthlyContributionHint}
            value={state.monthlyContribution}
            onValue={(monthlyContribution) => update({ monthlyContribution })}
          />
          <div class="grid grid-cols-2 gap-3">
            <NumberField
              label={ui.rateLabel}
              hint={ui.rateHint}
              value={state.annualRate}
              onValue={(annualRate) => update({ annualRate })}
            />
            <NumberField
              label={ui.yearsLabel}
              hint={ui.yearsHint}
              value={state.years}
              onValue={(years) => update({ years })}
            />
          </div>
          <Field label={ui.frequencyLabel} hint={ui.frequencyHint}>
            <Select<CompoundFrequency>
              value={state.frequency}
              onValue={(frequency) => update({ frequency })}
              options={[
                { value: 'annual', label: ui.annual },
                { value: 'quarterly', label: ui.quarterly },
                { value: 'monthly', label: ui.monthly },
                { value: 'daily', label: ui.daily },
              ]}
            />
          </Field>
          <Field label={ui.timingLabel} hint={ui.timingHint}>
            <Segmented<ContributionTiming>
              label={ui.timingLabel}
              value={state.contributionTiming}
              onValue={(contributionTiming) => update({ contributionTiming })}
              options={[
                { value: 'end', label: ui.endOfMonth },
                { value: 'beginning', label: ui.beginningOfMonth },
              ]}
            />
          </Field>
        </div>

        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium text-fg">{ui.resultsHeading}</p>
          {!result ? (
            <Notice tone="danger">{issueText}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.finalBalance} value={money(result.finalBalance)} emphasis />
                <Stat label={ui.totalInterest} value={money(result.totalInterest)} />
                <Stat label={ui.totalContributions} value={money(result.totalContributions)} />
                <Stat label={ui.effectiveAnnualRate} value={percent(result.effectiveAnnualRate)} />
              </div>
              <div>
                <p class="mb-2 text-sm font-medium text-fg">{ui.chartHeading}</p>
                <BarChart items={chartItems} ariaLabel={ui.chartDescription} />
              </div>
              <Notice tone="info">{ui.assumption}</Notice>
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
              <table class="w-full min-w-[30rem] border-collapse text-right text-sm tabular">
                <thead class="sticky top-0 bg-surface-2 text-xs text-muted">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium">{ui.year}</th>
                    <th class="px-3 py-2 font-medium">{ui.balance}</th>
                    <th class="px-3 py-2 font-medium">{ui.contributions}</th>
                    <th class="px-3 py-2 font-medium">{ui.interest}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line text-fg">
                  {result.schedule.map((row) => (
                    <tr>
                      <td class="px-3 py-2 text-left">{row.year}</td>
                      <td class="px-3 py-2">{money(row.balance)}</td>
                      <td class="px-3 py-2">{money(row.contributions)}</td>
                      <td class="px-3 py-2">{money(row.interest)}</td>
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
