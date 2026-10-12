import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Segmented, TextInput } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  dateTimeToMilliseconds,
  formatDateTimeInput,
  formatDisplayTime,
  parseTimestamp,
  type DateTimeZone,
  type TimestampUnit,
} from './logic';

const STORAGE_KEY = 'tools:unix-timestamp:state';

interface SavedState {
  timestamp: string;
  unit: TimestampUnit;
  dateTime: string;
  dateTimeZone: DateTimeZone;
  source: 'timestamp' | 'date';
}

function initialTimestamp() {
  return String(Math.floor(Date.now() / 1000));
}

export default function UnixTimestamp({ locale, ui }: ToolProps<UI>) {
  const [timestamp, setTimestamp] = useState(initialTimestamp);
  const [unit, setUnit] = useState<TimestampUnit>('auto');
  const [dateTimeZone, setDateTimeZone] = useState<DateTimeZone>('utc');
  const [dateTime, setDateTime] = useState(() => formatDateTimeInput(Date.now(), 'utc'));
  const [source, setSource] = useState<'timestamp' | 'date'>('timestamp');
  const [hydrated, setHydrated] = useState(false);
  const timestampInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<SavedState> | null;
      if (saved) {
        if (typeof saved.timestamp === 'string') setTimestamp(saved.timestamp);
        if (saved.unit === 'auto' || saved.unit === 'seconds' || saved.unit === 'milliseconds') setUnit(saved.unit);
        if (typeof saved.dateTime === 'string') setDateTime(saved.dateTime);
        if (saved.dateTimeZone === 'utc' || saved.dateTimeZone === 'local') setDateTimeZone(saved.dateTimeZone);
        if (saved.source === 'timestamp' || saved.source === 'date') setSource(saved.source);
      }
    } catch {
      // Ignore corrupt or unavailable local state.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safeStorage.set(
      STORAGE_KEY,
      JSON.stringify({ timestamp, unit, dateTime, dateTimeZone, source } satisfies SavedState),
    );
  }, [dateTime, dateTimeZone, hydrated, source, timestamp, unit]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key !== '/' ||
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }
      event.preventDefault();
      timestampInput.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const timestampResult = useMemo(() => parseTimestamp(timestamp, unit), [timestamp, unit]);
  const dateMilliseconds = useMemo(() => dateTimeToMilliseconds(dateTime, dateTimeZone), [dateTime, dateTimeZone]);
  const dateResult = useMemo(
    () =>
      dateMilliseconds === undefined
        ? { status: 'invalid' as const }
        : parseTimestamp(String(dateMilliseconds), 'milliseconds'),
    [dateMilliseconds],
  );
  const result = source === 'timestamp' ? timestampResult : dateResult;
  const conversion = result.status === 'valid' ? result.conversion : undefined;

  const applyTimestamp = (value: string, nextUnit = unit) => {
    setTimestamp(value);
    setSource('timestamp');
    const parsed = parseTimestamp(value, nextUnit);
    if (parsed.status === 'valid') setDateTime(formatDateTimeInput(parsed.conversion.milliseconds, dateTimeZone));
  };

  const applyUnit = (nextUnit: TimestampUnit) => {
    setUnit(nextUnit);
    applyTimestamp(timestamp, nextUnit);
  };

  const applyDateTime = (value: string) => {
    setDateTime(value);
    setSource('date');
    const milliseconds = dateTimeToMilliseconds(value, dateTimeZone);
    if (milliseconds !== undefined) {
      setTimestamp(String(milliseconds / 1000));
      setUnit('seconds');
    }
  };

  const applyDateTimeZone = (nextZone: DateTimeZone) => {
    if (conversion) setDateTime(formatDateTimeInput(conversion.milliseconds, nextZone));
    setDateTimeZone(nextZone);
  };

  const useNow = () => {
    const now = Date.now();
    setUnit('seconds');
    setTimestamp(String(Math.floor(now / 1000)));
    setDateTime(formatDateTimeInput(now, dateTimeZone));
    setSource('timestamp');
  };

  const error =
    result.status === 'empty'
      ? ui.empty
      : result.status === 'invalid'
        ? source === 'date'
          ? ui.invalidDateTime
          : timestampResult.status === 'invalid' && timestampResult.reason === 'range'
            ? ui.outOfRange
            : ui.invalidTimestamp
        : '';
  const copyText = conversion
    ? `${ui.seconds}: ${conversion.seconds}\n${ui.milliseconds}: ${conversion.millisecondsText}\n${ui.iso}: ${conversion.iso}\n${ui.displayTime}: ${formatDisplayTime(conversion.milliseconds, locale, dateTimeZone)}`
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="space-y-5">
          <Field label={ui.timestampLabel} hint={ui.timestampHint}>
            <TextInput
              ref={timestampInput}
              value={timestamp}
              inputMode="numeric"
              placeholder={ui.timestampPlaceholder}
              onInput={(event) => applyTimestamp(event.currentTarget.value)}
            />
          </Field>
          <Field label={ui.unitLabel} hint={ui.unitHint}>
            <Segmented
              label={ui.unitLabel}
              value={unit}
              onValue={applyUnit}
              options={[
                { value: 'auto', label: ui.auto },
                { value: 'seconds', label: ui.secondsShort },
                { value: 'milliseconds', label: ui.millisecondsShort },
              ]}
            />
          </Field>
          <div class="border-t border-line pt-5">
            <Field label={ui.dateTimeLabel} hint={ui.dateTimeHint}>
              <TextInput
                type="datetime-local"
                value={dateTime}
                onInput={(event) => applyDateTime(event.currentTarget.value)}
              />
            </Field>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <Segmented
                label={ui.interpretationLabel}
                value={dateTimeZone}
                onValue={applyDateTimeZone}
                options={[
                  { value: 'utc', label: ui.utc },
                  { value: 'local', label: ui.local },
                ]}
              />
              <Button size="sm" onClick={useNow}>
                {ui.now}
              </Button>
            </div>
          </div>
          <p class="text-xs text-subtle">
            {ui.focusHintStart} <Kbd>/</Kbd> {ui.focusHintEnd}
          </p>
        </div>

        <div class="flex flex-col gap-3" aria-live="polite">
          <h2 class="text-sm font-medium text-fg">{ui.results}</h2>
          {error ? (
            <Notice tone="danger">{error}</Notice>
          ) : conversion ? (
            <>
              <ResultRow
                label={ui.detectedUnit}
                value={conversion.unit === 'seconds' ? ui.secondsShort : ui.millisecondsShort}
              />
              <ResultRow label={ui.seconds} value={conversion.seconds} copyLabel={ui.copy} copiedLabel={ui.copied} />
              <ResultRow
                label={ui.milliseconds}
                value={conversion.millisecondsText}
                copyLabel={ui.copy}
                copiedLabel={ui.copied}
              />
              <ResultRow label={ui.iso} value={conversion.iso} copyLabel={ui.copy} copiedLabel={ui.copied} />
              <ResultRow
                label={dateTimeZone === 'utc' ? ui.utcTime : ui.localTime}
                value={formatDisplayTime(conversion.milliseconds, locale, dateTimeZone)}
                copyLabel={ui.copy}
                copiedLabel={ui.copied}
              />
              <CopyButton text={copyText} label={ui.copyAll} copiedLabel={ui.copied} />
            </>
          ) : null}
          <p class="mt-auto text-xs text-subtle">{ui.private}</p>
        </div>
      </div>
    </Panel>
  );
}

function ResultRow(props: { label: string; value: string; copyLabel?: string; copiedLabel?: string }) {
  return (
    <div class="rounded-md bg-surface-2 px-3 py-2.5">
      <div class="text-xs text-muted">{props.label}</div>
      <div class="mt-1 flex items-start justify-between gap-2">
        <output class="min-w-0 break-all tabular text-sm font-medium text-fg">{props.value}</output>
        {props.copyLabel && props.copiedLabel && (
          <CopyButton text={props.value} label={props.copyLabel} copiedLabel={props.copiedLabel} />
        )}
      </div>
    </div>
  );
}
