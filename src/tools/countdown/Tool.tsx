import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Stat, TextInput, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  calendarDayDifference,
  formatDday,
  isValidDate,
  isValidTime,
  nextAnnualDate,
  normalizeEventName,
  splitRemaining,
  toLocalTimestamp,
  type PresetEvent,
} from './logic';

const STATE_KEY = 'tools:countdown:event';

interface CountdownInput {
  event: string;
  date: string;
  time: string;
}

function defaultInput(now: number, event: string): CountdownInput {
  return { event, date: nextAnnualDate('new-year', now), time: '' };
}

function isInput(value: unknown): value is CountdownInput {
  if (!value || typeof value !== 'object') return false;
  const input = value as CountdownInput;
  return (
    typeof input.event === 'string' &&
    typeof input.date === 'string' &&
    typeof input.time === 'string' &&
    isValidDate(input.date) &&
    isValidTime(input.time)
  );
}

function shareUrl(input: CountdownInput): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('date', input.date);
  if (input.time) url.searchParams.set('time', input.time);
  if (input.event) url.searchParams.set('event', input.event);
  return url.toString();
}

export default function Countdown({ ui }: ToolProps<UI>) {
  const [input, setInput] = useState<CountdownInput>(() => defaultInput(Date.now(), ui.newYear));
  const [now, setNow] = useState(() => Date.now());

  // A URL is portable; local storage is a convenient fallback for an unshared event.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      event: normalizeEventName(params.get('event') ?? ''),
      date: params.get('date') ?? '',
      time: params.get('time') ?? '',
    };
    if (isInput(fromUrl)) {
      setInput(fromUrl);
      return;
    }
    try {
      const stored = JSON.parse(safeStorage.get(STATE_KEY) ?? 'null');
      if (isInput(stored)) setInput(stored);
    } catch {
      /* Ignore unavailable or malformed local storage. */
    }
  }, []);

  useEffect(() => {
    safeStorage.set(STATE_KEY, JSON.stringify(input));
    if (!isValidDate(input.date) || !isValidTime(input.time)) return;
    window.history.replaceState(null, '', shareUrl(input));
  }, [input]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const target = toLocalTimestamp(input.date, input.time);
  const dayDifference = calendarDayDifference(input.date, now);
  const valid = target !== null && dayDifference !== null;
  const parts = valid ? splitRemaining(target!, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const reached = valid && target! <= now;
  const url = useMemo(() => (valid ? shareUrl(input) : ''), [input, valid]);

  const update = useCallback((change: Partial<CountdownInput>) => {
    setInput((previous) => ({ ...previous, ...change }));
  }, []);

  const choosePreset = useCallback(
    (preset: PresetEvent) => {
      const current = Date.now();
      setNow(current);
      const label = preset === 'new-year' ? ui.newYear : preset === 'valentine' ? ui.valentine : ui.christmas;
      setInput({ event: label, date: nextAnnualDate(preset, current), time: '' });
    },
    [ui.christmas, ui.newYear, ui.valentine],
  );

  const reset = useCallback(() => {
    const current = Date.now();
    setNow(current);
    setInput(defaultInput(current, ui.newYear));
  }, [ui.newYear]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const targetElement = event.target as HTMLElement;
      if (
        targetElement.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        setNow(Date.now());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dday = valid ? formatDday(dayDifference!) : '—';
  const heading = input.event || ui.until;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section aria-label={ui.event}>
          <Field label={ui.event} hint={ui.eventHint}>
            <TextInput
              value={input.event}
              maxLength={80}
              placeholder={ui.eventPlaceholder}
              onInput={(event) => update({ event: normalizeEventName(event.currentTarget.value) })}
            />
          </Field>

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={ui.date}>
              <TextInput
                type="date"
                value={input.date}
                onInput={(event) => update({ date: event.currentTarget.value })}
              />
            </Field>
            <Field label={ui.time} hint={ui.timeHint}>
              <TextInput
                type="time"
                value={input.time}
                onInput={(event) => update({ time: event.currentTarget.value })}
              />
            </Field>
          </div>

          <div class="mt-5 border-t border-line pt-5">
            <p class="text-sm font-medium text-fg">{ui.presets}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              {(['new-year', 'valentine', 'christmas'] as const).map((preset) => {
                const label = preset === 'new-year' ? ui.newYear : preset === 'valentine' ? ui.valentine : ui.christmas;
                return (
                  <Button size="sm" onClick={() => choosePreset(preset)}>
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-live="polite" aria-label={heading} class="rounded-lg bg-surface-2 p-4 sm:p-5">
          <p class="text-sm font-medium text-muted">{heading}</p>
          {!valid ? (
            <Notice tone="danger">{ui.invalidDate}</Notice>
          ) : (
            <>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <Stat label={ui.days} value={parts.days} emphasis />
                <Stat label={ui.hours} value={String(parts.hours).padStart(2, '0')} emphasis />
                <Stat label={ui.minutes} value={String(parts.minutes).padStart(2, '0')} />
                <Stat label={ui.seconds} value={String(parts.seconds).padStart(2, '0')} />
              </div>
              <div class="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                <span class="text-sm text-muted">{reached ? ui.elapsed : ui.dday}</span>
                <span class={cx('tabular text-lg font-semibold', reached ? 'text-muted' : 'text-accent')}>{dday}</span>
              </div>
              {reached && <Notice tone="info">{ui.targetReached}</Notice>}
            </>
          )}
        </section>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p class="max-w-xl text-xs leading-5 text-muted">{ui.shareHint}</p>
        <div class="flex flex-wrap gap-2">
          <CopyButton text={url} label={ui.share} copiedLabel={ui.copied} />
          <Button size="sm" onClick={reset}>
            {ui.reset}
          </Button>
        </div>
      </div>

      <div class="mt-5 text-xs text-muted">
        <Kbd>R</Kbd> {ui.keyboard}
      </div>
    </Panel>
  );
}
