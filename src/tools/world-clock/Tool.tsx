import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Field, Panel, Segmented, TextInput, cx } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import {
  cityFromInput,
  cityLabel,
  formatOffset,
  isTimeZone,
  resolveCity,
  searchCities,
} from '../time-zone-converter/logic';
import type { UI } from './content';
import {
  DEFAULT_ZONES,
  clockParts,
  currentDateInZone,
  formatHour,
  fullOverlapRanges,
  isWorkingHour,
  overlapHours,
} from './logic';

const STORAGE_KEY = 'tools:world-clock:state';
const MAX_CITIES = 8;

interface SavedState {
  zones: string[];
  hourCycle: '12' | '24';
}

function displayZone(zone: string, locale: ToolProps<UI>['locale']): string {
  const city = cityFromInput(zone, locale);
  return city ? cityLabel(city, locale) : zone;
}

export default function WorldClock({ locale, ui }: ToolProps<UI>) {
  const [zones, setZones] = useState<string[]>([...DEFAULT_ZONES]);
  const [hourCycle, setHourCycle] = useState<'12' | '24'>('24');
  const [now, setNow] = useState(() => Date.now());
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [date, setDate] = useState(() => currentDateInZone(Date.now(), DEFAULT_ZONES[0]));
  const restored = useRef(false);
  /** The planner follows "today" until the person picks a date themselves. */
  const followsToday = useRef(true);
  const referenceZone = zones[0] ?? DEFAULT_ZONES[0];

  useEffect(() => {
    try {
      const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<SavedState> | null;
      if (saved && Array.isArray(saved.zones)) {
        const validZones = saved.zones.filter((zone): zone is string => typeof zone === 'string' && isTimeZone(zone));
        if (validZones.length) setZones([...new Set(validZones)].slice(0, MAX_CITIES));
      }
      if (saved?.hourCycle === '12' || saved?.hourCycle === '24') setHourCycle(saved.hourCycle);
    } catch {
      // Ignore unavailable or corrupt local state.
    }
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    // Storage can be full or blocked (private browsing); the copy promises the city list is kept,
    // so a failed save has to be visible instead of silently dropping the list.
    setStorageWarning(!safeStorage.trySet(STORAGE_KEY, JSON.stringify({ zones, hourCycle } satisfies SavedState)));
  }, [zones, hourCycle]);

  // Tick on the wall clock, aligned to the second boundary, and refresh as soon as the tab is
  // visible again: a hidden tab throttles timers to about once a minute, so a clock that only
  // counts its own ticks shows a stale time right when someone comes back to it.
  useEffect(() => {
    let timer = 0;
    let stopped = false;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    const tick = () => {
      if (stopped) return;
      setNow(Date.now());
      schedule();
    };
    const refresh = () => {
      if (document.hidden) return;
      setNow(Date.now());
      schedule();
    };
    schedule();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pageshow', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pageshow', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  // Keep the reference date on today (also across midnight and when the reference city changes)
  // until the person chooses a date.
  useEffect(() => {
    if (!followsToday.current) return;
    setDate(currentDateInZone(now, referenceZone));
  }, [now, referenceZone]);

  const suggestions = searchCities(query, locale).map((city) => cityLabel(city, locale));
  const hours = useMemo(() => overlapHours(date, referenceZone, zones), [date, referenceZone, zones]);
  const fullRanges = useMemo(() => fullOverlapRanges(hours), [hours]);

  const addCity = () => {
    const trimmed = query.trim();
    const city = resolveCity(trimmed, locale);
    const zone = city?.zone ?? (isTimeZone(trimmed) ? trimmed : undefined);
    if (!zone) {
      setMessage(ui.invalidCity);
      return;
    }
    if (zones.includes(zone)) {
      setMessage(ui.alreadyAdded);
      return;
    }
    if (zones.length >= MAX_CITIES) {
      setMessage(ui.cityLimit);
      return;
    }
    setZones((previous) => [...previous, zone]);
    setQuery('');
    setMessage('');
  };

  const removeCity = (zone: string) => {
    if (zones.length <= 1) return;
    setZones((previous) => previous.filter((item) => item !== zone));
    setMessage('');
  };

  const useToday = () => {
    followsToday.current = true;
    setDate(currentDateInZone(Date.now(), referenceZone));
  };

  return (
    <Panel>
      <div class="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
        <Field label={ui.cityLabel} hint={ui.cityHint} class="min-w-0 flex-1 max-sm:basis-full">
          <div class="flex gap-2 max-sm:flex-col">
            <TextInput
              class="min-w-0 flex-1"
              list="world-clock-cities"
              value={query}
              placeholder={ui.cityPlaceholder}
              onInput={(event) => {
                setQuery(event.currentTarget.value);
                setMessage('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addCity();
                }
              }}
            />
            <datalist id="world-clock-cities">
              {suggestions.map((suggestion) => (
                <option value={suggestion} />
              ))}
            </datalist>
            <Button variant="primary" onClick={addCity} class="shrink-0 max-sm:w-full">
              {ui.addCity}
            </Button>
          </div>
        </Field>
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
      {message && (
        <p class="mt-3 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
          {message}
        </p>
      )}

      <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="off">
        {zones.map((zone) => {
          const city = cityFromInput(zone, locale);
          const parts = clockParts(now, zone, locale, hourCycle);
          const working = isWorkingHour(now, zone);
          return (
            <article class="rounded-lg border border-line bg-surface-2 p-4" key={zone}>
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h2 class="truncate text-sm font-medium text-fg">
                    {city ? (locale === 'ko' ? city.ko : city.en) : zone}
                  </h2>
                  <p class="mt-0.5 truncate text-xs text-subtle">
                    {city ? (locale === 'ko' ? city.countryKo : city.countryEn) : zone}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCity(zone)}
                  disabled={zones.length <= 1}
                  aria-label={ui.removeCity}
                >
                  ×
                </Button>
              </div>
              <p class="mt-5 tabular text-2xl font-semibold tracking-tight text-fg">{parts.time}</p>
              <p class="mt-1 text-sm text-muted">{parts.date}</p>
              <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-subtle">
                <span>{parts.weekday}</span>
                <span>
                  {ui.utcOffset} {formatOffset(parts.offsetMinutes * 60_000)}
                </span>
              </div>
              <p class={cx('mt-3 text-xs font-medium', working ? 'text-success' : 'text-muted')}>
                {working ? ui.working : ui.outsideWorking}
              </p>
            </article>
          );
        })}
      </div>

      <section class="mt-6 border-t border-line pt-6" aria-label={ui.meetingPlanner}>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 class="text-sm font-medium text-fg">{ui.meetingPlanner}</h2>
            <p class="mt-1 text-xs text-muted">{ui.meetingHint}</p>
          </div>
          <Field label={ui.plannerDate} class="w-full sm:w-auto">
            <div class="flex gap-2">
              <TextInput
                class="min-w-0"
                type="date"
                value={date}
                onInput={(event) => {
                  followsToday.current = false;
                  setDate(event.currentTarget.value);
                }}
              />
              <Button size="sm" onClick={useToday} class="shrink-0">
                {ui.now}
              </Button>
            </div>
          </Field>
        </div>
        <p class="mt-4 text-xs text-subtle">
          {ui.referenceCity}: {displayZone(referenceZone, locale)}
        </p>
        {fullRanges.length ? (
          <div class="mt-3 flex flex-wrap gap-2" aria-live="polite">
            {fullRanges.map((range) => (
              <span class="rounded-md bg-accent-soft px-3 py-2 text-sm font-medium text-accent">
                {formatHour(range.start, hourCycle, locale)}–{formatHour(range.end % 24, hourCycle, locale)} ·{' '}
                {ui.fullOverlap}
              </span>
            ))}
          </div>
        ) : (
          <p class="mt-3 rounded-md bg-surface-2 px-3 py-3 text-sm text-muted">{ui.noOverlap}</p>
        )}
        <ol class="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6" aria-label={ui.meetingPlanner}>
          {hours.map((hour) => {
            const full = hour.available === hour.total;
            return (
              <li
                class={cx(
                  'rounded-md border px-2 py-2 text-center text-xs',
                  full ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface text-muted',
                )}
              >
                <span class="block tabular font-medium">{formatHour(hour.hour, hourCycle, locale)}</span>
                <span class="mt-0.5 block">
                  {hour.available}/{hour.total} {ui.availableCount}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <p class={cx('mt-5 text-xs', storageWarning ? 'text-danger' : 'text-subtle')}>
        {storageWarning ? ui.storageFailed : ui.private}
      </p>
    </Panel>
  );
}
