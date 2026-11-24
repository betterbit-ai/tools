import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Kbd, Notice, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { DEFAULT_CLOCK_SETTINGS, isClockSettings, makeClockDisplay, utcOffsetFor, type ClockSettings } from './logic';

const SETTINGS_KEY = 'tools:online-clock:settings';

function loadSettings(): ClockSettings {
  try {
    const saved = JSON.parse(safeStorage.get(SETTINGS_KEY) ?? 'null');
    return isClockSettings(saved) ? saved : DEFAULT_CLOCK_SETTINGS;
  } catch {
    return DEFAULT_CLOCK_SETTINGS;
  }
}

export default function OnlineClock({ locale, ui }: ToolProps<UI>) {
  // Null until the page is running in the browser: the static HTML is rendered at build time, so a
  // time baked into it would be presented as "now" hours or days later (and forever without JS).
  const [now, setNow] = useState<Date | null>(null);
  // The saved display settings are read after hydration, never during the first render: the static
  // HTML cannot know them, and a value read only in the initial state left the wrong format button
  // highlighted (the clock showed 12-hour time while "24-hour" stayed marked as selected).
  const [settings, setSettings] = useState<ClockSettings>(DEFAULT_CLOCK_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [fullScreenError, setFullScreenError] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);
  const browserLocale = locale === 'ko' ? 'ko-KR' : 'en-US';
  const display = now ? makeClockDisplay(now, browserLocale, settings) : null;
  const placeholder = settings.showSeconds ? '--:--:--' : '--:--';
  const zone = now ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC') : '—';
  const copiedTime = display ? (display.period ? `${display.time} ${display.period}` : display.time) : '';

  // Schedule against the next second boundary so the visible seconds do not drift.
  useEffect(() => {
    let timer: number;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 1_000 - (Date.now() % 1_000) + 10);
    };
    // A hidden tab is throttled (and a slept device pauses it), so re-read the clock the moment the
    // visitor is looking again instead of waiting for the next scheduled tick.
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      window.clearTimeout(timer);
      tick();
    };
    tick();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, []);

  useEffect(() => {
    setSettings(loadSettings());
    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    // Only after the stored value is in place, so the defaults never overwrite it.
    if (settingsLoaded) safeStorage.set(SETTINGS_KEY, JSON.stringify(settings));
  }, [settingsLoaded, settings]);

  useEffect(() => {
    const updateFullscreen = () => setFullScreen(document.fullscreenElement === displayRef.current);
    document.addEventListener('fullscreenchange', updateFullscreen);
    return () => document.removeEventListener('fullscreenchange', updateFullscreen);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const displayElement = displayRef.current;
    if (!displayElement) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (displayElement.requestFullscreen) await displayElement.requestFullscreen();
      else setFullScreenError(true);
    } catch {
      setFullScreenError(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFullscreen]);

  return (
    <Panel class="overflow-hidden">
      <div
        ref={displayRef}
        class="flex flex-col items-center justify-center rounded-lg bg-surface px-3 py-8 text-center transition-colors sm:px-6 [&:fullscreen]:min-h-screen [&:fullscreen]:bg-bg"
      >
        <p class="text-sm font-medium text-muted">{ui.currentTime}</p>
        <div
          role="timer"
          aria-live="off"
          aria-label={display ? `${ui.currentTime}: ${copiedTime}` : ui.currentTime}
          class="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 tabular font-semibold tracking-tight leading-none text-[clamp(3.75rem,17vw,10rem)] text-fg [:fullscreen_&]:text-[min(24vw,38vh)]"
        >
          <span>{display ? display.time : placeholder}</span>
          {display?.period && <span class="text-[0.3em] text-muted">{display.period}</span>}
        </div>
        {display && settings.showDate && <p class="mt-4 text-[15px] text-muted">{display.date}</p>}

        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="lg" onClick={() => void toggleFullscreen()}>
            {fullScreen ? ui.exitFullScreen : ui.fullScreen}
          </Button>
          <CopyButton text={copiedTime} label={ui.copyTime} copiedLabel={ui.copied} size="lg" />
        </div>
      </div>

      {fullScreenError && <Notice tone="danger">{ui.fullscreenUnavailable}</Notice>}

      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        <Stat label={ui.timeZone} value={zone} />
        <Stat label={ui.utcOffset} value={now ? utcOffsetFor(now) : '—'} />
      </div>

      <section class="mt-6 border-t border-line pt-6" aria-label={ui.settings}>
        <h2 class="text-sm font-medium text-fg">{ui.settings}</h2>
        <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-4">
          <div>
            <p class="mb-1.5 text-xs text-muted">{ui.format}</p>
            <Segmented
              value={settings.format}
              onValue={(format) => setSettings((previous) => ({ ...previous, format }))}
              options={[
                { value: '24h', label: ui.format24 },
                { value: '12h', label: ui.format12 },
              ]}
              label={ui.format}
            />
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <Toggle
              checked={settings.showSeconds}
              onChecked={(showSeconds) => setSettings((previous) => ({ ...previous, showSeconds }))}
              label={ui.showSeconds}
            />
            <Toggle
              checked={settings.showDate}
              onChecked={(showDate) => setSettings((previous) => ({ ...previous, showDate }))}
              label={ui.showDate}
            />
          </div>
        </div>
      </section>

      <div class="mt-6">
        <Notice>
          <span class="font-medium">{ui.deviceClock}.</span> {ui.deviceClockNotice}
        </Notice>
      </div>

      <div class="mt-6 flex justify-center text-xs text-muted">
        <span>
          <Kbd>{ui.keyFullscreen}</Kbd> {ui.keyFullscreenHint}
        </span>
      </div>
    </Panel>
  );
}
