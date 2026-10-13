import { useEffect, useMemo, useState } from 'preact/hooks';
import { Field, Notice, NumberInput, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { calculatePregnancy, isValidDate, todayIso, type DatingMethod, type EmbryoAge } from './logic';

const STORAGE_KEY = 'tools:pregnancy-calculator:state';

interface State {
  method: DatingMethod;
  date: string;
  cycleLength: number | '';
  embryoAge: EmbryoAge;
}

const DEFAULT_STATE: State = { method: 'lmp', date: '', cycleLength: 28, embryoAge: 5 };

function isDatingMethod(value: unknown): value is DatingMethod {
  return value === 'lmp' || value === 'conception' || value === 'ivf';
}

function isEmbryoAge(value: unknown): value is EmbryoAge {
  return value === 3 || value === 5;
}

function isCycleLength(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 20 && value <= 45;
}

function restoreState(): State {
  try {
    const saved: unknown = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return DEFAULT_STATE;
    const value = saved as Partial<State>;
    return {
      method: isDatingMethod(value.method) ? value.method : DEFAULT_STATE.method,
      date: typeof value.date === 'string' && (value.date === '' || isValidDate(value.date)) ? value.date : '',
      cycleLength: isCycleLength(value.cycleLength) ? value.cycleLength : DEFAULT_STATE.cycleLength,
      embryoAge: isEmbryoAge(value.embryoAge) ? value.embryoAge : DEFAULT_STATE.embryoAge,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function PregnancyCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(DEFAULT_STATE);

  useEffect(() => {
    setState(restoreState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<State>) => setState((current) => ({ ...current, ...patch }));
  const result = useMemo(
    () => calculatePregnancy({ ...state, asOf: todayIso(Date.now()) }),
    [state.method, state.date, state.cycleLength, state.embryoAge],
  );
  const n = (value: number) => formatNumber(value, locale, 0);
  const formatLong = (date: string) =>
    new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(new Date(`${date}T12:00:00`));
  const dateLabel: Record<DatingMethod, string> = {
    lmp: ui.lmpDateLabel,
    conception: ui.conceptionDateLabel,
    ivf: ui.transferDateLabel,
  };
  const invalid = state.date !== '' && !result;
  const gestationalAge = result?.gestationalAge;
  const ageValue = gestationalAge
    ? ui.gestationalAgeValue
        .replace('{weeks}', n(gestationalAge.weeks))
        .replace('{days}', n(gestationalAge.remainingDays))
    : ui.notStarted;
  const dueCountdown = !result
    ? ''
    : result.daysUntilDue > 0
      ? ui.daysUntilDueValue.replace('{days}', n(result.daysUntilDue))
      : result.daysUntilDue === 0
        ? ui.dueToday
        : ui.daysPastDueValue.replace('{days}', n(Math.abs(result.daysUntilDue)));

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Segmented<DatingMethod>
          label={ui.methodLabel}
          value={state.method}
          onValue={(method) => update({ method })}
          options={[
            { value: 'lmp', label: ui.methodLmp },
            { value: 'conception', label: ui.methodConception },
            { value: 'ivf', label: ui.methodIvf },
          ]}
        />
        <span class="text-xs text-subtle">{ui.autosaved}</span>
      </div>

      <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex flex-col gap-4">
          <Field label={dateLabel[state.method]} hint={ui.dateHint}>
            <TextInput
              type="date"
              value={state.date}
              onInput={(event) => update({ date: (event.currentTarget as HTMLInputElement).value })}
            />
          </Field>
          {state.method === 'lmp' && (
            <Field label={ui.cycleLengthLabel} hint={ui.cycleLengthHint}>
              <NumberInput
                value={state.cycleLength}
                min="20"
                max="45"
                step="1"
                onValue={(cycleLength) => update({ cycleLength })}
              />
            </Field>
          )}
          {state.method === 'ivf' && (
            <Field label={ui.embryoAgeLabel} hint={ui.embryoAgeHint}>
              <Segmented<'3' | '5'>
                label={ui.embryoAgeLabel}
                value={String(state.embryoAge) as '3' | '5'}
                onValue={(value) => update({ embryoAge: Number(value) as EmbryoAge })}
                options={[
                  { value: '3', label: ui.day3 },
                  { value: '5', label: ui.day5 },
                ]}
              />
            </Field>
          )}
          {invalid && <Notice tone="danger">{ui.invalidInput}</Notice>}
          <Notice tone="info">{ui.privateNotice}</Notice>
        </div>

        <div class="flex flex-col gap-3">
          {!result ? (
            <Notice tone="info">{invalid ? ui.invalidInput : ui.enterDate}</Notice>
          ) : (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.dueDateLabel} value={formatLong(result.dueDate)} emphasis />
                <Stat label={ui.dueCountdownLabel} value={dueCountdown} />
                <Stat label={ui.gestationalAgeLabel} value={ageValue} />
                <Stat
                  label={ui.trimesterLabel}
                  value={gestationalAge ? ui[`trimester${gestationalAge.trimester}`] : ui.notStarted}
                />
                <Stat label={ui.estimatedConceptionLabel} value={formatLong(result.estimatedConceptionDate)} />
                <Stat label={ui.estimatedLmpLabel} value={formatLong(result.gestationalStartDate)} />
              </div>
              <div class="border-t border-line pt-4">
                <h2 class="text-sm font-medium text-fg">{ui.milestonesHeading}</h2>
                <div class="mt-3 grid grid-cols-2 gap-2">
                  <Stat label={ui.firstTrimesterEnds} value={formatLong(result.milestones.firstTrimesterEnds)} />
                  <Stat label={ui.secondTrimesterStarts} value={formatLong(result.milestones.secondTrimesterStarts)} />
                  <Stat label={ui.thirdTrimesterStarts} value={formatLong(result.milestones.thirdTrimesterStarts)} />
                  <Stat label={ui.earlyTermStarts} value={formatLong(result.milestones.earlyTermStarts)} />
                  <Stat label={ui.fullTermStarts} value={formatLong(result.milestones.fullTermStarts)} />
                  <Stat label={ui.dueDateMilestone} value={formatLong(result.milestones.dueDate)} />
                </div>
              </div>
              <Notice tone="info">{ui.estimateNotice}</Notice>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
