import { useEffect, useMemo, useState } from 'preact/hooks';
import { BarChart, Button, Field, Notice, NumberInput, Panel, Segmented, Select, Stat } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculateCompoundInterest, type CompoundFrequency, type ContributionTiming } from './logic';

const STORAGE_KEY = 'tools:compound-interest:state';

interface State {
  principal: number | '';
  monthlyContribution: number | '';
  annualRate: number | '';
  years: number | '';
  frequency: CompoundFrequency;
  contributionTiming: ContributionTiming;
}

function defaultState(locale: ToolProps<UI>['locale']): State {
  return locale === 'ko'
    ? {
        principal: 10_000_000,
        monthlyContribution: 500_000,
        annualRate: 5,
        years: 10,
        frequency: 'monthly',
        contributionTiming: 'end',
      }
    : {
        principal: 10_000,
        monthlyContribution: 500,
        annualRate: 7,
        years: 20,
        frequency: 'monthly',
        contributionTiming: 'end',
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
      monthlyContribution: isFiniteNumber(saved.monthlyContribution)
        ? saved.monthlyContribution
        : fallback.monthlyContribution,
      annualRate: isFiniteNumber(saved.annualRate) ? saved.annualRate : fallback.annualRate,
      years: isFiniteNumber(saved.years) ? saved.years : fallback.years,
      frequency: isFrequency(saved.frequency) ? saved.frequency : fallback.frequency,
      contributionTiming: isTiming(saved.contributionTiming) ? saved.contributionTiming : fallback.contributionTiming,
    };
  } catch {
    return fallback;
  }
}

function isFrequency(value: unknown): value is CompoundFrequency {
  return value === 'annual' || value === 'quarterly' || value === 'monthly' || value === 'daily';
}

function isTiming(value: unknown): value is ContributionTiming {
  return value === 'beginning' || value === 'end';
}

export default function CompoundInterest({ locale, ui }: ToolProps<UI>) {
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
  const result = useMemo(() => calculateCompoundInterest(state), [state]);
  const money = (value: number) => formatNumber(value, locale, 0);
  const percent = (value: number) => `${formatNumber(value * 100, locale, 2)}%`;
  const chartItems = result?.schedule.map((row) => ({ label: `${ui.year} ${row.year}`, value: row.balance })) ?? [];

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
              max="1000000000000"
              step="1"
              onValue={(principal) => update({ principal })}
            />
          </Field>
          <Field label={ui.monthlyContributionLabel} hint={ui.monthlyContributionHint}>
            <NumberInput
              value={state.monthlyContribution}
              min="0"
              max="1000000000000"
              step="1"
              onValue={(monthlyContribution) => update({ monthlyContribution })}
            />
          </Field>
          <div class="grid grid-cols-2 gap-3">
            <Field label={ui.rateLabel} hint={ui.rateHint}>
              <NumberInput
                value={state.annualRate}
                min="0"
                max="100"
                step="0.01"
                onValue={(annualRate) => update({ annualRate })}
              />
            </Field>
            <Field label={ui.yearsLabel} hint={ui.yearsHint}>
              <NumberInput value={state.years} min="1" max="100" step="1" onValue={(years) => update({ years })} />
            </Field>
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
            <Notice tone="danger">{ui.invalidInput}</Notice>
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
