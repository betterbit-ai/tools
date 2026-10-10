import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Field,
  NumberInput,
  Notice,
  Panel,
  Segmented,
  Select,
  Stat,
  TextInput,
  Toggle,
  cx,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  addBusinessDays,
  addCalendarDelta,
  calendarSpan,
  countBusinessDays,
  daysBetween,
  isHolidayCountrySupportedForYear,
  isValidDate,
  todayIso,
  type HolidayCountry,
} from './logic';

const STORAGE_KEY = 'tools:date-calculator:state';

type Mode = 'diff' | 'add';
type Direction = 'add' | 'subtract';

interface Preset {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

const QUICK_PRESETS: Preset[] = [
  { years: 0, months: 0, weeks: 1, days: 0 },
  { years: 0, months: 1, weeks: 0, days: 0 },
  { years: 0, months: 0, weeks: 0, days: 100 },
  { years: 1, months: 0, weeks: 0, days: 0 },
];

const PRESET_LABEL_KEYS: ((ui: UI) => string)[] = [
  (ui) => ui.presetWeek,
  (ui) => ui.presetMonth,
  (ui) => ui.preset100Days,
  (ui) => ui.presetYear,
];

interface PersistedState {
  mode: Mode;
  startDate: string;
  endDate: string;
  includeStart: boolean;
  diffCountry: HolidayCountry;
  baseDate: string;
  direction: Direction;
  useBusinessDays: boolean;
  businessDaysAmount: number | '';
  years: number | '';
  months: number | '';
  weeks: number | '';
  days: number | '';
  addCountry: HolidayCountry;
}

function defaultState(today: string): PersistedState {
  return {
    mode: 'diff',
    startDate: today,
    endDate: addCalendarDelta(today, { years: 0, months: 1, weeks: 0, days: 0 }, 1),
    includeStart: false,
    diffCountry: 'none',
    baseDate: today,
    direction: 'add',
    useBusinessDays: false,
    businessDaysAmount: 5,
    years: 0,
    months: 0,
    weeks: 1,
    days: 0,
    addCountry: 'none',
  };
}

export default function DateCalculator({ locale, ui }: ToolProps<UI>) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState>(() => defaultState('2026-01-01'));

