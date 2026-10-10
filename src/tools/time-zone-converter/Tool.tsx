import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Panel, Segmented, Stat, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  calendarDayDifference,
  cityFromInput,
  cityLabel,
  formatDateInput,
  formatDateTime,
  formatOffset,
  formatTimeInput,
  isNearOffsetTransition,
  isTimeZone,
  resolveLocalTime,
  searchCities,
  timeZoneAbbreviation,
  zoneOffsetMs,
  zonedParts,
} from './logic';

const STORAGE_KEY = 'tools:time-zone-converter:state';
const DEFAULT_FROM = 'Asia/Seoul';
const DEFAULT_TO = 'America/New_York';

interface SavedState {
  fromZone: string;
  toZone: string;
  date: string;
  time: string;
  hourCycle: '12' | '24';
}

function currentInputs(timeZone: string) {
  const parts = zonedParts(Date.now(), timeZone);
  return { date: formatDateInput(parts), time: formatTimeInput(parts) };
}

function displayZone(timeZone: string, locale: ToolProps<UI>['locale']): string {
  const city = cityFromInput(timeZone, locale);
  return city ? cityLabel(city, locale) : timeZone;
}

export default function TimeZoneConverter({ locale, ui }: ToolProps<UI>) {
  const initial = currentInputs(DEFAULT_FROM);
  const [fromZone, setFromZone] = useState(DEFAULT_FROM);
  const [toZone, setToZone] = useState(DEFAULT_TO);
  const [fromQuery, setFromQuery] = useState(() => displayZone(DEFAULT_FROM, locale));
  const [toQuery, setToQuery] = useState(() => displayZone(DEFAULT_TO, locale));
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [hourCycle, setHourCycle] = useState<'12' | '24'>('24');
  const restored = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<SavedState> | null;
      if (saved && isTimeZone(saved.fromZone ?? '') && isTimeZone(saved.toZone ?? '')) {
        setFromZone(saved.fromZone!);
        setToZone(saved.toZone!);
        setFromQuery(displayZone(saved.fromZone!, locale));
        setToQuery(displayZone(saved.toZone!, locale));
        if (saved.date) setDate(saved.date);
        if (saved.time) setTime(saved.time);
        if (saved.hourCycle === '12' || saved.hourCycle === '24') setHourCycle(saved.hourCycle);
      }
    } catch {
      // Ignore corrupt local state.
    }
    restored.current = true;
  }, [locale]);

  useEffect(() => {
    if (!restored.current) return;
    safeStorage.set(STORAGE_KEY, JSON.stringify({ fromZone, toZone, date, time, hourCycle } satisfies SavedState));
  }, [fromZone, toZone, date, time, hourCycle]);

  const fromCity = cityFromInput(fromQuery, locale);
  const toCity = cityFromInput(toQuery, locale);
  const fromInputValid = Boolean(fromCity || isTimeZone(fromQuery));
  const toInputValid = Boolean(toCity || isTimeZone(toQuery));
  const resolution = useMemo(
    () =>
      fromInputValid && toInputValid
        ? resolveLocalTime(date, time, fromZone)
        : { status: 'invalid' as const, alternatives: [] },
    [date, time, fromZone, fromInputValid, toInputValid],
  );
  const instant = resolution.instant;
  const targetParts = instant === undefined ? undefined : zonedParts(instant, toZone);
  const sourceOffset = instant === undefined ? undefined : zoneOffsetMs(instant, fromZone);
  const targetOffset = instant === undefined ? undefined : zoneOffsetMs(instant, toZone);
  const sourceResult = instant === undefined ? '' : formatDateTime(instant, fromZone, locale, hourCycle);
  const targetResult = instant === undefined ? '' : formatDateTime(instant, toZone, locale, hourCycle);
  const sourceName = displayZone(fromZone, locale);
  const targetName = displayZone(toZone, locale);
  const dayDifference = targetParts ? calendarDayDifference(date, targetParts) : undefined;
  const dayLabel =
    dayDifference === 0 ? ui.sameDay : dayDifference === 1 ? ui.nextDay : dayDifference === -1 ? ui.previousDay : '';
  const copyText = instant === undefined ? '' : `${sourceName}: ${sourceResult}\n${targetName}: ${targetResult}`;

  const applyFromInput = (value: string) => {
    setFromQuery(value);
    const city = cityFromInput(value, locale);
    if (city) setFromZone(city.zone);
    else if (isTimeZone(value)) setFromZone(value);
  };
  const applyToInput = (value: string) => {
    setToQuery(value);
    const city = cityFromInput(value, locale);
    if (city) setToZone(city.zone);
    else if (isTimeZone(value)) setToZone(value);
  };
  const useNow = () => {
    const values = currentInputs(fromZone);
    setDate(values.date);
    setTime(values.time);
  };
  const swap = () => {
    if (instant === undefined || !targetParts) return;
    setFromZone(toZone);
    setToZone(fromZone);
    setFromQuery(displayZone(toZone, locale));
    setToQuery(displayZone(fromZone, locale));
    setDate(formatDateInput(targetParts));
    setTime(formatTimeInput(targetParts));
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="space-y-4">
          <Field label={ui.fromLabel} hint={ui.cityHint}>
            <ZoneInput
              id="tz-from"
              value={fromQuery}
              onValue={applyFromInput}
              options={searchCities(fromQuery, locale).map((city) => cityLabel(city, locale))}
              placeholder={ui.cityPlaceholder}
            />
          </Field>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={ui.dateLabel}>
              <TextInput type="date" value={date} onInput={(event) => setDate(event.currentTarget.value)} />
            </Field>
            <Field label={ui.timeLabel}>
              <TextInput type="time" value={time} onInput={(event) => setTime(event.currentTarget.value)} />
            </Field>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={useNow}>
              {ui.now}
            </Button>
            <Button size="sm" variant="ghost" onClick={swap} disabled={instant === undefined}>
              {ui.swap}
            </Button>
            <Segmented
              label={ui.clockFormat}
              value={hourCycle}
              onValue={setHourCycle}
              options={[
                { value: '24', label: ui.hours24 },
                { value: '12', label: ui.hours12 },
              ]}
            />
          </div>
          <Field label={ui.toLabel} hint={ui.cityHint}>
            <ZoneInput
              id="tz-to"
              value={toQuery}
              onValue={applyToInput}
              options={searchCities(toQuery, locale).map((city) => cityLabel(city, locale))}
              placeholder={ui.cityPlaceholder}
            />
          </Field>
          {!fromInputValid || !toInputValid ? (
            <p class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
              {ui.unknownZone}
            </p>
          ) : resolution.status === 'nonexistent' ? (
            <p class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
              {ui.nonexistentTime}
            </p>
          ) : resolution.status === 'invalid' ? (
            <p class="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
              {ui.invalidTime}
            </p>
          ) : resolution.status === 'ambiguous' ? (
            <p class="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent" role="status">
              {ui.ambiguousTime}
            </p>
          ) : null}
        </div>

        <div class="flex flex-col gap-3" aria-live="polite">
          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <p class="text-xs font-medium text-muted">{ui.fromResult}</p>
            <p class="mt-1 text-sm font-medium text-fg">{sourceName}</p>
            <p class="mt-2 tabular text-lg font-semibold tracking-tight text-fg">{sourceResult || '—'}</p>
            {sourceOffset !== undefined && (
              <p class="mt-1 text-xs text-subtle">
                {timeZoneAbbreviation(instant!, fromZone, locale)} · {formatOffset(sourceOffset)}
              </p>
            )}
          </div>
          <div class="rounded-lg border border-line bg-surface-2 p-4">
            <p class="text-xs font-medium text-muted">{ui.toResult}</p>
            <p class="mt-1 text-sm font-medium text-fg">{targetName}</p>
            <p class="mt-2 tabular text-lg font-semibold tracking-tight text-fg">{targetResult || '—'}</p>
            {targetOffset !== undefined && (
              <p class="mt-1 text-xs text-subtle">
                {timeZoneAbbreviation(instant!, toZone, locale)} · {formatOffset(targetOffset)}
              </p>
            )}
          </div>
          {sourceOffset !== undefined && targetOffset !== undefined && (
            <div class="grid grid-cols-2 gap-2">
              <Stat label={ui.difference} value={formatOffset(targetOffset - sourceOffset).replace('UTC', '')} />
              <Stat label={ui.dateChange} value={dayLabel || '—'} />
            </div>
          )}
          <CopyButton text={copyText} label={ui.copy} copiedLabel={ui.copied} />
          {instant !== undefined &&
            (isNearOffsetTransition(instant, fromZone) || isNearOffsetTransition(instant, toZone)) && (
              <p class="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent" role="status">
                {ui.dstTransition}
              </p>
            )}
          <p class="text-xs text-subtle">{ui.private}</p>
        </div>
      </div>
    </Panel>
  );
}

function ZoneInput(props: {
  id: string;
  value: string;
  onValue: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  const listId = `${props.id}-options`;
  return (
    <>
      <TextInput
        id={props.id}
        list={listId}
        value={props.value}
        onInput={(event) => props.onValue(event.currentTarget.value)}
        placeholder={props.placeholder}
        autocomplete="off"
      />
      <datalist id={listId}>
        {props.options.map((option) => (
          <option value={option} />
        ))}
      </datalist>
    </>
  );
}