  // Restore saved inputs (or fall back to today) only after hydration — the server render has no storage or clock.
  useEffect(() => {
    const today = todayIso(Date.now());
    let next = defaultState(today);
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null');
      if (saved && typeof saved === 'object') next = { ...next, ...saved };
    } catch {
      /* ignore corrupt state */
    }
    if (!isValidDate(next.startDate)) next.startDate = today;
    if (!isValidDate(next.endDate)) next.endDate = today;
    if (!isValidDate(next.baseDate)) next.baseDate = today;
    setState(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    safeStorage.set(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const update = (patch: Partial<PersistedState>) => setState((s) => ({ ...s, ...patch }));

  const n = (v: number) => formatNumber(v, locale);
  const formatLong = (iso: string) =>
    new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(
      new Date(`${iso}T00:00:00`),
    );

  const countryOptions = [
    { value: 'none' as HolidayCountry, label: ui.countryNone },
    { value: 'us' as HolidayCountry, label: ui.countryUs },
    { value: 'kr' as HolidayCountry, label: ui.countryKr },
  ];

  const diff = useMemo(() => {
    if (!isValidDate(state.startDate) || !isValidDate(state.endDate)) return null;
    const rawDays = Math.abs(daysBetween(state.startDate, state.endDate));
    const totalDays = state.includeStart ? rawDays + 1 : rawDays;
    const span = calendarSpan(state.startDate, state.endDate);
    const business = countBusinessDays(state.startDate, state.endDate, state.diffCountry, state.includeStart);
    const startYear = Number(state.startDate.slice(0, 4));
    const endYear = Number(state.endDate.slice(0, 4));
    const unsupportedYear =
      state.diffCountry === 'kr' &&
      (!isHolidayCountrySupportedForYear(startYear, 'kr') || !isHolidayCountrySupportedForYear(endYear, 'kr'));
    return { totalDays, span, business, unsupportedYear };
  }, [state.startDate, state.endDate, state.includeStart, state.diffCountry]);

  const addResultDate = useMemo(() => {
    if (!isValidDate(state.baseDate)) return null;
    const sign = state.direction === 'add' ? 1 : -1;
    if (state.useBusinessDays) {
      return addBusinessDays(state.baseDate, sign * (state.businessDaysAmount || 0), state.addCountry);
    }
    return addCalendarDelta(
      state.baseDate,
      {
        years: state.years || 0,
        months: state.months || 0,
        weeks: state.weeks || 0,
        days: state.days || 0,
      },
      sign,
    );
  }, [
    state.baseDate,
    state.direction,
    state.useBusinessDays,
    state.businessDaysAmount,
    state.years,
    state.months,
    state.weeks,
    state.days,
    state.addCountry,
  ]);

  const addUnsupportedYear =
    state.useBusinessDays &&
    state.addCountry === 'kr' &&
    isValidDate(state.baseDate) &&
    addResultDate !== null &&
    (!isHolidayCountrySupportedForYear(Number(state.baseDate.slice(0, 4)), 'kr') ||
      !isHolidayCountrySupportedForYear(Number(addResultDate.slice(0, 4)), 'kr'));

  const diffSummary = diff
    ? ui.diffSummary
        .replace('{start}', formatLong(state.startDate))
        .replace('{end}', formatLong(state.endDate))
        .replace('{days}', n(diff.totalDays))
        .replace('{business}', n(diff.business.businessDays))
    : '';

  const addSummary = addResultDate ? formatLong(addResultDate) : '';

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label={ui.modeLabel}
          value={state.mode}
          onValue={(v) => update({ mode: v })}
          options={[
            { value: 'diff', label: ui.diffTab },
            { value: 'add', label: ui.addTab },
          ]}
        />
        <span class="text-xs text-subtle">{ui.autosaved}</span>
      </div>

      {state.mode === 'diff' ? (
        <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div class="flex flex-col gap-4">
            <div class="grid gap-3 sm:grid-cols-2">
              <Field label={ui.startDate}>
                <TextInput
                  type="date"
                  value={state.startDate}
                  onInput={(e) => update({ startDate: (e.currentTarget as HTMLInputElement).value })}
                />
              </Field>
              <Field label={ui.endDate}>
                <TextInput
                  type="date"
                  value={state.endDate}
                  onInput={(e) => update({ endDate: (e.currentTarget as HTMLInputElement).value })}
                />
              </Field>
            </div>
            <Toggle
              checked={state.includeStart}
              onChecked={(v) => update({ includeStart: v })}
              label={ui.includeStart}
            />
            <Field label={ui.holidayCountry} hint={ui.holidayHint}>
              <Select value={state.diffCountry} onValue={(v) => update({ diffCountry: v })} options={countryOptions} />
            </Field>
            {diff?.unsupportedYear && <Notice tone="info">{ui.holidayUnsupported}</Notice>}
          </div>

          <div class="flex flex-col gap-3">
            {!diff ? (
              <Notice tone="danger">{ui.invalidDate}</Notice>
            ) : (
              <>
                <div class="grid grid-cols-2 gap-2" aria-live="polite">
                  <Stat label={ui.totalDays} value={n(diff.totalDays)} emphasis />
                  <Stat label={ui.businessDays} value={n(diff.business.businessDays)} emphasis />
                  <Stat
                    label={ui.calendarSpan}
                    value={`${n(diff.span.years)}${ui.yearUnit} ${n(diff.span.months)}${ui.monthUnit} ${n(diff.span.days)}${ui.dayUnit}`}
                  />
                  <Stat
                    label={ui.weeksDays}
                    value={`${n(Math.floor(diff.totalDays / 7))}${ui.weekUnit} ${n(diff.totalDays % 7)}${ui.dayUnit}`}
                  />
                  <Stat label={ui.weekendDays} value={n(diff.business.weekendDays)} />
                  <Stat label={ui.holidayDays} value={n(diff.business.holidayDays)} />
                </div>
                <div class="mt-1 flex items-center gap-2">
                  <CopyButton text={diffSummary} label={ui.copy} copiedLabel={ui.copied} />
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div class="flex flex-col gap-4">
            <div class="grid gap-3 sm:grid-cols-2">
              <Field label={ui.baseDate}>
                <TextInput
                  type="date"
                  value={state.baseDate}
                  onInput={(e) => update({ baseDate: (e.currentTarget as HTMLInputElement).value })}
                />
              </Field>
              <Field label={ui.direction}>
                <Segmented
                  label={ui.direction}
                  value={state.direction}
                  onValue={(v) => update({ direction: v })}
                  options={[
                    { value: 'add', label: ui.addOp },
                    { value: 'subtract', label: ui.subtractOp },
                  ]}
                />
              </Field>
            </div>

            <Toggle
              checked={state.useBusinessDays}
              onChecked={(v) => update({ useBusinessDays: v })}
              label={ui.useBusinessDays}
            />

            {state.useBusinessDays ? (
              <div class="grid gap-3 sm:grid-cols-2">
                <Field label={ui.businessDaysAmount}>
                  <NumberInput
                    value={state.businessDaysAmount}
                    onValue={(v) => update({ businessDaysAmount: v === '' ? '' : Math.max(0, Math.round(v)) })}
                    min={0}
                  />
                </Field>
                <Field label={ui.holidayCountry} hint={ui.holidayHint}>
                  <Select
                    value={state.addCountry}
                    onValue={(v) => update({ addCountry: v })}
                    options={countryOptions}
                  />
                </Field>
              </div>
            ) : (
              <>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label={ui.years}>
                    <NumberInput value={state.years} onValue={(v) => update({ years: v })} min={0} />
                  </Field>
                  <Field label={ui.months}>
                    <NumberInput value={state.months} onValue={(v) => update({ months: v })} min={0} />
                  </Field>
                  <Field label={ui.weeks}>
                    <NumberInput value={state.weeks} onValue={(v) => update({ weeks: v })} min={0} />
                  </Field>
                  <Field label={ui.days}>
                    <NumberInput value={state.days} onValue={(v) => update({ days: v })} min={0} />
                  </Field>
                </div>
                <div class="flex flex-wrap gap-2">
                  {QUICK_PRESETS.map((p, i) => (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => update({ years: p.years, months: p.months, weeks: p.weeks, days: p.days })}
                    >
                      {PRESET_LABEL_KEYS[i](ui)}
                    </Button>
                  ))}
                </div>
              </>
            )}
            {addUnsupportedYear && <Notice tone="info">{ui.holidayUnsupported}</Notice>}
          </div>

          <div class="flex flex-col gap-3">
            {!addResultDate ? (
              <Notice tone="danger">{ui.invalidDate}</Notice>
            ) : (
              <>
                <div class={cx('rounded-md bg-surface-2 px-4 py-5 text-center')} aria-live="polite">
                  <div class="text-2xl font-semibold tracking-tight text-fg">{addSummary}</div>
                  <div class="mt-1 text-sm text-muted">{addResultDate}</div>
                </div>
                <div class="flex items-center gap-2">
                  <CopyButton text={addSummary} label={ui.copy} copiedLabel={ui.copied} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
